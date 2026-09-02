import { NextResponse } from "next/server";
import { setToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { account?: string; password?: string };
  const result = war.login(body.account ?? "", body.password ?? "");
  if ("error" in result) {
    return NextResponse.json(result, { status: 401 });
  }
  await setToken(result.token);
  return NextResponse.json({ ok: true, role: result.role });
}
