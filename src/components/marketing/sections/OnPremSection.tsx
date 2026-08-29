import { DeploymentBoundaryDiagram } from "../diagrams/DeploymentBoundaryDiagram";
import { CatalogCard } from "../editorial/CatalogCard";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import {
  BODY_CLASS,
  PRIMARY_INK_BUTTON_CLASS,
  PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
  SECTION_H2_CLASS,
} from "../typography";

const pillars = [
  {
    title: "Single Rust binary",
    body: "One process to install, monitor, and upgrade.",
  },
  {
    title: "Kubernetes or systemd",
    body: "Deploy with the Enterprise Helm chart or a systemd unit.",
  },
  {
    title: "Storage you control",
    body: "Use Postgres or FoundationDB for persistence and tiered storage to S3.",
  },
  {
    title: "Local dev matches production",
    body: "Use the same binary, APIs, and control-plane behavior from laptop to production.",
  },
];

export const OnPremSection = () => (
  <section
    aria-labelledby="landing-deployment-title"
    className={`bg-paper ${SITE_SECTION_CLASS}`}
  >
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="max-w-3xl" data-site-reveal="">
        <h2 id="landing-deployment-title" className={SECTION_H2_CLASS}>
          Run your agent infrastructure where your data already lives.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <ul
          className="grid grid-cols-1 gap-6 sm:auto-rows-fr sm:grid-cols-2"
          data-site-reveal-group=""
          data-site-reveal-stagger="70"
        >
          {pillars.map((pillar) => (
            <li key={pillar.title} className="h-full" data-site-reveal-child="">
              <CatalogCard
                title={pillar.title}
                className="flex h-full flex-col"
              >
                <p className={`mt-2 flex-1 ${BODY_CLASS}`}>{pillar.body}</p>
              </CatalogCard>
            </li>
          ))}
        </ul>

        <div
          className="mx-auto h-full w-full min-w-0 max-w-xl"
          data-site-reveal=""
          data-site-reveal-delay="120"
        >
          <DeploymentBoundaryDiagram className="h-full" />
        </div>
      </div>

      <div
        className="mt-10 flex flex-col gap-3 sm:flex-row"
        data-site-reveal=""
      >
        <a href="/talk-to-an-engineer/" className={PRIMARY_INK_BUTTON_CLASS}>
          Talk to an engineer
        </a>
        <a href="/enterprise/" className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}>
          Explore Enterprise
        </a>
      </div>
    </div>
  </section>
);
