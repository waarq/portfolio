"use client";

import { motion } from "framer-motion";

/**
 * A premium, geometric four-pointed marker, not a traditional star. The
 * top/bottom points are noticeably longer than the left/right points, every
 * transition between points is a smooth cubic-bezier curve with rounded
 * inner "waists" (no sharp inner corners). This single marker travels down
 * the Experience rail as the page scrolls; its only motion beyond that
 * scroll-driven position is a very slow breathing scale and opacity
 * (0.95 -> 1.05 -> 0.95). No rotation, no wobble.
 */
export default function TimelineStar({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      aria-hidden
      animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 -m-2 rounded-full bg-accent-terracotta/15 blur-md dark:bg-accent-dusty/20"
        aria-hidden
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
      >
        <path
          d="M50 6
             C55.7 22.4 71.7 44.4 82 50
             C71.7 55.7 55.7 77.7 50 94
             C44.3 77.7 28.3 55.7 18 50
             C28.3 44.4 44.3 22.4 50 6 Z"
          fill="currentColor"
          className="text-accent-terracotta dark:text-accent-dusty"
        />
      </svg>
    </motion.div>
  );
}
