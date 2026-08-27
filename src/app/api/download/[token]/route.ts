import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

// Deliverable files live outside `public/` on purpose — anything under
// public/ is served to anyone who guesses the path. This route is the only
// way to reach them, gated by a signed, time-limited token.
const PRODUCT_FILES_DIR = path.join(process.cwd(), "private-assets");

function isSafeFileKey(fileKey: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(fileKey) && !fileKey.includes("..");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = verifyDownloadToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "This download link is invalid or has expired. Reply to your order email and we'll send a new one." },
      { status: 410 }
    );
  }

  if (!isSafeFileKey(payload.fileKey)) {
    return NextResponse.json({ error: "Invalid file reference" }, { status: 400 });
  }

  const filePath = path.join(PRODUCT_FILES_DIR, payload.fileKey);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(filePath);
  } catch (err) {
    console.error("Product file missing on disk", payload.fileKey, err);
    return NextResponse.json({ error: "File temporarily unavailable, we've been notified." }, { status: 500 });
  }

  if (isSupabaseConfigured()) {
    const db = supabaseAdmin();
    // payload.orderId is the Lemon Squeezy order id; downloads.order_id is a
    // FK to our internal orders.id, so resolve it first.
    const { data: order } = await db
      .from("orders")
      .select("id")
      .eq("lemonsqueezy_order_id", payload.orderId)
      .maybeSingle();

    if (order) {
      const { data: existing } = await db
        .from("downloads")
        .select("id, download_count")
        .eq("order_id", order.id)
        .eq("file_key", payload.fileKey)
        .maybeSingle();

      if (existing) {
        await db
          .from("downloads")
          .update({
            download_count: existing.download_count + 1,
            last_downloaded_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await db.from("downloads").insert({
          order_id: order.id,
          file_key: payload.fileKey,
          download_count: 1,
          last_downloaded_at: new Date().toISOString(),
        });
      }
    } else {
      console.warn("Download served but matching order not found in DB", payload.orderId);
    }
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${payload.fileKey}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
