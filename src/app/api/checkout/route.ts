import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTier } from "@/data/products";
import { createCheckout } from "@/lib/lemonsqueezy";

const schema = z.object({
  product: z.string().min(1),
  tier: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const parsed = schema.safeParse({
    product: formData.get("product"),
    tier: formData.get("tier"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }

  const tier = getTier(parsed.data.product, parsed.data.tier);
  if (!tier) {
    return NextResponse.json({ error: "Unknown product or tier" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  try {
    const checkoutUrl = await createCheckout({
      variantId: tier.lemonsqueezyVariantId,
      customData: { productSlug: parsed.data.product, tierSlug: parsed.data.tier },
      redirectUrl: `${siteUrl}/success`,
    });
    return NextResponse.redirect(checkoutUrl, { status: 303 });
  } catch (err) {
    console.error("Checkout creation failed", err);
    return NextResponse.redirect(`${siteUrl}/cancelled?reason=checkout_error`, { status: 303 });
  }
}
