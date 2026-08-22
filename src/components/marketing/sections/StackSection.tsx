import { Icon } from "@rivet-gg/icons";
import type { CSSProperties } from "react";
import { visibleProducts, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { BODY_CLASS, CARD_TITLE_BASE_CLASS, SectionHeading } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

// The verb-led catalog of the product family: Orchestrate / Operate / Automate /
// Deploy, foundation-first (registry order). Each card leads with its verb and
// premise — the same strings the Products menu carries — then one sentence of
// evidence. Sits directly under the hero so the map of the stack precedes the
// deep dives.
const stack = visibleProducts.map((product) => ({
  product,
  accent: productAccent(product.id),
  highlight: product.id === "actors",
}));

const workflowRails = Array.from({ length: 10 }, (_, index) => 26 + index * 26);
const workflowSteps = [
  { x: 180, y: 44, width: 108, height: 16 },
  { x: 32, y: 96, width: 132, height: 16 },
  { x: 160, y: 148, width: 128, height: 16 },
  { x: 70, y: 200, width: 132, height: 16 },
] as const;

const dynamicAppCircles = [
  { cx: 16, cy: 36, direction: "forward", tone: "bright", delay: 0 },
  { cx: 96, cy: 108, direction: "backward", tone: "soft", delay: 0 },
  { cx: 176, cy: 36, direction: "forward", tone: "soft", delay: 120 },
  { cx: 256, cy: 108, direction: "backward", tone: "bright", delay: 120 },
  { cx: 16, cy: 180, direction: "forward", tone: "soft", delay: 180 },
  { cx: 96, cy: 252, direction: "backward", tone: "bright", delay: 180 },
  { cx: 176, cy: 180, direction: "forward", tone: "bright", delay: 300 },
  { cx: 256, cy: 252, direction: "backward", tone: "soft", delay: 300 },
] as const;

// A quiet workflow field for the Workflows card. The rails stay visible at
// rest; hover and keyboard focus trace each task from input to output.
const WorkflowBackdrop = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)]"
  >
    <svg
      className="h-full w-full"
      viewBox="0 0 320 400"
      preserveAspectRatio="none"
    >
      <g className="workflow-rails">
        {workflowRails.map((y) => (
          <line
            key={y}
            className="workflow-rail"
            x1="-12"
            x2="332"
            y1={y}
            y2={y}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {workflowSteps.map((step, index) => {
        const centerY = step.y + step.height / 2;

        return (
          <g
            key={`${step.x}-${step.y}`}
            className={`workflow-step workflow-step-${index + 1}`}
            style={{
              "--workflow-step-delay": `${index * 130}ms`,
            } as CSSProperties}
          >
            <line
              className="workflow-trace workflow-trace-in"
              x1="-12"
              x2={step.x}
              y1={centerY}
              y2={centerY}
              pathLength="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              className="workflow-node-cutout"
              x={step.x}
              y={step.y}
              width={step.width}
              height={step.height}
              rx="5"
            />
            <rect
              className="workflow-node"
              x={step.x}
              y={step.y}
              width={step.width}
              height={step.height}
              rx="5"
              vectorEffect="non-scaling-stroke"
            />
            <line
              className="workflow-trace workflow-trace-out"
              x1={step.x + step.width}
              x2="332"
              y1={centerY}
              y2={centerY}
              pathLength="1"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
    </svg>
  </div>
);

// Four diagonal pairs exchange positions, then return to their own origin.
// The offset circles echo the Dynamic Apps reference without adding a new
// foreground element or competing with the card copy.
const DynamicAppsBackdrop = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)]"
  >
    <svg
      className="h-full w-full"
      viewBox="0 0 320 400"
      preserveAspectRatio="none"
    >
      {dynamicAppCircles.map((circle) => (
        <circle
          key={`${circle.cx}-${circle.cy}`}
          className={`dynamic-app-circle dynamic-app-circle--${circle.direction} dynamic-app-circle--${circle.tone}`}
          style={{
            "--dynamic-circle-delay": `${circle.delay}ms`,
          } as CSSProperties}
          cx={circle.cx}
          cy={circle.cy}
          r="62"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  </div>
);

// The mark at plate scale, rendered cream directly on the accent field.
const StackProductMark = ({ product }: { product: Product }) => {
  const logo = productLogos[product.id];

  if (logo) {
    return (
      <span
        aria-hidden="true"
        style={wordmarkMaskStyle(logo.src)}
        className="inline-block h-6 w-6 shrink-0 bg-cream"
      />
    );
  }

  return product.icon ? (
    <Icon
      icon={product.icon}
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-cream"
    />
  ) : null;
};

export const StackSection = () => (
  <section className={`relative bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div data-site-reveal="">
        <SectionHeading
          title="Orchestrate, operate, automate, deploy."
          className="max-w-2xl"
        />
      </div>
      <div
        data-site-reveal-group=""
        className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stack.map(({ product, accent }) => (
          <a
            key={product.id}
            href={product.href}
            data-site-reveal-child=""
            className={`group flex min-w-0 flex-col ${product.id === "workflows" ? "workflow-card focus-visible:outline-none" : product.id === "dynamic-apps" ? "dynamic-apps-card focus-visible:outline-none" : ""}`}
          >
            {/* Accent plate: verb, mark, name, and the premise live on the
                product color. Workflows and Dynamic Apps use product-specific
                fields; the other cards retain their drifting cream grid. */}
            <div
              className={`relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl p-6 ${accent?.fill ?? "bg-ink"} ${product.id === "workflows" || product.id === "dynamic-apps" ? "transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-cream/80 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-paper motion-reduce:transition-none" : ""}`}
            >
              {product.id === "workflows" ? (
                <WorkflowBackdrop />
              ) : product.id === "dynamic-apps" ? (
                <DynamicAppsBackdrop />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_25%,transparent_90%)]"
                >
                  <div className={`absolute -inset-[18px] bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='18'%20height='18'%3E%3Cpath%20d='M9%205.5v7M5.5%209h7'%20stroke='rgba(244,241,231,0.42)'%20stroke-width='1'/%3E%3C/svg%3E")] bg-[size:18px_18px] will-change-transform [animation:dot-drift_7s_linear_infinite_paused] group-hover:[animation-play-state:running] motion-reduce:[animation:none]`} />
                </div>
              )}
              <span className="relative self-start rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-sm font-medium text-cream/90 backdrop-blur-md backdrop-saturate-[1.3] transition-colors duration-300 [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:border-cream/35 group-hover:bg-cream/25 group-hover:text-cream">
                {product.verb}
              </span>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <StackProductMark product={product} />
                  <div className={`${CARD_TITLE_BASE_CLASS} text-cream`}>{product.name}</div>
                </div>
                {product.premise && (
                  <p className={`mt-3 text-balance font-medium !text-cream/90 ${BODY_CLASS}`}>
                    {product.premise}
                  </p>
                )}
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
              Explore {product.name}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
