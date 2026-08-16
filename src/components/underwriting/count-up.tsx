"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 900,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  /** milliseconds */
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let frame: number;
    let done = false;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setDisplay(value * easeOutCubic(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        done = true;
      }
    };
    frame = requestAnimationFrame(tick);

    // Safety net: if rAF is throttled (backgrounded tab, low-power mode) and
    // never completes the animation, land on the exact final value anyway.
    const fallback = window.setTimeout(() => {
      if (!done) setDisplay(value);
    }, duration + 150);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {Math.round(display).toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
