"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CopyButton } from "./ui/CopyButton";

interface UseCase {
  id: string;
  tab: string;
  title: string;
  description: string;
  fileName: string;
  code: string;
}

// One idea per tab, written the way the docs and `secure-exec/examples/*` write
// it. A guest expression that returns a promise is resolved by `evaluate`, so
// host functions are called without an async wrapper.
const useCases: UseCase[] = [
  {
    id: "execute",
    tab: "Code execution",
    title: "Run untrusted code with one function call.",
    description:
      "Run untrusted scripts against host functions you define. Your credentials stay in your process.",
    fileName: "run.ts",
    code: `import { evaluate } from "secure-exec";
import { crm } from "./crm";
import { z } from "zod";

const result = await evaluate<{ accounts: number; openTickets: number }>(
  \`
  const accounts = await customers.findAccounts({ industry: "fintech" });
  const tickets = await customers.openTickets({ account: accounts[0].id });
  return { accounts: accounts.length, openTickets: tickets.length };
  \`,
  {
    hostFunctions: {
      customers: {
        findAccounts: { inputSchema: z.object({ industry: z.string() }), execute: ({ industry }) => crm.findAccounts(industry) },
        openTickets: { inputSchema: z.object({ account: z.string() }), execute: ({ account }) => crm.openTickets(account) },
      },
    },
  },
);`,
  },
  {
    id: "agent",
    tab: "AI agent tool",
    title: "Give your AI agent secure code execution",
    description:
      "Expose secure-exec as a tool with the Vercel AI SDK. Your agent can run whatever it writes, without risking your infrastructure.",
    fileName: "agent.ts",
    code: `import { generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { evaluate } from "secure-exec";
import { z } from "zod";

const { text } = await generateText({
  model: anthropic("claude-sonnet-4-6"),
  prompt: "What is the 20th fibonacci number?",
  tools: {
    runCode: tool({
      description: "Evaluate a JavaScript expression and return its value.",
      inputSchema: z.object({ code: z.string() }),
      // Model-written code, so it runs sandboxed, with no network.
      execute: ({ code }) => evaluate(code),
    }),
  },
});

console.log(text);`,
  },
  {
    id: "plugins",
    tab: "Plugin system",
    title: "Run your users' plugins safely",
    description:
      "Each plugin runs in its own VM with the access you grant it, so one plugin cannot see another's data or reach anything you did not allow.",
    fileName: "plugins.ts",
    code: `import { evaluate } from "secure-exec";
import { plugins } from "./plugins";

for (const plugin of plugins) {
  const result = await evaluate<string>(plugin.source, {
    inputs: { text: "hello" },
    permissions: { network: plugin.network ? "allow" : "deny" },
  });

  // A plugin that crashes or hangs fails its own call, and nothing else.
  console.log(plugin.name, result.outcome === "succeeded" ? result.value : result.outcome);
}`,
  },
  {
    id: "fs-net",
    tab: "Filesystem & networking",
    title: "Give it exactly the files and hosts you choose",
    description:
      "The guest gets a virtual filesystem and a virtual network. Your files enter only through a mount, and the network is denied until you allow it.",
    fileName: "fs-net.ts",
    code: `import { execute, hostDirMount } from "secure-exec";

const result = await execute(
  \`
  import { readFileSync } from "node:fs";

  const url = readFileSync("/data/endpoint.txt", "utf8").trim();
  const response = await fetch(url);
  console.log(response.status);
  \`,
  {
    // One host directory, read-only. The network is denied until allowed.
    mounts: [hostDirMount("/data", "./config")],
    permissions: { network: "allow" },
    output: { capture: "all" },
  },
);

console.log(result.stdout?.trim());`,
  },
  {
    id: "dev-server",
    tab: "Dev server",
    title: "Preview generated apps without a container",
    description:
      "A VM outlives a single call, so a real node:http server can keep running inside it while you send requests in.",
    fileName: "dev-server.ts",
    code: `import { createVm } from "secure-exec";
import { app } from "./generated-app";

const vm = await createVm({ permissions: { network: "allow" } });
const server = await vm.javascript.spawn(app);

// The port lives inside the VM. Nothing is exposed on your host's network.
const response = await vm.network.httpRequest({ port: 3000, path: "/" });
console.log(new TextDecoder().decode(response.body));

await vm.process.kill(server.pid);
await vm.dispose();`,
  },
];

const KEYWORDS = new Set([
  "import", "from", "const", "let", "new", "await", "async", "return", "function", "export", "type",
]);

// One alternation, ordered so comments and strings win over everything inside
// them. Whatever falls between matches is plain punctuation and identifiers.
const TOKEN = /(\/\/[^\n]*)|(`[\s\S]*?`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(\d[\d_]*(?:\.\d+)?|true|false)\b|\b([A-Za-z_$][\w$]*)(?=\()|\b([A-Za-z_$][\w$]*)\b/g;

function highlight(code: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  const plain = (text: string) => {
    if (text) out.push(<span key={key++} className="text-zinc-300">{text}</span>);
  };
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    plain(code.slice(last, index));
    last = index + match[0].length;
    const [text, comment, string, literal, call, word] = match;
    if (comment) out.push(<span key={key++} className="text-zinc-500">{text}</span>);
    else if (string) out.push(<span key={key++} className="text-green-400">{text}</span>);
    else if (literal) out.push(<span key={key++} className="text-orange-400">{text}</span>);
    else if (call && !KEYWORDS.has(call)) out.push(<span key={key++} className="text-blue-400">{text}</span>);
    else if (KEYWORDS.has(call ?? word)) out.push(<span key={key++} className="text-purple-400">{text}</span>);
    else plain(text);
  }
  plain(code.slice(last));
  return out;
}

export function UseCases() {
  const [activeId, setActiveId] = useState(useCases[0].id);
  const active = useCases.find((useCase) => useCase.id === activeId) ?? useCases[0];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div role="tablist" aria-label="Use cases" className="mb-8 flex flex-wrap items-center justify-center gap-1">
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              type="button"
              role="tab"
              aria-selected={useCase.id === active.id}
              onClick={() => setActiveId(useCase.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
                useCase.id === active.id ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {useCase.tab}
            </button>
          ))}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">{active.title}</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">{active.description}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div
          className="overflow-hidden rounded-xl bg-[#0c0c0e] shadow-2xl chrome-gradient-border"
          style={{ "--chrome-angle": "240deg" } as React.CSSProperties}
        >
          <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 chrome-divider">
            <span className="text-xs font-medium text-zinc-500">{active.fileName}</span>
            <CopyButton text={active.code} />
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed">
            <code>{highlight(active.code)}</code>
          </pre>
        </div>
      </motion.div>
    </>
  );
}
