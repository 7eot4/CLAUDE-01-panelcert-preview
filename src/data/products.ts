import type { Product } from "@/types";

const FAT = {
  name: "Factory Acceptance Test (FAT) Checklist",
  description:
    "Panel-by-panel FAT sign-off: visual inspection, wiring continuity, I/O verification, functional test, punch items, sign-off block.",
};
const SAT = {
  name: "Site Acceptance Test (SAT) Checklist",
  description:
    "On-site commissioning checklist: power-up sequence, loop checks, interlocks, safety circuits, performance test, client sign-off block.",
};
const COMMISSIONING_REPORT = {
  name: "Commissioning Test Report",
  description:
    "Formal handover document summarizing test results, deviations, corrective actions and final acceptance status.",
};
const CABLE_SCHEDULE = {
  name: "Cable & Termination Schedule",
  description:
    "Cable ID, origin/destination, core count, gland/termination status, and test result tracking in one register.",
};
const INSULATION_LOG = {
  name: "Insulation Resistance (IR) Test Log",
  description:
    "Pre- and post-energization IR readings per circuit against your pass/fail threshold, with test instrument record.",
};
const LOTO_LOG = {
  name: "LOTO (Lockout/Tagout) Tag Log",
  description:
    "Isolation point register: tag number, device, applied by, verified by, removal sign-off — audit-ready.",
};
const PUNCH_LIST = {
  name: "Punch List / Snag List Tracker",
  description:
    "Open-item tracker with severity, responsible party, target date and closeout sign-off, sortable by area or panel.",
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
        "Single active project",
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
        "Single active project",
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
        "Editable Excel (.xlsx), works offline",
        "Priority email support",
        "Free updates to this product line",
      ],
      fileKey: "panelcert-complete.xlsx",
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
