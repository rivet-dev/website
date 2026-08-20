'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { PRIMARY_INK_BUTTON_CLASS } from './typography';

interface NotFoundPageProps {
  thinkingImage: string;
}

const colors = [
  '#CB5A33', // accent
  '#2E4034', // pine
  '#93A286', // sage
  '#AB451F', // accent-deep
  '#56524A', // ink-soft
];

const BouncingPill = ({ reduceMotion }: { reduceMotion: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLHeadingElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [colorIndex, setColorIndex] = useState(0);
  const velocityRef = useRef({ x: 0.4, y: 0.25 });

  useEffect(() => {
    if (reduceMotion) return;

    let animationFrameId: number;
    let lastTime = 0;
    const targetInterval = 30; // ms between updates

    const animate = (currentTime: number) => {
      if (!containerRef.current || !pillRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Throttle updates to ~30ms intervals for consistent speed
      if (currentTime - lastTime < targetInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      const container = containerRef.current.getBoundingClientRect();
      const pill = pillRef.current.getBoundingClientRect();

      const pillWidth = (pill.width / container.width) * 100;
      const pillHeight = (pill.height / container.height) * 100;

      setPosition((prev) => {
        let newX = prev.x + velocityRef.current.x;
        let newY = prev.y + velocityRef.current.y;
        let hitEdge = false;

        if (newX <= 0 || newX >= 100 - pillWidth) {
          velocityRef.current.x *= -1;
          newX = Math.max(0, Math.min(newX, 100 - pillWidth));
          hitEdge = true;
        }

        if (newY <= 0 || newY >= 100 - pillHeight) {
          velocityRef.current.y *= -1;
          newY = Math.max(0, Math.min(newY, 100 - pillHeight));
          hitEdge = true;
        }

        if (hitEdge) {
          setColorIndex((prev) => (prev + 1) % colors.length);
        }

        return { x: newX, y: newY };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [reduceMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <h1
        ref={pillRef}
        className="absolute m-0 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3 py-1.5 text-sm font-medium text-ink-soft backdrop-blur-md transition-colors duration-200 motion-reduce:transition-none"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
      >
        <span className="font-medium transition-colors duration-200" style={{ color: colors[colorIndex] }}>404</span>
        Page not found
      </h1>
    </div>
  );
};

export const NotFoundPage = ({ thinkingImage }: NotFoundPageProps) => {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <main id="main-content" tabIndex={-1} className="depth-wash relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="flex flex-col items-center gap-8">
        {/* Thinking image */}
        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
          className="relative m-0 h-[350px] w-[280px] sm:h-[400px] sm:w-[320px]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-ink/10 bg-white/55 p-2.5">
            <img
              src={thinkingImage}
              alt="Paul Delaroche, Napoleon at Fontainebleau (1845)"
              className="h-full w-full rounded-xl border border-ink/10 object-cover"
            />
          </div>

          {/* Bouncing 404 pill */}
          <BouncingPill reduceMotion={reduceMotion} />
        </motion.figure>

        {/* Primary button */}
        <motion.a
          href="/"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.5 }}
          className={PRIMARY_INK_BUTTON_CLASS}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </motion.a>
      </div>
    </main>
  );
};
