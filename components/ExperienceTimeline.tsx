"use client";

import { useRef } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import type { Experience } from "@/lib/content";
import Reveal from "./Reveal";
import TimelineStar from "./TimelineStar";
import SectionAbstract from "./SectionAbstract";

export default function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start center", "end center"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    mass: 0.5,
  });
  const starTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="experience" className="relative z-10 overflow-hidden px-6 py-16 md:px-12 md:py-24">
      <SectionAbstract variant="top-right" />
      <Reveal>
        <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
          Experience
        </span>
      </Reveal>

      <div className="relative mt-16">
        {/* connecting rail, desktop only — also the scroll-tracking target for the star */}
        <div
          ref={railRef}
          className="pointer-events-none absolute bottom-8 left-[2.85rem] top-8 hidden w-px bg-gradient-to-b from-ink/15 via-ink/10 to-transparent dark:from-dark-text/15 dark:via-dark-text/10 md:block"
        >
          <motion.div
            style={{ top: starTop }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <TimelineStar />
          </motion.div>
        </div>

        <div className="divide-y divide-ink/10 dark:divide-dark-text/10">
          {experiences.map((exp, i) => (
            <Reveal key={exp.title} delay={i * 0.05}>
              <article className="group grid items-start gap-4 py-8 transition-colors duration-500 md:grid-cols-12 md:gap-6 md:py-10">
                <div className="hidden md:col-span-1 md:block" aria-hidden />

                <div className="md:col-span-2">
                  <p className="font-note text-xl italic leading-snug text-accent-terracotta dark:text-accent-dusty">
                    {exp.chapter}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-widest2 text-ink-soft dark:text-dark-soft">
                    {exp.date}
                  </p>
                </div>

                <div className="md:col-span-7">
                  <h3 className="font-display text-3xl font-semibold leading-[1.1] tracking-tightest2 text-ink transition-transform duration-500 ease-expensive group-hover:translate-x-2 dark:text-dark-text md:text-4xl">
                    {exp.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-balance text-lg leading-[1.75] text-ink-soft dark:text-dark-soft">
                    {exp.description}
                  </p>
                </div>

                <div className="flex flex-wrap content-start gap-2 md:col-span-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink-soft transition-colors duration-500 ease-expensive group-hover:border-accent-terracotta/40 dark:border-dark-text/15 dark:text-dark-soft dark:group-hover:border-accent-dusty/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
