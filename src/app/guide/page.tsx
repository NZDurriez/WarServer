import { SiteFrame } from "@/components/site-frame";

export default function GuidePage() {
  return (
    <SiteFrame eyebrow="Drop-in files for The Forgotten Server 8.60 live in /server.">
      <article className="gold-panel max-w-3xl space-y-5 rounded-sm p-5 leading-7">
        <h1 className="font-heading text-3xl">Get a real Open Tibia war server running</h1>
        <p>
          The old Antica vs Amera servers were not a special engine. They were a normal OT server
          with four tricks: a shared account, a pre-created character list, clone protection, and a
          login script that kits everybody.
        </p>

        <h2 className="font-heading text-2xl">What you need</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>The Forgotten Server 1.5 downgraded to protocol 8.60 (Nekiro / community forks).</li>
          <li>A matching 8.60 datapack (items, vocations, spells). This repo does not ship CipSoft sprites or maps.</li>
          <li>MariaDB, and an 8.60 client or OTClient pointed at 127.0.0.1:7171.</li>
          <li>A small war map with two temples and an open field. Build it in Remere&apos;s Map Editor.</li>
        </ul>

        <h2 className="font-heading text-2xl">The login trick</h2>
        <p>
          Create one account named <code>1</code> with password <code>1</code>. Insert every war
          character on that account. Then set:
        </p>
        <pre className="overflow-x-auto rounded-sm bg-black/40 p-3 text-sm">
{`onePlayerOnlinePerAccount = false
allowClones = false
replaceKickOnLogin = false
showOnlineStatusInCharlist = true`}
        </pre>
        <p>
          Several people can sit on account 1 at once. They cannot take a name that is already
          online. If <code>replaceKickOnLogin</code> stays true, a second person can steal the
          character by kicking the first — the opposite of what you want.
        </p>

        <h2 className="font-heading text-2xl">This repo&apos;s overlay</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Import <code>server/sql/00-schema.sql</code> then <code>server/sql/01-war-seed.sql</code>{" "}
            into a MariaDB database named <code>tfs</code>.
          </li>
          <li>
            Copy <code>server/config.lua</code> over your TFS <code>config.lua</code> and set mysql
            user/password/ip.
          </li>
          <li>
            Copy <code>server/data/scripts/world_war.lua</code> into your datapack{" "}
            <code>data/scripts/</code> folder. Revscripts load it automatically.
          </li>
          <li>
            Point <code>mapName</code> at your war map and set the Antica / Amera temple coordinates
            at the top of <code>world_war.lua</code>.
          </li>
          <li>
            Start TFS, open an 8.60 client, log in with 1 / 1, pick a free name.
          </li>
        </ol>
        <p>
          Docker is optional: <code>docker compose up -d db</code> starts MariaDB on port 3307 and
          runs the SQL files. You still compile TFS on the host (or in your own image) because a war
          server needs your datapack.
        </p>

        <h2 className="font-heading text-2xl">Why equipment looks “already on”</h2>
        <p>
          The seed sets level 100, promoted vocations, and skills. The Lua login event then wipes
          inventory, blesses you, haste, and stuffs the vocation kit into the paperdoll. Characters
          use <code>save = 0</code> so a loot-stripped corpse does not persist after logout.
        </p>

        <h2 className="font-heading text-2xl">What this browser desk is</h2>
        <p>
          Use Login → Character List → War Field here to feel the roster lock without compiling
          anything. Open a second browser if you want to see “already logged in” on a taken name.
          When you are ready for a real client, follow the overlay above.
        </p>
      </article>
    </SiteFrame>
  );
}
