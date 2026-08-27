import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-navy">Privacy Policy</h1>
      <p className="mt-2 text-sm text-brand-slate">Last updated: TODO_OWNER_DATA (effective date)</p>

      <div className="prose prose-slate mt-8 max-w-none text-brand-slate">
        <p>
          This policy explains what personal data PanelCert (&quot;we&quot;, &quot;us&quot;) collects
          when you buy or browse panelcert.com, and what we do with it. It is written in plain
          language and is not a substitute for legal advice — TODO_OWNER_DATA: have this reviewed by
          a qualified advisor before relying on it, particularly for GDPR compliance specific to your
          business setup and country of establishment.
        </p>

        <h2>Who we are</h2>
        <p>
          TODO_OWNER_DATA: legal entity name, registered address, company registration number, and
          contact email for privacy requests (data controller details required under GDPR Art. 13).
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Checkout data:</strong> your email address and (optionally) name, collected by
            our payment processor, Lemon Squeezy, acting as Merchant of Record. We receive your
            email and order details from them to deliver your purchase and provide support.
          </li>
          <li>
            <strong>Order records:</strong> product purchased, amount paid, and order status, stored
            in our database to handle support requests, refunds, and re-sending download links.
          </li>
          <li>
            <strong>Analytics:</strong> if enabled, we use Plausible Analytics, which does not use
            cookies and does not collect personally identifiable information — it reports aggregate
            page views only.
          </li>
        </ul>

        <h2>What we don&apos;t collect</h2>
        <p>
          We never see or store your card details — those are handled entirely by Lemon Squeezy. We
          don&apos;t require an account to buy or download the product.
        </p>

        <h2>How we use your data</h2>
        <ul>
          <li>To deliver the product you purchased and send order-related emails.</li>
          <li>To respond to support requests.</li>
          <li>To comply with tax and accounting obligations.</li>
        </ul>
        <p>We do not sell your data, and we do not use it for advertising.</p>

        <h2>Third parties we use</h2>
        <ul>
          <li>
            <strong>Lemon Squeezy</strong> — payment processing and Merchant of Record (handles VAT
            and sales tax).
          </li>
          <li>
            <strong>Supabase</strong> — database hosting for order records.
          </li>
          <li>
            <strong>Resend</strong> — transactional email delivery (order confirmation, download
            link).
          </li>
        </ul>

        <h2>Your rights</h2>
        <p>
          If you are in the EU/UK, you have the right to access, correct, or delete your personal
          data, and to object to its processing, under GDPR. To exercise these rights, contact
          TODO_OWNER_DATA (privacy contact email).
        </p>

        <h2>Data retention</h2>
        <p>
          Order records are kept for as long as required for tax and accounting purposes
          (TODO_OWNER_DATA: confirm the statutory retention period in your jurisdiction).
        </p>

        <h2>Contact</h2>
        <p>Questions about this policy: TODO_OWNER_DATA (contact email).</p>
      </div>
    </article>
  );
}
