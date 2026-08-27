import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-navy">Refund Policy</h1>
      <p className="mt-2 text-sm text-brand-slate">Last updated: TODO_OWNER_DATA (effective date)</p>

      <div className="prose prose-slate mt-8 max-w-none text-brand-slate">
        <h2>14-day guarantee</h2>
        <p>
          If PanelCert isn&apos;t useful to you, email TODO_OWNER_DATA (support email) within 14 days
          of purchase and we&apos;ll refund you in full — no forms, no justification needed. This is
          a policy we choose to offer on top of any statutory rights, because the format has already
          been downloaded by the time most people can evaluate it.
        </p>

        <h2>How refunds are processed</h2>
        <p>
          Refunds are issued back to your original payment method via Lemon Squeezy, our Merchant of
          Record. Processing typically takes 5-10 business days depending on your bank or card
          issuer.
        </p>

        <h2>What happens to the license</h2>
        <p>
          Once refunded, your license to use the files ends and you should delete any copies you
          downloaded.
        </p>

        <h2>Not covered</h2>
        <p>
          Repeated refund requests on the same account/email for the same product may be declined at
          our discretion to prevent abuse.
        </p>

        <h2>Contact</h2>
        <p>TODO_OWNER_DATA (support email) — we read and reply to every message ourselves.</p>
      </div>
    </article>
  );
}
