# World War — Antica vs Amera

Repo: [github.com/NZDurriez/WarServer](https://github.com/NZDurriez/WarServer)

Old Open Tibia war servers were not a different engine. They were a normal OT server with a **shared account**, a **pre-made character list**, and a **login script that kits you**. This repo is that setup: a browser desk so you can use the roster immediately, plus a drop-in overlay for The Forgotten Server 8.60.

```bash
git clone https://github.com/NZDurriez/WarServer.git
cd WarServer
npm install
npm run dev
```

## What you remember, mapped to real settings

Everybody logged in with `1` / `1`. The client showed names like `Antica EK 1` and `Amera MS 2`. If someone was already in that character, you got *already logged in* and picked another. Equipment, skills, and bless were applied on login — nobody walked to a depot.

That is three TFS flags plus a SQL seed:

```lua
onePlayerOnlinePerAccount = false  -- many players on account 1 at once
allowClones = false                 -- one soul per character name
replaceKickOnLogin = false          -- a second login does not kick the first
```

If `replaceKickOnLogin` stays true (TFS default), the next person to pick that name steals the body. That is the opposite of those old war lists.

## Try the roster

Open [http://127.0.0.1:43141](http://127.0.0.1:43141). Account `1` / `1`. Pick a free name. Open a second browser window to see a taken character refuse you.

Gamemaster: `god` / `warlord` (can unlock names).

The war field is a small original map so you can walk, hit, and frag without compiling TFS. It is not a Tibia client.

## Run a real 8.60 server

You still need a TFS binary, an 8.60 datapack, and a client. This repo does **not** ship CipSoft sprites, the official client, or ripped city maps.

1. Get [TFS 1.5 for protocol 8.60](https://github.com/nekiro/TFS-1.5-Downgrades/tree/8.60) (archived) or a maintained fork such as [Greed-TFS-1.5-Downgrades](https://github.com/fdc23/Greed-TFS-1.5-Downgrades). Compile it.
2. Use an 8.60 datapack (items, vocations, spells, monsters). OTLand is where those live.
3. Start MariaDB and load the schema + roster:

```bash
docker compose up -d db
```

That listens on **3307**. User `tfs`, password `war`, database `tfs`. Without Docker, import `server/sql/00-schema.sql` then `server/sql/01-war-seed.sql` yourself.

4. Copy `server/config.lua` over TFS `config.lua`. Set `ip`, mysql, and `mapName`.
5. Copy `server/data/scripts/world_war.lua` into the datapack `data/scripts/` folder. Revscripts load it on startup.
6. Edit the temple `Position(...)` values at the top of `world_war.lua` so they match **your** map.
7. Build a two-temple war map in Remere's Map Editor (west Antica PZ, east Amera PZ, open field in the middle). Name the `.otbm` to match `mapName`.
8. Point an 8.60 client or OTClient at `127.0.0.1`, login `1` / `1`, pick a free character.

`world_war.lua` wipes inventory on login, blesses, haste, and stuffs the vocation kit. Characters are seeded with `save = 0` so a stripped corpse does not persist after logout. Death teleports you home and re-kits instead of leaving a body.

### Accounts

| Account | Password | What it is |
| --- | --- | --- |
| `1` | `1` | Shared war roster (36 characters) |
| `god` | `warlord` | Gamemaster character |

### Roster

Each world has 6 Elite Knights, 4 Royal Paladins, 4 Master Sorcerers, 4 Elder Druids. Names are `Antica EK 1` … `Amera ED 4`.

## Why not include TFS itself?

TFS is large, needs a datapack you choose, and a real client still needs item/sprite files you must obtain legally. The overlay here is the war-specific part: roster SQL, config, and login kit. The browser desk is so you can run the *idea* today.

## Legal

Do not redistribute the official Tibia client, sprite sheets, or official city maps. OTClient is open source; TFS is GPL. `server/sql/00-schema.sql` is from The Forgotten Server (GPL-2.0).
