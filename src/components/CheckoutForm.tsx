"use client";

import type { ProductTier } from "@/types";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export default function CheckoutForm({
  productSlug,
  tier,
  children,
  className,
}: {
  productSlug: string;
  tier: ProductTier;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action="/api/checkout"
      method="POST"
      className={className}
      onSubmit={() => {
        window.plausible?.("checkout_started", {
          props: { product: productSlug, tier: tier.slug },
        });
      }}
    >
      <input type="hidden" name="product" value={productSlug} />
      <input type="hidden" name="tier" value={tier.slug} />
      {children}
    </form>
  );
}
