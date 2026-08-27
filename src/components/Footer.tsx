import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-brand-navy font-mono text-sm font-bold text-white">
              PC
            </span>
            <p className="mt-3 text-sm text-brand-slate">
              Commissioning documentation that closes the job — not just the panel.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-slate">
              <li><Link href="/#whats-inside" className="hover:text-brand-navy">What&apos;s inside</Link></li>
              <li><Link href="/#pricing" className="hover:text-brand-navy">Pricing</Link></li>
              <li><Link href="/#faq" className="hover:text-brand-navy">FAQ</Link></li>
              <li><Link href="/guides" className="hover:text-brand-navy">Guides</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-slate">
              <li><Link href="/contact" className="hover:text-brand-navy">Contact</Link></li>
              <li><Link href="/legal/refund" className="hover:text-brand-navy">Refund policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-slate">
              <li><Link href="/legal/terms" className="hover:text-brand-navy">Terms &amp; Conditions</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-brand-navy">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-brand-navy">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-brand-border pt-6 text-xs text-brand-slate md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} PanelCert. All rights reserved.</p>
          <p>TODO_OWNER_DATA: legal company name, address &amp; registration number.</p>
        </div>
      </div>
    </footer>
  );
}
