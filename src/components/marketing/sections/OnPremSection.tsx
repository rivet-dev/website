import { ArrowRight, Check } from "lucide-react";
import { PerimeterDiagram } from "../editorial/PerimeterDiagram";
import {
	BODY_CLASS,
  PRIMARY_INK_BUTTON_CLASS,
  PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
  SECTION_H2_CLASS,
  SECTION_LEDE_CLASS,
} from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

const points = [
  "Air-gapped and on-prem: no outbound connections, telemetry off with one flag",
  "Customer VPCs: each deployment chooses its own network and storage boundary",
  "Regulated environments: runs under the controls your team already operates",
];

// The checklist above carries the air-gap claim, so the diagram drops its
// footer; the lede carries "one binary", so the control-plane node drops it.
const perimeterNodes = [
  { title: "Your backend", detail: "Actors run in your Node.js or Bun process" },
  { title: "Rivet control plane", detail: "Schedules and routes your Actors" },
  { title: "Your storage", detail: "File system, Postgres, or FoundationDB" },
];

export const OnPremSection = () => (
  <section className={`bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
            Run it where your data lives.
          </h2>
          <p className={SECTION_LEDE_CLASS}>
            The control plane is one binary you control, deployed on your own
            infrastructure.
          </p>

          <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {points.map((point) => (
              <li
                key={point}
                className={`flex items-start gap-3 py-4 ${BODY_CLASS}`}
              >
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-pine/60 bg-pine/[0.08]">
                  <Check className="h-3 w-3 text-pine" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/talk-to-an-engineer" className={PRIMARY_INK_BUTTON_CLASS}>
              Talk to an engineer
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="/enterprise"
              className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
            >
              Rivet for Enterprise
            </a>
          </div>
        </div>

        <PerimeterDiagram className="bg-paper" nodes={perimeterNodes} footer={null} />
      </div>
    </div>
  </section>
);
