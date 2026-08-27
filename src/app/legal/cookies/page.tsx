import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-navy">Cookie Policy</h1>
      <p className="mt-2 text-sm text-brand-slate">Last updated: TODO_OWNER_DATA (effective date)</p>

      <div className="prose prose-slate mt-8 max-w-none text-brand-slate">
        <p>
          panelcert.com itself does not set any tracking or advertising cookies. We use{" "}
          <strong>Plausible Analytics</strong>, a privacy-friendly analytics tool that does not use
          cookies and does not collect personal data — which is why this site does not show a cookie
          consent banner.
        </p>
        <p>
          Our payment processor, <strong>Lemon Squeezy</strong>, may set its own cookies during
          checkout as strictly necessary for processing your payment securely. These are outside our
          control — see Lemon Squeezy&apos;s own privacy and cookie policy for details.
        </p>
        <p>
          If we add any additional analytics or marketing tools in the future that do use cookies,
          this page will be updated accordingly and a consent mechanism will be added where required.
        </p>
        <h2>Contact</h2>
        <p>Questions: TODO_OWNER_DATA (contact email).</p>
      </div>
    </article>
  );
}
