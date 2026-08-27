import { Icon } from "@rivet-gg/icons";
import type { CSSProperties } from "react";
import { visibleProducts, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { BODY_CLASS, CARD_TITLE_BASE_CLASS, SectionHeading } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { canonicalizeInternalHref } from "@/lib/internalHref";

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

const workflowSteps = [
  { x: 164, y: 84, width: 108, height: 16 },
  { x: 44, y: 132, width: 132, height: 16 },
  { x: 144, y: 180, width: 128, height: 16 },
  { x: 60, y: 228, width: 132, height: 16 },
] as const;
const workflowRails = workflowSteps.map((step) => step.y + step.height / 2);

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

const easeInOutSine = (progress: number) => (1 - Math.cos(Math.PI * progress)) / 2;

const agentOSRings = Array.from({ length: 9 }, (_, index) => ({
  scale: 0.06 + easeInOutSine(index / 9) * 1.1,
  delay: index * -800,
  tone: index % 3 === 0 ? "bright" : "soft",
}));

const actorLogoMarks = [
  {
    left: -19, top: -13.5, tilt: -5, rock: 3.5,
    swayX: 6, bob: 4, duration: 7.6, delay: -1.4, opacity: 0.18,
  },
  {
    left: 29, top: -11.5, tilt: 3, rock: 4,
    swayX: -5, bob: 3, duration: 8.4, delay: -3.2, opacity: 0.24,
  },
  {
    left: 75, top: -13, tilt: -2, rock: 3,
    swayX: -6, bob: 5, duration: 6.9, delay: -4.8, opacity: 0.18,
  },
  {
    left: 4, top: 13.5, tilt: 5, rock: 3.5,
    swayX: 7, bob: 3, duration: 8.8, delay: -2.5, opacity: 0.2,
  },
  {
    left: 52, top: 11.5, tilt: -4, rock: 4.5,
    swayX: -7, bob: 4, duration: 7.2, delay: -5.3, opacity: 0.26,
  },
  {
    left: -17, top: 36.5, tilt: 4, rock: 3,
    swayX: 5, bob: 5, duration: 8.1, delay: -3.7, opacity: 0.17,
  },
  {
    left: 30, top: 38.5, tilt: -5, rock: 3.5,
    swayX: -6, bob: 3, duration: 6.6, delay: -1.9, opacity: 0.22,
  },
  {
    left: 76, top: 36.5, tilt: 3, rock: 4,
    swayX: -5, bob: 4, duration: 8.6, delay: -6.1, opacity: 0.18,
  },
  {
    left: 6, top: 63.5, tilt: -3, rock: 4.5,
    swayX: 7, bob: 5, duration: 7.4, delay: -4.4, opacity: 0.2,
  },
  {
    left: 50, top: 61, tilt: 5, rock: 3,
    swayX: -6, bob: 3, duration: 8.3, delay: -2.8, opacity: 0.24,
  },
] as const;

// A quiet workflow field for the Workflows card. The rails stay visible at
// rest; hover and keyboard focus trace each task from input to output.
const WorkflowBackdrop = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)]"
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
    className="pointer-events-none absolute inset-0 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)]"
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

// Rings share one lower-right origin. Their resting scales follow the same
// sine-eased phases as their negative delays, so hover begins without a jump.
const AgentOSBackdrop = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)]"
  >
    <svg
      className="h-full w-full"
      viewBox="0 0 320 400"
      preserveAspectRatio="none"
    >
      {agentOSRings.map((ring, index) => (
        <circle
          key={index}
          className={`agentos-ring agentos-ring--${ring.tone}`}
          style={{
            "--agentos-ring-scale": ring.scale,
            "--agentos-ring-delay": `${ring.delay}ms`,
          } as CSSProperties}
          cx="168"
          cy="144"
          r="229.1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  </div>
);

// Reuse the real Actors mark so its outline stays exact. A plate-colored
// center cover removes the inner glyphs, while two identical fields make the
// upward hover loop seamless as one replaces the other.
const ActorsBackdrop = () => (
  <div
    aria-hidden="true"
    className="actors-backdrop pointer-events-none absolute inset-0 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_58%,transparent_86%)] [mask-image:linear-gradient(to_bottom,black_58%,transparent_86%)]"
  >
    <div className="actors-logo-track">
      {[0, 1].map((cycle) => (
        <div
          key={cycle}
          className="actors-logo-field"
          style={{ "--actors-logo-field-top": `${cycle * 50}%` } as CSSProperties}
        >
          {actorLogoMarks.map((mark, index) => (
            <span
              key={index}
              className="actors-floating-logo"
              style={{
                "--actors-logo-left": `${mark.left}%`,
                "--actors-logo-top": `${mark.top}%`,
                "--actors-logo-tilt": `${mark.tilt}deg`,
                "--actors-logo-opacity": mark.opacity,
                "--actors-logo-tilt-left": `${mark.tilt - mark.rock}deg`,
                "--actors-logo-tilt-right": `${mark.tilt + mark.rock}deg`,
                "--actors-logo-float-x": `${mark.swayX}px`,
                "--actors-logo-contact-x": `${mark.swayX + (mark.swayX > 0 ? -2 : 2)}px`,
                "--actors-logo-float-back-x": `${mark.swayX * -0.55}px`,
                "--actors-logo-float-y": `${mark.bob * -1}px`,
                "--actors-logo-contact-y": `${mark.bob * -1 + 2}px`,
                "--actors-logo-float-duration": `${mark.duration}s`,
                "--actors-logo-float-delay": `${mark.delay}s`,
              } as CSSProperties}
            >
              <img
                alt=""
                className="actors-logo actors-logo--outline"
                src={productLogos.actors.src}
              />
              <span className="actors-logo-center-cover" />
            </span>
          ))}
        </div>
      ))}
    </div>
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
            href={canonicalizeInternalHref(product.href)}
            data-site-reveal-child=""
            className={`group flex min-w-0 flex-col ${product.id === "workflows" ? "workflow-card focus-visible:outline-none" : product.id === "dynamic-apps" ? "dynamic-apps-card focus-visible:outline-none" : product.id === "agentos" ? "agentos-card focus-visible:outline-none" : product.id === "actors" ? "actors-card" : ""}`}
          >
            {/* Accent plate: verb, mark, name, and the premise live on the
                product color. Each product uses its own quiet background
                field without competing with the foreground content. */}
            <div
              className={`relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl p-6 ${accent?.fill ?? "bg-ink"} ${product.id === "workflows" || product.id === "dynamic-apps" || product.id === "agentos" ? "transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-cream/80 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-paper motion-reduce:transition-none" : ""}`}
            >
              {product.id === "workflows" ? (
                <WorkflowBackdrop />
              ) : product.id === "dynamic-apps" ? (
                <DynamicAppsBackdrop />
              ) : product.id === "agentos" ? (
                <AgentOSBackdrop />
              ) : product.id === "actors" ? (
                <ActorsBackdrop />
              ) : (
                null
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

            <span className="mt-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pine">
                Explore {product.name}
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
              </span>
              {product.badge && (
                <span className="whitespace-nowrap rounded-sm border border-ink/10 bg-white/55 px-2 py-1 text-xs font-medium leading-none text-ink-soft">
                  {product.badge}
                </span>
              )}
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
