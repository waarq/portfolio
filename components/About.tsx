"use client";

import { Cat } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { getIcon } from "@/lib/icons";
import type { Skill } from "@/lib/content";

export default function About({ skills }: { skills: Skill[] }) {
  const badges = skills.filter((s) => s.expertise);

  return (
    <section id="about" className="relative z-10 px-6 py-16 md:px-12 md:py-24">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <Reveal>
            <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
              About
            </span>
          </Reveal>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <Reveal delay={0.05}>
            <p className="text-balance font-display text-3xl leading-[1.2] tracking-tightest2 text-ink dark:text-dark-text md:text-5xl">
              I&rsquo;ve always been fascinated by products that feel effortless.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-balance text-xl leading-[1.75] text-ink-soft dark:text-dark-soft">
              The kind people recommend without thinking. That&rsquo;s what I enjoy
              building: software that disappears into the task, and design that
              earns trust in the first three seconds.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="mt-6 max-w-xl text-balance text-xl leading-[1.75] text-ink-soft dark:text-dark-soft">
              I work across the stack, but I spend most of my attention on the
              parts people actually feel: pacing, hierarchy, the half-second
              before something responds.
            </p>
          </Reveal>

          {badges.length > 0 && (
            <Reveal delay={0.32} className="mt-10">
              <span className="text-xs uppercase tracking-widest2 text-ink-soft/70 dark:text-dark-soft/70">
                Currently working with
              </span>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {badges.map((skill, i) => {
                  const Icon = getIcon(skill.icon);
                  return (
                    <motion.span
                      key={skill.name}
                      data-cursor-hover
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.5,
                        delay: 0.35 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover="hover"
                      className="group relative inline-flex cursor-default items-center gap-2 overflow-hidden rounded-full border border-ink/15 bg-paper-card/40 px-4 py-2 text-sm text-ink-soft backdrop-blur-sm transition-colors duration-500 ease-expensive dark:border-dark-text/15 dark:bg-dark-card/40 dark:text-dark-soft"
                    >
                      <motion.span
                        variants={{
                          hover: { opacity: 1, scale: 1.6 },
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-accent-terracotta/20 via-accent-dusty/15 to-accent-olive/20 dark:from-accent-dusty/20 dark:via-accent-terracotta/15 dark:to-accent-olive/20"
                      />
                      <motion.span
                        animate={{ y: [0, -2.5, 0] }}
                        transition={{
                          duration: 3.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.25,
                        }}
                        className="relative flex items-center justify-center"
                      >
                        <motion.span
                          variants={{ hover: { rotate: 18, scale: 1.15 } }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center justify-center text-ink-soft/60 transition-colors duration-500 ease-expensive group-hover:text-accent-terracotta dark:text-dark-soft/60 dark:group-hover:text-accent-dusty"
                        >
                          <Icon size={14} strokeWidth={1.5} />
                        </motion.span>
                      </motion.span>
                      <span className="relative transition-colors duration-500 ease-expensive group-hover:text-ink dark:group-hover:text-dark-text">
                        {skill.name}
                      </span>
                    </motion.span>
                  );
                })}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.4} className="mt-10 flex items-center gap-3">
            <span
              data-cursor-hover
              className="group inline-flex items-center gap-2 text-sm text-ink-soft transition-colors duration-500 dark:text-dark-soft"
            >
              <Cat
                size={16}
                strokeWidth={1.5}
                className="text-ink-soft/40 transition-colors duration-500 ease-expensive group-hover:text-accent-terracotta dark:text-dark-soft/40 dark:group-hover:text-accent-dusty"
              />
              <span className="font-note italic">still learning.</span>
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
