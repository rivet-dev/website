import { deployOptionsForRole } from "@rivetkit/shared-data";
import { DeploymentOptions } from "../DeploymentOptions";
import {
  EYEBROW_CLASS,
  SECTION_H2_CLASS,
  SECTION_LEDE_CLASS,
} from "../typography";

const PLATFORM_LINK_CLASS =
  "inline-flex items-center rounded-md border border-ink/10 bg-white/55 px-2.5 py-1 text-sm text-ink-soft transition-colors hover:border-ink/25 hover:bg-white hover:text-ink";

export const HostingSection = () => (
  <section className="border-t border-ink/10 bg-paper px-6 py-16 md:py-32">
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
          Start local. Deploy when ready.
        </h2>
        <p className={SECTION_LEDE_CLASS}>
          Build locally, deploy on Rivet Cloud, or self-host Rivet inside your
          own infrastructure.
        </p>
      </div>

      <DeploymentOptions
        productName="Actors"
        quickstartHref="/actors/docs"
        selfHostHref="/actors/self-host/control-plane"
        className="mt-12"
      />

      <div className="mt-12 border-t border-ink/15 pt-5">
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
