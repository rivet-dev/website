import { DeploymentOptions } from "../DeploymentOptions";
import { SECTION_H2_CLASS } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

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

    </div>
  </section>
);
