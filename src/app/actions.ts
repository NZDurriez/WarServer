"use server";

import { redirect } from "next/navigation";
import { clearToken, getToken, setToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export type FormState = { error: string } | null;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const account = String(formData.get("account") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = war.login(account, password);
  if ("error" in result) {
    return { error: result.error };
  }
  await setToken(result.token);
  redirect("/characters");
}

export async function claimAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = await getToken();
  const session = war.session(token);
  if (!session || !token) {
    redirect("/");
  }
  const characterId = String(formData.get("characterId") ?? "");
  const result = war.claim(token, characterId);
  if ("error" in result) {
    return { error: result.error };
  }
  redirect("/war");
}

export async function logoutAction() {
  const token = await getToken();
  if (token) war.release(token);
  await clearToken();
  redirect("/");
}

export async function releaseAction() {
  const token = await getToken();
  if (token) war.release(token);
  redirect("/characters");
}
