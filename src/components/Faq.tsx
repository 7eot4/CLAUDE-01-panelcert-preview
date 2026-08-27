export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-brand-border rounded-xl border border-brand-border">
      {items.map((item) => (
        <details key={item.question} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium text-brand-navy">
            {item.question}
            <span className="ml-4 shrink-0 text-brand-slate transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-brand-slate">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
