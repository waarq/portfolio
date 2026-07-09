"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/content";
import Reveal from "./Reveal";

const gradients = [
  "from-accent-terracotta/25 via-paper-card to-paper-card",
  "from-accent-olive/25 via-paper-card to-paper-card",
  "from-accent-dusty/25 via-paper-card to-paper-card",
];

export default function Projects({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Adding or removing a project.yaml file changes `projects.length`
  // automatically — nothing here is hardcoded to a slide count.
  const count = projects.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slideWidth = track.clientWidth;
        if (slideWidth === 0) return;
        const index = Math.round(track.scrollLeft / slideWidth);
        setActive(Math.min(Math.max(index, 0), count - 1));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.min(Math.max(index, 0), count - 1);
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  };

  return (
    <section id="work" className="relative z-10 px-6 py-16 md:px-12 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Reveal>
          <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
            Selected work
          </span>
        </Reveal>

        {count > 1 && (
          <Reveal delay={0.05} className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest2 text-ink-soft/60 dark:text-dark-soft/60">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-cursor-hover
                aria-label="Previous project"
                disabled={active === 0}
                onClick={() => goTo(active - 1)}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-500 ease-expensive hover:border-accent-terracotta hover:text-accent-terracotta disabled:pointer-events-none disabled:opacity-30 dark:border-dark-text/15 dark:text-dark-soft dark:hover:border-accent-dusty dark:hover:text-accent-dusty"
              >
                <ArrowLeft size={15} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                data-cursor-hover
                aria-label="Next project"
                disabled={active === count - 1}
                onClick={() => goTo(active + 1)}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-500 ease-expensive hover:border-accent-terracotta hover:text-accent-terracotta disabled:pointer-events-none disabled:opacity-30 dark:border-dark-text/15 dark:text-dark-soft dark:hover:border-accent-dusty dark:hover:text-accent-dusty"
              >
                <ArrowRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          </Reveal>
        )}
      </div>

      <Reveal delay={0.08}>
        <div
          ref={trackRef}
          role="region"
          aria-label="Project carousel"
          className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth"
        >
          {projects.map((project, i) => (
            <article
              key={project.title}
              className="group grid w-full shrink-0 snap-center items-center gap-8 md:grid-cols-12 md:gap-6"
            >
              <motion.div
                whileHover={{ x: -8 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`relative order-1 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} md:col-span-7`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-6xl font-bold tracking-tightest2 text-ink/10 dark:text-dark-text/10 md:text-8xl">
                    {project.title}
                  </span>
                </div>
              </motion.div>

              <div className="order-2 md:col-span-5">
                <p className="text-xs uppercase tracking-widest2 text-ink-soft dark:text-dark-soft">
                  {project.role}
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold tracking-tightest2 text-ink dark:text-dark-text md:text-5xl">
                  {project.title}
                </h3>
                <p className="mt-5 max-w-md text-balance text-lg leading-[1.75] text-ink-soft dark:text-dark-soft">
                  {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink-soft dark:border-dark-text/15 dark:text-dark-soft"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="mt-6 max-w-md border-l-2 border-accent-terracotta/40 pl-4 text-sm italic leading-relaxed text-ink-soft dark:border-accent-dusty/40 dark:text-dark-soft">
                  {project.outcome}
                </p>

                <div className="mt-8 flex items-center gap-5">
                  {project.links.visit && (
                    <a
                      href={project.links.visit}
                      data-cursor-hover
                      className="focus-ring inline-flex items-center gap-1.5 text-sm text-ink transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-text dark:hover:text-accent-dusty"
                    >
                      Visit <ArrowUpRight size={15} strokeWidth={1.5} />
                    </a>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      data-cursor-hover
                      aria-label="GitHub repository"
                      className="focus-ring text-ink-soft transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-soft dark:hover:text-accent-dusty"
                    >
                      <Github size={17} strokeWidth={1.5} />
                    </a>
                  )}
                  {project.links.caseStudy && (
                    <a
                      href={project.links.caseStudy}
                      data-cursor-hover
                      aria-label="Read case study"
                      className="focus-ring text-ink-soft transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-soft dark:hover:text-accent-dusty"
                    >
                      <FileText size={17} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      {count > 1 && (
        <div className="mt-10 flex items-center gap-2">
          {projects.map((project, i) => (
            <button
              key={project.title}
              type="button"
              data-cursor-hover
              aria-label={`Go to project ${i + 1}`}
              aria-current={active === i}
              onClick={() => goTo(i)}
              className="focus-ring group flex h-4 items-center"
            >
              <span
                className={`h-1 rounded-full transition-all duration-500 ease-expensive ${
                  active === i
                    ? "w-8 bg-accent-terracotta dark:bg-accent-dusty"
                    : "w-4 bg-ink/20 group-hover:bg-ink/40 dark:bg-dark-text/20 dark:group-hover:bg-dark-text/40"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
