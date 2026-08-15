import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="ledger-page ledger-margin flex-1">
        <div
          className={cn(
            "mx-auto max-w-4xl px-8 py-12 pl-14 sm:pl-20 sm:pr-10",
            className
          )}
        >
          {children}
        </div>
      </main>
      <footer className="border-t border-paper-line px-8 py-6 pl-14 font-mono text-[11px] text-muted-foreground sm:pl-20">
        Omnikon Hackathon 2026 · Omni_FinTech_2 · Scores are illustrative and
        computed from a synthetic training dataset.
      </footer>
    </div>
  );
}
