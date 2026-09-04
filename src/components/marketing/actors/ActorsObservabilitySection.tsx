import { Bot, LayoutDashboard } from "lucide-react";
import { CARD_TITLE_CLASS, SECTION_H2_CLASS, SECTION_LEDE_CLASS } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

const INSPECTOR_SRC =
  "https://assets.rivet.dev/website/marketing/screenshots/rivet-actors-inspector-state.png";

const features = [
  {
    title: "Actor Inspector",
    description:
      "Inspect live state, connections, queues, workflow history, and SQLite data without building admin tooling.",
    icon: LayoutDashboard,
  },
  {
    title: "Rivet MCP",
    description:
      "Ask your AI client to find Actors, call actions, and open the same Inspector inline as it debugs your application.",
    icon: Bot,
  },
];

export const ActorsObservabilitySection = () => (
  <section className={`${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16" data-site-reveal>
        <div>
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>See inside every Actor.</h2>
          <p className={SECTION_LEDE_CLASS}>
            Open the Actor Inspector in the dashboard, or inside your AI client
            through Rivet MCP.
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
          alt="Rivet Actor Inspector showing the live state of a project Actor: build summary plus each pipeline step's status, attempts, and timing"
          width="2944"
          height="2202"
          loading="lazy"
          className="block h-auto w-full"
        />
      </figure>
    </div>
  </section>
);
