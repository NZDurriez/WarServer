# TFS 8.60 overlay

Drop these files onto a compiled The Forgotten Server 8.60 datapack.

1. Import `sql/00-schema.sql` then `sql/01-war-seed.sql`.
2. Copy `config.lua` next to the TFS binary and set `ip` / mysql.
3. Copy `data/scripts/world_war.lua` into the datapack `data/scripts/` folder.
4. Change the temple `Position` values in `world_war.lua` to match your map.

See the root README for why `onePlayerOnlinePerAccount` must be false and `replaceKickOnLogin` must be false.
