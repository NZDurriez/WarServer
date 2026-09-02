"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginWindow() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="gold-panel mx-auto w-full max-w-md rounded-sm p-5 sm:p-6">
      <p className="text-center text-[11px] uppercase tracking-[0.22em] text-primary">
        Enter Game
      </p>
      <h1 className="mt-1 text-center font-heading text-2xl">World War</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Shared account. Preset characters. If a name is taken, pick another.
      </p>
      <form action={formAction} className="mt-5 space-y-3" method="post">
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Account number</span>
          <Input
            name="account"
            autoComplete="username"
            defaultValue="1"
            className="h-9 rounded-sm bg-black/40"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Password</span>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue="1"
            className="h-9 rounded-sm bg-black/40"
          />
        </label>
        {state?.error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Everyone uses <span className="text-foreground">1 / 1</span>. Gamemaster:{" "}
            <span className="text-foreground">god / warlord</span>.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={pending} className="min-w-24 rounded-sm">
            {pending ? "Entering..." : "Ok"}
          </Button>
        </div>
      </form>
    </div>
  );
}
