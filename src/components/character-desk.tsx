"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RosterEntry, Team } from "@/lib/types";
import { Paperdoll } from "@/components/paperdoll";

type Payload = {
  role: "player" | "god";
  characterId: string | null;
  roster: RosterEntry[];
  frags: { antica: number; amera: number };
};

export function CharacterDesk() {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/roster", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/");
      return;
    }
    if (!res.ok) {
      setError("Could not load the character list.");
      return;
    }
    const json = (await res.json()) as Payload;
    setData(json);
    setSelected((current) => current ?? json.characterId ?? json.roster.find((c) => !c.taken)?.id ?? json.roster[0]?.id ?? null);
  }

  useEffect(() => {
    const boot = setTimeout(() => {
      load().catch(() => setError("Could not load the character list."));
    }, 0);
    const id = setInterval(() => {
      load().catch(() => undefined);
    }, 1500);
    return () => {
      clearTimeout(boot);
      clearInterval(id);
    };
    // The roster poll is intentionally mounted once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedChar = useMemo(
    () => data?.roster.find((c) => c.id === selected) ?? null,
    [data, selected],
  );

  async function enter() {
    if (!selectedChar) return;
    if (selectedChar.taken && !selectedChar.takenByYou) {
      setDialog("A player is already logged in on this character.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: selectedChar.id }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setDialog(json.error ?? "Could not enter with that character.");
        await load();
        return;
      }
      router.push("/war");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  async function unlock(id: string) {
    await fetch("/api/gm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: id }),
    });
    await load();
  }

  if (error) {
    return (
      <div className="gold-panel rounded-sm p-6 text-center">
        <p>{error}</p>
        <Button className="mt-4 rounded-sm" onClick={() => router.push("/")}>
          Back to login
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="gold-panel rounded-sm p-8 text-center text-muted-foreground">
        Loading character list...
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="gold-panel rounded-sm p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Select Character</p>
            <h1 className="font-heading text-2xl">Character List</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-[#c4472c]">Antica {data.frags.antica}</span>
            <span className="text-[#6db4d4]">Amera {data.frags.amera}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Account 1 holds the whole roster. A taken name stays locked until that player logs out or drops.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TeamColumn
            team="antica"
            title="Antica"
            roster={data.roster}
            selected={selected}
            onSelect={setSelected}
            onUnlock={data.role === "god" ? unlock : undefined}
          />
          <TeamColumn
            team="amera"
            title="Amera"
            roster={data.roster}
            selected={selected}
            onSelect={setSelected}
            onUnlock={data.role === "god" ? unlock : undefined}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="rounded-sm" onClick={logout}>
            Logout
          </Button>
          <Button className="rounded-sm" disabled={busy || !selectedChar} onClick={enter}>
            {busy ? "Entering..." : "Ok"}
          </Button>
        </div>
      </div>
      <aside className="gold-panel rounded-sm p-4">
        {selectedChar ? (
          <Paperdoll character={selectedChar} />
        ) : (
          <p className="text-sm text-muted-foreground">Select a character to inspect the kit.</p>
        )}
      </aside>
      <Dialog open={Boolean(dialog)} onOpenChange={() => setDialog(null)}>
        <DialogContent className="rounded-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Already logged in</DialogTitle>
            <DialogDescription>{dialog}</DialogDescription>
          </DialogHeader>
          <Button className="rounded-sm" onClick={() => setDialog(null)}>
            Ok
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamColumn({
  team,
  title,
  roster,
  selected,
  onSelect,
  onUnlock,
}: {
  team: Team;
  title: string;
  roster: RosterEntry[];
  selected: string | null;
  onSelect: (id: string) => void;
  onUnlock?: (id: string) => void;
}) {
  const rows = roster.filter((c) => c.team === team);
  const free = rows.filter((c) => !c.taken).length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-lg">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {free} free / {rows.length}
        </span>
      </div>
      <div className="overflow-hidden rounded-sm border border-[#6b4e22]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Voc</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const active = selected === c.id;
              return (
                <tr
                  key={c.id}
                  className={`cursor-pointer border-t border-[#6b4e22]/60 ${
                    active ? "bg-primary/15" : "hover:bg-white/5"
                  } ${c.taken && !c.takenByYou ? "opacity-70" : ""}`}
                  onClick={() => onSelect(c.id)}
                >
                  <td className="px-2 py-1.5 font-medium">{c.name}</td>
                  <td className="px-2 py-1.5">{c.vocation.toUpperCase()}</td>
                  <td className="px-2 py-1.5">
                    {c.takenByYou ? (
                      <Badge className="rounded-sm">You</Badge>
                    ) : c.taken ? (
                      <span className="flex items-center gap-2">
                        <Badge variant="destructive" className="rounded-sm">
                          Taken
                        </Badge>
                        {onUnlock ? (
                          <button
                            className="text-xs text-primary underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnlock(c.id);
                            }}
                          >
                            Unlock
                          </button>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-emerald-400/90">Free</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
