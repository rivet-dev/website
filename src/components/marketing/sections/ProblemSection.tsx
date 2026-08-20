"use client";

import { useState, useEffect, useRef } from "react";
import {
  Database,
  Cpu,
  Clock,
  Wifi,
  Zap,
  Bot,
  Users,
  Boxes,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { codeToHtml } from "shiki";
import { EYEBROW_CLASS, SECTION_H2_CLASS } from "../typography";
import heroTheme from "@/lib/agent-os-hero-code-theme";

// Client-side shiki highlighting hook
const useHighlightedCode = (code: string) => {
  const [html, setHtml] = useState<string>("");
  const cache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (cache.current[code]) {
      setHtml(cache.current[code]);
      return;
    }

    codeToHtml(code, {
      lang: "typescript",
      theme: heroTheme,
    }).then((result) => {
      cache.current[code] = result;
      setHtml(result);
    });
  }, [code]);

  return html;
};

interface UseCaseConfig {
  title: string;
  description: string;
  features: { icon: typeof Cpu; label: string; detail: string; href: string }[];
  serverCode: string;
  clientCode: string;
}

const useCases: Record<string, UseCaseConfig> = {
  "AI Agent": {
    title: "AI Agent",
    description:
      "Each agent runs as its own actor with persistent context, memory, and the ability to schedule tool calls.",
    features: [
      {
        icon: Cpu,
        label: "In-memory state",
        detail: "Context",
        href: "/actors/docs/state",
      },
      {
        icon: Database,
        label: "SQLite or BYO database persistence",
        detail: "Memory",
        href: "/actors/docs/state",
      },
      {
        icon: Clock,
        label: "Scheduling",
        detail: "Tool calls",
        href: "/actors/docs/schedule",
      },
    ],
    serverCode: `const agent = actor({
  // In-memory, persisted state for the actor
  state: { messages: [] },

  // Long-running actor process
  run: async (c) => {
    // Process incoming messages from the queue
    for await (const msg of c.queue.iter()) {
      c.state.messages.push({ role: "user", content: msg.body.text });
      const response = streamText({ model: openai("gpt-5"), messages: c.state.messages });

      // Stream realtime events to all connected clients
      for await (const delta of response.textStream) {
        c.broadcast("token", delta);
      }

      c.state.messages.push({ role: "assistant", content: await response.text });
    }
  },
});`,
    clientCode: `const agent = client.agent.getOrCreate("agent-123").connect();
agent.on("token", delta => process.stdout.write(delta));
await agent.queue.send("hello!");`,
  },
  "Collab Docs": {
    title: "Collaborate Document",
    description:
      "Real-time collaborative editing where each document is an actor broadcasting changes to all connected users.",
    features: [
      {
        icon: Cpu,
        label: "In-memory state",
        detail: "Document",
        href: "/actors/docs/state",
      },
      {
        icon: Wifi,
        label: "WebSockets",
        detail: "Sync",
        href: "/actors/docs/events",
      },
      {
        icon: Zap,
        label: "Runs indefinitely",
        detail: "Always on",
        href: "/actors/docs/lifecycle",
      },
    ],
    serverCode: `// One actor per document
const document = actor({
  state: { content: "", version: 0 },
  actions: {
    edit: (c, patch) => {
      c.state.content = applyPatch(
        c.state.content, patch
      );
      c.state.version++;
      // Send realtime update to all clients
      c.broadcast("update", c.state);
    },
  },
});`,
    clientCode: `const doc = client.document.get("doc-789");
await doc.edit({ insert: "Hello", pos: 0 });
doc.on("update", (state) => render(state));`,
  },
  "Per-Tenant Database": {
    title: "Per-Tenant DB",
    description:
      "One actor per tenant with low-latency in-memory reads and durable tenant data persistence.",
    features: [
      {
        icon: Cpu,
        label: "In-memory state",
        detail: "Hot reads",
        href: "/actors/docs/state",
      },
      {
        icon: Database,
        label: "SQLite or BYO database persistence",
        detail: "Tenant data",
        href: "/actors/docs/state",
      },
      {
        icon: Zap,
        label: "Sleeps when idle",
        detail: "Cost efficient",
        href: "/actors/docs/lifecycle",
      },
    ],
    serverCode: `// One actor per tenant
const tenantDb = actor({
  state: { users: {}, settings: {} },
  actions: {
    upsertUser: (c, user) => {
      c.state.users[user.id] = user;
      return c.state.users[user.id];
    },
    getUser: (c, userId) => c.state.users[userId] ?? null,
  },
});`,
    clientCode: `const tenant = client.tenantDb.get("tenant-123");
await tenant.upsertUser({ id: "u1", name: "Avery" });
const user = await tenant.getUser("u1");`,
  },
  "Sandbox Orchestration": {
    title: "Sandbox Orchestration",
    description:
      "Coordinate sandbox sessions, queue work, and schedule cleanup in one long-lived actor per workspace.",
    features: [
      {
        icon: Cpu,
        label: "In-memory state",
        detail: "Live sessions",
        href: "/actors/docs/state",
      },
      {
        icon: Database,
        label: "Queue messages",
        detail: "Jobs",
        href: "/actors/docs/queues",
      },
      {
        icon: Clock,
        label: "Scheduling",
        detail: "Timeouts",
        href: "/actors/docs/schedule",
      },
    ],
    serverCode: `// One actor per sandbox workspace
const sandbox = actor({
  state: { sessions: {}, pendingRuns: [] },
  actions: {
    enqueueRun: (c, run) => {
      c.state.pendingRuns.push(run);
      c.schedule.after(0, "processQueue");
    },
    processQueue: async (c) => {
      const run = c.state.pendingRuns.shift();
      if (!run) return;
      const result = await executeInSandbox(run);
      c.broadcast("runComplete", result);
    },
  },
});`,
    clientCode: `const sandbox = client.sandbox.get("workspace-123");
await sandbox.enqueueRun({ sessionId: "abc", command: "pnpm test" });
sandbox.on("runComplete", (result) => render(result));`,
  },
  Chat: {
    title: "Chat",
    description:
      "One actor per room or conversation with in-memory state, persistent history, and realtime delivery.",
    features: [
      {
        icon: Cpu,
        label: "In-memory state",
        detail: "Room state",
        href: "/actors/docs/state",
      },
      {
        icon: Database,
        label: "SQLite or BYO database persistence",
        detail: "History",
        href: "/actors/docs/state",
      },
      {
        icon: Wifi,
        label: "WebSockets",
        detail: "Realtime",
        href: "/actors/docs/events",
      },
    ],
    serverCode: `// One actor per chat room
const chatRoom = actor({
  state: { messages: [] },
  actions: {
    send: (c, text) => {
      const msg = { text, sentAt: Date.now() };
      c.state.messages.push(msg);
      c.broadcast("message", msg);
    },
    history: (c) => c.state.messages,
  },
});`,
    clientCode: `const room = client.chatRoom.get("room-123");
await room.send("Hello everyone");
room.on("message", (msg) => renderMessage(msg));`,
  },
};

