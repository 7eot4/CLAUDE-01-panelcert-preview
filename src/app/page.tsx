import Link from "next/link";
import PricingCard from "@/components/PricingCard";
import DocumentCard from "@/components/DocumentCard";
import Faq from "@/components/Faq";
import { panelcertToolkit } from "@/data/products";

const product = panelcertToolkit;
const completeTier = product.tiers.find((t) => t.slug === "complete")!;

const faqItems = [
  {
    question: "What exactly do I get?",
    answer:
      "One .xlsx workbook (Excel, works in Google Sheets and LibreOffice too) with a separate tab for each document, plus a Read Me tab. No app to install, no account needed — it's yours the moment it's delivered.",
  },
  {
    question: "Is this specific to one industry standard or code?",
    answer:
      "No. The checklists are structured around FAT/SAT/commissioning best practice used across industrial, panel-building and marine/offshore work — not tied to a single national electrical code — so you adapt the pass/fail criteria to whatever spec governs your job.",
  },
  {
    question: "Can I use this for client-facing sign-off?",
    answer:
      "Yes — every checklist and the Commissioning Report end with a sign-off block (tested by, witnessed by, accepted by) designed to be handed to a client or included in an as-built package.",
  },
  {
    question: "What's the difference between Complete and Team License?",
    answer:
      "Same 7 documents. Complete is licensed for one active project at a time. Team License covers unlimited projects and unlimited people on your team, plus priority email support — meant for companies, not individual use.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes — 14 days, no questions asked. See the Refund Policy for details. If the file doesn't open or something's broken, reply to your order email first and we'll usually just fix it.",
  },
  {
    question: "How is this delivered?",
    answer:
      "Immediately after payment, you'll get an email with a secure download link. The link stays valid for 7 days — if it expires, reply to the email and we'll send a fresh one.",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: "PanelCert" },
    offers: product.tiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: tier.price,
      priceCurrency: tier.currency,
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://panelcert.com"}/#pricing`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 font-mono text-sm uppercase tracking-widest text-blue-300">
                For automation &amp; commissioning technicians
              </p>
              <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
                Stop rebuilding FAT/SAT checklists from a blank sheet every job.
              </h1>
              <p className="mt-6 text-lg text-slate-300">{product.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="#pricing"
                  className="rounded-md bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
                >
                  Get the toolkit — from ${Math.min(...product.tiers.map((t) => t.price))}
                </Link>
                <Link
                  href="#whats-inside"
                  className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  See what&apos;s inside
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                One-time payment. No subscription. Instant download. 14-day money-back guarantee.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 font-mono text-sm text-slate-300">
              <p className="mb-3 text-blue-300"># Read Me — PanelCert Commissioning Toolkit</p>
              <p>Included in this workbook:</p>
              <ul className="mt-2 space-y-1">
                {completeTier.documents.map((d) => (
                  <li key={d.name}>• {d.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-brand-navy">Every job, the same wasted hour.</h2>
        <p className="mt-4 text-lg text-brand-slate">
          You know the drill: a new panel or system to commission, and no clean checklist on hand —
          so you rebuild one in Word from memory, or dig through last year&apos;s job folder hoping the
          format still makes sense to a client. It works, but it&apos;s an hour you&apos;re not billing,
          on every single job.
        </p>
      </section>

      {/* What's inside */}
      <section id="whats-inside" className="bg-brand-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-brand-navy">
            Seven documents. One workbook. Every job.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-brand-slate">
            Not screenshots of a demo — this is the actual product, generated as a real, editable
            .xlsx file you can open right now.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {completeTier.documents.map((doc) => (
              <DocumentCard key={doc.name} document={doc} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-brand-navy">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Buy", body: "Pick a tier, pay once via secure checkout. No account required." },
            { step: "2", title: "Download", body: "Get an instant email with a secure link to your workbook." },
            { step: "3", title: "Commission", body: "Duplicate the tabs you need per job, fill in, sign off, hand over." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light font-mono text-lg font-bold text-brand-blue">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-brand-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-brand-slate">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder credibility (trust, no fake testimonials) */}
      <section className="bg-brand-navy py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Built by someone who&apos;s filled these out on-site</h2>
          <p className="mt-4 text-slate-300">
            PanelCert is made by a working electrical/automation technician with hands-on
            commissioning experience across industrial and shipyard environments — not a
            template mill. These are the documents used to actually get a system signed off,
            formatted so a client can read them without a walkthrough.
          </p>
          <p className="mt-6 text-sm text-slate-400">
            No fake reviews here — this is a new product. Try it risk-free with the 14-day refund policy.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-brand-navy">Pricing</h2>
          <p className="mt-4 text-center text-brand-slate">
            One-time payment. Every tier includes lifetime access to that version.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {product.tiers.map((tier) => (
              <PricingCard key={tier.slug} productSlug={product.slug} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-brand-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold text-brand-navy">
            Frequently asked questions
          </h2>
          <div className="mt-10">
            <Faq items={faqItems} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-brand-navy">
            Get your next job&apos;s paperwork sorted before you leave the shop.
          </h2>
          <Link
            href="#pricing"
            className="mt-8 inline-block rounded-md bg-brand-blue px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            Get the toolkit
          </Link>
        </div>
      </section>
    </>
  );
}
