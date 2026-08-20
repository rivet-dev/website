import {
  Clock,
  Database,
  GitBranch,
  Globe,
  Infinity,
  Layers,
  ListOrdered,
  Wifi,
} from "lucide-react";
import { SECTION_H2_CLASS, SECTION_LEDE_CLASS } from "../typography";

const features = [
  {
    icon: Database,
    title: "In-memory state",
    description:
      "State lives with the Actor for local reads and writes. Persist with SQLite or bring a database.",
    href: "/actors/docs/state",
  },
  {
    icon: Infinity,
    title: "Long-lived while active, sleeps when idle",
    description: "Continue beyond one request, then sleep when idle.",
    href: "/actors/docs/lifecycle",
  },
  {
    icon: Layers,
    title: "Sleeps idle, fans out with demand",
    description: "Each Actor is independently addressed and scheduled.",
    href: "/actors/docs/design-patterns",
  },
  {
    icon: Globe,
    title: "Regional placement",
    description:
      "Configure Actor placement with Rivet Cloud or your own control plane.",
    href: "https://dashboard.rivet.dev",
  },
  {
    icon: Wifi,
    title: "WebSockets",
    description: "Real-time bidirectional streaming built in.",
    href: "/actors/docs/events",
  },
  {
    icon: GitBranch,
    title: "Workflows layer",
    description:
      "Add recorded multi-step operations with configured retries and waits.",
    href: "/workflows",
  },
  {
    icon: ListOrdered,
    title: "Queues",
    description: "Durable message queues for reliable async processing.",
    href: "/actors/docs/queues",
  },
  {
    icon: Clock,
    title: "Scheduling",
    description: "Timers and cron jobs within your actor.",
    href: "/actors/docs/schedule",
  },
];

export const BuiltInFeatures = () => (
  <section className="border-t border-ink/10 bg-paper px-6 py-16 md:py-32">
    <div className="mx-auto w-full max-w-7xl">
      <div className="max-w-3xl">
        <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
          A lightweight primitive with powerful capabilities.
        </h2>
        <p className={SECTION_LEDE_CLASS}>
          One Actor per agent, per session, per user — state, storage, and
          networking included.
        </p>
      </div>

      <div className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <a
              key={feature.title}
              href={feature.href}
              className="group flex flex-col border-t border-ink/15 py-6 transition-colors hover:border-pine/50"
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className="h-4 w-4 shrink-0 text-ink-soft"
                  aria-hidden="true"
                />
                <h3 className="text-base font-medium tracking-tight text-ink">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {feature.description}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);