type UseCaseKey = keyof typeof useCases;

const useCaseOrder: UseCaseKey[] = [
  "AI Agent",
  "Sandbox Orchestration",
  "Collab Docs",
  "Chat",
  "Per-Tenant Database",
];

const useCaseTabLabels: Record<UseCaseKey, string> = {
  "AI Agent": "AI Agent",
  "Sandbox Orchestration": "Sandboxes",
  "Collab Docs": "Multiplayer",
  "Per-Tenant Database": "Per-Tenant DB",
  Chat: "Chat",
};

const useCaseIcons: Record<string, typeof Bot> = {
  "AI Agent": Bot,
  "Collab Docs": Users,
  "Per-Tenant Database": Database,
  "Sandbox Orchestration": Boxes,
  Chat: MessageSquare,
};

const useCaseId = (useCase: UseCaseKey) =>
  useCase.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const HighlightedCode = ({ code, title }: { code: string; title: string }) => {
  const html = useHighlightedCode(code);

  return (
    <div>
      <div className="px-4 py-2 border-b border-ink/10 text-xs text-ink-faint font-mono">
        {title}
      </div>
      {!html ? (
        <pre className="p-4 font-mono text-xs md:text-sm leading-6 text-ink-soft overflow-x-auto">
          <code>{code}</code>
        </pre>
      ) : (
        <div
          className="p-4 text-xs md:text-sm leading-6 overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
};

// Stacked code snippets that live inside the section's ink plate.
const UseCaseCode = ({ config }: { config: UseCaseConfig }) => (
  <div>
    <HighlightedCode code={config.serverCode} title="backend.ts" />
    <div className="border-t border-ink/10">
      <HighlightedCode code={config.clientCode} title="client.ts" />
    </div>
  </div>
);

// The porcelain caption column that sits beside the ink plate.
const UseCaseDetails = ({ config }: { config: UseCaseConfig }) => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-3">
      <span className={EYEBROW_CLASS}>
        {config.title}
      </span>
    </div>

    <p className="text-sm leading-relaxed text-ink-soft">
      {config.description}
    </p>

    <div className="flex flex-col gap-3">
      {config.features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <a
            key={idx}
            href={feature.href}
            className="group flex w-fit items-center gap-3 rounded-sm text-ink-soft transition-colors duration-200 motion-reduce:transition-none hover:text-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-ink-faint transition-colors duration-200 motion-reduce:transition-none group-hover:text-pine" />
            <span className="text-sm">{feature.label}</span>
            <span className="text-sm text-ink-faint transition-colors duration-200 motion-reduce:transition-none group-hover:text-pine/80">
              ({feature.detail})
            </span>
            <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-pine opacity-0 transition-all duration-200 motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100" />
          </a>
        );
      })}
    </div>
  </div>
);

