"use client";

import { useEffect, useRef } from "react";

/**
 * A quiet, interactive dot-field that lives behind the Hero and About
 * sections only. It reacts to the pointer with a soft glow and a very slow
 * ambient drift, then fades itself out completely by the time the
 * Experience section reaches the viewport — controlled by
 * `getOpacityForScroll` below, which reads the DOM positions of
 * #top / #about / #experience each scroll tick.
 *
 * Pure canvas 2D — no WebGL/three.js — so it stays light and fast.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// smoothstep for a gentle, non-linear crossfade instead of a linear ramp
const smooth = (t: number) => t * t * (3 - 2 * t);

function getOpacityForScroll(scrollY: number, viewportHeight: number) {
  const heroEl = document.getElementById("top");
  const aboutEl = document.getElementById("about");
  const experienceEl = document.getElementById("experience");
  if (!heroEl || !aboutEl || !experienceEl) return 1;

  const aboutTop = aboutEl.offsetTop;
  const experienceTop = experienceEl.offsetTop;

  // Reference point: middle of the viewport, so the fade feels tied to what
  // is actually on screen rather than the very top edge.
  const focus = scrollY + viewportHeight * 0.42;

  const fadeZone = Math.max(240, viewportHeight * 0.5);

  // 1 -> 0.5 as the focus point crosses into About
  const enterAbout = smooth(clamp((focus - (aboutTop - fadeZone / 2)) / fadeZone, 0, 1));
  // 0.5 -> 0 as the focus point crosses into Experience
  const enterExperience = smooth(clamp((focus - (experienceTop - fadeZone / 2)) / fadeZone, 0, 1));

  const heroToAbout = 1 - enterAbout * 0.5; // 1 -> 0.5
  const aboutToExperience = heroToAbout - enterExperience * heroToAbout; // fades remainder to 0

  return clamp(enterExperience >= 1 ? 0 : aboutToExperience, 0, 1);
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const opacityRef = useRef(1);
  const pointer = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;

    const spacing = 46;
    let cols = 0;
    let rows = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
    };

    const onMove = (e: MouseEvent) => {
      pointer.current.targetX = e.clientX;
      pointer.current.targetY = e.clientY;
    };

    const onLeave = () => {
      pointer.current.targetX = -9999;
      pointer.current.targetY = -9999;
    };

    const onScroll = () => {
      opacityRef.current = getOpacityForScroll(window.scrollY, window.innerHeight);
    };

    const isDark = () => document.documentElement.classList.contains("dark");

    const draw = () => {
      raf = requestAnimationFrame(draw);
      t += 0.0016;

      ctx.clearRect(0, 0, width, height);

      const opacity = opacityRef.current;
      if (opacity <= 0.002) return;

      // ease pointer toward target for a soft, weighted glow
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.08;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.08;

      const dark = isDark();
      const dotColor = dark ? "242, 239, 233" : "27, 27, 27";
      const glowColor = dark ? "123, 146, 166" : "183, 110, 86"; // accent-dusty / accent-terracotta

      const driftX = Math.sin(t) * 6;
      const driftY = Math.cos(t * 0.8) * 6;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacing + driftX;
          const baseY = j * spacing + driftY;

          const dx = baseX - pointer.current.x;
          const dy = baseY - pointer.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = clamp(1 - dist / 260, 0, 1);
          const eased = influence * influence;

          const twinkle = reducedMotion.current
            ? 0
            : Math.sin(t * 1.4 + i * 0.6 + j * 0.4) * 0.5 + 0.5;

          const baseAlpha = 0.05 + twinkle * 0.035;
          const alpha = clamp((baseAlpha + eased * 0.5) * opacity, 0, 0.85);
          const radius = 1 + eased * 1.6;

          if (eased > 0.02) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${glowColor}, ${alpha})`;
            ctx.arc(baseX, baseY, radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (alpha > 0.01) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${dotColor}, ${alpha})`;
            ctx.arc(baseX, baseY, radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
