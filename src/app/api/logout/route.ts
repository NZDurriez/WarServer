import { NextResponse } from "next/server";
import { clearToken, getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = await getToken();
  if (token) war.release(token);
  await clearToken();
  return NextResponse.json({ ok: true });
}
