import type { ProductTier } from "@/types";
import CheckoutForm from "@/components/CheckoutForm";

export default function PricingCard({
  productSlug,
  tier,
}: {
  productSlug: string;
  tier: ProductTier;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 ${
        tier.mostPopular
          ? "border-brand-blue shadow-lg shadow-blue-100 ring-1 ring-brand-blue"
          : "border-brand-border"
      }`}
    >
      {tier.mostPopular ? (
        <span className="mb-3 inline-block w-fit rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue">
          Most popular
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-brand-navy">{tier.name}</h3>
      <p className="mt-1 text-sm text-brand-slate">{tier.tagline}</p>
      <p className="mt-4">
        <span className="text-4xl font-bold text-brand-navy">${tier.price}</span>
        <span className="ml-1 text-sm text-brand-slate">one-time</span>
      </p>
      <ul className="mt-6 flex-1 space-y-3 text-sm text-brand-slate">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-blue">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <CheckoutForm productSlug={productSlug} tier={tier} className="mt-6">
        <button
          type="submit"
          className={`w-full rounded-md px-4 py-3 text-sm font-semibold transition ${
            tier.mostPopular
              ? "bg-brand-blue text-white hover:bg-blue-700"
              : "bg-brand-navy text-white hover:bg-slate-800"
          }`}
        >
          Get {tier.name}
        </button>
      </CheckoutForm>
      <p className="mt-3 text-center text-xs text-brand-slate">
        Secure checkout via Lemon Squeezy · 14-day money-back guarantee
      </p>
    </div>
  );
}
