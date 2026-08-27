import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commissioning Guides",
  description: "Practical guides on FAT/SAT, commissioning documentation and panel sign-off.",
};

const guides = [
  {
    slug: "fat-vs-sat-checklist",
    title: "FAT vs SAT Checklist: What's the Difference?",
    excerpt:
      "Factory Acceptance Test and Site Acceptance Test cover different failure modes. Here's what belongs on each checklist and why conflating them costs you rework.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-navy">Guides</h1>
      <p className="mt-3 text-brand-slate">
        Practical notes from the field on commissioning documentation — no fluff.
      </p>
      <div className="mt-10 space-y-6">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="block rounded-lg border border-brand-border p-6 transition hover:border-brand-blue"
          >
            <h2 className="text-lg font-semibold text-brand-navy">{g.title}</h2>
            <p className="mt-2 text-sm text-brand-slate">{g.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
