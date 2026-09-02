import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = await getToken();
  const session = war.session(token);
  if (!session || !token) {
    return NextResponse.json({ error: "You are not logged in." }, { status: 401 });
  }
  const body = (await request.json()) as { characterId?: string; resetFrags?: boolean };
  if (body.resetFrags) {
    const result = war.resetFrags(token);
    if ("error" in result) return NextResponse.json(result, { status: 403 });
    return NextResponse.json({ ok: true });
  }
  const result = war.unlock(token, body.characterId ?? "");
  if ("error" in result) return NextResponse.json(result, { status: 403 });
  return NextResponse.json({ ok: true });
}
