"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const primaryContact = socials[0];

  useEffect(() => {
    const timer = setTimeout(() => setShowCat(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative z-10 overflow-hidden px-6 py-14 md:px-12 md:py-16">
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
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
            Contact
          </span>
          <span className="hidden h-4 w-px bg-ink/15 dark:bg-dark-text/15 md:inline-block" />
          <span className="inline-flex items-center gap-2 text-sm text-ink-soft dark:text-dark-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-olive opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-olive" />
            </span>
            Available for new projects
          </span>
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
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {socials.map((social) => {
            const Icon = iconMap[social.icon] ?? Mail;
            return (
              <motion.a
                key={social.label}
                href={social.href}
                data-cursor-hover
                aria-label={social.label}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="focus-ring text-ink-soft transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-soft dark:hover:text-accent-dusty"
              >
                <Icon size={17} strokeWidth={1.5} />
              </motion.a>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="inline-flex items-center gap-1.5 font-note text-base italic leading-relaxed text-ink-soft dark:text-dark-soft">
            made with
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex text-accent-terracotta dark:text-accent-dusty"
            >
              <Heart size={13} strokeWidth={1.5} fill="currentColor" />
            </motion.span>
            tea, and late nights
          </p>
          <p className="text-xs uppercase tracking-widest2 text-ink-soft/70 dark:text-dark-soft/70">
            &copy; {new Date().getFullYear()} Waleed Ahmed
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            data-cursor-hover
            aria-label="Back to top"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-500 ease-expensive hover:-translate-y-0.5 hover:border-accent-terracotta hover:text-accent-terracotta dark:border-dark-text/15 dark:text-dark-soft dark:hover:border-accent-dusty dark:hover:text-accent-dusty"
          >
            <ArrowUp size={14} strokeWidth={1.5} />
          </button>
        </div>
      </Reveal>
    </footer>
  );
}
