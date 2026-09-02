import type { GearPiece, PackItem, Vocation } from "./types";

const uh: PackItem = { name: "Ultimate Healing Rune", count: 100, itemId: 2273 };
const sd: PackItem = { name: "Sudden Death Rune", count: 80, itemId: 2268 };
const mw: PackItem = { name: "Magic Wall Rune", count: 20, itemId: 2293 };
const ghp: PackItem = { name: "Great Health Potion", count: 50, itemId: 7591 };
const smp: PackItem = { name: "Strong Mana Potion", count: 80, itemId: 7589 };
const coins: PackItem = { name: "Crystal Coin", count: 20, itemId: 2160 };

export function kitFor(vocation: Vocation): GearPiece[] {
  switch (vocation) {
    case "ek":
      return [
        { slot: "head", name: "Demon Helmet", itemId: 2493 },
        { slot: "necklace", name: "Amulet of Loss", itemId: 2173 },
        { slot: "backpack", name: "Backpack", itemId: 1988 },
        { slot: "armor", name: "Magic Plate Armor", itemId: 2472 },
        { slot: "right", name: "Magic Sword", itemId: 2400 },
        { slot: "left", name: "Demon Shield", itemId: 2520 },
        { slot: "legs", name: "Demon Legs", itemId: 2495 },
        { slot: "feet", name: "Steel Boots", itemId: 2645 },
        { slot: "ring", name: "Time Ring", itemId: 2169 },
      ];
    case "rp":
      return [
        { slot: "head", name: "Royal Helmet", itemId: 2498 },
        { slot: "necklace", name: "Amulet of Loss", itemId: 2173 },
        { slot: "backpack", name: "Backpack", itemId: 1988 },
        { slot: "armor", name: "Paladin Armor", itemId: 2663 },
        { slot: "right", name: "Bow", itemId: 2456 },
        { slot: "left", name: "Demon Shield", itemId: 2520 },
        { slot: "legs", name: "Plate Legs", itemId: 2647 },
        { slot: "feet", name: "Boots of Haste", itemId: 2195 },
        { slot: "ring", name: "Time Ring", itemId: 2169 },
        { slot: "ammo", name: "Sniper Arrow", itemId: 7364 },
      ];
    case "ms":
      return [
        { slot: "head", name: "Hat of the Mad", itemId: 2323 },
        { slot: "necklace", name: "Amulet of Loss", itemId: 2173 },
        { slot: "backpack", name: "Backpack", itemId: 1988 },
        { slot: "armor", name: "Blue Robe", itemId: 2656 },
        { slot: "right", name: "Wand of Inferno", itemId: 2187 },
        { slot: "left", name: "Spellbook", itemId: 2175 },
        { slot: "legs", name: "Plate Legs", itemId: 2647 },
        { slot: "feet", name: "Boots of Haste", itemId: 2195 },
        { slot: "ring", name: "Energy Ring", itemId: 2167 },
      ];
    case "ed":
      return [
        { slot: "head", name: "Hat of the Mad", itemId: 2323 },
        { slot: "necklace", name: "Amulet of Loss", itemId: 2173 },
        { slot: "backpack", name: "Backpack", itemId: 1988 },
        { slot: "armor", name: "Blue Robe", itemId: 2656 },
        { slot: "right", name: "Quagmire Rod", itemId: 2181 },
        { slot: "left", name: "Spellbook", itemId: 2175 },
        { slot: "legs", name: "Plate Legs", itemId: 2647 },
        { slot: "feet", name: "Boots of Haste", itemId: 2195 },
        { slot: "ring", name: "Energy Ring", itemId: 2167 },
      ];
  }
}

export function backpackFor(vocation: Vocation): PackItem[] {
  if (vocation === "ek") return [uh, ghp, mw, coins];
  if (vocation === "rp") return [uh, ghp, mw, coins, { name: "Sniper Arrow", count: 200, itemId: 7364 }];
  return [uh, sd, mw, smp, coins];
}
