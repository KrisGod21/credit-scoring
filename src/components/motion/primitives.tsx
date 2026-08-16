"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/** Weighty spring used for anything that should feel physical rather than
 * timed — cards settling, panels arriving. */
export const SPRING = { type: "spring" as const, stiffness: 260, damping: 30, mass: 0.9 };

const EASE = [0.2, 0.8, 0.3, 1] as const;

/** Content rising into place as it enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Parent that cascades its RevealItem children instead of mounting them
 * all at once. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : stagger } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={revealItem}>
      {children}
    </motion.div>
  );
}

/** Mount-triggered entrance, for content that appears from a state change
 * (tab switch, async result) rather than from scrolling. */
export function Enter({
  children,
  className,
  y = 14,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word headline rise. Splits on spaces and keeps each word's
 * overflow clipped so words appear to lift off a baseline. */
export function AnimatedHeadline({
  text,
  className,
  as: Tag = "h1",
  delay = 0.05,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2";
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = Tag === "h1" ? motion.h1 : motion.h2;

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "108%" },
              show: { y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
