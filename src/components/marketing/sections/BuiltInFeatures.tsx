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
import { BODY_CLASS, CARD_TITLE_CLASS, SECTION_H2_CLASS } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { canonicalizeInternalHref } from "@/lib/internalHref";

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
  <section className={`bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="max-w-3xl" data-site-reveal>
        <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
          A lightweight primitive with powerful capabilities.
        </h2>
      </div>

      <div className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4" data-site-reveal-group>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <a
              key={feature.title}
              href={canonicalizeInternalHref(feature.href)}
              data-site-reveal-child
              className="group flex flex-col border-t border-ink/15 py-6 transition-colors hover:border-pine/50"
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className="h-4 w-4 shrink-0 text-ink-soft"
                  aria-hidden="true"
                />
                <h3 className={CARD_TITLE_CLASS}>
                  {feature.title}
                </h3>
              </div>
              <p className={`mt-3 ${BODY_CLASS}`}>
                {feature.description}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);
