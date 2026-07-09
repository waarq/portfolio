"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 1400, damping: 40, mass: 0.12 });
  const springY = useSpring(cursorY, { stiffness: 1400, damping: 40, mass: 0.12 });

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setIsCoarse(coarse);
    if (coarse) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
      const target = e.target as HTMLElement;
      setIsPointer(Boolean(target.closest("a, button, [data-cursor-hover]")));
    };

    const hide = () => setIsVisible(false);
    const press = () => setIsPressed(true);
    const release = () => setIsPressed(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", hide);
    window.addEventListener("mousedown", press);
    window.addEventListener("mouseup", release);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", hide);
      window.removeEventListener("mousedown", press);
      window.removeEventListener("mouseup", release);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (isCoarse) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden rounded-full mix-blend-difference md:block"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        backgroundColor: "#F7F4EE",
      }}
      animate={{
        width: isPointer ? 44 : 10,
        height: isPointer ? 44 : 10,
        opacity: isVisible ? 1 : 0,
        scale: isPressed ? 0.75 : 1,
      }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
