import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-navy">Contact</h1>
      <p className="mt-4 text-brand-slate">
        Questions about the toolkit, an order, or a refund? Email us directly — a real person reads
        every message.
      </p>
      <div className="mt-8 rounded-lg border border-brand-border bg-brand-surface p-6">
        <p className="text-sm font-semibold text-brand-navy">Email</p>
        <p className="mt-1 text-brand-slate">TODO_OWNER_DATA (support email address)</p>
      </div>
      <div className="mt-4 rounded-lg border border-brand-border bg-brand-surface p-6">
        <p className="text-sm font-semibold text-brand-navy">Company</p>
        <p className="mt-1 text-brand-slate">
          TODO_OWNER_DATA (legal entity name, registered address, registration number — required for
          EU consumer-facing sites)
        </p>
      </div>
    </article>
  );
}
