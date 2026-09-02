"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TILE } from "@/lib/types";
import type { Dir, WarSnapshot } from "@/lib/types";
import { releaseAction } from "@/app/actions";

const TILE_COLORS: Record<number, [string, string]> = {
  [TILE.grass]: ["#3f6b2c", "#355c26"],
  [TILE.dirt]: ["#8a6a38", "#74582e"],
  [TILE.stone]: ["#6a6a62", "#55554e"],
  [TILE.wall]: ["#3a2c18", "#2a1e10"],
  [TILE.temple]: ["#7a6a4a", "#645538"],
  [TILE.water]: ["#1d4a68", "#163a54"],
};

export function WarField() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<WarSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const apply = useCallback((next: WarSnapshot) => {
    setState(next);
    if (next.message) setFlash(next.message);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/war", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/");
      return;
    }
    const json = (await res.json()) as WarSnapshot & { error?: string };
    if (!res.ok) {
      setError(json.error ?? "The war field could not be loaded.");
      return;
    }
    if (!json.you) {
      router.push("/characters");
      return;
    }
    apply(json);
  }, [apply, router]);

  async function act(payload: { type: "move"; dir: Dir } | { type: "attack" } | { type: "skill"; skill: "sd" | "heal" }) {
    const res = await fetch("/api/war", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { error?: string; state?: WarSnapshot };
    if (json.state) apply(json.state);
    if (json.error) setFlash(json.error);
  }

  useEffect(() => {
    const boot = setTimeout(() => {
      load().catch(() => setError("The war field could not be loaded."));
    }, 0);
    const poll = setInterval(() => {
      load().catch(() => undefined);
    }, 220);
    const beat = setInterval(() => {
      fetch("/api/heartbeat", { method: "POST" }).catch(() => undefined);
    }, 5000);
    return () => {
      clearTimeout(boot);
      clearInterval(poll);
      clearInterval(beat);
    };
  }, [load]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
        event.preventDefault();
      }
      if (key === "arrowup" || key === "w") void act({ type: "move", dir: "n" });
      if (key === "arrowdown" || key === "s") void act({ type: "move", dir: "s" });
      if (key === "arrowleft" || key === "a") void act({ type: "move", dir: "w" });
      if (key === "arrowright" || key === "d") void act({ type: "move", dir: "e" });
      if (key === " " || key === "f") void act({ type: "attack" });
      if (key === "r") void act({ type: "skill", skill: "sd" });
      if (key === "h" || key === "e") void act({ type: "skill", skill: "heal" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // Intentionally bind once; actions always POST to the live session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
        const size = Math.max(10, Math.floor(Math.min(canvas.clientWidth / state.width, 22)));
    canvas.width = size * state.width;
    canvas.height = size * state.height;
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        const kind = state.tiles[y][x];
        const pair = TILE_COLORS[kind] ?? TILE_COLORS[TILE.grass];
        ctx.fillStyle = (x + y) % 2 === 0 ? pair[0] : pair[1];
        ctx.fillRect(x * size, y * size, size, size);
      }
    }

    for (const actor of state.actors) {
      const px = actor.x * size;
      const py = actor.y * size;
      ctx.fillStyle =
        actor.team === "antica" ? "#9a2c22" : actor.team === "amera" ? "#2a6f9a" : "#6a6a6a";
      ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
      ctx.strokeStyle = state.you?.characterId === actor.characterId ? "#f3d26a" : "#120e08";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
      ctx.fillStyle = "#f3e6c4";
      ctx.font = `${Math.max(8, size - 8)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const mark = actor.vocation === "dummy" ? "D" : actor.vocation.toUpperCase().slice(0, 2);
      ctx.fillText(mark, px + size / 2, py + size / 2);
      const hpW = size - 4;
      ctx.fillStyle = "#1a1008";
      ctx.fillRect(px + 2, py + size - 5, hpW, 3);
      ctx.fillStyle = "#c4472c";
      ctx.fillRect(px + 2, py + size - 5, hpW * (actor.hp / actor.hpMax), 3);
    }
  }, [state]);

  if (error) {
    return (
      <div className="gold-panel rounded-sm p-6 text-center">
        <p>{error}</p>
        <Button className="mt-4 rounded-sm" onClick={() => router.push("/characters")}>
          Character list
        </Button>
      </div>
    );
  }

  if (!state?.you) {
    return (
      <div className="gold-panel rounded-sm p-8 text-center text-muted-foreground">
        Entering the field...
      </div>
    );
  }

  const you = state.you;
  const hpPct = Math.round((you.hp / you.hpMax) * 100);
  const manaPct = Math.round((you.mana / you.manaMax) * 100);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="gold-panel rounded-sm p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary">War Field</p>
            <h1 className="font-heading text-xl">{you.name}</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-[#c4472c]">Antica {state.frags.antica}</span>
            <span className="text-[#6db4d4]">Amera {state.frags.amera}</span>
          </div>
        </div>
        <div className="overflow-auto rounded-sm border border-[#6b4e22] bg-black">
          <canvas ref={canvasRef} className="mx-auto block h-auto w-full max-w-full" style={{ imageRendering: "pixelated" }} />
        </div>
        {flash ? <p className="mt-2 text-sm text-primary">{flash}</p> : null}
        <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
          <span />
          <Button className="rounded-sm" onClick={() => void act({ type: "move", dir: "n" })}>
            N
          </Button>
          <span />
          <Button className="rounded-sm" onClick={() => void act({ type: "move", dir: "w" })}>
            W
          </Button>
          <Button className="rounded-sm" onClick={() => void act({ type: "attack" })}>
            Hit
          </Button>
          <Button className="rounded-sm" onClick={() => void act({ type: "move", dir: "e" })}>
            E
          </Button>
          <Button variant="outline" className="rounded-sm" onClick={() => void act({ type: "skill", skill: "heal" })}>
            UH
          </Button>
          <Button className="rounded-sm" onClick={() => void act({ type: "move", dir: "s" })}>
            S
          </Button>
          <Button variant="outline" className="rounded-sm" onClick={() => void act({ type: "skill", skill: "sd" })}>
            SD
          </Button>
        </div>
      </div>
      <aside className="gold-panel space-y-3 rounded-sm p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {you.pz ? "Protection zone" : "Open war"}
        </p>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span>Health</span>
            <span>
              {you.hp}/{you.hpMax}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm bg-black/50">
            <div className="hp-bar h-full" style={{ width: `${hpPct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span>Mana</span>
            <span>
              {you.mana}/{you.manaMax}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm bg-black/50">
            <div className="mana-bar h-full" style={{ width: `${manaPct}%` }} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          WASD or arrows to walk. Space to hit. R for Sudden Death. H to heal. Training knights wait at the gate.
        </p>
        <ul className="h-40 overflow-auto border border-[#6b4e22] bg-black/30 p-2 text-xs leading-5">
          {state.log.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
        <form action={releaseAction}>
          <Button type="submit" variant="outline" className="w-full rounded-sm">
            Logout character
          </Button>
        </form>
      </aside>
    </div>
  );
}
