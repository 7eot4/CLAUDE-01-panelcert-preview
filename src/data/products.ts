import type { Product } from "@/types";

const FAT = {
  name: "Factory Acceptance Test (FAT) Checklist",
  description:
    "45 checks across 8 sections — documentation, enclosure, power circuits, earthing, I/O and configuration, functional testing, safety systems, dispatch. Every line carries a short method note, so it reads as a procedure rather than a list of headings.",
};
const SAT = {
  name: "Site Acceptance Test (SAT) Checklist",
  description:
    "45 checks across 9 sections — site readiness, installation, earthing, energization, loop checks, interlocks and network, safety systems, performance, handover. Same method notes throughout.",
};
const COMMISSIONING_REPORT = {
  name: "Commissioning Test Report",
  description:
    "Handover document that pulls live pass/fail counts from the checklist and test tabs, so the summary can't drift out of step with the evidence behind it. Acceptance status, limitations, and a three-role sign-off.",
};
const CABLE_SCHEDULE = {
  name: "Cable & Termination Schedule",
  description:
    "80-row register: ID, route, type, cores, voltage rating, length, glanding, termination, continuity and IR cross-reference — with running totals for terminated and tested cables.",
};
const INSULATION_LOG = {
  name: "Insulation Resistance (IR) Test Log",
  description:
    "60 circuits, all six phase/earth combinations. You set the acceptance limit once; the sheet finds the lowest reading per circuit and returns the pass/fail verdict itself. Ambient temperature and humidity recorded alongside.",
};
const LOTO_LOG = {
  name: "LOTO (Lockout/Tagout) Tag Log",
  description:
    "45 isolations tracked from applied to removed, with energy source, isolation method, zero-energy verification and second-person check. Any lock still applied is highlighted automatically.",
};
const PUNCH_LIST = {
  name: "Punch List / Snag List Tracker",
  description:
    "70 items with severity (A/B/C), responsible party, automatic ageing in days, and overdue highlighting. Severity-A items still open are flagged straight onto the commissioning report.",
};

export const panelcertToolkit: Product = {
  slug: "commissioning-toolkit",
  name: "PanelCert Commissioning Toolkit",
  shortName: "Commissioning Toolkit",
  tagline: "Commissioning documentation that closes the job — not just the panel.",
  description:
    "A single, professionally formatted Excel workbook covering the seven documents every industrial or electrical commissioning job actually needs — built by a working automation/commissioning technician, not a template mill.",
  tiers: [
    {
      slug: "starter",
      name: "Starter",
      price: 29,
      currency: "USD",
      lemonsqueezyVariantId: "REPLACE_WITH_STARTER_VARIANT_ID",
      tagline: "The three documents you need on day one.",
      documents: [FAT, SAT, COMMISSIONING_REPORT],
      features: [
        "3 core documents (FAT, SAT, Commissioning Report)",
        "Project details entered once, carried across every sheet",
        "Dropdowns, print setup and sign-off blocks already built",
        "Editable Excel (.xlsx), works offline",
        "Lifetime access to this version",
      ],
      fileKey: "panelcert-starter.xlsx",
    },
    {
      slug: "complete",
      name: "Complete",
      price: 49,
      currency: "USD",
      lemonsqueezyVariantId: "REPLACE_WITH_COMPLETE_VARIANT_ID",
      mostPopular: true,
      tagline: "The full commissioning documentation set.",
      documents: [
        FAT,
        SAT,
        COMMISSIONING_REPORT,
        CABLE_SCHEDULE,
        INSULATION_LOG,
        LOTO_LOG,
        PUNCH_LIST,
      ],
      features: [
        "All 7 documents in one workbook",
        "Project details entered once, carried across every sheet",
        "IR verdicts, punch-list ageing and report totals calculated for you",
        "Print-ready: repeating headers, page numbers, sign-off blocks",
        "Editable Excel (.xlsx), works offline",
        "Free updates to this product line",
      ],
      fileKey: "panelcert-complete.xlsx",
    },
    {
      slug: "team",
      name: "Team License",
      price: 129,
      currency: "USD",
      lemonsqueezyVariantId: "REPLACE_WITH_TEAM_VARIANT_ID",
      tagline: "For crews and companies running multiple jobs.",
      documents: [
        FAT,
        SAT,
        COMMISSIONING_REPORT,
        CABLE_SCHEDULE,
        INSULATION_LOG,
        LOTO_LOG,
        PUNCH_LIST,
      ],
      features: [
        "All 7 documents in one workbook",
        "Unlimited projects, unlimited team members",
        "Company licence wording built into the workbook",
        "Adapt it to your house standard and reissue internally",
        "Priority email support",
        "Free updates to this product line",
      ],
      fileKey: "panelcert-team.xlsx",
    },
  ],
};

export const products: Product[] = [panelcertToolkit];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getTier(productSlug: string, tierSlug: string) {
  const product = getProductBySlug(productSlug);
  return product?.tiers.find((t) => t.slug === tierSlug);
}

export function getTierByVariantId(variantId: string) {
  for (const product of products) {
    const tier = product.tiers.find((t) => t.lemonsqueezyVariantId === variantId);
    if (tier) return { product, tier };
  }
  return undefined;
}
