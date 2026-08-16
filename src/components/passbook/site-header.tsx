"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/passbook", label: "Get scored" },
  { href: "/lender", label: "Lender mode" },
  { href: "/insights", label: "Model & fairness" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-signal font-display text-[13px] font-bold text-primary-foreground"
          >
            ₹
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight">Passbook</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
