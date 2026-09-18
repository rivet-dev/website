"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "How does it work?",
    answer: (
      <>
        Secure Exec runs untrusted code inside{" "}
        <a href="https://v8.dev/docs/embed" className="text-white underline underline-offset-2 hover:text-zinc-300">
          V8 isolates
        </a>
        {" "}— the same isolation primitive that powers every Chromium tab and Cloudflare Workers. Each execution gets its own
        heap, its own globals, and a deny-by-default permission boundary. There is no container, no VM, and no Docker daemon — just
        fast, lightweight isolation using battle-tested web technology.{" "}
        <a href="https://secureexec.dev/docs/sdk-overview" className="text-red-400 hover:text-red-300">
          Architecture →
        </a>
      </>
    ),
  },
  {
    question: "Does this require Docker, nested virtualization, or a hypervisor?",
    answer: (
      <>
        No. Secure Exec is a pure npm package — <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">npm install secure-exec</code> is
        all you need. It has zero infrastructure dependencies: no Docker daemon, no hypervisor, no
        orchestrator, no sidecar. It runs anywhere Node.js or Bun runs.
      </>
    ),
  },
  {
    question: "Can it run in serverless environments?",
    answer: (
      <>
        We are actively validating serverless platforms, but Secure Exec should work everywhere that provides a
        standard Node.js-like runtime. This includes Vercel Fluid Compute, AWS Lambda, and Google Cloud Run.
        Cloudflare Workers is not supported because it does not expose the V8 APIs that Secure Exec relies on.
      </>
    ),
  },
  {
    question: "When should I use a sandbox vs. Secure Exec?",
    answer: (
      <>
        Use <strong className="text-white">Secure Exec</strong> when you need fast, lightweight code execution —
        AI tool calls, code evaluation, user-submitted scripts — without provisioning infrastructure.
        Use a <strong className="text-white">sandbox</strong> (e2b, Modal, Daytona) when you need a full
        operating-system environment with persistent disk, root access, or GPU passthrough.{" "}
        <a href="https://secureexec.dev/docs/comparison/sandbox" className="text-red-400 hover:text-red-300">
          Full comparison →
        </a>
      </>
    ),
  },
  {
    question: "Can I run npm install in Secure Exec to dynamically install modules?",
    answer: "Yes. Secure Exec supports dynamic module installation via npm inside the execution environment.",
  },
  {
    question: "Can I use it to run dev servers like Express, Hono, or Next.js?",
    answer: (
      <>
        Yes. Secure Exec bridges Node.js APIs including http, net, and child_process, so frameworks like Express, Hono,
        and Next.js work out of the box. For production deployments, pair Secure Exec with{" "}
        <a href="https://rivet.dev/docs/actors" className="text-white underline underline-offset-2 hover:text-zinc-300">
          Rivet Actors
        </a>
        {" "}to get built-in routing, scaling, and lifecycle management for each server instance.
      </>
    ),
  },
  {
    question: "Can it be used for long-running tasks?",
    answer: (
      <>
        Yes. For orchestrating stateful, long-running tasks, we recommend pairing Secure Exec with{" "}
        <a href="https://rivet.dev/docs/actors" className="text-white underline underline-offset-2 hover:text-zinc-300">
          Rivet Actors
        </a>
        . Rivet Actors provide durable state, automatic persistence, and fault-tolerant orchestration — so each
        long-running task survives restarts and can be monitored, paused, or resumed without you building that
        infrastructure yourself.
      </>
    ),
  },
  {
    question: "What are common use cases?",
    answer: (
      <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
        <li>
          <a href="https://secureexec.dev/docs/use-cases/ai-agent-code-exec" className="text-red-400 hover:text-red-300">
            AI agent code execution and tool use
          </a>
        </li>
        <li>
          <a href="https://secureexec.dev/docs/use-cases/dev-servers" className="text-red-400 hover:text-red-300">
            User-facing dev servers (Express, Hono, Next.js)
          </a>
        </li>
        <li>MCP tool-code execution</li>
        <li>
          <a href="https://secureexec.dev/docs/use-cases/plugin-systems" className="text-red-400 hover:text-red-300">
            Sandboxed plugin / extension systems
          </a>
        </li>
        <li>Interactive coding playgrounds</li>
      </ul>
    ),
  },
  {
    question: "Does this have Node.js compatibility?",
    answer: (
      <>
        Yes. Most Node.js core modules work — including fs, child_process, http, dns, process, and os. These are
        bridged to real host capabilities, not stubbed.{" "}
        <a href="https://secureexec.dev/docs/nodejs-compatibility" className="text-red-400 hover:text-red-300">
          Compatibility matrix →
        </a>
      </>
    ),
  },
  {
    question: "Does this have access to a full operating system?",
    answer: "Yes. Secure Exec includes a virtual kernel with a system bridge that supports a granular permission model. Filesystem, network, child processes, and environment variables are all available — gated behind deny-by-default permissions.",
  },
  {
    question: "Does Secure Exec support JIT compilation?",
    answer: "Yes. Secure Exec runs on native V8 isolates, so your code is JIT-compiled by V8's TurboFan optimizing compiler — the same pipeline that powers Chrome and Node.js. This means full optimization tiers, inline caching, and speculative optimization out of the box.",
  },
  {
    question: "How does Secure Exec compare to WASM-based JavaScript runtimes like QuickJS?",
    answer: (
      <>
        WASM-based runtimes like{" "}
        <a href="https://bellard.org/quickjs/" className="text-white underline underline-offset-2 hover:text-zinc-300">
          QuickJS
        </a>{" "}
        (via quickjs-emscripten) compile a separate JS engine to WebAssembly, which means your code runs through an
        interpreter inside WASM — not native V8. Secure Exec uses native V8 isolates directly, so you get the same
        JIT-compiled performance as JavaScript running on the host. No interpretation overhead, no WASM translation
        layer, and full Node.js API compatibility.
      </>
    ),
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: React.ReactNode; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="border-b border-white/5 last:border-b-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-white group"
      >
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-sm leading-relaxed text-zinc-400">{answer}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-2xl font-normal tracking-tight text-white md:text-4xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            FAQ
          </motion.h2>
        </div>

        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
