import { cookies } from "next/headers";

export const SESSION_COOKIE = "war_session";

export async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function setToken(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearToken() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
