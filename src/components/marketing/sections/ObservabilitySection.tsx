import { Activity, Database, GitBranch, Terminal } from "lucide-react";
import { SECTION_H2_CLASS } from "../typography";

const inspectorSrc =
  "https://assets.rivet.dev/repo/website/src/components/marketing/images/screenshots/rivet-actor-inspector.png";

const features = [
  {
    title: "SQLite Viewer",
    description:
      "Browse and query SQLite databases in real-time across actors and agent sessions",
    icon: Database,
  },
  {
    title: "Workflow State",
    description:
      "Inspect workflow progress, steps, and retries as they execute",
    icon: GitBranch,
  },
  {
    title: "Event Monitoring",
    description:
      "Follow Actor actions, connection events, and application logs while debugging a run",
    icon: Activity,
  },
  {
    title: "REPL",
    description:
      "Debug actors and agent sessions by calling actions, subscribing to events, and interacting directly with your code",
    icon: Terminal,
  },
];

export const ObservabilitySection = () => (
  <section className="border-t border-ink/10 bg-paper px-6 py-16 md:py-32">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
            Observe the whole stack.
          </h2>
        </div>

        <div className="grid gap-x-8 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="border-t border-ink/15 py-5"
              >
                <Icon className="mb-3 h-4 w-4 text-pine" aria-hidden="true" />
                <h3 className="text-base font-medium tracking-tight text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <figure className="mt-12 overflow-hidden rounded-xl border border-ink/10 bg-white/55 p-2 sm:p-3">
        <img
          src={inspectorSrc}
          alt="Rivet Actor Inspector"
          width="2688"
          height="2018"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-md border border-ink/10"
        />
      </figure>
    </div>
  </section>
);
