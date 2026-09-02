import { TILE } from "./types";

export const MAP_W = 40;
export const MAP_H = 22;

export const ANTICA_SPAWN = { x: 3, y: 11 };
export const AMERA_SPAWN = { x: 36, y: 11 };

export function buildTiles(): number[][] {
  const tiles: number[][] = [];
  for (let y = 0; y < MAP_H; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_W; x++) {
      let t: number = TILE.grass;
      if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) t = TILE.water;
      else if (x <= 7 && y >= 8 && y <= 14) t = TILE.temple;
      else if (x >= 32 && y >= 8 && y <= 14) t = TILE.temple;
      else if (x >= 16 && x <= 23) t = TILE.dirt;
      else if ((x + y) % 7 === 0) t = TILE.dirt;
      row.push(t);
    }
    tiles.push(row);
  }

  function wall(x: number, y: number) {
    if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) tiles[y][x] = TILE.wall;
  }

  for (let x = 1; x <= 8; x++) {
    wall(x, 7);
    wall(x, 15);
  }
  for (let y = 7; y <= 15; y++) wall(1, y);
  wall(8, 7);
  wall(8, 8);
  wall(8, 14);
  wall(8, 15);

  for (let x = 31; x <= 38; x++) {
    wall(x, 7);
    wall(x, 15);
  }
  for (let y = 7; y <= 15; y++) wall(38, y);
  wall(31, 7);
  wall(31, 8);
  wall(31, 14);
  wall(31, 15);

  for (let y = 1; y < MAP_H - 1; y++) {
    if (y >= 9 && y <= 13) continue;
    wall(19, y);
    wall(20, y);
  }

  return tiles;
}

export function isWall(tiles: number[][], x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  const t = tiles[y][x];
  return t === TILE.wall || t === TILE.water;
}

export function inProtectionZone(x: number, y: number): boolean {
  const antica = x <= 8 && y >= 8 && y <= 14;
  const amera = x >= 31 && y >= 8 && y <= 14;
  return antica || amera;
}

export function spawnFor(team: "antica" | "amera") {
  return team === "antica" ? { ...ANTICA_SPAWN } : { ...AMERA_SPAWN };
}
