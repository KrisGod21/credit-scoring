import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";

export function PageShell({
  children,
  className,
  bleed = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Skip the inner container — the page manages its own full-bleed sections. */
  bleed?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="grain-overlay" aria-hidden />
      <SiteHeader />
      <main className="flex-1">
        {bleed ? children : <div className={cn("mx-auto w-full max-w-[1560px] px-6 py-14 sm:px-10 lg:px-14", className)}>{children}</div>}
      </main>
      <footer className="mt-auto">
        <hr className="rule-fade" />
        <div className="mx-auto flex w-full max-w-[1560px] flex-wrap items-center justify-between gap-3 px-6 py-7 font-mono text-[11px] text-muted-foreground sm:px-10 lg:px-14">
          <span>Omnikon 2026 · Omni_FinTech_2</span>
          <span>Demo data. Scores computed from a synthetic training set.</span>
        </div>
      </footer>
    </div>
  );
}
