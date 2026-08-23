// Side-by-side deployment models for /enterprise, adapted from the pricing
// page's SelfHostingComparison. Every column draws the same backend → control
// plane → storage stack; only the Rivet Cloud (pine) vs your-infrastructure
// (ink) boundary moves. The section heading and lede live in enterprise.astro;
// this island holds only the cards because the diagrams need framer-motion.
import { Icon, faCloudArrowUp, faServer, faShareNodes } from "@rivet-gg/icons";
import { DeploymentDiagram } from "@/components/marketing/diagrams/deploymentDiagrams";
import { SITE_CARD_CLASS } from "@/components/marketing/layout";
import { DEPLOY_CARD_TITLE_CLASS } from "@/components/marketing/deployKit";

const LINK_CLASS =
  "mt-6 inline-flex items-center gap-1 text-sm font-medium text-pine transition-colors motion-reduce:transition-none hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const models = [
  {
    title: "Fully self-hosted",
    description:
      "You run the entire stack — in your VPC, in customer environments, or fully air-gapped.",
    icon: faServer,
    diagram: "self-hosted" as const,
    linkLabel: "Read the self-hosting docs",
    href: "/actors/self-host/control-plane",
  },
  {
    title: "Bring your own compute",
    description:
      "Your backend runs on your infrastructure and connects outbound to the control plane in Rivet Cloud.",
    icon: faShareNodes,
    diagram: "byoc" as const,
    linkLabel: "Connect your host",
    href: "/actors/self-host",
  },
  {
    title: "Rivet Cloud",
    description:
      "Everything managed by Rivet — your backend, the control plane, and storage.",
    icon: faCloudArrowUp,
    diagram: "managed" as const,
    linkLabel: "Open the dashboard",
    href: "https://dashboard.rivet.dev",
  },
];

export const EnterpriseDeploymentModels = () => (
  <div className="mt-12 grid gap-6 md:grid-cols-3" data-site-reveal-group>
    {models.map((model) => (
      <article
        key={model.title}
        data-site-reveal-child
        className={`${SITE_CARD_CLASS} flex flex-col md:grid md:row-span-4 md:grid-rows-subgrid`}
      >
        <div className="flex h-6 items-center gap-2.5">
          <Icon
            icon={model.icon}
            aria-hidden="true"
            className="h-4 w-4 text-pine"
          />
          <h3 className={DEPLOY_CARD_TITLE_CLASS}>{model.title}</h3>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {model.description}
        </p>
        <div className="mt-6 flex-1">
          <DeploymentDiagram variant={model.diagram} />
        </div>
        <a href={model.href} className={LINK_CLASS}>
          {model.linkLabel} <span aria-hidden="true">→</span>
        </a>
      </article>
    ))}
  </div>
);
