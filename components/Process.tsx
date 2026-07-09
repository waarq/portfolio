"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, PenTool, Hammer, Sparkles, Rocket, type LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import SectionAbstract from "./SectionAbstract";

type Step = {
  label: string;
  icon: LucideIcon;
  description: string;
};

const steps: Step[] = [
  { label: "Research", icon: Search, description: "Understanding the problem, the users, and what success actually looks like." },
  { label: "Design", icon: PenTool, description: "Exploring structure and hierarchy before a single pixel is final." },
  { label: "Build", icon: Hammer, description: "Writing clean, considered code that mirrors the design intent exactly." },
  { label: "Refine", icon: Sparkles, description: "Sanding down the rough edges until the details feel invisible." },
  { label: "Ship", icon: Rocket, description: "Shipping with confidence, then watching how it's actually used." },
];

export default function Process() {
  const [active, setActive] = useState(0);

  return (
    <section id="process" className="relative z-10 overflow-hidden px-6 py-16 md:px-12 md:py-24">
      <SectionAbstract variant="top-left" />
      <Reveal>
        <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
          Process
        </span>
      </Reveal>

      <div className="mt-12 flex flex-col gap-2 md:flex-row md:gap-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = active === i;
          return (
            <button
              key={step.label}
              data-cursor-hover
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="focus-ring group relative flex-1 rounded-2xl border border-ink/10 p-6 text-left transition-colors duration-500 ease-expensive dark:border-dark-text/10"
              style={{
                backgroundColor: isActive ? undefined : "transparent",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="process-active"
                  className="absolute inset-0 rounded-2xl bg-paper-card ring-1 ring-accent-terracotta/25 dark:bg-dark-card dark:ring-accent-dusty/25"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <div className="relative flex items-center gap-3">
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={`transition-colors duration-500 ease-expensive ${
                    isActive ? "text-accent-terracotta dark:text-accent-dusty" : "text-ink-soft dark:text-dark-soft"
                  }`}
                />
                <span className="font-display text-sm font-semibold uppercase tracking-widest2 text-ink dark:text-dark-text">
                  {step.label}
                </span>
              </div>

              <motion.p
                initial={false}
                animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative mt-3 overflow-hidden text-lg leading-[1.7] text-ink-soft dark:text-dark-soft"
              >
                {step.description}
              </motion.p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
