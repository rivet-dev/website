"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const taglines = [
  "For those about to execute, we salute you.",
  "Welcome to the runtime jungle.",
  "Smells like clean isolation.",
  "Highway to shell.",
  "Stairway to deployment.",
  "Born to run (your code).",
  "We will, we will, sandbox you.",
  "Don't stop executin'.",
  "Livin' on a runtime.",
  "Another one bytes the dust.",
  "Enter sandbox.",
  "Paranoid (about security).",
  "Thunderstruck by performance.",
  "Free bird. Caged code.",
  "Comfortably sandboxed.",
];

function RotatingTagline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[4em] sm:h-[3em] md:h-[2.5em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-x-0"
        >
          {taglines[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function FooterCTA() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 rounded-2xl bg-[#0c0c0e] chrome-gradient-border px-8 py-14 sm:px-14 sm:py-18 text-center"
          style={{ "--chrome-angle": "200deg" } as React.CSSProperties}
        >
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white md:text-4xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            <RotatingTagline />
          </h2>
          <p className="mb-8 mx-auto max-w-lg text-base text-zinc-500 leading-relaxed">
            Install Secure Exec, create a runtime, and execute untrusted code. All in a few lines of TypeScript.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <a
              href="/secure-exec/docs/"
              className="selection-dark inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md btn-chrome px-6 py-3 text-sm"
              style={{ "--chrome-angle": "50deg" } as React.CSSProperties}
            >
              Read the Docs
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/rivet-dev/agentos/tree/main/secure-exec"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md btn-chrome-outline px-6 py-3 text-sm font-medium"
              style={{ "--chrome-angle": "280deg" } as React.CSSProperties}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
