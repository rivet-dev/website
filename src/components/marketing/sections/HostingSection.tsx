import { deployOptionsForRole } from "@rivetkit/shared-data";
import { DeploymentOptions } from "../DeploymentOptions";
import {
  EYEBROW_CLASS,
  SECTION_H2_CLASS,
} from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

const PLATFORM_LINK_CLASS =
  "inline-flex items-center rounded-md border border-ink/10 bg-white/55 px-2.5 py-1 text-sm text-ink-soft transition-colors hover:border-ink/25 hover:bg-white hover:text-ink";

export const HostingSection = () => (
  <section className={`bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div data-site-reveal="" className="max-w-3xl">
        <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
          Start local. Deploy when ready.
        </h2>
      </div>

      <div data-site-reveal="">
        <DeploymentOptions
          productName="Actors"
          quickstartHref="/actors/docs"
          selfHostHref="/actors/self-host/control-plane"
          className="mt-12"
        />
      </div>

      <div data-site-reveal="" className="mt-12">
        <p className={EYEBROW_CLASS}>Your backend deploys to</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {deployOptionsForRole("worker").map(
            ({ displayName, shortTitle, slug }) => (
              <a
                key={displayName}
                href={`/actors/self-host/workers/${slug}`}
                className={PLATFORM_LINK_CLASS}
              >
                {shortTitle || displayName}
              </a>
            ),
          )}
        </div>
      </div>
    </div>
  </section>
);
