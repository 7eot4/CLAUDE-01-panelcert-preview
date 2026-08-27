import { createHmac, timingSafeEqual } from "node:crypto";

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

function apiKey(): string {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not set");
  return key;
}

function storeId(): string {
  const id = process.env.LEMONSQUEEZY_STORE_ID;
  if (!id) throw new Error("LEMONSQUEEZY_STORE_ID is not set");
  return id;
}

interface CreateCheckoutParams {
  variantId: string;
  email?: string;
  customData: Record<string, string>;
  redirectUrl: string;
}

/**
 * Creates a Lemon Squeezy hosted checkout session server-side so we can attach
 * custom_data (product/tier slug) that the webhook later reads back to know
 * exactly what was purchased and what to deliver.
 */
export async function createCheckout({
  variantId,
  email,
  customData,
  redirectUrl,
}: CreateCheckoutParams): Promise<string> {
  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email,
            custom: customData,
          },
          product_options: {
            redirect_url: redirectUrl,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId() } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lemon Squeezy checkout creation failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy response did not include a checkout URL");
  return url as string;
}

/**
 * Verifies the X-Signature header Lemon Squeezy sends on every webhook
 * request using HMAC-SHA256 over the raw request body. Must be called with
 * the raw, unparsed body — parsing and re-stringifying JSON changes byte
 * layout and breaks signature verification.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");

  const computed = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const provided = Buffer.from(signatureHeader.trim(), "hex");

  if (computed.length !== provided.length) return false;
  return timingSafeEqual(computed, provided);
}

export interface LemonSqueezyOrderWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    id: string;
    attributes: {
      identifier: string;
      order_number: number;
      user_email: string;
      user_name: string;
      status: string;
      total: number;
      currency: string;
      first_order_item?: {
        variant_id: number;
        variant_name: string;
      };
    };
  };
}
