import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getToken();
  const session = war.session(token);
  if (!session) {
    return NextResponse.json({ error: "You are not logged in." }, { status: 401 });
  }
  return NextResponse.json({
    role: session.role,
    characterId: session.characterId,
    roster: war.roster(token),
    frags: war.frags,
  });
}
