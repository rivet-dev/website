"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Sparkle positions mapped from red dots on the logo (% of logo dimensions)
const sparklePoints = [
  { x: 5.8, y: 43 },    // S top
  { x: 20, y: 31.5 },   // E top (SECURE)
  { x: 34.7, y: 29 },   // C top
  { x: 40.1, y: 38 },   // U/R junction
  { x: 67, y: 22 },     // R/E top
  { x: 96.5, y: 15 },   // E tip (SECURE end)
  { x: 19.1, y: 79 },   // E bottom (EXEC)
  { x: 23.2, y: 91 },   // X bottom
  { x: 32.2, y: 79.5 }, // E bottom (EXEC middle)
  { x: 48.2, y: 79.5 }, // C bottom
  { x: 77.3, y: 84 },   // right of EXEC
];

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

function LogoSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const idCounterRef = useRef(0);
  const lastIndexRef = useRef(-1);

  const spawnSparkle = useCallback(() => {
    // Pick a random point that isn't the same as the last one
    let idx = Math.floor(Math.random() * sparklePoints.length);
    if (idx === lastIndexRef.current) {
      idx = (idx + 1 + Math.floor(Math.random() * (sparklePoints.length - 1))) % sparklePoints.length;
    }
    lastIndexRef.current = idx;
    const point = sparklePoints[idx];

    const id = idCounterRef.current++;
    const sparkle: Sparkle = {
      id,
      x: point.x + (Math.random() - 0.5) * 4,
      y: point.y + (Math.random() - 0.5) * 4,
      size: 50 + Math.random() * 60,
      duration: 0.15 + Math.random() * 0.2,
    };
    setSparkles((prev) => [...prev, sparkle]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, sparkle.duration * 1000 + 100);
  }, []);

  useEffect(() => {
    const tick = () => {
      spawnSparkle();
      const delay = 300 + Math.random() * 1200;
      timer = setTimeout(tick, delay);
    };
    let timer = setTimeout(tick, 2000);
    return () => clearTimeout(timer);
  }, [spawnSparkle]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 1080 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: s.duration, ease: "linear" }}
              style={{ marginLeft: -s.size / 2, marginTop: -s.size / 2 }}
            >
              <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none" style={{ filter: "blur(0.5px)" }}>
                <path
                  d="M12 0 L12.15 11.4 L24 12 L12.15 12.6 L12 24 L11.85 12.6 L0 12 L11.85 11.4 Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function HeroLogo({ className = "h-56 sm:h-72 md:h-96 lg:h-[28rem]" }: { className?: string }) {
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 -inset-x-20 -inset-y-10 bg-[radial-gradient(ellipse_at_center,rgba(180,200,255,0.06)_0%,transparent_70%)]" />
      <div className="relative inline-block">
        <img
          id="hero-logo"
          src="/images/secure-exec/secure-exec-logo.png"
          alt="Secure Exec"
          className={`relative ${className} w-auto drop-shadow-[0_0_60px_rgba(14,165,164,0.15)]`}
        />
        <LogoSparkles />
      </div>
    </div>
  );
}

export function NewPill() {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-white bg-black px-5 py-1.5 text-sm font-bold tracking-[0.2em] text-white uppercase">
      New
    </span>
  );
}
