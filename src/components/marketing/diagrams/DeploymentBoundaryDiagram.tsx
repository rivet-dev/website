import { wordmarkMaskStyle } from "@/lib/product-accent";
import rivetLogo from "../images/platforms/rivet-white.svg";

/**
 * What sits inside the customer's boundary: a worker running their code, the
 * control plane scheduling it, and the storage underneath.
 *
 * Three layers and nothing else. It used to enumerate the product family in the
 * top layer and the three storage engines in the bottom one, which made the
 * dashed boundary — the actual point — the least prominent thing in the frame.
 */
const StackLayer = ({
  title,
  detail,
  highlight = false,
  icon,
}: {
  title: string;
  detail?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) => (
  <div
    className={`rounded-lg border px-4 py-4 ${
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
  </div>
);

const StackConnector = () => (
  <span
    aria-hidden="true"
    className="mx-auto w-px flex-1 bg-pine/40 min-h-[1.5rem]"
  />
);

const DEPLOYMENT_BOUNDARY_DESCRIPTION =
  "In your VPC, on-prem, air-gapped, or embedded: a worker running your code, the Rivet control plane scheduling it, and durable storage underneath.";

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
    className={`flex flex-col rounded-xl border border-dashed border-pine/45 bg-pine/[0.035] p-4 md:p-5 ${className ?? ""}`}
  >
    <p className="text-sm font-medium leading-relaxed text-pine">
      In your VPC, on-prem, air-gapped, or embedded.
    </p>

    <div className="mt-6 flex flex-1 flex-col justify-center">
      <StackLayer title="Worker" detail="Your code, using the Rivet SDK" />

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
              className="block size-[75%] bg-white"
              style={wordmarkMaskStyle(rivetLogo.src)}
            />
          </span>
        }
      />

      <StackConnector />

      <StackLayer
        title="Durable storage"
        detail="Postgres or FoundationDB, tiered to S3"
      />
    </div>
  </div>
);
