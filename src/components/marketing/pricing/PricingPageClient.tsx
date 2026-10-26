"use client";

import { useId, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  Icon,
  faCheck,
  faCloudArrowUp,
  faCloudCheck,
  faGoogleCloud,
  faLock,
  faMinus,
  faPlus,
  faServer
} from '@rivet-gg/icons';
import imgYC from '@/images/logos/yc.svg';
import imgA16z from '@/images/logos/a16z.svg';
import { canonicalizeInternalHref } from '@/lib/internalHref';
import {
  CARD_TITLE_CLASS,
  EYEBROW_ON_INK_CLASS,
  PRODUCT_HERO_PRIMARY_BUTTON_CLASS,
  PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
  SECTION_H2_CLASS,
  SECTION_LEDE_CLASS
} from '@/components/marketing/typography';
import {
  SITE_CARD_CLASS,
  SITE_SECTION_CLASS,
  SITE_STANDARD_RAIL_CLASS,
  SITE_WIDE_CALLOUT_CLASS,
} from '@/components/marketing/layout';
import {
  DEPLOY_CARD_TITLE_CLASS,
  DEPLOY_GHOST_BUTTON_CLASS,
  DEPLOY_WHITE_BUTTON_CLASS,
} from '@/components/marketing/deployKit';
import { InkPanel } from '@/components/marketing/editorial/InkPanel';
import { SectionRule } from '@/components/marketing/SectionRule';
import { DeploymentDiagram, type DeploymentDiagramVariant } from '@/components/marketing/diagrams/deploymentDiagrams';
import { PlanBadge, type PlanKey } from '@/components/marketing/pricing/PlanBadge';

// --- Page Sections ---

