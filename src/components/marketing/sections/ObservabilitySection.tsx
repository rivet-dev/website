import { Activity, Database, GitBranch, Terminal } from "lucide-react";
import { BODY_CLASS, CARD_TITLE_CLASS, SECTION_H2_CLASS } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

const inspectorSrc =
  "https://assets.rivet.dev/website/marketing/screenshots/rivet-actors-inspector-state.png";

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
  <section className={`bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div data-site-reveal="">
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
            Complete observability.
          </h2>
        </div>

        <div
          data-site-reveal-group=""
          className="grid gap-x-8 sm:grid-cols-2"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                data-site-reveal-child=""
                className="border-t border-ink/15 py-5"
              >
                <Icon className="mb-3 h-4 w-4 text-pine" aria-hidden="true" />
                <h3 className={CARD_TITLE_CLASS}>
                  {feature.title}
                </h3>
                <p className={`mt-2 ${BODY_CLASS}`}>
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <figure
        data-site-reveal=""
        className="mt-12 overflow-hidden rounded-xl"
      >
        <img
          src={inspectorSrc}
          alt="Rivet dashboard inspecting a project Actor built by an agent: live state with the build summary and each pipeline step's status, attempts, and timing"
          width="2944"
          height="2202"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </figure>
    </div>
  </section>
);