export const ProblemSection = () => {
  const [activeUseCase, setActiveUseCase] = useState<UseCaseKey>("AI Agent");
  const [showScrollHint, setShowScrollHint] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const config = useCases[activeUseCase];

  const selectTab = (index: number) => {
    const normalizedIndex = (index + useCaseOrder.length) % useCaseOrder.length;
    setActiveUseCase(useCaseOrder[normalizedIndex]);
    tabRefs.current[normalizedIndex]?.focus();
  };

  useEffect(() => {
    const tabsEl = tabsScrollRef.current;
    if (!tabsEl) return;

    const updateScrollHint = () => {
      const hasOverflow = tabsEl.scrollWidth > tabsEl.clientWidth + 1;
      const atRightEdge =
        tabsEl.scrollLeft + tabsEl.clientWidth >= tabsEl.scrollWidth - 1;
      setShowScrollHint(hasOverflow && !atRightEdge);
    };

    updateScrollHint();

    tabsEl.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);

    return () => {
      tabsEl.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, []);

  return (
    <section
      id="problem"
      className="border-t border-ink/10 bg-paper-mid px-6 py-16 md:py-32"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>Actors in action.</h2>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft md:text-lg lg:pt-1">
            One primitive that adapts to agents, workflows, collaboration, and
            more.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-16">
          <div>
            <UseCaseDetails config={config} />
          </div>

          <div
            id="actors-use-case-panel"
            role="tabpanel"
            aria-labelledby={`actors-use-case-tab-${useCaseId(activeUseCase)}`}
            tabIndex={0}
            className="min-w-0 overflow-hidden rounded-xl border border-ink/10 bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
          >
            {/* File-tab strip */}
            <div className="relative">
              <div
                ref={tabsScrollRef}
                role="tablist"
                aria-label="Actor use cases"
                className="scrollbar-hide flex w-full overflow-x-auto border-b border-ink/10 bg-white/35"
                style={
                  showScrollHint
                    ? {
                        maskImage:
                          "linear-gradient(to right, #000 0, #000 calc(100% - 3.5rem), transparent 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to right, #000 0, #000 calc(100% - 3.5rem), transparent 100%)",
                      }
                    : undefined
                }
              >
                {useCaseOrder.map((useCase, index) => {
                  const Icon = useCaseIcons[useCase];
                  const active = activeUseCase === useCase;
                  return (
                    <button
                      key={useCase}
                      ref={(element) => {
                        tabRefs.current[index] = element;
                      }}
                      id={`actors-use-case-tab-${useCaseId(useCase)}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="actors-use-case-panel"
                      tabIndex={active ? 0 : -1}
                      onClick={() => setActiveUseCase(useCase)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowRight") {
                          event.preventDefault();
                          selectTab(index + 1);
                        } else if (event.key === "ArrowLeft") {
                          event.preventDefault();
                          selectTab(index - 1);
                        } else if (event.key === "Home") {
                          event.preventDefault();
                          selectTab(0);
                        } else if (event.key === "End") {
                          event.preventDefault();
                          selectTab(useCaseOrder.length - 1);
                        }
                      }}
                      className={`-mb-px flex flex-none items-center justify-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine sm:flex-1 ${
                        active
                          ? "border-pine bg-paper-mid/70 text-ink"
                          : "border-transparent text-ink-faint hover:bg-white/55 hover:text-ink-soft"
                      }`}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {useCaseTabLabels[useCase]}
                    </button>
                  );
                })}
              </div>
              <div
                className={`pointer-events-none absolute bottom-0 right-0 top-0 flex items-center pr-2 transition-opacity duration-200 motion-reduce:transition-none ${
                  showScrollHint ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 bg-white/55">
                  <ArrowRight className="h-3.5 w-3.5 text-ink-soft" />
                </span>
              </div>
            </div>

            <UseCaseCode config={config} />
          </div>
        </div>
      </div>
    </section>
  );
};
