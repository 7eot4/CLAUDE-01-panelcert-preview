import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (!expected) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=not_configured`, { status: 303 });
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=invalid`, { status: 303 });
  }

  const res = NextResponse.redirect(`${siteUrl}/admin`, { status: 303 });
  res.cookies.set(ADMIN_COOKIE_NAME, await createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
