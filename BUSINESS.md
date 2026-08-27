# PanelCert — Business Document

## The niche

Industrial/electrical commissioning documentation: FAT (Factory Acceptance Test), SAT (Site
Acceptance Test), commissioning reports, cable schedules, insulation resistance test logs,
LOTO tag logs, and punch lists.

## Research summary (done via live web search, Aug 2026)

Digital templates for the electrical/automation trade are an active, proven market:
- Etsy sells paid NEC load-calc Excel templates to US electricians.
- ServiceTitan and Construct & Commission sell/give away individual commissioning documents,
  the latter charging **$3.95/document** and bundling 130+ templates for "engineers, consultants,
  and new companies."
- Gumroad has electrician-targeted products (website templates, social media packs, AI prompt
  packs for quotes/invoices) at $9–99, confirming trades buyers pay for productized digital tools.
- The **panel schedule / load calc generator** sub-niche has real competition: commercial SaaS
  (Kopperfield) and a "buy it and own it" panel scheduler product — validated demand, but crowded.
- The **commissioning / FAT-SAT documentation** sub-niche is the opposite: real demand (forum
  threads, scattered free PDFs from equipment vendors and consultancies) but **no dominant premium
  brand** — just fragmented, inconsistent free resources and a few cheap single-document sellers.

## Opportunities considered

| | Product | Competition | Fit to founder background |
|---|---|---|---|
| 1 | NEC load-calc/panel-schedule toolkit (US electricians) | Medium-high (Etsy sellers, Kopperfield) | Weak — US-code-specific, not the founder's domain |
| 2 | **Industrial commissioning / FAT-SAT documentation toolkit** | **Low-medium** (fragmented, no premium brand) | **Strong — automation, commissioning, industrial/shipyard experience** |
| 3 | Micro-SaaS panel schedule generator | High (existing SaaS competitors) | Medium — good idea, wrong first move (MVP too slow to ship) |

**Winner: Opportunity 2.** Lowest competition, matches real professional credibility (used
honestly as the trust signal in place of fake testimonials — see Homepage "Built by someone
who's filled these out on-site" section), fastest to a real, sellable MVP, and has a natural
v2 path into micro-SaaS (a report generator) once the digital-product line has revenue and an
audience.

## Product

**PanelCert Commissioning Toolkit** — one Excel workbook (`.xlsx`), professionally formatted,
covering seven documents:

1. FAT Checklist
2. SAT Checklist
3. Commissioning Test Report
4. Cable & Termination Schedule
5. Insulation Resistance (IR) Test Log
6. LOTO Tag Log
7. Punch List / Snag List Tracker

Three tiers: **Starter** ($29, 3 docs), **Complete** ($49, all 7, most popular), **Team License**
($129, all 7 + unlimited projects/users + priority support).

## Customer

Automation technicians, commissioning engineers, panel builders, and industrial/marine electrical
contractors who currently rebuild these documents from scratch or from memory on every job.

## Pricing rationale

Anchored against Construct & Commission's $3.95/single-document pricing and 130+-template bundles,
and against Gumroad electrician products in the $9–99 range. $49 for a curated, professionally
formatted 7-document set (vs. buying/assembling equivalents piecemeal) is priced as a convenience
and quality premium, not a discount play.

## Unit economics

Payment processor: **Lemon Squeezy** (Merchant of Record), chosen over raw Stripe specifically
because the founder is EU-based and selling digital goods internationally — Lemon Squeezy collects
and remits EU VAT and US sales tax automatically; with raw Stripe, the founder would need to
register for VAT MOSS/OSS and handle tax remittance manually. Fee: ~5% + $0.50/transaction (2026
pricing).

| Sales/month | Avg. price | Revenue | LS fee (~5.5%) | Net |
|---|---|---|---|---|
| 10 | $49 | $490 | $27 | ~$463 |
| 50 | $49 | $2,450 | $135 | ~$2,315 |
| 100 | $49 | $4,900 | $270 | ~$4,630 |

No COGS beyond founder time (digital delivery, no inventory). These are scenarios, not forecasts.

## Brand

**PanelCert** — no naming collisions found (checked against existing companies/apps; "VoltVerify"
was considered and rejected because an identically-named app already exists). Tagline:
*"Commissioning documentation that closes the job — not just the panel."* Positioning: technical,
plainspoken, zero startup-marketing-speak — matches the buyer (a working tradesperson, not a
marketing persona).

## Acquisition — first 10, then 100 customers

**First 10:** direct, high-context channels where the founder has credibility —
r/PLC, r/askelectricians, r/industrialengineering and similar subreddits (participate genuinely,
don't spam a link), Mike Holt's Forum and ForumAutomation.com threads that already discuss
commissioning checklists, LinkedIn posts from a real industry account.

**Next 100:** SEO via the `/guides` content structure already scaffolded (one live guide:
"FAT vs SAT Checklist: What's the Difference?" — targets a real, searched, informational query with
FAQPage schema); more guides answering specific commissioning questions; Etsy/Gumroad as secondary
distribution channels once the core product is proven (they take a cut but add discovery surface).

**Not planned for v1:** paid ads (unproven product, budget better spent validating organically
first).

## Risks

- **Standard-agnostic positioning cuts both ways**: not being tied to NEC/IEC/a specific code is a
  strength (broader addressable market) but means the product can't claim code-specific compliance
  — must stay explicit in copy that this is documentation structure, not a compliance engine.
- **Low differentiation moat**: templates are easy to copy once proven. Mitigation: brand + founder
  credibility + continuous guide/content output are the moat, not the spreadsheet itself.
- **EU VAT/tax complexity** if Lemon Squeezy is ever swapped for raw Stripe — deliberately avoided
  for v1 by choosing a Merchant of Record.
- **Single-product concentration**: all revenue depends on one product line. v2 (below) is the
  diversification path once this is validated.

## MVP (this build) vs. v2

**MVP / launch now:**
- One product, three pricing tiers, real downloadable files
- Lemon Squeezy checkout + webhook + signed download delivery
- Transactional email (Resend)
- Minimal admin dashboard (revenue, orders)
- Legal pages, SEO metadata/sitemap/schema, one SEO guide

**v2 (only after real sales data):**
- Micro-SaaS commissioning report generator (fill checklist online → auto PDF), addressing
  Opportunity 3 from a position of proven demand and initial audience instead of a cold start
- Additional product lines (e.g., a marine/offshore-specific variant, a PLC I/O checklist pack)
- More `/guides` content for SEO compounding
- Customer accounts / re-download portal (currently: no account, email-link delivery only)

## My actions (owner, not automatable)

1. Create a Lemon Squeezy account + store, create the 3 variants, paste real variant IDs into
   `src/data/products.ts` (see README "Lemon Squeezy setup").
2. Create a Supabase project, run `supabase/schema.sql`, add credentials to env.
3. Create a Resend account, verify a sending domain, add API key to env.
4. Buy the `panelcert.com` domain (or an available alternative) and point it at the deployment.
5. Fill in every `TODO_OWNER_DATA` placeholder (legal entity name, address, registration number,
   support email) in the legal pages, footer, and contact page — required for EU consumer-facing
   compliance, and something only the business owner can legally provide.
6. Decide whether to also list on Etsy/Gumroad as secondary channels (recommended after initial
   organic traction, not before).
