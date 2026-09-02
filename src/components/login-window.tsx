"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginWindow() {
  const router = useRouter();
  const [account, setAccount] = useState("1");
  const [password, setPassword] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not enter the game.");
        return;
      }
      router.push("/characters");
      router.refresh();
    } catch {
      setError("The game server is not answering.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gold-panel mx-auto w-full max-w-md rounded-sm p-5 sm:p-6">
      <p className="text-center text-[11px] uppercase tracking-[0.22em] text-primary">
        Enter Game
      </p>
      <h1 className="mt-1 text-center font-heading text-2xl">World War</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Shared account. Preset characters. If a name is taken, pick another.
      </p>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Account number</span>
          <Input
            autoComplete="username"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="h-9 rounded-sm bg-black/40"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Password</span>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 rounded-sm bg-black/40"
          />
        </label>
        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Everyone uses <span className="text-foreground">1 / 1</span>. Gamemaster:{" "}
            <span className="text-foreground">god / warlord</span>.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={loading} className="min-w-24 rounded-sm">
            {loading ? "Entering..." : "Ok"}
          </Button>
        </div>
      </form>
    </div>
  );
}
