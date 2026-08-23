import { Cloud, Laptop, Server } from "lucide-react";
import {
  DEPLOY_CARD_CLASS,
  DEPLOY_CARD_TITLE_CLASS,
  DEPLOY_GHOST_BUTTON_CLASS,
  DEPLOY_WHITE_BUTTON_CLASS,
  TerminalCommand,
} from "./deployKit";
import { BODY_CLASS } from "./typography";

interface DeploymentOptionsProps {
  productName: string;
  quickstartHref: string;
  selfHostHref: string;
  installCommand?: string;
  className?: string;
}

/**
 * The shared deployment decision used across product and overview pages.
 *
 * This component is intentionally static: it renders from Astro without
 * hydrating another island, while React product pages can consume the exact
 * same cards. Product pages own the surrounding chapter heading and context.
 */
export const DeploymentOptions = ({
  productName,
  quickstartHref,
  selfHostHref,
  installCommand = "npm install rivetkit",
  className,
}: DeploymentOptionsProps) => (
  <div
    className={`grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch ${className ?? ""}`}
  >
    <article className={DEPLOY_CARD_CLASS}>
      <div className="mb-3 flex h-6 items-center gap-2.5">
        <Laptop className="h-4 w-4 text-pine" aria-hidden="true" />
        <h3 className={DEPLOY_CARD_TITLE_CLASS}>Local</h3>
      </div>
      <p className={BODY_CLASS}>
        Install {productName} and run it locally while you build.
      </p>
      <div className="flex-1" />
      <div className="mt-6 border-t border-ink/10 pt-6">
        <TerminalCommand command={installCommand} />
        <a
          href={quickstartHref}
          className={`mt-4 ${DEPLOY_GHOST_BUTTON_CLASS}`}
        >
          Open the quickstart
        </a>
      </div>
    </article>

    <article className={`${DEPLOY_CARD_CLASS} border-ink/20`}>
      <div className="mb-3 flex h-6 items-center gap-2.5">
        <Cloud className="h-4 w-4 text-pine" aria-hidden="true" />
        <h3 className={DEPLOY_CARD_TITLE_CLASS}>Rivet Cloud</h3>
      </div>
      <p className={BODY_CLASS}>
        Deploy {productName} on Rivet Cloud with managed infrastructure and
        persisted Actor data.
      </p>
      <div className="flex-1" />
      <a
        href="https://dashboard.rivet.dev"
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 ${DEPLOY_WHITE_BUTTON_CLASS}`}
      >
        Open the dashboard
      </a>
    </article>

    <article className={DEPLOY_CARD_CLASS}>
      <div className="mb-3 flex h-6 items-center gap-2.5">
        <Server className="h-4 w-4 text-pine" aria-hidden="true" />
        <h3 className={DEPLOY_CARD_TITLE_CLASS}>Self-Host</h3>
      </div>
      <p className={BODY_CLASS}>
        Run the open-source Rivet control plane as a Rust binary or container on
        your infrastructure.
      </p>
      <div className="flex-1" />
      <a href={selfHostHref} className={`mt-6 ${DEPLOY_GHOST_BUTTON_CLASS}`}>
        Read self-hosting docs
      </a>
    </article>
  </div>
);
