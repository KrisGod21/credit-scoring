import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-foreground/70 font-display text-sm font-semibold"
          >
            ₹
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Passbook
          </span>
        </Link>
        <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-wider text-primary-foreground/80">
          <Link href="/passbook" className="transition-colors hover:text-primary-foreground">
            Get scored
          </Link>
          <Link href="/insights" className="transition-colors hover:text-primary-foreground">
            How it works
          </Link>
        </nav>
      </div>
    </header>
  );
}
