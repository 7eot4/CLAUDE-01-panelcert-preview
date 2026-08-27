import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default function SuccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
        ✓
      </div>
      <h1 className="mt-6 text-2xl font-bold text-brand-navy">Payment received</h1>
      <p className="mt-3 text-brand-slate">
        Check your inbox — your download link is on its way. It usually arrives within a minute or
        two. Be sure to check spam if you don&apos;t see it.
      </p>
      <p className="mt-2 text-sm text-brand-slate">
        Didn&apos;t get an email in 15 minutes?{" "}
        <Link href="/contact" className="text-brand-blue underline">
          Contact us
        </Link>{" "}
        and we&apos;ll sort it out.
      </p>
      <Link href="/" className="mt-8 text-sm font-medium text-brand-blue hover:underline">
        ← Back to homepage
      </Link>
    </div>
  );
}
