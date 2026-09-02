import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "You are not logged in." }, { status: 401 });
  war.heartbeat(token);
  return NextResponse.json({ ok: true });
}
