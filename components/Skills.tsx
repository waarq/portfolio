"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Award } from "lucide-react";
import Reveal from "./Reveal";
import SectionAbstract from "./SectionAbstract";
import { getIcon } from "@/lib/icons";
import type { Certification, Skill } from "@/lib/content";

export default function Skills({
  skills,
  certifications,
}: {
  skills: Skill[];
  certifications: Certification[];
}) {
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <section id="skills" className="relative z-10 overflow-hidden px-6 py-16 md:px-12 md:py-24">
      <SectionAbstract variant="bottom-left" />
      <Reveal>
        <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
          Skills &amp; Certifications
        </span>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="text-balance mt-6 font-display text-3xl leading-[1.2] tracking-tightest2 text-ink dark:text-dark-text md:text-5xl">
          Tools I reach for, and the credentials behind them.
        </p>
      </Reveal>

      {/* Skills, grouped by category */}
      <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, ci) => {
          const items = skills.filter((s) => s.category === category);
          return (
            <Reveal key={category} delay={0.08 + ci * 0.05}>
              <h3 className="text-xs uppercase tracking-widest2 text-ink-soft/70 dark:text-dark-soft/70">
                {category}
              </h3>
              <div className="mt-4 flex flex-col gap-1">
                {items.map((skill, i) => {
                  const Icon = getIcon(skill.icon);
                  return (
                    <motion.div
                      key={skill.name}
                      data-cursor-hover
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ x: 6 }}
                      className="group flex items-center gap-3 rounded-lg py-2 transition-colors duration-500 ease-expensive"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-500 ease-expensive group-hover:-rotate-6 group-hover:border-accent-terracotta/50 group-hover:text-accent-terracotta dark:border-dark-text/15 dark:text-dark-soft dark:group-hover:border-accent-dusty/50 dark:group-hover:text-accent-dusty">
                        <Icon size={14} strokeWidth={1.5} />
                      </span>
                      <span className="text-lg leading-relaxed text-ink-soft transition-colors duration-500 ease-expensive group-hover:text-ink dark:text-dark-soft dark:group-hover:text-dark-text">
                        {skill.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Certifications — cinematic cards */}
      {certifications.length > 0 && (
        <div className="mt-16">
          <Reveal>
            <span className="text-xs uppercase tracking-widest2 text-ink-soft/70 dark:text-dark-soft/70">
              Certifications
            </span>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert, i) => {
              const Icon = getIcon(cert.icon) ?? Award;
              const content = (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-terracotta/0 via-accent-dusty/0 to-accent-olive/0 opacity-0 transition-opacity duration-700 ease-expensive group-hover:from-accent-terracotta/10 group-hover:via-accent-dusty/5 group-hover:to-accent-olive/10 group-hover:opacity-100 dark:group-hover:from-accent-dusty/10 dark:group-hover:to-accent-olive/10" />

                  <div className="relative flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-500 ease-expensive group-hover:scale-110 group-hover:border-accent-terracotta/50 group-hover:text-accent-terracotta dark:border-dark-text/15 dark:text-dark-soft dark:group-hover:border-accent-dusty/50 dark:group-hover:text-accent-dusty">
                      <Icon size={16} strokeWidth={1.5} />
                    </span>
                    {cert.credentialUrl && (
                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.5}
                        className="text-ink-soft/40 transition-all duration-500 ease-expensive group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-terracotta dark:text-dark-soft/40 dark:group-hover:text-accent-dusty"
                      />
                    )}
                  </div>

                  <h4 className="relative mt-5 font-display text-lg font-semibold leading-snug tracking-tightest2 text-ink dark:text-dark-text">
                    {cert.title}
                  </h4>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-dark-soft">
                    {cert.issuer}
                  </p>
                  <p className="relative mt-4 text-xs uppercase tracking-widest2 text-ink-soft/60 dark:text-dark-soft/60">
                    {cert.date}
                  </p>
                </>
              );

              const className =
                "group relative overflow-hidden rounded-2xl border border-ink/10 bg-paper-card/40 p-6 backdrop-blur-sm transition-all duration-500 ease-expensive hover:-translate-y-1 hover:border-accent-terracotta/30 hover:shadow-[0_20px_50px_-25px_rgba(183,110,86,0.35)] dark:border-dark-text/10 dark:bg-dark-card/40 dark:hover:border-accent-dusty/30 dark:hover:shadow-[0_20px_50px_-25px_rgba(123,146,166,0.35)]";

              return (
                <Reveal key={cert.title} delay={0.05 + i * 0.06}>
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      data-cursor-hover
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`focus-ring block ${className}`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
