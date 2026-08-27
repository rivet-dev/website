import type { CSSProperties } from "react";
import { productLogos } from "@/sitemap/productLogos";

export type ProductMotifId =
  "actors" | "agentos" | "workflows" | "dynamic-apps";

export interface ProductMotifProps {
  productId: ProductMotifId;
  surface: "card" | "hero";
}

const workflowSteps = [
  { x: 164, y: 84, width: 108, height: 16 },
  { x: 44, y: 132, width: 132, height: 16 },
  { x: 144, y: 180, width: 128, height: 16 },
  { x: 60, y: 228, width: 132, height: 16 },
] as const;

const heroWorkflowStepY = [20, 110, 250, 340] as const;

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

const easeInOutSine = (progress: number) =>
  (1 - Math.cos(Math.PI * progress)) / 2;

const agentOSRings = Array.from({ length: 9 }, (_, index) => ({
  scale: 0.06 + easeInOutSine(index / 9) * 1.1,
  delay: index * -800,
  tone: index % 3 === 0 ? "bright" : "soft",
}));

const actorLogoMarks = [
  {
    left: -19,
    top: -13.5,
    tilt: -5,
    rock: 3.5,
    swayX: 6,
    bob: 4,
    duration: 7.6,
    delay: -1.4,
    opacity: 0.18,
  },
  {
    left: 29,
    top: -11.5,
    tilt: 3,
    rock: 4,
    swayX: -5,
    bob: 3,
    duration: 8.4,
    delay: -3.2,
    opacity: 0.24,
  },
  {
    left: 75,
    top: -13,
    tilt: -2,
    rock: 3,
    swayX: -6,
    bob: 5,
    duration: 6.9,
    delay: -4.8,
    opacity: 0.18,
  },
  {
    left: 4,
    top: 13.5,
    tilt: 5,
    rock: 3.5,
    swayX: 7,
    bob: 3,
    duration: 8.8,
    delay: -2.5,
    opacity: 0.2,
  },
  {
    left: 52,
    top: 11.5,
    tilt: -4,
    rock: 4.5,
    swayX: -7,
    bob: 4,
    duration: 7.2,
    delay: -5.3,
    opacity: 0.26,
  },
  {
    left: -17,
    top: 36.5,
    tilt: 4,
    rock: 3,
    swayX: 5,
    bob: 5,
    duration: 8.1,
    delay: -3.7,
    opacity: 0.17,
  },
  {
    left: 30,
    top: 38.5,
    tilt: -5,
    rock: 3.5,
    swayX: -6,
    bob: 3,
    duration: 6.6,
    delay: -1.9,
    opacity: 0.22,
  },
  {
    left: 76,
    top: 36.5,
    tilt: 3,
    rock: 4,
    swayX: -5,
    bob: 4,
    duration: 8.6,
    delay: -6.1,
    opacity: 0.18,
  },
  {
    left: 6,
    top: 63.5,
    tilt: -3,
    rock: 4.5,
    swayX: 7,
    bob: 5,
    duration: 7.4,
    delay: -4.4,
    opacity: 0.2,
  },
  {
    left: 50,
    top: 61,
    tilt: 5,
    rock: 3,
    swayX: -6,
    bob: 3,
    duration: 8.3,
    delay: -2.8,
    opacity: 0.24,
  },
] as const;

const cardMaskClass =
  "[-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent_84%)]";
const actorsCardMaskClass =
  "[-webkit-mask-image:linear-gradient(to_bottom,black_58%,transparent_86%)] [mask-image:linear-gradient(to_bottom,black_58%,transparent_86%)]";

const containerClassName = (
  productId: ProductMotifId,
  surface: ProductMotifProps["surface"],
) =>
  [
    "product-motif pointer-events-none absolute overflow-hidden",
    `product-motif--${surface}`,
    `product-motif--${productId}`,
    productId === "actors" ? "actors-backdrop" : "",
    surface === "card"
      ? `inset-0 ${productId === "actors" ? actorsCardMaskClass : cardMaskClass}`
      : "inset-x-0 top-0",
  ]
    .filter(Boolean)
    .join(" ");

