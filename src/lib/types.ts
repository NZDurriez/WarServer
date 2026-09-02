export type Team = "antica" | "amera";
export type Vocation = "ek" | "rp" | "ms" | "ed";
export type Role = "player" | "god";
export type Dir = "n" | "s" | "e" | "w";

export type GearSlot =
  | "head"
  | "necklace"
  | "backpack"
  | "armor"
  | "right"
  | "left"
  | "legs"
  | "feet"
  | "ring"
  | "ammo";

export type GearPiece = {
  slot: GearSlot;
  name: string;
  itemId: number;
};

export type PackItem = {
  name: string;
  count: number;
  itemId: number;
};

export type Character = {
  id: string;
  name: string;
  team: Team;
  vocation: Vocation;
  vocationLabel: string;
  vocationId: number;
  level: number;
  sex: "male" | "female";
  lookType: number;
  look: { head: number; body: number; legs: number; feet: number };
  skills: {
    sword: number;
    axe: number;
    club: number;
    dist: number;
    shielding: number;
    magic: number;
  };
  healthMax: number;
  manaMax: number;
  kit: GearPiece[];
  backpack: PackItem[];
};

export type RosterEntry = Character & {
  taken: boolean;
  takenByYou: boolean;
};

export type Actor = {
  characterId: string;
  name: string;
  team: Team | "neutral";
  vocation: Vocation | "dummy";
  x: number;
  y: number;
  hp: number;
  hpMax: number;
  mana: number;
  manaMax: number;
  facing: Dir;
  pz: boolean;
  dummy: boolean;
};

export type WarSnapshot = {
  you: Actor | null;
  actors: Actor[];
  width: number;
  height: number;
  tiles: number[][];
  log: string[];
  frags: { antica: number; amera: number };
  message: string | null;
};

export type TileKind = 0 | 1 | 2 | 3 | 4 | 5;
export const TILE = {
  grass: 0,
  dirt: 1,
  stone: 2,
  wall: 3,
  temple: 4,
  water: 5,
} as const;
