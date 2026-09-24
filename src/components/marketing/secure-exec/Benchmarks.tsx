"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InfoTooltip } from "./ui/InfoTooltip";

const ACCENT = "#38BDF8";
const ACCENT_LIGHT = "#7DD3FC";

/* Cold start with p50/p95/p99 tabs — single bar pair visible at a time */
function ColdStartChart() {
  const groups = [
    { label: "p50", secureExec: 16.2, sandbox: 440 },
    { label: "p95", secureExec: 17.9, sandbox: 950 },
    { label: "p99", secureExec: 17.9, sandbox: 3150 },
  ];
  const [active, setActive] = useState(2);
  const g = groups[active];
  const sePct = Math.max((g.secureExec / g.sandbox) * 100, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div>
          <h4 className="text-sm font-medium text-white flex items-center">
            Cold start
            <InfoTooltip>
              <strong>What's measured:</strong> Time from requesting an execution to first code running.
              <br /><br />
              <strong>Why the gap:</strong> Secure Exec spins up a V8 isolate inside the host process. No container, no VM, no network hop. Sandboxes must boot an entire container or microVM, allocate memory, and establish a network connection before code can run.
              <br /><br />
              <strong>Sandbox baseline:</strong> e2b, the fastest provider on{" "}
              <a href="https://www.computesdk.com/benchmarks/" target="_blank" rel="noopener noreferrer">ComputeSDK</a>
              {" "}as of March 18, 2026.
              <br /><br />
              <strong>Secure Exec:</strong> Median of 10,000 runs (100 iterations × 100 samples) on Intel i7-12700KF.
              <br /><br />
              <a href="https://secureexec.dev/docs/benchmarks">Our benchmarks →</a>
            </InfoTooltip>
          </h4>
          <p className="text-[11px] text-zinc-600 italic mt-1">Lower is better</p>
        </div>
        <div className="flex flex-wrap gap-1 sm:ml-auto">
          {groups.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
                i === active
                  ? "bg-white/10 text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {/* Secure Exec bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs text-zinc-500 sm:w-48 shrink-0 font-mono">Secure Exec</span>
          <div className="w-full sm:flex-1 relative h-7 bg-white/5 rounded-sm overflow-hidden">
            <motion.div
              key={active}
              initial={{ width: 0 }}
              animate={{ width: `${sePct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})` }}
            />
            <span
              className="absolute inset-y-0 flex items-center gap-2 text-xs font-mono font-medium z-10 text-zinc-400"
              style={{ left: `calc(${sePct}% + 8px)` }}
            >
              {g.secureExec} ms
              <span className="text-[11px] font-semibold" style={{ color: ACCENT_LIGHT }}>
                {Math.round(g.sandbox / g.secureExec)}x faster
              </span>
            </span>
          </div>
        </div>
        {/* Sandbox bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs text-zinc-500 sm:w-48 shrink-0 font-mono">Fastest sandbox</span>
          <div className="w-full sm:flex-1 relative h-7 bg-white/5 rounded-sm overflow-hidden">
            <motion.div
              key={active}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="absolute inset-y-0 left-0 rounded-sm bg-zinc-600"
            />
            <span className="absolute inset-y-0 left-2 flex items-center text-xs font-mono text-zinc-300 z-10">
              {g.sandbox.toLocaleString()} ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Standard comparison bar for memory/cost metrics */
function MetricBar({
  label,
  tooltip,
  secureExec,
  sandbox,
  multiplier,
}: {
  label: string;
  tooltip?: React.ReactNode;
  secureExec: { value: string; bar: number };
  sandbox: { value: string; bar: number; label: string };
  multiplier?: string;
}) {
  const barMin = Math.max(secureExec.bar, 1);
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-white flex items-center">
          {label}
          {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
        </h4>
        <p className="text-[11px] text-zinc-600 italic mt-1">Lower is better</p>
      </div>
      <div className="space-y-1.5">
        {/* Secure Exec bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs text-zinc-500 sm:w-48 shrink-0 font-mono">Secure Exec</span>
          <div className="w-full sm:flex-1 relative h-7 bg-white/5 rounded-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${barMin}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})` }}
            />
            <span
              className="absolute inset-y-0 flex items-center gap-2 text-xs font-mono font-medium z-10 text-zinc-400"
              style={{ left: `calc(${barMin}% + 8px)` }}
            >
              {secureExec.value}
              {multiplier && (
                <span className="text-[11px] font-semibold" style={{ color: ACCENT_LIGHT }}>
                  {multiplier}
                </span>
              )}
            </span>
          </div>
        </div>
        {/* Sandbox bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs text-zinc-500 sm:w-48 shrink-0 font-mono">{sandbox.label}</span>
          <div className="w-full sm:flex-1 relative h-7 bg-white/5 rounded-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${sandbox.bar}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
              className="absolute inset-y-0 left-0 rounded-sm bg-zinc-600"
            />
            <span className="absolute inset-y-0 left-2 flex items-center text-xs font-mono text-zinc-300 z-10">
              {sandbox.value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Cost per execution-second with hardware tier tabs */
function CostChart() {
  const tiers = [
    { label: "AWS ARM", value: "$0.000011/s", multiplier: "56x cheaper", bar: 1.8 },
    { label: "AWS x86", value: "$0.000014/s", multiplier: "45x cheaper", bar: 2.2 },
    { label: "Hetzner ARM", value: "$0.0000016/s", multiplier: "380x cheaper", bar: 0.3 },
    { label: "Hetzner x86", value: "$0.0000027/s", multiplier: "232x cheaper", bar: 0.4 },
  ];
  const [active, setActive] = useState(0);
  const t = tiers[active];
  const barMin = Math.max(t.bar, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div>
          <h4 className="text-sm font-medium text-white flex items-center">
            Cost per execution-second
            <InfoTooltip>
              <strong>What's measured:</strong> <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded">server price per second ÷ concurrent executions per server</code>
              <br /><br />
              <strong>Why it's cheaper:</strong> Each execution uses ~3.4 MB instead of a 256 MB container minimum. And you run on your own hardware, which is significantly cheaper than per-second sandbox billing.
              <br /><br />
              <strong>Sandbox baseline:</strong> Cloudflare Containers, the cheapest sandbox provider benchmarked. Billed at $0.0000025/GiB·s with a 256 MB minimum (March 18, 2026).
              <br /><br />
              <strong>Secure Exec:</strong> 3.4 MB baseline per execution, assuming 70% utilization. Select a hardware tier above to compare.
              <br /><br />
              <a href="https://secureexec.dev/docs/benchmarks">Our benchmarks →</a>
              {" · "}
              <a href="https://secureexec.dev/docs/cost-evaluation">Full cost breakdown →</a>
            </InfoTooltip>
          </h4>
          <p className="text-[11px] text-zinc-600 italic mt-1">Lower is better</p>
        </div>
        <div className="flex flex-wrap gap-1 sm:ml-auto">
          {tiers.map((tier, i) => (
            <button
              key={tier.label}
              onClick={() => setActive(i)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wider transition-colors ${
                i === active
                  ? "bg-white/10 text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {/* Secure Exec bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs text-zinc-500 sm:w-48 shrink-0 font-mono">Secure Exec</span>
          <div className="w-full sm:flex-1 relative h-7 bg-white/5 rounded-sm overflow-hidden">
            <motion.div
              key={active}
              initial={{ width: 0 }}
              animate={{ width: `${barMin}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})` }}
            />
            <span
              className="absolute inset-y-0 flex items-center gap-2 text-xs font-mono font-medium z-10 text-zinc-400"
              style={{ left: `calc(${barMin}% + 8px)` }}
            >
              {t.value}
              <span className="text-[11px] font-semibold" style={{ color: ACCENT_LIGHT }}>
                {t.multiplier}
              </span>
            </span>
          </div>
        </div>
        {/* Sandbox bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span className="text-xs text-zinc-500 sm:w-48 shrink-0 font-mono">Cheapest sandbox</span>
          <div className="w-full sm:flex-1 relative h-7 bg-white/5 rounded-sm overflow-hidden">
            <motion.div
              key={active}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="absolute inset-y-0 left-0 rounded-sm bg-zinc-600"
            />
            <span className="absolute inset-y-0 left-2 flex items-center text-xs font-mono text-zinc-300 z-10">
              $0.000625/s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Benchmarks() {
  return (
    <section id="benchmarks" className="border-t border-white/10 py-48 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-2xl font-normal tracking-tight text-white md:text-4xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Benchmarks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl text-base leading-relaxed text-zinc-500"
          >
            V8 isolates vs. sandboxes.
          </motion.p>
        </div>

        <div className="relative">
          <motion.img
            src="/images/secure-exec/grim-reaper.webp"
            alt=""
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="pointer-events-none absolute -top-[118px] sm:-top-[134px] md:-top-[166px] -right-[48px] sm:-right-[80px] md:-right-[112px] w-48 sm:w-56 md:w-72 z-0 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 rounded-xl bg-[#0c0c0e] p-4 sm:p-8 overflow-hidden chrome-gradient-border"
          style={{ "--chrome-angle": "75deg" } as React.CSSProperties}
        >
          {/* Cold start charts */}
          <ColdStartChart />

          <div className="border-t border-white/5 my-8" />

          {/* Memory */}
          <MetricBar
            label="Memory per instance"
            tooltip={
              <>
                <strong>What's measured:</strong> Memory footprint added per concurrent execution.
                <br /><br />
                <strong>Why the gap:</strong> V8 isolates share the host process and its V8 engine. Each additional execution only adds its own heap and stack (~3.4 MB). Sandboxes allocate a dedicated container with a minimum memory reservation, even if the code inside uses far less.
                <br /><br />
                <strong>What this means:</strong> On a 1 GB server, you can run ~210 concurrent Secure Exec executions vs. ~4 sandboxes.
                <br /><br />
                <strong>Sandbox baseline:</strong> 256 MB, the smallest minimum among popular providers (Modal, Cloudflare Containers) as of March 18, 2026.
                <br /><br />
                <strong>Secure Exec:</strong> 3.4 MB, the converged average per execution under sustained load.
                <br /><br />
                <a href="https://secureexec.dev/docs/benchmarks">Our benchmarks →</a>
              </>
            }
            secureExec={{ value: "~3.4 MB", bar: 2 }}
            sandbox={{ value: "~256 MB", bar: 100, label: "Sandbox provider minimum" }}
            multiplier="75x smaller"
          />

          <div className="border-t border-white/5 my-8" />

          {/* Cost */}
          <CostChart />
        </motion.div>
          <motion.img
            src="/images/secure-exec/grim-hand.png"
            alt=""
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="pointer-events-none absolute -top-[118px] sm:-top-[134px] md:-top-[166px] -right-[48px] sm:-right-[80px] md:-right-[112px] w-48 sm:w-56 md:w-72 z-20"
          />
        </div>

      </div>
    </section>
  );
}
