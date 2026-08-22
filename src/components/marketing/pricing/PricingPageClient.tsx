"use client";

import { useId, useState } from 'react';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Cpu,
  MemoryStick,
  Clock
} from 'lucide-react';
import {
  Icon,
  faCloudArrowUp,
  faServer,
  faShareNodes
} from '@rivet-gg/icons';
import imgYC from '@/images/logos/yc.svg';
import imgA16z from '@/images/logos/a16z.svg';
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
import { DeploymentDiagram } from '@/components/marketing/diagrams/deploymentDiagrams';

// --- Page Sections ---

const SelfHostingComparison = () => {
  const deploymentModels = [
    {
      title: 'Fully managed',
      description: 'Rivet Cloud runs your workers, the control plane, and storage. Nothing to operate.',
      hint: 'Best for most teams shipping to production.',
      icon: faCloudArrowUp,
      diagram: 'managed' as const,
      cta: 'Get Started',
      href: 'https://dashboard.rivet.dev',
      primary: true,
    },
    {
      title: 'Bring your own compute',
      description: 'Your workers run on your own infrastructure and connect outbound to the control plane in Rivet Cloud.',
      hint: 'Best for serverless platforms and keeping compute in your VPC.',
      icon: faShareNodes,
      diagram: 'byoc' as const,
      cta: 'Connect Your Host',
      href: '/actors/self-host/',
      primary: false,
    },
    {
      title: 'Fully self-hosted',
      description: 'You run the entire stack on infrastructure you control, including air-gapped networks.',
      hint: 'Best for strict compliance and air-gapped environments.',
      icon: faServer,
      diagram: 'self-hosted' as const,
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
            Every model runs the same three pieces — a worker running your code, the control plane,
            and storage. Choose who runs each piece.
          </p>
        </div>

        {/* Fused hairline grid (workflows composition pattern): three cells
            reading as one comparison object. Every column draws the identical
            worker → control plane → storage stack; only the Rivet Cloud (pine)
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
              <a
                href={model.href}
                className={`mt-6 ${model.primary ? DEPLOY_WHITE_BUTTON_CLASS : DEPLOY_GHOST_BUTTON_CLASS}`}
              >
                {model.cta}
              </a>
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
                Add multi-tenancy, access controls, backups, and deployment guidance to a self-hosted deployment.
              </p>
              <a href="/enterprise" className="mt-3 inline-flex text-sm font-medium text-pine transition-colors motion-reduce:transition-none hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
                Explore Enterprise
              </a>
            </div>
          </div>
          <a href="/talk-to-an-engineer" className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}>
            Talk to an Engineer
          </a>
        </aside>
      </div>
    </section>
  )
}

const ComparisonTable = () => {
    const features = [
      { name: "Awake Actor Hours", free: "100,000 max", hobby: "400,000 included", team: "400,000 included" },
      { name: "Compute", free: "$5 max", hobby: "Usage-based", team: "Usage-based" },
      { name: "Max vCPU", free: "1", hobby: "8", team: "8" },
      { name: "Storage", free: "5GB max", hobby: "5GB included", team: "5GB included" },
      { name: "Reads / mo", free: "200 Million max", hobby: "25 Billion included", team: "25 Billion included" },
      { name: "Writes / mo", free: "5 Million max", hobby: "50 Million included", team: "50 Million included" },
      { name: "Egress", free: "100GB max", hobby: "1TB included", team: "1TB included" },
      { name: "Support", free: "Community", hobby: "Email", team: "Slack & Email" },
      { name: "MFA", free: false, hobby: false, team: true },
    ];

    const renderCell = (value) => {
      if (typeof value === 'boolean') {
        return value ?
          <div className="flex justify-center"><Check className="h-4 w-4 text-pine" /></div> :
          <div className="flex justify-center"><div className="h-1.5 w-1.5 rounded-full bg-ink/20" /></div>;
      }
      return <span className="text-sm text-ink-soft">{value}</span>;
    };

    return (
        <div className="mt-24 pt-16" data-site-reveal>
            <h3 className={`mb-12 ${SECTION_H2_CLASS}`}>Compare Cloud Plans</h3>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                        <tr className="border-b border-ink/15">
                            <th className="w-1/4 p-4 text-left text-sm font-medium text-ink-faint">Feature</th>
                            <th className="w-[18%] p-4 text-center text-sm font-medium text-ink">Free</th>
                            <th className="w-[18%] p-4 text-center text-sm font-medium text-pine">Hobby</th>
                            <th className="w-[18%] p-4 text-center text-sm font-medium text-ink">Team</th>
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature, i) => (
                            <tr key={i} className="border-b border-ink/10">
                                <td className="p-4 text-sm text-ink-soft">{feature.name}</td>
                                <td className="p-4 text-center">{renderCell(feature.free)}</td>
                                <td className="p-4 text-center">{renderCell(feature.hobby)}</td>
                                <td className="p-4 text-center">{renderCell(feature.team)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-6 text-xs text-ink-faint">
                Free plan values are hard monthly limits. Hobby and Team include the listed amounts, then bill per usage; paid active execution has no included amount and is billed per usage.
            </p>
        </div>
    );
  };

// Rivet Cloud pricing. Cost is billed per active second based on each actor's
// configured CPU and memory:
//   cost = active_seconds × (vcpus × CPU_PER_VCPU_SECOND + memory_gib × MEMORY_PER_GIB_SECOND)
// One vCPU is half a physical core. The Free plan is limited to 1 vCPU; paid plans
// allow up to 8 vCPU.
const COMPUTE = {
    cpuPerVcpuSecond: 0.000033,
    memoryPerGibSecond: 0.0000029,
    maxVcpu: 8,
    freeMaxVcpu: 1,
};

// Valid compute shapes. vCPU is continuous from 0.08 to 1, then exactly 2, 4,
// or 8. Memory ranges from 128 MiB to 4096 MiB (4 GiB).
const VCPU_STEPS = [0.08, 0.25, 0.5, 1, 2, 4, 8];
const MEMORY_STEPS = [128, 256, 512, 1024, 2048, 4096]; // MiB

const usd = (n: number, decimals = 2) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const ComputeCalculator = () => {
    const vcpuInputId = useId();
    const memoryInputId = useId();
    const hoursInputId = useId();
    const [vcpuIdx, setVcpuIdx] = useState(3); // 1 vCPU
    const [memIdx, setMemIdx] = useState(2); // 512 MiB
    const [hours, setHours] = useState(100);

    const vcpus = VCPU_STEPS[vcpuIdx];
    const memoryMib = MEMORY_STEPS[memIdx];
    const cpuPerSec = vcpus * COMPUTE.cpuPerVcpuSecond;
    const memPerSec = (memoryMib / 1024) * COMPUTE.memoryPerGibSecond;
    const perSecond = cpuPerSec + memPerSec;
    const monthly = perSecond * hours * 3600;

    const memLabel = memoryMib >= 1024 ? `${memoryMib / 1024} GiB` : `${memoryMib} MiB`;

    return (
        <div className="pt-16" data-site-reveal>
            <h3 className={`mb-3 ${SECTION_H2_CLASS}`}>Estimate managed execution cost</h3>
            <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
                Run your actors and applications on Rivet Cloud and pay only for the seconds they are active.
                Costs scale with the CPU and memory you configure.
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Controls sit on porcelain: this is interactive input UI. */}
                <div className={`space-y-8 ${SITE_CARD_CLASS}`}>
                    {/* vCPU */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <label htmlFor={vcpuInputId} className="flex items-center gap-2 text-sm text-ink-soft">
                                <Cpu aria-hidden="true" className="h-4 w-4 text-ink-faint" /> vCPU
                            </label>
                            <output htmlFor={vcpuInputId} className="font-mono text-sm text-ink">{vcpus}</output>
                        </div>
                        <input
                            id={vcpuInputId}
                            type="range"
                            min={0}
                            max={VCPU_STEPS.length - 1}
                            step={1}
                            value={vcpuIdx}
                            aria-valuetext={`${vcpus} vCPU`}
                            aria-describedby={`${vcpuInputId}-description`}
                            onChange={(e) => setVcpuIdx(Number(e.target.value))}
                            className="w-full accent-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                        />
                        <p id={`${vcpuInputId}-description`} className="mt-2 text-xs text-ink-faint">
                            1 vCPU = half a physical core. 0.08–1 vCPU, or exactly 2, 4, or 8.
                        </p>
                    </div>

                    {/* Memory */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <label htmlFor={memoryInputId} className="flex items-center gap-2 text-sm text-ink-soft">
                                <MemoryStick aria-hidden="true" className="h-4 w-4 text-ink-faint" /> Memory
                            </label>
                            <output htmlFor={memoryInputId} className="font-mono text-sm text-ink">{memLabel}</output>
                        </div>
                        <input
                            id={memoryInputId}
                            type="range"
                            min={0}
                            max={MEMORY_STEPS.length - 1}
                            step={1}
                            value={memIdx}
                            aria-valuetext={memLabel}
                            aria-describedby={`${memoryInputId}-description`}
                            onChange={(e) => setMemIdx(Number(e.target.value))}
                            className="w-full accent-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                        />
                        <p id={`${memoryInputId}-description`} className="mt-2 text-xs text-ink-faint">
                            128 MiB to 4 GiB.
                        </p>
                    </div>

                    {/* Active time */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <label htmlFor={hoursInputId} className="flex items-center gap-2 text-sm text-ink-soft">
                                <Clock aria-hidden="true" className="h-4 w-4 text-ink-faint" /> Active hours / month
                            </label>
                            <output htmlFor={hoursInputId} className="font-mono text-sm text-ink">{hours >= 730 ? "Always on" : `${hours} h`}</output>
                        </div>
                        <input
                            id={hoursInputId}
                            type="range"
                            min={1}
                            max={730}
                            step={1}
                            value={hours}
                            aria-valuetext={hours >= 730 ? 'Always on, 730 hours per month' : `${hours} hours per month`}
                            aria-describedby={`${hoursInputId}-description`}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="w-full accent-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                        />
                        <p id={`${hoursInputId}-description`} className="mt-2 text-xs text-ink-faint">
                            Sleeping Actors are not billed for active execution.
                        </p>
                    </div>
                </div>

                {/* Result is the data moment: render it on the ink plate so the
                    estimate reads as output, mirroring the Self-Hosted panel. */}
                <InkPanel className="flex flex-col p-8">
                    <span className={EYEBROW_ON_INK_CLASS}>Estimated execution cost</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-medium tracking-[-0.015em] text-cream">{usd(monthly)}</span>
                        <span className="text-xs text-cream/50">/mo</span>
                    </div>

                    <div className="mt-8 space-y-3 text-sm">
                        <div className="flex items-center justify-between border-b border-cream/10 py-2">
                            <span className="text-cream/50">CPU ({vcpus} vCPU)</span>
                            <span className="font-mono text-cream/85">{usd(cpuPerSec * hours * 3600)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-cream/10 py-2">
                            <span className="text-cream/50">Memory ({memLabel})</span>
                            <span className="font-mono text-cream/85">{usd(memPerSec * hours * 3600)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-cream/50">Rate</span>
                            <span className="font-mono text-cream/85">{usd(perSecond, 7)}/s</span>
                        </div>
                    </div>

                    <p className="mt-auto pt-8 text-xs leading-relaxed text-cream/50">
                        Estimate only. Or use a supported deployment path on AWS, Vercel,
                        Railway, or bare metal and pay that provider directly.
                    </p>
                </InkPanel>
            </div>
        </div>
    );
};

interface Plan {
    name: string;
    prefix?: string;
    price: string;
    period: string;
    desc: string;
    features: string[];
    cta: string;
    highlight: boolean;
    inkHeader?: boolean;
}

const Pricing = () => {
    const cloudPlans: Plan[] = [
        {
            name: "Free",
            price: "$0",
            period: "/mo",
            desc: "For prototyping and small projects.",
            features: [
                "100,000 Awake Actor Hours /mo limit",
                "$5 /mo Compute limit",
                "1 vCPU Max",
                "5GB Limit",
                "5 Million Writes /mo Limit",
                "200 Million Reads /mo Limit",
                "100GB Egress Limit",
                "Community Support"
            ],
            cta: "Get Started",
            highlight: false
        },
        {
            name: "Hobby",
            prefix: "From",
            price: "$20",
            period: "/mo + Usage",
            desc: "For scaling applications.",
            features: [
                "400,000 Awake Actor Hours Included",
                "Up to 8 vCPU",
                "25 Billion Reads /mo included",
                "50 Million Writes /mo included",
                "5GB Storage included",
                "1TB Egress included",
                "Email Support"
            ],
            cta: "Get Started",
            highlight: true
        },
        {
            name: "Team",
            prefix: "From",
            price: "$200",
            period: "/mo + Usage",
            desc: "For growing teams and businesses.",
            features: [
                "400,000 Awake Actor Hours Included",
                "Up to 8 vCPU",
                "25 Billion Reads /mo included",
                "50 Million Writes /mo included",
                "5GB Storage included",
                "1TB Egress included",
                "MFA",
                "Slack Support"
            ],
            cta: "Get Started",
            highlight: false
        }
    ];

    // Enterprise Edition is the self-hosted, on-prem offering. It is the only
    // enterprise tier, so it is shown on both toggle states: alongside the
    // self-hosted plans, and appended to the cloud plans so it stays visible by
    // default (it keeps its "Self-Hosted" header tag in either view).
    const enterpriseEditionPlan: Plan = {
        name: "Enterprise Edition",
        price: "Custom",
        period: "",
        desc: "Additional operational features for running Rivet in your own VPC, customer environments, or regulated networks.",
        features: [
            "Actor control plane",
            "FoundationDB persistence layer",
            "Cloud layer for multi-tenant",
            "SQLite backup",
            "SQLite PITR",
            "Forking",
            "ACL system",
            "ACL for agents",
            "Advanced ClickHouse analytics",
            "OpenTelemetry integration",
            "Alert manager rules, Prometheus rules, Grafana configs",
            "Kubernetes manifests",
            "Air-gapped & sovereign-cloud deployments",
            "Priority support & SLA",
            "Hardening guidance for FedRAMP, HIPAA, regulated industries"
        ],
        cta: "Contact Sales",
        highlight: false,
        inkHeader: true
    };

    const plans = [...cloudPlans, enterpriseEditionPlan];

    const usagePricing: { resource: string; price: string; unit: string; prefix?: string }[] = [
        { resource: "Awake Actors", price: "$0.05", unit: "per 1k Awake Actor Hours" },
        { resource: "State Storage", price: "$0.40", unit: "per GB-month" },
        { resource: "Reads*", price: "$0.20", unit: "per million reads" },
        { resource: "Writes*", price: "$1", unit: "per million writes" },
        { resource: "Egress", price: "$0.15", unit: "per GB" },
        { resource: "Compute", prefix: "From", price: "$0.0000330", unit: "per vCPU-second + $0.0000029/GiB-s" },
    ];

    return (
        <section id="pricing" className={SITE_SECTION_CLASS}>
            <div className={SITE_STANDARD_RAIL_CLASS}>
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-12">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-site-reveal-group>
                                {plans.map((plan, idx) => (
                                    <div
                                       key={idx}
                                       data-site-reveal-child
                                       className={`flex flex-col overflow-hidden rounded-xl border bg-white/55 ${
                                           plan.highlight ? 'border-pine/60' : 'border-ink/10'
                                       }`}
                                    >
                                        {plan.inkHeader ? (
                                            <div className="selection-paper flex items-center justify-between gap-4 bg-ink px-7 py-3">
                                                <span className="text-sm font-medium text-cream">{plan.name}</span>
                                                <span className={EYEBROW_ON_INK_CLASS}>On-Prem</span>
                                            </div>
                                        ) : null}
                                        <div className="flex flex-grow flex-col p-6 md:p-8">
                                            {!plan.inkHeader ? (
                                                <h3 className={`mb-2 ${CARD_TITLE_CLASS}`}>{plan.name}</h3>
                                            ) : null}

                                            <div className="mb-6">
                                                {plan.prefix && <span className="mb-1 block text-sm font-medium text-ink-faint">{plan.prefix}</span>}
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-medium tracking-[-0.015em] text-ink">{plan.price}</span>
                                                    {plan.period && <span className="ml-1 text-xs text-ink-faint">{plan.period}</span>}
                                                </div>
                                            </div>

                                            <div className="mb-6 h-px bg-ink/10" />

                                            {plan.desc && <p className="mb-6 min-h-[2.5rem] text-[15px] leading-relaxed text-ink-soft">{plan.desc}</p>}

                                            <div className="mb-8 space-y-3">
                                                {plan.features.map((feat, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-xs text-ink-soft">
                                                        <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-pine" />
                                                        <span>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <a href={plan.cta === "Contact Sales" ? "/talk-to-an-engineer" : "https://dashboard.rivet.dev"}
                                                className={`mt-auto ${
                                                    plan.highlight
                                                    ? PRODUCT_HERO_PRIMARY_BUTTON_CLASS
                                                    : PRODUCT_HERO_SECONDARY_BUTTON_CLASS
                                                }`}
                                            >
                                                {plan.cta}
                                            </a>
                                        </div>
                                    </div>
                                ))}
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
                                                    <img src={imgA16z.src} alt="a16z" className="h-3 w-auto invert" />
                                                    <span>a16z Speedrun</span>
                                                </div>
                                                <span>companies</span>
                                            </div>
                                        </div>
                                        <a
                                            href="/startups"
                                            className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
                                        >
                                            Claim the deal
                                            <ArrowRight className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>

                            {/* Usage pricing, compute calculator, and plan comparison */}
                                <>
                                    {/* Usage Pricing Section */}
                                    <div className="pt-16" data-site-reveal>
                                        <h3 className={`mb-3 ${SECTION_H2_CLASS}`}>Usage Pricing</h3>
                                        <p className="mb-8 text-[15px] leading-relaxed text-ink-soft">Metered costs for scaling beyond plan limits.</p>

                                        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                                            {usagePricing.map((item, i) => (
                                                <div key={i} className="border-t border-ink/10 pt-6">
                                                    <div className="mb-2 text-sm font-medium text-ink-faint">{item.resource}</div>
                                                    {item.prefix && <span className="mb-1 block text-sm font-medium text-ink-faint">{item.prefix}</span>}
                                                    <div className="mb-1 font-mono text-2xl text-ink">{item.price}</div>
                                                    <div className="text-xs text-ink-faint">{item.unit}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-6 text-xs text-ink-faint">* Reads and writes to persisted actor state, not in-memory operations within an actor</p>
                                        <p className="mt-2 text-xs text-ink-faint">Active execution on Rivet Cloud is billed per second. Supported deployment paths are also available for AWS, Vercel, Railway, and bare metal.</p>
                                    </div>

                                    <ComputeCalculator />

                                    <ComparisonTable />
                                </>
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
