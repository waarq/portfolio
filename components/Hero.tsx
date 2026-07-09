"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";

const roles = ["Software Engineer", "Product Builder", "Content Creator"];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="top"
      className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pb-10 pt-32 md:px-12 md:pt-40"
    >
      <div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft"
        >
          Waleed Ahmed
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance mt-6 font-display text-[13vw] font-bold leading-[0.98] tracking-tightest2 text-ink dark:text-dark-text md:text-[6.4vw]"
        >
          Building software people actually enjoy using.
        </motion.h1>

        <div className="mt-8 h-9 overflow-hidden md:mt-10 md:h-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={roles[roleIndex]}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-note text-2xl italic leading-relaxed text-accent-terracotta dark:text-accent-dusty md:text-3xl"
            >
              {roles[roleIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="flex items-end justify-between"
      >
        <p className="max-w-xs text-balance text-lg leading-relaxed text-ink-soft dark:text-dark-soft">
          Currently building things from Karachi.
        </p>

        <motion.a
          href="#about"
          data-cursor-hover
          aria-label="Scroll to learn more"
          className="focus-ring flex flex-col items-center gap-2 text-ink-soft transition-colors duration-500 ease-expensive hover:text-accent-terracotta dark:text-dark-soft dark:hover:text-accent-dusty"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={18} strokeWidth={1.5} />
        </motion.a>
      </motion.div>
    </section>
  );
}