// Rails stop at each node instead of relying on a product-colored cutout. This
// keeps the card unchanged while allowing the same geometry to sit over the
// hero's depth wash without painting flat rectangles into the paper field.
const WorkflowMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => {
  const renderedSteps = [
    ...workflowSteps.map((step) => ({ ...step, variant: "default" as const })),
    ...(surface === "hero"
      ? workflowSteps.map((step, index) => ({
          ...step,
          y: heroWorkflowStepY[index],
          variant: "mobile" as const,
        }))
      : []),
  ];

  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 320 400"
      preserveAspectRatio="none"
    >
      {renderedSteps.map((positionedStep, index) => {
        const sequenceIndex = index % workflowSteps.length;
        const centerY = positionedStep.y + positionedStep.height / 2;

        return (
          <g
            key={`${positionedStep.variant}-${positionedStep.x}-${positionedStep.y}`}
            className={`workflow-step workflow-step-${sequenceIndex + 1} workflow-step--${positionedStep.variant}`}
            style={
              {
                "--workflow-step-delay": `${sequenceIndex * 130}ms`,
              } as CSSProperties
            }
          >
            <line
              className="workflow-rail"
              x1="-12"
              x2={positionedStep.x}
              y1={centerY}
              y2={centerY}
              vectorEffect="non-scaling-stroke"
            />
            <line
              className="workflow-rail"
              x1={positionedStep.x + positionedStep.width}
              x2="332"
              y1={centerY}
              y2={centerY}
              vectorEffect="non-scaling-stroke"
            />
            <line
              className="workflow-trace workflow-trace-in"
              x1="-12"
              x2={positionedStep.x}
              y1={centerY}
              y2={centerY}
              pathLength="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              className="workflow-node"
              x={positionedStep.x}
              y={positionedStep.y}
              width={positionedStep.width}
              height={positionedStep.height}
              rx="5"
              vectorEffect="non-scaling-stroke"
            />
            <line
              className="workflow-trace workflow-trace-out"
              x1={positionedStep.x + positionedStep.width}
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
  );
};

const DynamicAppsMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => (
  <svg
    className="h-full w-full"
    viewBox="0 0 320 400"
    preserveAspectRatio={surface === "hero" ? "xMidYMid slice" : "none"}
  >
    {dynamicAppCircles.map((circle) => (
      <circle
        key={`${circle.cx}-${circle.cy}`}
        className={`dynamic-app-circle dynamic-app-circle--${circle.direction} dynamic-app-circle--${circle.tone}`}
        style={
          {
            "--dynamic-circle-delay": `${circle.delay}ms`,
          } as CSSProperties
        }
        cx={circle.cx}
        cy={circle.cy}
        r="62"
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
);

const AgentOSMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => (
  <svg
    className="h-full w-full"
    viewBox="0 0 320 400"
    preserveAspectRatio={surface === "hero" ? "xMidYMid slice" : "none"}
  >
    {agentOSRings.map((ring, index) => (
      <circle
        key={index}
        className={`agentos-ring agentos-ring--${ring.tone}`}
        style={
          {
            "--agentos-ring-scale": ring.scale,
            "--agentos-ring-delay": `${ring.delay}ms`,
          } as CSSProperties
        }
        cx="168"
        cy="144"
        r="229.1"
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
);

// This is the exact outer rounded square from the Actors product mark. Drawing
// only that path removes the old accent-colored center cover and makes the
// outline reusable over both product blue and the porcelain hero.
const ActorsMarkOutline = () => (
  <svg className="actors-logo actors-logo--outline" viewBox="0 0 128 128">
    <rect
      className="actors-logo-outline-path"
      x="18.25"
      y="18.25"
      width="91.5"
      height="91.5"
      rx="25.75"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const ActorsMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => (
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
            style={
              {
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
              } as CSSProperties
            }
          >
            {surface === "card" ? (
              <>
                <img
                  alt=""
                  className="actors-logo actors-logo--outline"
                  src={productLogos.actors.src}
                />
                <span className="actors-logo-center-cover bg-product-actors" />
              </>
            ) : (
              <ActorsMarkOutline />
            )}
          </span>
        ))}
      </div>
    ))}
  </div>
);

export const ProductMotif = ({ productId, surface }: ProductMotifProps) => {
  const motif =
    productId === "actors" ? (
      <ActorsMotif surface={surface} />
    ) : productId === "agentos" ? (
      <AgentOSMotif surface={surface} />
    ) : productId === "workflows" ? (
      <WorkflowMotif surface={surface} />
    ) : (
      <DynamicAppsMotif surface={surface} />
    );

  return (
    <div aria-hidden="true" className={containerClassName(productId, surface)}>
      {motif}
    </div>
  );
};
