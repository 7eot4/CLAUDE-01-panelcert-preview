import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-navy">Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-brand-slate">Last updated: TODO_OWNER_DATA (effective date)</p>

      <div className="prose prose-slate mt-8 max-w-none text-brand-slate">
        <p>
          These terms govern your purchase and use of digital products sold on panelcert.com by
          TODO_OWNER_DATA (legal entity name, address, registration number). This is a plain-language
          summary, not legal advice — TODO_OWNER_DATA: have this reviewed before relying on it.
        </p>

        <h2>1. What you&apos;re buying</h2>
        <p>
          PanelCert sells digital, downloadable template files (Microsoft Excel format). No physical
          goods are shipped. Payment is processed by Lemon Squeezy, who act as the Merchant of Record
          for your purchase — meaning Lemon Squeezy, not PanelCert, is the seller of record on your
          receipt and handles applicable VAT/sales tax.
        </p>

        <h2>2. License</h2>
        <p>
          Purchasing a tier grants you a non-exclusive, non-transferable license to use the included
          files for your own commissioning/documentation work, per the scope of the tier purchased
          (single project for Starter/Complete, unlimited projects and team members for Team
          License). You may not resell, redistribute, or repackage the files themselves as a
          competing product.
        </p>

        <h2>3. Right of withdrawal (EU digital content)</h2>
        <p>
          Under EU consumer law, the 14-day right of withdrawal for digital content does not apply
          once you have downloaded the file and explicitly acknowledged that you lose that right by
          doing so — TODO_OWNER_DATA: confirm this acknowledgment is captured at checkout and reflect
          the exact mechanism here. Independent of statutory withdrawal rights, we offer our own
          14-day money-back guarantee — see the Refund Policy.
        </p>

        <h2>4. Availability &amp; delivery</h2>
        <p>
          Files are delivered via a time-limited secure download link sent by email after payment is
          confirmed. If your link expires before you download, contact us for a new one at no charge.
        </p>

        <h2>5. No professional/engineering sign-off implied</h2>
        <p>
          These templates are documentation aids. They do not constitute engineering advice, and use
          of these templates does not substitute for compliance with applicable codes, standards, or
          the sign-off of a qualified, licensed professional where required by law or contract.
        </p>

        <h2>6. Limitation of liability</h2>
        <p>
          TODO_OWNER_DATA: define liability limits appropriate to your jurisdiction and business
          structure, in consultation with a legal advisor.
        </p>

        <h2>7. Contact</h2>
        <p>Questions about these terms: TODO_OWNER_DATA (contact email).</p>
      </div>
    </article>
  );
}
