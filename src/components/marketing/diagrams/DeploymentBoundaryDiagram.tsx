import { ProductBadge } from "@/components/ProductBar";
import { wordmarkMaskStyle } from "@/lib/product-accent";
import { visibleProducts } from "@/sitemap/products";
import foundationDbLogo from "../images/platforms/foundationdb.svg";
import postgresLogo from "../images/platforms/postgres.svg";
import rivetLogo from "../images/platforms/rivet-white.svg";

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
  <span
    aria-hidden="true"
    className="mx-auto w-px flex-1 bg-pine/40 min-h-[1.25rem]"
  />
);

const StorageBadge = ({
  label,
  imageSrc,
  imageClassName = "h-4 w-4",
}: {
  label: string;
  imageSrc: string;
  imageClassName?: string;
}) => (
  <div className="flex min-w-0 items-center gap-2 rounded-md border border-ink/10 bg-white/75 px-2.5 py-2.5">
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${imageClassName}`}
    />
    <p className="min-w-0 text-xs font-medium leading-snug text-ink">{label}</p>
  </div>
);

const DEPLOYMENT_BOUNDARY_DESCRIPTION =
  "In your VPC, on-prem, air-gapped, or embedded, Rivet products run in your existing backend; the Rivet control plane handles scheduling, routing, and observability; storage uses Postgres or FoundationDB for persistence and tiered storage to S3.";

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

    <div className="mt-5 flex flex-1 flex-col">
      <StackLayer title="Runs in your existing backend">
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleProducts.map((product) => (
            <span
              key={product.id}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/75 px-2 py-1.5 text-xs font-medium text-ink-soft"
            >
              <ProductBadge product={product} className="size-5" />
              {product.name}
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
              className="block size-[75%] bg-white"
              style={wordmarkMaskStyle(rivetLogo.src)}
            />
          </span>
        }
      />

      <StackConnector />

      <StackLayer
        title="Your storage"
        detail="Postgres or FoundationDB for persistence and tiered storage to S3."
      >
        <div className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
          <StorageBadge label="Postgres" imageSrc={postgresLogo.src} />
          <StorageBadge
            label="FoundationDB"
            imageSrc={foundationDbLogo.src}
            imageClassName="h-4 w-6"
          />
          <StorageBadge label="S3" imageSrc="/images/registry/s3.svg" />
        </div>
      </StackLayer>
    </div>
  </div>
);
