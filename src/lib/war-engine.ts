import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildTiles, inProtectionZone, isWall, MAP_H, MAP_W, spawnFor } from "./map";
import { CHARACTER_BY_ID, GOD_ACCOUNT, ROSTER, SHARED_ACCOUNT } from "./roster";
import type { Actor, Dir, Role, RosterEntry, WarSnapshot } from "./types";

const LOCK_TIMEOUT_MS = 10 * 60 * 1000;
const WALK_MS = 180;
const DUMMY_HP = 900;
const STATE_FILE = join("/tmp", "world-war-state.json");

type Session = {
  id: string;
  role: Role;
  characterId: string | null;
  createdAt: number;
};

type Body = {
  characterId: string;
  sessionId: string;
  x: number;
  y: number;
  hp: number;
  mana: number;
  facing: Dir;
  walkReady: number;
  skillReady: number;
  healReady: number;
  dummy: boolean;
  respawnAt: number;
};

type Dummy = {
  id: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  hpMax: number;
  facing: Dir;
  respawnAt: number;
};

function rid(): string {
  return crypto.randomUUID();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roll(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function chebyshev(ax: number, ay: number, bx: number, by: number) {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function step(x: number, y: number, dir: Dir) {
  if (dir === "n") return { x, y: y - 1 };
  if (dir === "s") return { x, y: y + 1 };
  if (dir === "w") return { x: x - 1, y };
  return { x: x + 1, y };
}

class WarEngine {
  tiles = buildTiles();
  sessions = new Map<string, Session>();
  locks = new Map<string, { sessionId: string; lastSeen: number }>();
  bodies = new Map<string, Body>();
  dummies: Dummy[] = [
    { id: "dummy-w", name: "Training Knight", x: 16, y: 11, hp: DUMMY_HP, hpMax: DUMMY_HP, facing: "e", respawnAt: 0 },
    { id: "dummy-e", name: "Training Knight", x: 23, y: 11, hp: DUMMY_HP, hpMax: DUMMY_HP, facing: "w", respawnAt: 0 },
  ];
  log: string[] = ["World War is open. Account 1 / 1. One soul per character."];
  frags = { antica: 0, amera: 0 };
  lastMessages = new Map<string, string>();

  private hydrate() {
    try {
      const data = JSON.parse(readFileSync(STATE_FILE, "utf8")) as {
        sessions: Session[];
        locks: [string, { sessionId: string; lastSeen: number }][];
        bodies: Body[];
        dummies: Dummy[];
        log: string[];
        frags: { antica: number; amera: number };
        lastMessages: [string, string][];
      };
      this.sessions = new Map(data.sessions.map((s) => [s.id, s]));
      this.locks = new Map(data.locks);
      this.bodies = new Map(data.bodies.map((b) => [b.characterId, b]));
      this.dummies = data.dummies;
      this.log = data.log;
      this.frags = data.frags;
      this.lastMessages = new Map(data.lastMessages);
    } catch {
      // first run
    }
  }

  private persist() {
    mkdirSync(dirname(STATE_FILE), { recursive: true });
    const tmp = `${STATE_FILE}.tmp`;
    writeFileSync(
      tmp,
      JSON.stringify({
        sessions: [...this.sessions.values()],
        locks: [...this.locks.entries()],
        bodies: [...this.bodies.values()],
        dummies: this.dummies,
        log: this.log,
        frags: this.frags,
        lastMessages: [...this.lastMessages.entries()],
      }),
    );
    renameSync(tmp, STATE_FILE);
  }

  login(account: string, password: string): { token: string; role: Role } | { error: string } {
    this.hydrate();
    const a = account.trim();
    const p = password;
    if (a === SHARED_ACCOUNT.account && p === SHARED_ACCOUNT.password) {
      const id = rid();
      this.sessions.set(id, { id, role: "player", characterId: null, createdAt: Date.now() });
      this.persist();
      return { token: id, role: "player" };
    }
    if (a === GOD_ACCOUNT.account && p === GOD_ACCOUNT.password) {
      const id = rid();
      this.sessions.set(id, { id, role: "god", characterId: null, createdAt: Date.now() });
      this.persist();
      return { token: id, role: "god" };
    }
    return { error: "Account number or password is not correct." };
  }

  session(token: string | undefined | null): Session | null {
    if (!token) return null;
    this.hydrate();
    this.restoreBody(token);
    return this.sessions.get(token) ?? null;
  }

  roster(token: string | null): RosterEntry[] {
    this.hydrate();
    this.expireLocks();
    return ROSTER.map((c) => {
      const lock = this.locks.get(c.id);
      return {
        ...c,
        taken: Boolean(lock),
        takenByYou: Boolean(lock && token && lock.sessionId === token),
      };
    });
  }

  claim(token: string, characterId: string): { ok: true } | { error: string } {
    this.hydrate();
    this.expireLocks();
    const session = this.sessions.get(token);
    if (!session) return { error: "You are not logged in." };
    const character = CHARACTER_BY_ID.get(characterId);
    if (!character) return { error: "That character does not exist." };

    const existing = this.locks.get(characterId);
    if (existing && existing.sessionId !== token) {
      return { error: "A player is already logged in on this character." };
    }

    if (session.characterId && session.characterId !== characterId) {
      this.releaseCharacter(session.characterId, token);
    }

    this.locks.set(characterId, { sessionId: token, lastSeen: Date.now() });
    session.characterId = characterId;

    const spawn = spawnFor(character.team);
    this.bodies.set(characterId, {
      characterId,
      sessionId: token,
      x: spawn.x,
      y: spawn.y,
      hp: character.healthMax,
      mana: character.manaMax,
      facing: character.team === "antica" ? "e" : "w",
      walkReady: 0,
      skillReady: 0,
      healReady: 0,
      dummy: false,
      respawnAt: 0,
    });
    this.pushLog(`${character.name} entered the war.`);
    this.lastMessages.set(token, `${character.name} is ready. You are pre-equipped.`);
    this.persist();
    return { ok: true };
  }

  release(token: string) {
    this.hydrate();
    const session = this.sessions.get(token);
    if (!session?.characterId) return;
    this.releaseCharacter(session.characterId, token);
    session.characterId = null;
    this.persist();
  }

  heartbeat(token: string) {
    this.hydrate();
    this.restoreBody(token);
    const session = this.sessions.get(token);
    if (!session?.characterId) return;
    const lock = this.locks.get(session.characterId);
    if (lock && lock.sessionId === token) {
      lock.lastSeen = Date.now();
      this.persist();
    }
  }

  unlock(token: string, characterId: string): { ok: true } | { error: string } {
    this.hydrate();
    const session = this.sessions.get(token);
    if (!session || session.role !== "god") return { error: "Only a gamemaster can do that." };
    const lock = this.locks.get(characterId);
    if (!lock) return { ok: true };
    this.releaseCharacter(characterId, lock.sessionId);
    this.persist();
    return { ok: true };
  }

  resetFrags(token: string): { ok: true } | { error: string } {
    this.hydrate();
    const session = this.sessions.get(token);
    if (!session || session.role !== "god") return { error: "Only a gamemaster can do that." };
    this.frags = { antica: 0, amera: 0 };
    this.pushLog("Gamemaster reset the frag count.");
    this.persist();
    return { ok: true };
  }

  snapshot(token: string): WarSnapshot {
    this.hydrate();
    this.restoreBody(token);
    this.expireLocks();
    this.respawnDummies();
    const session = this.sessions.get(token);
    const you = session?.characterId ? this.actorFromBody(this.bodies.get(session.characterId)) : null;
    const actors: Actor[] = [];
    for (const body of this.bodies.values()) {
      const actor = this.actorFromBody(body);
      if (actor) actors.push(actor);
    }
    for (const dummy of this.dummies) {
      if (dummy.hp <= 0) continue;
      actors.push({
        characterId: dummy.id,
        name: dummy.name,
        team: "neutral",
        vocation: "dummy",
        x: dummy.x,
        y: dummy.y,
        hp: dummy.hp,
        hpMax: dummy.hpMax,
        mana: 0,
        manaMax: 0,
        facing: dummy.facing,
        pz: false,
        dummy: true,
      });
    }
    return {
      you,
      actors,
      width: MAP_W,
      height: MAP_H,
      tiles: this.tiles,
      log: this.log.slice(-12),
      frags: { ...this.frags },
      message: token ? (this.lastMessages.get(token) ?? null) : null,
    };
  }

  act(
    token: string,
    action: { type: "move"; dir: Dir } | { type: "attack" } | { type: "skill"; skill: "sd" | "heal" },
  ): { ok: true } | { error: string } {
    this.hydrate();
    this.restoreBody(token);
    this.expireLocks();
    const session = this.sessions.get(token);
    if (!session?.characterId) return { error: "You have not entered a character." };
    const body = this.bodies.get(session.characterId);
    const character = CHARACTER_BY_ID.get(session.characterId);
    if (!body || !character) return { error: "Character missing." };
    const lock = this.locks.get(session.characterId);
    if (lock) lock.lastSeen = Date.now();

    let result: { ok: true } | { error: string };
    if (action.type === "move") result = this.move(body, action.dir);
    else if (action.type === "attack") result = this.attack(body, character.vocation, false);
    else if (action.skill === "heal") result = this.heal(body, character.vocation);
    else result = this.attack(body, character.vocation, true);
    this.persist();
    return result;
  }

  private move(body: Body, dir: Dir): { ok: true } | { error: string } {
    const now = Date.now();
    if (now < body.walkReady) return { ok: true };
    body.facing = dir;
    const next = step(body.x, body.y, dir);
    if (isWall(this.tiles, next.x, next.y)) return { error: "You cannot walk there." };
    if (this.occupied(next.x, next.y, body.characterId)) return { error: "There is not enough room." };
    body.x = next.x;
    body.y = next.y;
    body.walkReady = now + WALK_MS;
    return { ok: true };
  }

  private heal(body: Body, vocation: string): { ok: true } | { error: string } {
    if (vocation !== "ed" && vocation !== "ms") {
      return { error: "You fumble with a healing rune." };
    }
    const now = Date.now();
    if (now < body.healReady) return { error: "You are exhausted." };
    const character = CHARACTER_BY_ID.get(body.characterId);
    if (!character) return { error: "Character missing." };
    if (body.mana < 80) return { error: "You do not have enough mana." };
    body.mana -= 80;
    const amount = vocation === "ed" ? roll(220, 320) : roll(140, 200);
    body.hp = clamp(body.hp + amount, 0, character.healthMax);
    body.healReady = now + 1200;
    this.lastMessages.set(body.sessionId, `You healed yourself for ${amount}.`);
    return { ok: true };
  }

  private attack(body: Body, vocation: string, rune: boolean): { ok: true } | { error: string } {
    const now = Date.now();
    if (now < body.skillReady) return { error: "You are exhausted." };
    if (inProtectionZone(body.x, body.y)) return { error: "You cannot attack in a protection zone." };

    const range = rune || vocation === "ms" || vocation === "ed" ? 4 : vocation === "rp" ? 5 : 1;
    const target = this.nearestEnemy(body, range);
    if (!target) return { error: "There is no target in range." };
    if (target.kind === "player" && inProtectionZone(target.body.x, target.body.y)) {
      return { error: "You cannot attack in a protection zone." };
    }

    if (rune && vocation !== "ms" && vocation !== "ed") {
      return { error: "You do not know that rune." };
    }
    if (rune) {
      if (body.mana < 70) return { error: "You do not have enough mana." };
      body.mana -= 70;
    }

    let dmg = 0;
    if (rune) dmg = roll(160, 240);
    else if (vocation === "ek") dmg = roll(90, 160);
    else if (vocation === "rp") dmg = roll(75, 125);
    else dmg = roll(55, 95);

    body.skillReady = now + (rune ? 1600 : vocation === "ek" ? 900 : 1100);

    if (target.kind === "dummy") {
      const dummy = target.dummy;
      dummy.hp = Math.max(0, dummy.hp - dmg);
      const attacker = CHARACTER_BY_ID.get(body.characterId);
      this.lastMessages.set(body.sessionId, `You deal ${dmg} to ${dummy.name}.`);
      if (dummy.hp <= 0) {
        dummy.respawnAt = now + 8000;
        this.pushLog(`${attacker?.name ?? "Someone"} wrecked a training knight.`);
      }
      return { ok: true };
    }

    const victim = target.body;
    const victimChar = CHARACTER_BY_ID.get(victim.characterId);
    if (!victimChar) return { error: "There is no target in range." };
    victim.hp = Math.max(0, victim.hp - dmg);
    this.lastMessages.set(body.sessionId, `You deal ${dmg} to ${victimChar.name}.`);
    this.lastMessages.set(victim.sessionId, `${characterName(body)} hits you for ${dmg}.`);

    if (victim.hp <= 0) {
      this.frag(body, victim);
    }
    return { ok: true };
  }

  private frag(killer: Body, victim: Body) {
    const killerChar = CHARACTER_BY_ID.get(killer.characterId);
    const victimChar = CHARACTER_BY_ID.get(victim.characterId);
    if (!killerChar || !victimChar) return;
    if (killerChar.team !== victimChar.team) {
      this.frags[killerChar.team] += 1;
    }
    this.pushLog(`${killerChar.name} fragged ${victimChar.name}.`);
    const spawn = spawnFor(victimChar.team);
    victim.hp = victimChar.healthMax;
    victim.mana = victimChar.manaMax;
    victim.x = spawn.x;
    victim.y = spawn.y;
    this.lastMessages.set(victim.sessionId, "You died. You respawn at your temple, fully kitted.");
  }

  private nearestEnemy(
    body: Body,
    range: number,
  ): { kind: "player"; body: Body } | { kind: "dummy"; dummy: Dummy } | null {
    const character = CHARACTER_BY_ID.get(body.characterId);
    if (!character) return null;
    let bestDist = Infinity;
    let best: { kind: "player"; body: Body } | { kind: "dummy"; dummy: Dummy } | null = null;

    for (const other of this.bodies.values()) {
      if (other.characterId === body.characterId) continue;
      const otherChar = CHARACTER_BY_ID.get(other.characterId);
      if (!otherChar || otherChar.team === character.team) continue;
      const dist = chebyshev(body.x, body.y, other.x, other.y);
      if (dist > range || dist >= bestDist) continue;
      bestDist = dist;
      best = { kind: "player", body: other };
    }
    for (const dummy of this.dummies) {
      if (dummy.hp <= 0) continue;
      const dist = chebyshev(body.x, body.y, dummy.x, dummy.y);
      if (dist > range || dist >= bestDist) continue;
      bestDist = dist;
      best = { kind: "dummy", dummy };
    }
    return best;
  }

  private occupied(x: number, y: number, ignoreId: string) {
    for (const body of this.bodies.values()) {
      if (body.characterId === ignoreId) continue;
      if (body.x === x && body.y === y) return true;
    }
    for (const dummy of this.dummies) {
      if (dummy.hp <= 0) continue;
      if (dummy.x === x && dummy.y === y) return true;
    }
    return false;
  }

  private restoreBody(token: string) {
    const session = this.sessions.get(token);
    if (!session?.characterId) return;
    const character = CHARACTER_BY_ID.get(session.characterId);
    if (!character) return;
    const lock = this.locks.get(session.characterId);
    if (!lock || lock.sessionId === token) {
      this.locks.set(session.characterId, { sessionId: token, lastSeen: Date.now() });
    }
    if (this.bodies.has(session.characterId)) return;
    const spawn = spawnFor(character.team);
    this.bodies.set(session.characterId, {
      characterId: session.characterId,
      sessionId: token,
      x: spawn.x,
      y: spawn.y,
      hp: character.healthMax,
      mana: character.manaMax,
      facing: character.team === "antica" ? "e" : "w",
      walkReady: 0,
      skillReady: 0,
      healReady: 0,
      dummy: false,
      respawnAt: 0,
    });
    this.persist();
  }

  private actorFromBody(body: Body | undefined): Actor | null {
    if (!body) return null;
    const character = CHARACTER_BY_ID.get(body.characterId);
    if (!character) return null;
    return {
      characterId: body.characterId,
      name: character.name,
      team: character.team,
      vocation: character.vocation,
      x: body.x,
      y: body.y,
      hp: body.hp,
      hpMax: character.healthMax,
      mana: body.mana,
      manaMax: character.manaMax,
      facing: body.facing,
      pz: inProtectionZone(body.x, body.y),
      dummy: false,
    };
  }

  private releaseCharacter(characterId: string, token: string) {
    const lock = this.locks.get(characterId);
    if (lock && lock.sessionId === token) this.locks.delete(characterId);
    const body = this.bodies.get(characterId);
    if (body && body.sessionId === token) this.bodies.delete(characterId);
    const session = this.sessions.get(token);
    if (session?.characterId === characterId) session.characterId = null;
    const character = CHARACTER_BY_ID.get(characterId);
    if (character) this.pushLog(`${character.name} left the war.`);
  }

  private expireLocks() {
    const now = Date.now();
    let changed = false;
    for (const [characterId, lock] of this.locks) {
      if (now - lock.lastSeen > LOCK_TIMEOUT_MS) {
        this.releaseCharacter(characterId, lock.sessionId);
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  private respawnDummies() {
    const now = Date.now();
    for (const dummy of this.dummies) {
      if (dummy.hp <= 0 && dummy.respawnAt && now >= dummy.respawnAt) {
        dummy.hp = dummy.hpMax;
        dummy.respawnAt = 0;
      }
    }
  }

  private pushLog(line: string) {
    this.log.push(line);
    if (this.log.length > 40) this.log.splice(0, this.log.length - 40);
  }
}

function characterName(body: Body) {
  return CHARACTER_BY_ID.get(body.characterId)?.name ?? "Someone";
}

const globalForWar = globalThis as unknown as { __worldWar?: WarEngine };
export const war = globalForWar.__worldWar ?? new WarEngine();
globalForWar.__worldWar = war;
