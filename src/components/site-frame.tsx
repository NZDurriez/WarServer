import Link from "next/link";

export function SiteFrame({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="stone-bg min-h-full flex-1">
      <header className="border-b border-[#6b4e22] bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-heading text-lg tracking-wide text-primary">World War</span>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Antica vs Amera
            </span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link className="hover:text-primary" href="/">
              Login
            </Link>
            <Link className="hover:text-primary" href="/characters">
              Character List
            </Link>
            <Link className="hover:text-primary" href="/guide">
              Run a real OT
            </Link>
          </nav>
        </div>
      </header>
      {eyebrow ? (
        <p className="border-b border-[#6b4e22] bg-black/25 px-4 py-2 text-center text-xs tracking-wide text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
