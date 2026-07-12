"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Linkedin,
  Instagram,
  Github,
  Briefcase,
  BriefcaseBusiness,
  Mail,
  FileText,
  Cat,
  Heart,
  ArrowUp,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import type { Social } from "@/lib/content";
import Reveal from "./Reveal";

const iconMap: Record<string, LucideIcon> = {
  "message-circle": MessageCircle,
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  briefcase: Briefcase,
  "briefcase-business": BriefcaseBusiness,
  mail: Mail,
  "file-text": FileText,
};

export default function Footer({ socials }: { socials: Social[] }) {
  const [showCat, setShowCat] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const primaryContact = socials[0];

  useEffect(() => {
    const timer = setTimeout(() => setShowCat(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="contact"
      className="relative z-10 overflow-hidden px-6 py-14 md:px-12 md:py-16"
    >
      {showCat && (
        <Cat
          aria-hidden
          size={20}
          strokeWidth={1.5}
          className="pointer-events-none absolute bottom-6 left-0 animate-driftCat text-ink/25 dark:text-dark-text/25"
        />
      )}

      {/* soft ambient glow, purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-accent-terracotta/10 blur-[120px] dark:bg-accent-dusty/10"
      />

      <Reveal className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-start gap-x-5 gap-y-4 md:items-center">
          <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft md:self-center">
            Contact
          </span>
          <span className="hidden h-4 w-px bg-ink/15 dark:bg-dark-text/15 md:inline-block md:self-center" />

          <div className="flex flex-wrap items-start gap-x-6 gap-y-4 md:items-center">
            {socials.map((social) => {
              const Icon = iconMap[social.icon] ?? Mail;
              const isActive = activeLabel === social.label;
              return (
                <div
                  key={social.label}
                  className="relative flex flex-col items-center"
                  onMouseEnter={() => setActiveLabel(social.label)}
                  onMouseLeave={() => setActiveLabel(null)}
                  onFocus={() => setActiveLabel(social.label)}
                  onBlur={() => setActiveLabel(null)}
                >
                  {/* Desktop-only animated tooltip, perfectly centered above the icon */}
                  <div className="pointer-events-none absolute -top-9 inset-x-0 z-20 hidden justify-center md:flex">
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: 4, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.94 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="relative whitespace-nowrap rounded-full border border-ink/10 bg-ink px-2.5 py-1 text-[11px] font-medium tracking-wide text-white shadow-sm dark:border-dark-text/10 dark:bg-dark-text dark:text-dark-bg"
                        >
                          {social.label}
                          <span className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink dark:bg-dark-text" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.a
                    href={social.href}
                    data-cursor-hover
                    aria-label={social.label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="focus-ring flex items-center justify-center text-ink-soft transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-soft dark:hover:text-accent-dusty"
                  >
                    <motion.span
                      variants={{ hover: { rotate: 22, scale: 1.35 } }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center justify-center duration-500 ease-expensive"
                    >
                      <Icon size={19} strokeWidth={1.5} />
                    </motion.span>
                  </motion.a>
                </div>
              );
            })}
          </div>
        </div>

        {primaryContact && (
          <a
            href={primaryContact.href}
            data-cursor-hover
            className="focus-ring group inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tightest2 text-ink transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-text dark:hover:text-accent-dusty"
          >
            Let&rsquo;s build something together
            <ArrowUpRight
              size={17}
              strokeWidth={1.5}
              className="transition-transform duration-500 ease-expensive group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        )}
      </Reveal>

      <Reveal
        delay={0.08}
        className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-6 dark:border-dark-text/10 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 w-full">
          <p className="flex-1 text-center text-sm uppercase tracking-widest2 text-ink-soft/70 dark:text-dark-soft/70">
            &copy; {new Date().getFullYear()} Waleed Ahmed
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            data-cursor-hover
            aria-label="Back to top"
            className="focus-ring ml-auto flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-500 ease-expensive hover:-translate-y-0.5 hover:border-accent-terracotta hover:text-accent-terracotta dark:border-dark-text/15 dark:text-dark-soft dark:hover:border-accent-dusty dark:hover:text-accent-dusty"
          >
            <ArrowUp size={14} strokeWidth={1.5} />
          </button>
        </div>
      </Reveal>
    </footer>
  );
}