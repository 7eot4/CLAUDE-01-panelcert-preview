import type { ProductDocument } from "@/types";

export default function DocumentCard({ document }: { document: ProductDocument }) {
  return (
    <div className="flex gap-4 rounded-lg border border-brand-border bg-white p-5">
      <svg
        width="40"
        height="48"
        viewBox="0 0 40 48"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="38" height="46" rx="3" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
        <rect x="8" y="12" width="24" height="3" rx="1" fill="#2563EB" />
        <rect x="8" y="19" width="24" height="2" rx="1" fill="#CBD5E1" />
        <rect x="8" y="24" width="18" height="2" rx="1" fill="#CBD5E1" />
        <rect x="8" y="29" width="24" height="2" rx="1" fill="#CBD5E1" />
        <rect x="8" y="34" width="14" height="2" rx="1" fill="#CBD5E1" />
      </svg>
      <div>
        <h4 className="font-semibold text-brand-navy">{document.name}</h4>
        <p className="mt-1 text-sm text-brand-slate">{document.description}</p>
      </div>
    </div>
  );
}
