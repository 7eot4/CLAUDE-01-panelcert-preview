import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout cancelled", robots: { index: false } };

export default function CancelledPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-brand-navy">Checkout cancelled</h1>
      <p className="mt-3 text-brand-slate">
        No charge was made. If something went wrong on our end, try again — if it keeps happening,{" "}
        <Link href="/contact" className="text-brand-blue underline">
          let us know
        </Link>
        .
      </p>
      <Link
        href="/#pricing"
        className="mt-8 rounded-md bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Back to pricing
      </Link>
    </div>
  );
}
