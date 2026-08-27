import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  type LemonSqueezyOrderWebhookEvent,
} from "@/lib/lemonsqueezy";
import { getProductBySlug, getTier, getTierByVariantId } from "@/data/products";
import { createDownloadToken } from "@/lib/download-token";
import { sendOrderDeliveryEmail } from "@/lib/email";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

// Lemon Squeezy retries webhooks that don't return 2xx, so every early
// return below still uses 200 once we've decided an event is not
// actionable — a 4xx/5xx would just trigger pointless retries.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  let signatureValid: boolean;
  try {
    signatureValid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("Webhook signature verification misconfigured", err);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as LemonSqueezyOrderWebhookEvent;
  const eventName = event.meta.event_name;

  if (eventName === "order_refunded") {
    if (isSupabaseConfigured()) {
      await supabaseAdmin()
        .from("orders")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("lemonsqueezy_order_id", event.data.id);
    }
    return NextResponse.json({ received: true });
  }

  if (eventName !== "order_created") {
    return NextResponse.json({ received: true, ignored: eventName });
  }

  const attrs = event.data.attributes;
  if (attrs.status !== "paid") {
    return NextResponse.json({ received: true, ignored: `status:${attrs.status}` });
  }

  const customData = event.meta.custom_data;
  const resolved =
    customData?.productSlug && customData?.tierSlug
      ? { product: getProductBySlug(customData.productSlug), tier: getTier(customData.productSlug, customData.tierSlug) }
      : attrs.first_order_item
        ? getTierByVariantId(String(attrs.first_order_item.variant_id))
        : undefined;

  if (!resolved?.product || !resolved?.tier) {
    console.error("Webhook: could not resolve product/tier for order", event.data.id);
    return NextResponse.json({ received: true, error: "unresolved_product" });
  }

  const { product, tier } = resolved;
  const email = attrs.user_email;
  const name = attrs.user_name || null;

  if (isSupabaseConfigured()) {
    const db = supabaseAdmin();
    const { data: customer, error: customerError } = await db
      .from("customers")
      .upsert({ email, name }, { onConflict: "email" })
      .select()
      .single();

    if (customerError) {
      console.error("Failed to upsert customer", customerError);
    } else {
      const { error: orderError } = await db.from("orders").upsert(
        {
          lemonsqueezy_order_id: event.data.id,
          customer_id: customer.id,
          product_slug: product.slug,
          tier_slug: tier.slug,
          amount_total_cents: attrs.total,
          currency: attrs.currency,
          status: "paid",
        },
        { onConflict: "lemonsqueezy_order_id" }
      );
      if (orderError) console.error("Failed to record order", orderError);
    }
  } else {
    console.warn("SUPABASE not configured — order was fulfilled but not persisted.");
  }

  const token = createDownloadToken({
    orderId: event.data.id,
    tierSlug: tier.slug,
    fileKey: tier.fileKey,
    email,
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const downloadUrl = `${siteUrl}/api/download/${token}`;

  try {
    await sendOrderDeliveryEmail({
      to: email,
      customerName: name,
      productName: product.name,
      tierName: tier.name,
      downloadUrl,
      expiresInDays: 7,
    });
  } catch (err) {
    console.error("Failed to send delivery email", err);
  }

  return NextResponse.json({ received: true });
}
