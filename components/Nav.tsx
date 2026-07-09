"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const FULL_NAME = "Waleed Ahmed";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, [0, 160], [0, 1], { clamp: true });
  const progress = useSpring(rawProgress, { stiffness: 220, damping: 30, mass: 0.4 });
  const bgOpacity = useTransform(progress, [0, 1], [0, 1]);
  const nameOpacity = useTransform(progress, [0, 1], [0, 1]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <motion.div
          aria-hidden
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 border-b border-ink/10 bg-paper/70 backdrop-blur-xl backdrop-saturate-150 dark:border-dark-text/10 dark:bg-dark-bg/70"
        />

        <div className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-6 py-5 md:px-12 md:py-6">
          <a
            href="#top"
            data-cursor-hover
            className="focus-ring relative h-6 font-display text-md font-semibold tracking-wide text-ink dark:text-dark-text"
          >
            <motion.span style={{ opacity: nameOpacity }} className="whitespace-nowrap">
              {FULL_NAME}
            </motion.span>
          </a>

          <nav className="hidden items-center justify-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor-hover
                className="focus-ring group relative whitespace-nowrap text-md uppercase tracking-wide text-ink-soft transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-soft dark:hover:text-accent-dusty"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-terracotta transition-all duration-500 ease-expensive group-hover:w-full dark:bg-accent-dusty" />
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3">
            <ThemeToggle />
            <button
              type="button"
              data-cursor-hover
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-500 ease-expensive hover:border-accent-terracotta hover:text-accent-terracotta dark:border-dark-text/15 dark:text-dark-text dark:hover:border-accent-dusty dark:hover:text-accent-dusty md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center"
                >
                  {menuOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-paper/95 backdrop-blur-xl dark:bg-dark-bg/95 md:hidden"
          >
            <motion.nav
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex h-full flex-col items-start justify-center gap-2 px-8"
            >
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  data-cursor-hover
                  onClick={handleLinkClick}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.45, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="focus-ring py-3 font-display text-4xl font-semibold tracking-tightest2 text-ink transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-text dark:hover:text-accent-dusty"
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
