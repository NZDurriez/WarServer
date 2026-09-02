import { LoginWindow } from "@/components/login-window";
import { SiteFrame } from "@/components/site-frame";

export default function HomePage() {
  return (
    <SiteFrame eyebrow="Open Tibia war, the old way: one account, a fixed roster, first come first served.">
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <LoginWindow />
        <section className="gold-panel rounded-sm p-5">
          <h2 className="font-heading text-xl">How these servers worked</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Everybody logged in with the same account, usually 1 / 1.</li>
            <li>The character list was pre-made: Antica EK 1, Amera MS 2, and so on.</li>
            <li>If that name was already in the game, you got “already logged in” and picked another.</li>
            <li>Login scripts shoved full war equipment, skills, bless, and haste onto you.</li>
            <li>You spawned in your world’s temple and walked into the middle.</li>
          </ol>
          <p className="mt-4 text-sm">
            This desk is the login and lock system you remember, playable in the browser. The{" "}
            <a className="text-primary underline" href="/guide">
              real OT guide
            </a>{" "}
            drops the same roster onto The Forgotten Server 8.60.
          </p>
        </section>
      </div>
    </SiteFrame>
  );
}
