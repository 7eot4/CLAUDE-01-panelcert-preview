import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-brand-navy font-mono text-sm font-bold text-white">
            PC
          </span>
          <span className="text-lg font-semibold tracking-tight text-brand-navy">
            PanelCert
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-brand-slate md:flex">
          <Link href="/#whats-inside" className="hover:text-brand-navy">
            What&apos;s inside
          </Link>
          <Link href="/#pricing" className="hover:text-brand-navy">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-brand-navy">
            FAQ
          </Link>
          <Link href="/guides" className="hover:text-brand-navy">
            Guides
          </Link>
        </nav>
        <Link
          href="/#pricing"
          className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Get the toolkit
        </Link>
      </div>
    </header>
  );
}
