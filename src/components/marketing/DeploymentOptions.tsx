import {
  Icon,
  faAws,
  faGoogleCloud,
  faHetzner,
  faMicrosoft,
  type IconProp,
} from "@rivet-gg/icons";
import { Cloud, Laptop, Server } from "lucide-react";
import {
  DEPLOY_CARD_CLASS,
  DEPLOY_CARD_TITLE_CLASS,
  DEPLOY_GHOST_BUTTON_CLASS,
  DEPLOY_WHITE_BUTTON_CLASS,
  TerminalCommand,
} from "./deployKit";
import { BODY_CLASS } from "./typography";
import { canonicalizeInternalHref } from "@/lib/internalHref";

interface DeploymentOptionsProps {
  productName: string;
  quickstartHref: string;
  selfHostHref: string;
  installCommand?: string;
  className?: string;
}

const CLOUDS = {
  aws: { label: "AWS", icon: faAws },
  gcp: { label: "Google Cloud", icon: faGoogleCloud },
  azure: { label: "Azure", icon: faMicrosoft },
  hetzner: { label: "Hetzner", icon: faHetzner },
} satisfies Record<string, { label: string; icon: IconProp }>;

/** The clouds a deployment option runs on, as a row of labelled marks. */
const CloudLogos = ({ clouds }: { clouds: (keyof typeof CLOUDS)[] }) => (
  <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
    {clouds.map((id) => (
      <li
        key={id}
        className="flex items-center gap-1.5 text-xs font-medium text-ink-soft"
      >
        <Icon icon={CLOUDS[id].icon} aria-hidden="true" className="size-4 shrink-0" />
        {CLOUDS[id].label}
      </li>
    ))}
  </ul>
);

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
        <h3 className={DEPLOY_CARD_TITLE_CLASS}>Local & Self-Host</h3>
      </div>
      <p className={BODY_CLASS}>
        Install {productName} and run it locally while you build. When you ship,
        run the same open-source control plane as a Rust binary or container on
        your own infrastructure.
      </p>
      <CloudLogos clouds={["aws", "gcp", "azure", "hetzner"]} />
      <div className="flex-1" />
      <div className="mt-6 border-t border-ink/10 pt-6">
        <TerminalCommand command={installCommand} />
        <a
          href={canonicalizeInternalHref(quickstartHref)}
          className={`mt-4 ${DEPLOY_GHOST_BUTTON_CLASS}`}
        >
          Open the quickstart
        </a>
        <a
          href={canonicalizeInternalHref(selfHostHref)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pine no-underline hover:underline"
        >
          Read self-hosting docs
          <span aria-hidden="true">→</span>
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
      <CloudLogos clouds={["aws", "gcp"]} />
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
        <h3 className={DEPLOY_CARD_TITLE_CLASS}>BYOC</h3>
      </div>
      <p className={BODY_CLASS}>
        Run the control plane inside your own VPC, fully managed by Rivet. Your
        data never leaves your cloud and there is no inbound management
        connection.
      </p>
      <CloudLogos clouds={["aws", "gcp", "azure"]} />
      <div className="flex-1" />
      <a href="/docs/deploy/byoc/" className={`mt-6 ${DEPLOY_GHOST_BUTTON_CLASS}`}>
        Read the BYOC docs
      </a>
    </article>
  </div>
);
