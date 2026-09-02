import { backpackFor, kitFor } from "./kits";
import type { Character, Team, Vocation } from "./types";

const LOOK_TYPES: Record<Vocation, { male: number; female: number; id: number; label: string }> = {
  ek: { male: 131, female: 139, id: 8, label: "Elite Knight" },
  rp: { male: 129, female: 137, id: 7, label: "Royal Paladin" },
  ms: { male: 130, female: 138, id: 5, label: "Master Sorcerer" },
  ed: { male: 144, female: 148, id: 6, label: "Elder Druid" },
};

const TEAM_LOOK = {
  antica: { head: 94, body: 94, legs: 114, feet: 94 },
  amera: { head: 86, body: 87, legs: 88, feet: 86 },
};

const STATS: Record<Vocation, { hp: number; mana: number; skills: Character["skills"] }> = {
  ek: {
    hp: 1635,
    mana: 550,
    skills: { sword: 90, axe: 85, club: 70, dist: 40, shielding: 90, magic: 8 },
  },
  rp: {
    hp: 1140,
    mana: 1485,
    skills: { sword: 50, axe: 40, club: 40, dist: 90, shielding: 80, magic: 20 },
  },
  ms: {
    hp: 645,
    mana: 3015,
    skills: { sword: 20, axe: 20, club: 20, dist: 20, shielding: 30, magic: 80 },
  },
  ed: {
    hp: 645,
    mana: 3015,
    skills: { sword: 20, axe: 20, club: 20, dist: 20, shielding: 30, magic: 80 },
  },
};

const LAYOUT: { vocation: Vocation; count: number }[] = [
  { vocation: "ek", count: 6 },
  { vocation: "rp", count: 4 },
  { vocation: "ms", count: 4 },
  { vocation: "ed", count: 4 },
];

function makeTeam(team: Team): Character[] {
  const world = team === "antica" ? "Antica" : "Amera";
  const chars: Character[] = [];
  for (const row of LAYOUT) {
    for (let n = 1; n <= row.count; n++) {
      const female = n === 2 || n === 4;
      const spec = LOOK_TYPES[row.vocation];
      const stats = STATS[row.vocation];
      const name = `${world} ${row.vocation.toUpperCase()} ${n}`;
      chars.push({
        id: `${team}-${row.vocation}-${n}`,
        name,
        team,
        vocation: row.vocation,
        vocationLabel: spec.label,
        vocationId: spec.id,
        level: 100,
        sex: female ? "female" : "male",
        lookType: female ? spec.female : spec.male,
        look: TEAM_LOOK[team],
        skills: stats.skills,
        healthMax: stats.hp,
        manaMax: stats.mana,
        kit: kitFor(row.vocation),
        backpack: backpackFor(row.vocation),
      });
    }
  }
  return chars;
}

export const ROSTER: Character[] = [...makeTeam("antica"), ...makeTeam("amera")];

export const CHARACTER_BY_ID = new Map(ROSTER.map((c) => [c.id, c]));

export const SHARED_ACCOUNT = {
  account: "1",
  password: "1",
};

export const GOD_ACCOUNT = {
  account: "god",
  password: "warlord",
};

export function vocationShort(v: Vocation): string {
  return v.toUpperCase();
}
