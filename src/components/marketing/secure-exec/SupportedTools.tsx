"use client";

import { motion } from "framer-motion";
import { TOOL_LOGOS, type ToolLogo } from "./toolLogos";

// Two opposing rows, the same treatment as the agentOS registry marquee (and
// the same `registry-marquee-*` keyframes from main.css).
const ROW_A = TOOL_LOGOS.slice(0, 5);
const ROW_B = TOOL_LOGOS.slice(5);

// A track holds two identical copies, so the -50% keyframe lands exactly on the
// duplicate. Each copy repeats its row until it outruns the widest viewport.
const REPEATS = 4;

function ToolTile({ tool, hidden }: { tool: ToolLogo; hidden: boolean }) {
  return (
    <li
      aria-hidden={hidden || undefined}
      className="flex w-56 shrink-0 items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.02] p-3"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d={tool.path} />
        </svg>
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-medium text-white">{tool.name}</p>
        <p className="truncate text-xs text-zinc-500">{tool.category}</p>
      </div>
    </li>
  );
}

function MarqueeRow({ tools, direction }: { tools: ToolLogo[]; direction: "left" | "right" }) {
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
      <div
        className={`flex w-max hover:[animation-play-state:paused] motion-reduce:animate-none ${
          direction === "left"
            ? "animate-[registry-marquee-left_140s_linear_infinite]"
            : "animate-[registry-marquee-right_140s_linear_infinite]"
        }`}
      >
        {[false, true].map((copy) => (
          <ul key={copy ? "copy" : "original"} className="flex shrink-0 gap-3 pr-3">
            {Array.from({ length: REPEATS }, (_, repeat) =>
              tools.map((tool) => (
                // Only the first run of the first copy is exposed to assistive tech.
                <ToolTile key={`${tool.name}-${repeat}`} tool={tool} hidden={copy || repeat > 0} />
              )),
            )}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function SupportedTools() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mt-24 text-center"
    >
      <h3 className="mx-auto max-w-2xl px-6 text-xl font-normal text-white md:text-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
        Runs the Node.js libraries and CLIs your agent already reaches for, unmodified.
      </h3>
      <div className="mt-10 flex flex-col gap-3">
        <MarqueeRow tools={ROW_A} direction="left" />
        <MarqueeRow tools={ROW_B} direction="right" />
      </div>
    </motion.div>
  );
}
