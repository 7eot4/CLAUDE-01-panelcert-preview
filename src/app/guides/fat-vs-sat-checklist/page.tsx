import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAT vs SAT Checklist: What's the Difference?",
  description:
    "Factory Acceptance Test and Site Acceptance Test cover different failure modes. What belongs on each checklist, and why conflating them costs you rework.",
};

export default function FatVsSatGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the difference between FAT and SAT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FAT (Factory Acceptance Test) verifies a panel or system before it leaves the shop — wiring, component list, functional logic, and safety circuits, tested in a controlled environment. SAT (Site Acceptance Test) verifies the same system after it's installed on site — physical installation, field wiring, loop checks, and performance under real site conditions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I skip FAT and only do SAT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can, but faults caught only at SAT are far more expensive to fix — you're now troubleshooting on a live site instead of a bench, often under schedule pressure. FAT exists specifically to catch build-stage issues before they become site-stage issues.",
        },
      },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/guides" className="text-sm text-brand-blue hover:underline">
        ← All guides
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-brand-navy">
        FAT vs SAT Checklist: What&apos;s the Difference?
      </h1>

      <div className="prose prose-slate mt-8 max-w-none text-brand-slate">
        <p>
          FAT and SAT get used almost interchangeably by people new to commissioning, but they test
          for different failure modes at different stages — and a checklist built for one doesn&apos;t
          hold up for the other.
        </p>

        <h2>FAT: catch it before it ships</h2>
        <p>
          The Factory Acceptance Test happens in the panel shop or integrator&apos;s facility, before
          anything is shipped to site. It answers one question: was this built correctly? That means:
        </p>
        <ul>
          <li>Wiring matches the schematic, point-to-point</li>
          <li>Component list matches the bill of materials</li>
          <li>I/O points match the I/O list</li>
          <li>PLC/HMI logic runs through its functional sequence correctly</li>
          <li>Safety circuits (E-stop, interlocks) behave as designed</li>
        </ul>
        <p>
          Everything here is testable on a bench, with simulated inputs where needed. There&apos;s no
          site conditions to account for yet.
        </p>

        <h2>SAT: does it work where it actually lives</h2>
        <p>
          The Site Acceptance Test happens after installation, and it answers a different question:
          does this work correctly in its real environment, connected to the real field devices?
        </p>
        <ul>
          <li>Physical installation matches the layout drawing</li>
          <li>Field wiring termination re-checked on site</li>
          <li>Loop checks from field device to controller</li>
          <li>Performance under actual site load, not simulated load</li>
          <li>Interaction with other systems already on site</li>
        </ul>

        <h2>Why the distinction matters for your paperwork</h2>
        <p>
          If your FAT checklist tries to cover site-only items (like loop checks to real field
          devices that don&apos;t exist yet), you either leave rows blank — which looks sloppy to a
          client — or you skip FAT items that actually matter because the sheet is bloated. Keep the
          two separate, and each one stays fast to run and easy to hand over.
        </p>

        <p>
          The <Link href="/#whats-inside" className="text-brand-blue underline">PanelCert Commissioning Toolkit</Link>{" "}
          ships FAT and SAT as two distinct tabs for exactly this reason — plus five more documents
          for everything between FAT and final handover.
        </p>
      </div>
    </article>
  );
}
