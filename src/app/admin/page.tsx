import type { Metadata } from "next";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  lemonsqueezy_order_id: string;
  product_slug: string;
  tier_slug: string;
  amount_total_cents: number;
  currency: string;
  status: string;
  created_at: string;
  customers: { email: string } | null;
}

async function getDashboardData() {
  if (!isSupabaseConfigured()) return null;

  const db = supabaseAdmin();
  const { data: orders, error } = await db
    .from("orders")
    .select("id, lemonsqueezy_order_id, product_slug, tier_slug, amount_total_cents, currency, status, created_at, customers(email)")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<OrderRow[]>();

  if (error) {
    console.error("Admin dashboard: failed to load orders", error);
    return { orders: [], revenueCents: 0, paidCount: 0, refundedCount: 0 };
  }

  const paid = orders.filter((o) => o.status === "paid");
  const refunded = orders.filter((o) => o.status === "refunded");
  const revenueCents = paid.reduce((sum, o) => sum + o.amount_total_cents, 0);

  return { orders, revenueCents, paidCount: paid.length, refundedCount: refunded.length };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-bold text-brand-navy">Admin dashboard</h1>
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing), so there&apos;s
          no order data to show yet. Run supabase/schema.sql against a Supabase project and set the
          env vars — see README.md.
        </p>
      </div>
    );
  }

  const { orders, revenueCents, paidCount, refundedCount } = data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-bold text-brand-navy">Admin dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Revenue (paid)" value={`$${(revenueCents / 100).toFixed(2)}`} />
        <Stat label="Paid orders" value={String(paidCount)} />
        <Stat label="Refunded orders" value={String(refundedCount)} />
        <Stat
          label="Avg. order value"
          value={paidCount ? `$${(revenueCents / 100 / paidCount).toFixed(2)}` : "—"}
        />
      </div>

      <h2 className="mt-12 text-lg font-semibold text-brand-navy">Recent orders</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface text-left text-brand-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Product / tier</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brand-slate">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-brand-slate">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{order.customers?.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {order.product_slug} / {order.tier_slug}
                  </td>
                  <td className="px-4 py-3">
                    ${(order.amount_total_cents / 100).toFixed(2)} {order.currency}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-slate">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-navy">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    refunded: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.failed}`}>
      {status}
    </span>
  );
}
