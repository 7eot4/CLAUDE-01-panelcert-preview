import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-bold text-brand-navy">Admin</h1>
      {error === "invalid" ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Wrong password.
        </p>
      ) : null}
      {error === "not_configured" ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          ADMIN_PASSWORD is not set in the environment.
        </p>
      ) : null}
      <form action="/api/admin/login" method="POST" className="mt-6 space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
