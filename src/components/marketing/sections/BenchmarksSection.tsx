import { SECTION_H2_CLASS } from "../typography";
import { BenchInfoTooltip } from "../bench/BenchCard";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

interface BarEntry {
  label: string;
  value: string;
  highlight?: boolean;
  /** Hover note explaining the benchmark context. */
  note?: string;
}

interface BenchmarkCard {
  title: string;
  /** Headline stat. Defaults to the highlighted entry's value when omitted. */
  hero?: string;
  /** Comparative shown next to the headline (e.g. "faster"). Only set where the
	    competitor/Rivet ratio is a finite number; division-by-zero metrics
	    (0ms reads, $0 idle) and qualitative ones keep their standout value. */
  verb?: string;
  bars: BarEntry[];
  /** Optional caveat pinned to the card foot. */
  note?: string;
}

const benchmarks: BenchmarkCard[] = [
  {
    title: "Cold Start",
    hero: "~300x",
    verb: "faster",
    bars: [
      {
        label: "Rivet Actor",
        value: "~20ms",
        highlight: true,
        note: "Includes durable state init, not just a process spawn. No actor key, so no cross-region locking. Measured with Node.js and FoundationDB.",
      },
      {
        label: "Kubernetes Pod",
        value: "~6s",
        note: "Node.js 24 Alpine image (56MB compressed) on AWS EKS with a pre-provisioned m5.large node. Breakdown: ~1s image pull and extraction, ~3-4s scheduling and container runtime setup, ~1s container start.",
      },
      {
        label: "Virtual Machine",
        value: "~30s",
        note: "AWS EC2 t3.nano instance from launch to SSH-ready, using an Amazon Linux 2 AMI. t3.nano is the smallest available EC2 instance (512MB RAM).",
      },
    ],
  },
  {
    title: "Memory Per Instance",
    hero: "~80,000x",
    verb: "smaller",
    bars: [
      {
        label: "Rivet Actor",
        value: "~0.6KB",
        highlight: true,
        note: "RSS (resident set size) delta divided by actor count, measured by spawning 10,000 actors in Node.js v24 on Linux x86.",
      },
      {
        label: "Kubernetes Pod",
        value: "~50MB",
        note: "Minimum idle Node.js container on Linux x86: Node.js v24 runtime (~43MB RSS), containerd-shim (~3MB), pause container (~1MB), and kubelet per-pod tracking (~2MB).",
      },
      {
        label: "Virtual Machine",
        value: "~512MB",
        note: "AWS EC2 t3.nano, the smallest available EC2 instance with 512MB allocated memory.",
      },
    ],
  },
  {
    title: "Read Latency",
    bars: [
      {
        label: "Rivet Actor",
        value: "0ms",
        highlight: true,
        note: "State is read from co-located SQLite/KV storage on the same machine as the actor, with no network round-trip.",
      },
      {
        label: "Redis",
        value: "~1ms",
        note: "AWS ElastiCache Redis (cache.t3.micro) in the same availability zone as the application.",
      },
      {
        label: "Postgres",
        value: "~5ms",
        note: "AWS RDS PostgreSQL (db.t3.micro) in the same availability zone as the application.",
      },
    ],
  },
  {
    title: "Idle Cost",
    note: "Actors scale to zero with no idle infrastructure.",
    bars: [
      {
        label: "Rivet Actor",
        value: "$0",
        highlight: true,
        note: "Assumes Rivet Actors running on a serverless platform. Actors scale to zero with no idle infrastructure costs. Traditional container deployments may incur idle costs.",
      },
      {
        label: "Virtual Machine",
        value: "~$5/mo",
        note: "AWS EC2 t3.nano ($0.0052/hr compute + $1.60/mo for 20GB gp3 storage) running 24/7. t3.nano is the smallest available EC2 instance (512MB RAM).",
      },
      {
        label: "Kubernetes Cluster",
        value: "~$85/mo",
        note: "AWS EKS control plane ($73/mo) plus a single t3.nano worker node with 20GB gp3 storage, running 24/7. t3.nano is the smallest available EC2 instance (512MB RAM).",
      },
    ],
  },
  {
    title: "Horizontal Scale",
    bars: [
      {
        label: "Rivet Actors",
        value: "Add capacity",
        highlight: true,
        note: "Actors are independently scheduled. Available capacity depends on the deployment you choose.",
      },
      {
        label: "Kubernetes",
        value: "~5k nodes",
        note: "Kubernetes officially supports clusters of up to 5,000 nodes per the Kubernetes scalability documentation.",
      },
      { label: "Postgres", value: "1 primary" },
    ],
  },
  {
    title: "Multi-Region",
    hero: "Routed",
    bars: [
      {
        label: "Rivet Cloud",
        value: "Multi-region routing",
        highlight: true,
        note: "Rivet Cloud routes Actor requests across its managed regions. Placement and availability depend on the selected deployment.",
      },
      {
        label: "Traditional Deployment",
        value: "1 region",
      },
    ],
  },
];

export const BenchmarksSection = () => {
  return (
    <section className={`bg-paper ${SITE_SECTION_CLASS}`}>
      <div className={SITE_STANDARD_RAIL_CLASS}>
        <div className="mb-12 md:mb-16">
          <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
            How Actors Compare
          </h2>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-xl border-l border-t border-ink/10 sm:grid-cols-2 xl:grid-cols-3">
          {benchmarks.map((card) => {
            const accent = card.bars.find((bar) => bar.highlight);
            const stat = card.hero ?? accent?.value ?? "";

            return (
              <article
                key={card.title}
                className="relative flex min-h-[23rem] flex-col border-b border-r border-ink/10 bg-white/55 p-6 md:p-8"
              >
                <h3 className="min-h-10 text-sm font-medium text-ink-faint">
                  {card.title}
                </h3>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-[2.75rem] font-medium leading-none tracking-[-0.02em] tabular-nums text-ink md:text-5xl">
                    {stat}
                  </span>
                  {card.verb ? (
                    <span className="text-lg font-medium text-ink-faint md:text-xl">
                      {card.verb}
                    </span>
                  ) : null}
                </div>

                <div className="mb-6 mt-6 divide-y divide-ink/10 border-y border-ink/10">
                  {card.bars.map((bar) => (
                    <div
                      key={bar.label}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <span
                        className={`inline-flex min-w-0 items-baseline text-sm ${bar.highlight ? "font-medium text-ink" : "font-normal text-ink-faint"}`}
                      >
                        {bar.label}
                        {bar.note ? (
                          <BenchInfoTooltip>{bar.note}</BenchInfoTooltip>
                        ) : null}
                      </span>
                      <span
                        className={`whitespace-nowrap font-mono text-[15px] tabular-nums ${bar.highlight ? "font-medium text-pine" : "font-normal text-ink-faint"}`}
                      >
                        {bar.value}
                      </span>
                    </div>
                  ))}
                </div>

                {card.note ? (
                  <p className="mt-auto text-xs leading-relaxed text-ink-faint">
                    {card.note}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
