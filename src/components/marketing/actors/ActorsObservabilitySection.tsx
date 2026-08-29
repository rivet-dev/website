import { Activity, Database, GitBranch, Terminal } from "lucide-react";
import { CARD_TITLE_CLASS, SECTION_H2_CLASS, SECTION_LEDE_CLASS } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

const INSPECTOR_SRC =
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

export const ActorsObservabilitySection = () => (
  <section className={`${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16" data-site-reveal>
        <div>
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>Complete observability.</h2>
          <p className={SECTION_LEDE_CLASS}>
            Inspect Actor state, SQLite data, workflow progress, events, and
            callable actions from the Rivet dashboard.
          </p>
        </div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="border-t border-ink/15 py-5">
                <Icon className="mb-3 h-4 w-4 text-pine" aria-hidden="true" />
                <h3 className={CARD_TITLE_CLASS}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <figure className="mt-12 overflow-hidden rounded-xl" data-site-reveal>
        <img
          src={INSPECTOR_SRC}
          alt="Rivet Actor Inspector showing state, events, and callable actions for a running Actor"
          width="2688"
          height="2018"
          loading="lazy"
          className="block h-auto w-full"
        />
      </figure>
    </div>
  </section>
);