const SelfHostingComparison = () => {
  const deploymentModels: Array<{
    title: string;
    description: string;
    hint: string;
    icon: typeof faCloudArrowUp;
    diagram: DeploymentDiagramVariant;
    cta: string;
    href: string;
    primary: boolean;
    secondaryLink?: { label: string; href: string };
  }> = [
    {
      title: 'Rivet Cloud',
      description: 'Rivet Cloud runs the control plane and storage. Run your backend on Rivet Cloud too, or bring your own compute from Vercel, Railway, Cloudflare, AWS, or Kubernetes.',
      hint: 'Best for most teams shipping to production.',
      icon: faCloudArrowUp,
      diagram: 'managed',
      cta: 'Get Started',
      href: 'https://dashboard.rivet.dev',
      primary: true,
      secondaryLink: { label: 'Connect your own nodes', href: '/docs/deploy/self-host/nodes/' },
    },
    {
      title: 'Bring your own cloud',
      description: 'The whole stack runs inside your VPC, and Rivet manages it for you over an outbound connection.',
      hint: 'Best for data residency without anything to operate.',
      icon: faCloudCheck,
      diagram: 'byoc',
      cta: 'Read the BYOC Docs',
      href: '/docs/deploy/byoc/',
      primary: false,
    },
    {
      title: 'Fully self-hosted',
      description: 'You run the entire stack on infrastructure you control, including air-gapped networks.',
      hint: 'Best for strict compliance and air-gapped environments.',
      icon: faServer,
      diagram: 'self-hosted',
      cta: 'View on GitHub',
      href: 'https://github.com/rivet-dev/rivet',
      primary: false,
    },
  ];

  return (
    <section className={SITE_SECTION_CLASS}>
      <div className={SITE_STANDARD_RAIL_CLASS}>
        <div className="max-w-3xl" data-site-reveal>
          <h2 className={SECTION_H2_CLASS}>Compare Deployment Models</h2>
          <p className={SECTION_LEDE_CLASS}>
            Every model runs the same three pieces — your backend, the control plane,
            and storage. Choose who runs each piece.
          </p>
        </div>

        {/* Fused hairline grid (workflows composition pattern): three cells
            reading as one comparison object. Every column draws the identical
            backend → control plane → storage stack; only the Rivet Cloud (pine)
            vs your-infrastructure (ink) boundary moves, so the pine region
            visibly shrinks left to right. Subgrid keeps the five rows level
            across columns; browsers without subgrid fall back to auto rows. */}
        <div className="mt-12 grid gap-6 md:grid-cols-3" data-site-reveal-group>
          {deploymentModels.map((model) => (
            <article
              key={model.title}
              data-site-reveal-child
              className={`${SITE_CARD_CLASS} flex flex-col md:grid md:row-span-5 md:grid-rows-subgrid`}
            >
              <div className="flex h-6 items-center gap-2.5">
                <Icon icon={model.icon} aria-hidden="true" className="h-4 w-4 text-pine" />
                <h3 className={DEPLOY_CARD_TITLE_CLASS}>{model.title}</h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{model.description}</p>

              <div className="mt-6 flex-1">
                <DeploymentDiagram variant={model.diagram} />
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink-faint">{model.hint}</p>
              <div className="mt-6 flex flex-col gap-4">
                <a
                  href={canonicalizeInternalHref(model.href)}
                  className={model.primary ? DEPLOY_WHITE_BUTTON_CLASS : DEPLOY_GHOST_BUTTON_CLASS}
                >
                  {model.cta}
                </a>
                {model.secondaryLink ? (
                  <a
                    href={canonicalizeInternalHref(model.secondaryLink.href)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-pine no-underline hover:underline"
                  >
                    {model.secondaryLink.label}
                    <span aria-hidden="true">→</span>
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <aside className={`mt-6 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto] ${SITE_WIDE_CALLOUT_CLASS}`} data-site-reveal>
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-paper text-pine">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className={CARD_TITLE_CLASS}>Enterprise Edition</h3>
              <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink-soft">
                Add multi-tenancy, access controls, backups, and deployment guidance to a BYOC or self-hosted deployment.
              </p>
              <a href="/enterprise/" className="mt-3 inline-flex text-sm font-medium text-pine transition-colors motion-reduce:transition-none hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
                Explore Enterprise
              </a>
            </div>
          </div>
          <a href="/talk-to-an-engineer/" className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}>
            Talk to an Engineer
          </a>
        </aside>
      </div>
    </section>
  )
}

// Rivet Cloud pricing. Mirrors the dashboard's "Create a cluster" page: a plan
// prices the control plane and caps how many Actor Nodes the cluster can run;
// each Actor Node is priced by its size. Keep these numbers in sync with the
// dashboard.

interface Plan {
    key: PlanKey;
    name: string;
    controlPlaneUsd: number;
    description: string;
    maxActorNodes: number;
    highlights: string[];
}

const PLANS: Plan[] = [
    {
        key: "free",
        name: "Free",
        controlPlaneUsd: 0,
        description: "For prototyping.",
        maxActorNodes: 1,
        highlights: [
            "1 control plane node in 1 availability zone",
            "Up to 1 Actor Node",
            "Community support",
        ],
    },
    {
        key: "hobby",
        name: "Hobby",
        controlPlaneUsd: 10,
        description: "For side projects that need to stay up.",
        maxActorNodes: 3,
        highlights: [
            "1 control plane node in 1 availability zone",
            "Up to 3 Actor Nodes",
            "Email support",
        ],
    },
    {
        key: "team",
        name: "Team",
        controlPlaneUsd: 120,
        description: "For production workloads and growing teams.",
        maxActorNodes: 10,
        highlights: [
            "3 control plane nodes across 3 availability zones",
            "Up to 10 Actor Nodes",
            "Slack & email support",
        ],
    },
    {
        key: "enterprise",
        name: "Enterprise",
        controlPlaneUsd: 900,
        description: "For compliance, SSO, audit logs, and dedicated support.",
        maxActorNodes: 50,
        highlights: [
            "5 control plane nodes across 3 availability zones",
            "Up to 50 Actor Nodes",
            "Dedicated support",
        ],
    },
];

// Plans in ascending order, so a node size can name the cheapest plan that
// unlocks it.
const PLAN_RANK: Record<PlanKey, number> = { free: 0, hobby: 1, team: 2, enterprise: 3 };

const planByKey = (key: PlanKey) => PLANS.find((plan) => plan.key === key) as Plan;

interface NodeSize {
    id: string;
    vcpu: number;
    memoryGb: number;
    monthlyUsd: number;
    // The cheapest plan that can run this size.
    minPlan: PlanKey;
}

// Per-node prices are for Google Cloud, the only cloud the dashboard offers.
const NODE_SIZES: NodeSize[] = [
    { id: "R-5", vcpu: 1 / 4, memoryGb: 1, monthlyUsd: 4.2, minPlan: "free" },
    { id: "R-10", vcpu: 1 / 2, memoryGb: 2, monthlyUsd: 8.4, minPlan: "free" },
    { id: "R-20", vcpu: 1, memoryGb: 4, monthlyUsd: 16.8, minPlan: "hobby" },
    { id: "R-40", vcpu: 4, memoryGb: 8, monthlyUsd: 27.3, minPlan: "team" },
    { id: "R-160", vcpu: 8, memoryGb: 16, monthlyUsd: 94.5, minPlan: "team" },
];

const REGIONS: { id: string; name: string; flag: string }[] = [
    { id: "us-east4", name: "N. Virginia", flag: "🇺🇸" },
    { id: "us-central1", name: "Iowa", flag: "🇺🇸" },
    { id: "europe-west1", name: "Belgium", flag: "🇧🇪" },
    { id: "europe-west3", name: "Frankfurt", flag: "🇩🇪" },
    { id: "asia-southeast1", name: "Singapore", flag: "🇸🇬" },
    { id: "asia-east1", name: "Taiwan", flag: "🇹🇼" },
];

// Whole dollars print without cents ($120); anything else prints two ($4.20).
const formatUsd = (value: number) =>
    `$${value.toLocaleString("en-US", {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;

// 1/4 and 1/2 vCPU read better as fractions than as 0.25 and 0.5.
const formatVcpu = (value: number) => {
    const denominator = [1, 2, 4, 8].find((d) => Number.isInteger(value * d));
    return denominator && denominator > 1 ? `${value * denominator}/${denominator}` : `${value}`;
};

const sizeAllowedOn = (size: NodeSize, plan: Plan) => PLAN_RANK[plan.key] >= PLAN_RANK[size.minPlan];

// The Free plan includes its Actor Nodes at no charge.
const nodePriceUsd = (plan: Plan, size: NodeSize) => (plan.key === "free" ? 0 : size.monthlyUsd);

const nodesLabel = (count: number) => (count === 1 ? "1 Actor Node" : `${count} Actor Nodes`);

function quoteCluster(plan: Plan, size: NodeSize, nodeCount: number) {
    const nodesUsd = nodePriceUsd(plan, size) * nodeCount;
    return {
        nodesUsd,
        totalUsd: plan.controlPlaneUsd + nodesUsd,
    };
}

const TABLE_HEAD_CLASS = "border-b border-ink/15 text-sm font-medium text-ink-faint";
const TABLE_ROW_CLASS = "border-b border-ink/10 text-sm text-ink-soft";

const ActorNodes = () => (
    <div className="pt-16" data-site-reveal>
        <h3 className={`mb-3 ${SECTION_H2_CLASS}`}>Actor Nodes</h3>
        <p className="mb-8 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Actor Nodes connect to the control plane and run your actor logic. Scale them with the
            number of actors running. Your plan caps how many Actor Nodes a cluster can run and
            which sizes it can use, and each node is priced per month on top of the control plane.
        </p>
        <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
                <thead>
                    <tr className={TABLE_HEAD_CLASS}>
                        <th className="p-4 text-left">Size</th>
                        <th className="p-4 text-right">vCPU</th>
                        <th className="p-4 text-right">RAM</th>
                        <th className="p-4 text-left">Available on</th>
                        <th className="p-4 text-right">Per node / month</th>
                    </tr>
                </thead>
                <tbody className="tabular-nums">
                    {NODE_SIZES.map((size) => {
                        const minPlan = planByKey(size.minPlan);
                        return (
                            <tr key={size.id} className={TABLE_ROW_CLASS}>
                                <td className="p-4">
                                    <span className="rounded-md border border-ink/15 bg-white/55 px-2 py-0.5 font-mono text-xs text-ink">
                                        {size.id}
                                    </span>
                                </td>
                                <td className="p-4 text-right">{formatVcpu(size.vcpu)}</td>
                                <td className="p-4 text-right">{size.memoryGb} GB</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5">
                                        <PlanBadge plan={minPlan.key}>{minPlan.name}</PlanBadge>
                                        {minPlan.key !== "enterprise" ? (
                                            <span className="text-xs text-ink-faint">and up</span>
                                        ) : null}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-medium text-ink">{formatUsd(size.monthlyUsd)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <p className="mt-6 text-xs text-ink-faint">
            The Free plan includes its Actor Node at no charge. Need more Actor Nodes or larger
            sizes?{" "}
            <a href="/talk-to-an-engineer/" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
                Talk to us
            </a>
            .
        </p>

        <div className="mt-10 border-t border-ink/10 pt-6">
            <div className="flex items-center gap-2.5">
                <Icon icon={faGoogleCloud} aria-hidden="true" className="h-4 w-4 text-ink" />
                <span className="text-sm font-medium text-ink">Google Cloud</span>
            </div>
            <p className="mt-1 text-xs text-ink-faint">
                Clusters run on Google Cloud in the region you pick when creating the cluster.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
                {REGIONS.map((region) => (
                    <li
                        key={region.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/55 px-2.5 py-0.5 text-xs text-ink-soft"
                    >
                        <span aria-hidden="true">{region.flag}</span>
                        <span className="font-mono text-ink">{region.id}</span>
                        <span>{region.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

// Segmented control for the estimator. A plain button group keeps the
// estimate keyboard-reachable without a form submit. Disabled options stay
// visible so the locked sizes read the same way as in the dashboard.
function Segmented<T>({
    label,
    options,
    value,
    onChange,
    render,
    disabledReason,
}: {
    label: string;
    options: T[];
    value: T;
    onChange: (next: T) => void;
    render: (option: T) => string;
    disabledReason?: (option: T) => string | null;
}) {
    return (
        <div>
            <div className="mb-3 text-sm text-ink-soft">{label}</div>
            <div role="group" aria-label={label} className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const selected = option === value;
                    const reason = disabledReason?.(option) ?? null;
                    return (
                        <button
                            key={render(option)}
                            type="button"
                            aria-pressed={selected}
                            disabled={reason !== null}
                            title={reason ?? undefined}
                            onClick={() => onChange(option)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed ${
                                selected
                                    ? "border-pine bg-pine/10 text-ink"
                                    : reason
                                      ? "border-ink/10 bg-white/30 text-ink-faint"
                                      : "border-ink/10 bg-white/55 text-ink-soft hover:border-ink/30"
                            }`}
                        >
                            {reason ? <Icon icon={faLock} aria-hidden="true" className="h-3 w-3" /> : null}
                            {render(option)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const STEPPER_BUTTON_CLASS =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white/55 text-ink-soft transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const ClusterEstimator = () => {
    const [plan, setPlan] = useState<Plan>(planByKey("team"));
    const [size, setSize] = useState<NodeSize>(NODE_SIZES[0]);
    const [nodeCount, setNodeCount] = useState(1);
    const nodeCountId = useId();
    const q = quoteCluster(plan, size, nodeCount);

    // Switching to a cheaper plan can lock the chosen size or lower the node
    // cap, so clamp both to what the new plan allows.
    const choosePlan = (next: Plan) => {
        setPlan(next);
        if (!sizeAllowedOn(size, next)) setSize(NODE_SIZES[0]);
        if (nodeCount > next.maxActorNodes) setNodeCount(next.maxActorNodes);
    };

    const lines: { label: string; amount: number | string }[] = [
        { label: `${plan.name} control plane`, amount: plan.controlPlaneUsd === 0 ? "Free" : plan.controlPlaneUsd },
        {
            label: `${nodeCount} × ${size.id} ${nodeCount === 1 ? "Actor Node" : "Actor Nodes"}`,
            amount: plan.key === "free" ? "Free" : q.nodesUsd,
        },
    ];

    return (
        <div className="pt-16" data-site-reveal>
            <h3 className={`mb-3 ${SECTION_H2_CLASS}`}>Estimate your cluster cost</h3>
            <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
                Pick a plan, an Actor Node size, and how many nodes to run. This is the same quote
                you see when creating a cluster in the dashboard, and you can change all of it later
                without downtime.
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className={`space-y-8 ${SITE_CARD_CLASS}`}>
                    <Segmented<Plan>
                        label="Plan"
                        options={PLANS}
                        value={plan}
                        onChange={choosePlan}
                        render={(p) => p.name}
                    />
                    <Segmented<NodeSize>
                        label="Actor Node size"
                        options={NODE_SIZES}
                        value={size}
                        onChange={setSize}
                        render={(s) => s.id}
                        disabledReason={(s) =>
                            sizeAllowedOn(s, plan) ? null : `Requires the ${planByKey(s.minPlan).name} plan`
                        }
                    />
                    <div>
                        <label htmlFor={nodeCountId} className="mb-3 block text-sm text-ink-soft">
                            Actor Nodes
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Remove an Actor Node"
                                disabled={nodeCount <= 1}
                                onClick={() => setNodeCount((n) => Math.max(1, n - 1))}
                                className={STEPPER_BUTTON_CLASS}
                            >
                                <Icon icon={faMinus} aria-hidden="true" className="h-3.5 w-3.5" />
                            </button>
                            <output
                                id={nodeCountId}
                                aria-live="polite"
                                className="min-w-[2.5rem] text-center font-mono text-lg text-ink tabular-nums"
                            >
                                {nodeCount}
                            </output>
                            <button
                                type="button"
                                aria-label="Add an Actor Node"
                                disabled={nodeCount >= plan.maxActorNodes}
                                onClick={() => setNodeCount((n) => Math.min(plan.maxActorNodes, n + 1))}
                                className={STEPPER_BUTTON_CLASS}
                            >
                                <Icon icon={faPlus} aria-hidden="true" className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs text-ink-faint">
                                {plan.name} includes up to {plan.maxActorNodes}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-ink-faint">
                        Each {size.id} node has {formatVcpu(size.vcpu)} vCPU and {size.memoryGb} GB of RAM.
                    </p>
                </div>

                <InkPanel className="flex flex-col p-8">
                    <span className={EYEBROW_ON_INK_CLASS}>Per month</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-medium tracking-[-0.015em] text-cream">{formatUsd(q.totalUsd)}</span>
                        <span className="text-xs text-cream/50">/mo</span>
                    </div>

                    <dl className="mt-8 space-y-3 text-sm">
                        {lines.map((line, i) => (
                            <div
                                key={line.label}
                                className={`flex items-center justify-between py-2 ${i < lines.length - 1 ? "border-b border-cream/10" : ""}`}
                            >
                                <dt className="text-cream/50">{line.label}</dt>
                                <dd className="font-mono text-cream/85">
                                    {typeof line.amount === "number" ? formatUsd(line.amount) : line.amount}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-auto pt-8 text-xs leading-relaxed text-cream/50">
                        Prices are for Google Cloud. Bring your own nodes and there is nothing more to
                        pay beyond the control plane.
                    </p>
                </InkPanel>
            </div>
        </div>
    );
};

const Pricing = () => {
    return (
        <section id="pricing" className={SITE_SECTION_CLASS}>
            <div className={SITE_STANDARD_RAIL_CLASS}>
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-12">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-site-reveal-group>
                                {PLANS.map((plan) => {
                                    const highlight = plan.key === "team";
                                    return (
                                    <div
                                       key={plan.key}
                                       data-site-reveal-child
                                       className={`flex flex-col overflow-hidden rounded-xl border bg-white/55 ${
                                           highlight ? 'border-pine/60' : 'border-ink/10'
                                       }`}
                                    >
                                        <div className="flex flex-grow flex-col p-6 md:p-8">
                                            <h3 className="mb-3 flex items-center gap-4">
                                                <PlanBadge plan={plan.key} className="text-sm">{plan.name}</PlanBadge>
                                            </h3>

                                            <div className="mb-6">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-medium tracking-[-0.015em] text-ink">{formatUsd(plan.controlPlaneUsd)}</span>
                                                    <span className="ml-1 text-xs text-ink-faint">/mo for control plane</span>
                                                </div>
                                                {/* Fixed height so the highlights below stay level
                                                    across cards when a description wraps. */}
                                                <p className="mt-2 min-h-[2.5rem] text-xs leading-5 text-ink-soft">{plan.description}</p>
                                            </div>

                                            <ul className="mb-8 space-y-2.5 border-t border-ink/10 pt-5 text-xs leading-5 text-ink">
                                                {plan.highlights.map((item) => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <Icon icon={faCheck} aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-pine" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <a href="https://dashboard.rivet.dev"
                                                className={`mt-auto ${
                                                    highlight
                                                    ? PRODUCT_HERO_PRIMARY_BUTTON_CLASS
                                                    : PRODUCT_HERO_SECONDARY_BUTTON_CLASS
                                                }`}
                                            >
                                                Get Started
                                            </a>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>

                            {/* YC & a16z Speedrun Callout */}
                            <div className={SITE_WIDE_CALLOUT_CLASS} data-site-reveal>
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className={`mb-2 ${CARD_TITLE_CLASS}`}>Startup Deal: 50% off for 12 months</p>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                                                <span>For</span>
                                                <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-white/55 px-3 py-1.5 text-xs text-ink-soft">
                                                    <img src={imgYC.src} alt="Y Combinator" className="h-4 w-auto" />
                                                    <span>Y Combinator</span>
                                                </div>
                                                <span>and</span>
                                                <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-white/55 px-3 py-1.5 text-xs text-ink-soft">
                                                    <img src={imgA16z.src} alt="a16z" className="theme-light-invert h-3 w-auto" />
                                                    <span>a16z Speedrun</span>
                                                </div>
                                                <span>companies</span>
                                            </div>
                                        </div>
                                        <a
                                            href="/startups/"
                                            className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
                                        >
                                            Claim the deal
                                            <ArrowRight className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>

                            <ActorNodes />

                            <ClusterEstimator />
                    </div>
                </div>
            </div>
        </section>
    );
};


export default function PricingPageClient() {
  return (
    <>
      <Pricing />
      <SectionRule />
      <SelfHostingComparison />
    </>
  );
}
