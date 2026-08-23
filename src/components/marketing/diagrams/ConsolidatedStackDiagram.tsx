import {
  ArrowDown,
  ArrowRight,
  Brain,
  Bug,
  Clock3,
  GitBranch,
  Laptop,
  MessagesSquare,
  Network,
  Radio,
  Shield,
} from "lucide-react";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { productLogos } from "@/sitemap/productLogos";
import foundationDbLogo from "../images/platforms/foundationdb.svg";
import postgresLogo from "../images/platforms/postgres.svg";
import rivetLogo from "../images/platforms/rivet-white.svg";

const agentNeeds = [
  { label: "Durable processes", icon: Clock3 },
  { label: "Computers & files", icon: Laptop },
  { label: "Workflows", icon: GitBranch },
  { label: "Queues & realtime", icon: Radio },
  { label: "State & memory", icon: Brain },
  { label: "Debugging & observability", icon: Bug },
  { label: "Orchestration", icon: Network },
  { label: "Isolation", icon: Shield },
  { label: "Agent-to-agent communication", icon: MessagesSquare },
];

const productMarks = [
  {
    id: "actors",
    label: "Actors",
    logo: productLogos.actors,
  },
  {
    id: "agentos",
    label: "agentOS",
    logo: productLogos.agentos,
  },
  {
    id: "workflows",
    label: "Workflows",
    logo: productLogos.workflows,
  },
  {
    id: "dynamic-apps",
    label: "Dynamic Apps",
    logo: productLogos["dynamic-apps"],
  },
];

const storageMarks = [
  { label: "Postgres", src: postgresLogo.src },
  { label: "SQLite", src: "/images/registry/sqlite3.svg" },
  { label: "S3", src: "/images/registry/s3.svg" },
  {
    label: "FoundationDB",
    src: foundationDbLogo.src,
    iconClassName: "w-7",
  },
];

const StackLayer = ({
  title,
  detail,
  highlight = false,
  icon,
  children,
}: {
  title: string;
  detail?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div
    className={`rounded-lg border px-4 py-3.5 ${
      highlight ? "border-pine/35 bg-pine/[0.08]" : "border-ink/10 bg-white/70"
    }`}
  >
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm font-medium text-ink">{title}</p>
    </div>
    {detail ? (
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{detail}</p>
    ) : null}
    {children}
  </div>
);

const StackConnector = () => (
  <span aria-hidden="true" className="mx-auto h-5 w-px bg-pine/40" />
);

const DEPLOYMENT_BOUNDARY_DESCRIPTION =
  "In your VPC, on-prem, air-gapped, or embedded, Rivet products including Actors, agentOS, Workflows, and Dynamic Apps run in your existing backend; the Rivet control plane handles scheduling, routing, and observability; and your data stays in Postgres, SQLite, S3, or FoundationDB.";

export const DeploymentBoundaryDiagram = ({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) => (
  <div
    role={decorative ? undefined : "img"}
    aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : DEPLOYMENT_BOUNDARY_DESCRIPTION}
    className={`rounded-xl border border-dashed border-pine/45 bg-pine/[0.035] p-4 md:p-5 ${className ?? ""}`}
  >
    <p className="text-sm font-medium leading-relaxed text-pine">
      In your VPC, on-prem, air-gapped, or embedded.
    </p>

    <div className="mt-5 flex flex-col">
      <StackLayer title="Runs in your existing backend">
        <div className="mt-3 flex flex-wrap gap-2">
          {productMarks.map((product) => (
            <span
              key={product.label}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/75 px-2 py-1.5 text-xs font-medium text-ink-soft"
            >
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-[34.375%] ${productAccent(product.id)?.fill ?? "bg-ink"}`}
              >
                <span
                  className="block size-full bg-cream"
                  style={wordmarkMaskStyle(product.logo.src)}
                />
              </span>
              {product.label}
            </span>
          ))}
        </div>
      </StackLayer>

      <StackConnector />

      <StackLayer
        title="Rivet control plane"
        detail="Scheduling · routing · observability"
        highlight
        icon={
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-[34.375%] bg-pine"
          >
            <span
              className="block size-[75%] bg-cream"
              style={wordmarkMaskStyle(rivetLogo.src)}
            />
          </span>
        }
      />

      <StackConnector />

      <StackLayer title="Your data">
        <div className="mt-3 flex flex-wrap gap-2">
          {storageMarks.map((storage) => (
            <span
              key={storage.label}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white/75 px-2 py-1.5 text-xs font-medium text-ink-soft"
            >
              <img
                src={storage.src}
                alt=""
                className={`h-4 shrink-0 object-contain ${storage.iconClassName ?? "w-4"}`}
              />
              {storage.label}
            </span>
          ))}
        </div>
      </StackLayer>
    </div>
  </div>
);

/**
 * A static architecture plate for the landing page. The left side names the
 * capabilities agents need; the right side places them in the backend,
 * control-plane, and storage layers that can live inside one customer-owned
 * boundary.
 */
export const ConsolidatedStackDiagram = () => (
  <figure
    role="img"
    aria-label={`Agents need durable processes, computers and files, workflows, queues and realtime, state and memory, debugging and observability, orchestration, isolation, and agent-to-agent communication. ${DEPLOYMENT_BOUNDARY_DESCRIPTION}`}
    className="grid items-stretch gap-6 rounded-xl border border-ink/10 bg-white/55 p-6 md:p-8 lg:grid-cols-[minmax(0,0.95fr)_auto_minmax(0,1.05fr)] lg:gap-8"
  >
    <div aria-hidden="true" className="flex flex-col justify-center">
      <div>
        <p className="text-sm font-medium text-ink">What agents need</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {agentNeeds.map(({ label, icon: NeedIcon }) => (
          <div
            key={label}
            className="flex min-h-14 items-center gap-2.5 rounded-lg border border-ink/10 bg-paper px-3 py-2.5 text-sm font-medium leading-snug text-ink-soft"
          >
            <NeedIcon
              className="h-4 w-4 shrink-0 text-pine"
              strokeWidth={1.75}
            />
            {label}
          </div>
        ))}
      </div>
    </div>

    <div
      aria-hidden="true"
      className="flex items-center justify-center text-pine"
    >
      <div className="flex flex-col items-center lg:hidden">
        <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="hidden items-center lg:flex">
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </div>
    </div>

    <DeploymentBoundaryDiagram decorative />
  </figure>
);
