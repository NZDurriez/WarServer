import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getToken();
  const session = war.session(token);
  if (!session || !token) {
    return NextResponse.json({ error: "You are not logged in." }, { status: 401 });
  }
  return NextResponse.json(war.snapshot(token));
}

export async function POST(request: Request) {
  const token = await getToken();
  const session = war.session(token);
  if (!session || !token) {
    return NextResponse.json({ error: "You are not logged in." }, { status: 401 });
  }
  const body = (await request.json()) as
    | { type: "move"; dir: "n" | "s" | "e" | "w" }
    | { type: "attack" }
    | { type: "skill"; skill: "sd" | "heal" };
  const result = war.act(token, body);
  if ("error" in result) {
    return NextResponse.json({ ...result, state: war.snapshot(token) }, { status: 400 });
  }
  return NextResponse.json({ ok: true, state: war.snapshot(token) });
}
