import type { RosterEntry } from "@/lib/types";

const ORDER: { slot: RosterEntry["kit"][number]["slot"]; label: string }[] = [
  { slot: "head", label: "Head" },
  { slot: "necklace", label: "Neck" },
  { slot: "backpack", label: "Bag" },
  { slot: "armor", label: "Armor" },
  { slot: "right", label: "Weapon" },
  { slot: "left", label: "Shield" },
  { slot: "legs", label: "Legs" },
  { slot: "feet", label: "Feet" },
  { slot: "ring", label: "Ring" },
  { slot: "ammo", label: "Ammo" },
];

export function Paperdoll({ character }: { character: RosterEntry }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Pre-equipped</p>
      <h2 className="font-heading text-xl">{character.name}</h2>
      <p className="text-sm text-muted-foreground">
        Level {character.level} {character.vocationLabel}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Hit points</dt>
        <dd>{character.healthMax}</dd>
        <dt className="text-muted-foreground">Mana</dt>
        <dd>{character.manaMax}</dd>
        <dt className="text-muted-foreground">Magic</dt>
        <dd>{character.skills.magic}</dd>
        <dt className="text-muted-foreground">Shielding</dt>
        <dd>{character.skills.shielding}</dd>
        <dt className="text-muted-foreground">Sword</dt>
        <dd>{character.skills.sword}</dd>
        <dt className="text-muted-foreground">Distance</dt>
        <dd>{character.skills.dist}</dd>
      </dl>
      <ul className="mt-4 space-y-1 text-sm">
        {ORDER.map((row) => {
          const item = character.kit.find((k) => k.slot === row.slot);
          return (
            <li key={row.slot} className="flex justify-between gap-3 border-b border-[#6b4e22]/40 py-1">
              <span className="text-muted-foreground">{row.label}</span>
              <span>{item?.name ?? "—"}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Backpack</p>
      <ul className="mt-1 space-y-1 text-sm">
        {character.backpack.map((item) => (
          <li key={item.name} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
