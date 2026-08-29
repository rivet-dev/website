import type { CSSProperties } from "react";
import { productLogos } from "@/sitemap/productLogos";

export type ProductMotifId =
  "actors" | "agentos" | "workflows" | "dynamic-apps";

export interface ProductMotifProps {
  productId: ProductMotifId;
  surface: "card" | "hero";
}

// Workflows draws the execution route as a bundle of three nested serpentine
// lanes — no task boxes, just the path. Each lane is the same meander offset
// by ±10: straight runs shift vertically and turn radii grow or shrink so the
// bundle stays parallel through every U-turn, flipping sides like nested
// hairpins.
// `lane` selects the per-lane pulse keyframes in main.css, whose stops are
// derived from this exact geometry (each lane's arc radii differ, so its
// corner positions land at different path fractions).
const workflowLanes = [
  { lane: 1, offset: -14, tone: "soft", delay: 0 },
  { lane: 2, offset: 0, tone: "bright", delay: 140 },
  { lane: 3, offset: 14, tone: "soft", delay: 280 },
] as const;

// Both ends run 180 units off-canvas so the pulse dash (0.1 of the path,
// ~161-169 units) sits fully off-screen at the loop's extremes.
const workflowLanePath = (offset: number) => {
  const rightRadius = 38 - offset;
  const leftRadius = 38 + offset;
  return [
    `M -180 ${48 + offset}`,
    "H 262",
    `a ${rightRadius} ${rightRadius} 0 0 1 0 ${rightRadius * 2}`,
    "H 58",
    `a ${leftRadius} ${leftRadius} 0 0 0 0 ${leftRadius * 2}`,
    "H 262",
    `a ${rightRadius} ${rightRadius} 0 0 1 0 ${rightRadius * 2}`,
    "H -180",
  ].join(" ");
};

const agentOSCircles = [
  { cx: 16, cy: 36, direction: "forward", tone: "bright", delay: 0 },
  { cx: 96, cy: 108, direction: "backward", tone: "soft", delay: 0 },
  { cx: 176, cy: 36, direction: "forward", tone: "soft", delay: 120 },
  { cx: 256, cy: 108, direction: "backward", tone: "bright", delay: 120 },
  { cx: 16, cy: 180, direction: "forward", tone: "soft", delay: 180 },
  { cx: 96, cy: 252, direction: "backward", tone: "bright", delay: 180 },
  { cx: 176, cy: 180, direction: "forward", tone: "bright", delay: 300 },
  { cx: 256, cy: 252, direction: "backward", tone: "soft", delay: 300 },
] as const;

// Dynamic Apps runs a verified Conway's Game of Life board on a 10-column
// grid (pitch 32 across the shared 320×400 viewBox — chips sized to match
// the weight of the neighboring card motifs). `life` encodes each cell's
// alive-timeline: "on" = alive every generation; "a"/"b" = the two phases of
// a period-2 oscillator; "q1"-"q3" = alive for a 1-3 generation window
// starting at `phase` of the glider's 4-generation cycle. Every coordinate is
// a genuine B3/S23 evolution and the composed board never self-interacts —
// re-verify with a Life simulation before moving any cell.
const LIFE_PITCH = 32;
const LIFE_CELL = 24;
const LIFE_INSET = 4;

interface LifeCell {
  col: number;
  row: number;
  life: "on" | "a" | "b" | "q1" | "q2" | "q3";
  tone: "bright" | "soft" | "still";
  phase?: number;
}

const lifeBoardCells: readonly LifeCell[] = [
  // Toad (period 2), partly behind the glass verb badge
  { col: 3, row: 2, life: "on", tone: "soft" },
  { col: 0, row: 3, life: "on", tone: "soft" },
  { col: 1, row: 2, life: "a", tone: "soft" },
  { col: 2, row: 2, life: "a", tone: "soft" },
  { col: 1, row: 3, life: "a", tone: "soft" },
  { col: 2, row: 3, life: "a", tone: "soft" },
  { col: 2, row: 1, life: "b", tone: "soft" },
  { col: 0, row: 2, life: "b", tone: "soft" },
  { col: 3, row: 3, life: "b", tone: "soft" },
  { col: 1, row: 4, life: "b", tone: "soft" },
  // Beacon (period 2), bright cells at the collapsing hinge
  { col: 6, row: 0, life: "on", tone: "soft" },
  { col: 7, row: 0, life: "on", tone: "soft" },
  { col: 6, row: 1, life: "on", tone: "soft" },
  { col: 9, row: 2, life: "on", tone: "soft" },
  { col: 8, row: 3, life: "on", tone: "soft" },
  { col: 9, row: 3, life: "on", tone: "soft" },
  { col: 7, row: 1, life: "a", tone: "bright" },
  { col: 8, row: 2, life: "a", tone: "bright" },
  // Still life: a block anchoring the left flank
  { col: 0, row: 7, life: "on", tone: "still" },
  { col: 1, row: 7, life: "on", tone: "still" },
  { col: 0, row: 8, life: "on", tone: "still" },
  { col: 1, row: 8, life: "on", tone: "still" },
];

// The glider's 10-cell union in its local frame. The group walks one diagonal
// cell per 4-generation cycle from the board origin toward the fade mask.
const gliderCells: readonly LifeCell[] = [
  { col: 1, row: 0, life: "q1", tone: "bright", phase: 0 },
  { col: 0, row: 1, life: "q1", tone: "bright", phase: 1 },
  { col: 1, row: 1, life: "q1", tone: "bright", phase: 3 },
  { col: 2, row: 1, life: "q3", tone: "bright", phase: 0 },
  { col: 0, row: 2, life: "a", tone: "bright" },
  { col: 1, row: 2, life: "q2", tone: "bright", phase: 0 },
  { col: 2, row: 2, life: "on", tone: "bright" },
  { col: 3, row: 2, life: "q1", tone: "bright", phase: 3 },
  { col: 1, row: 3, life: "q3", tone: "bright", phase: 1 },
  { col: 2, row: 3, life: "q2", tone: "bright", phase: 2 },
];

const GLIDER_ORIGIN = { col: 5, row: 7 } as const;

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

const WorkflowMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => (
  <svg
    className="h-full w-full"
    viewBox="0 0 320 400"
    preserveAspectRatio={surface === "hero" ? "xMidYMid slice" : "none"}
  >
    {workflowLanes.map((lane) => (
      <g
        key={lane.offset}
        className="workflow-lane"
        style={
          {
            "--workflow-lane-delay": `${lane.delay}ms`,
          } as CSSProperties
        }
      >
        <path
          className={`workflow-rail workflow-rail--${lane.tone}`}
          d={workflowLanePath(lane.offset)}
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className={`workflow-pulse workflow-pulse--${lane.lane}`}
          d={workflowLanePath(lane.offset)}
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    ))}
  </svg>
);

// "rest-off" marks cells dead at generation 0 so the static surfaces (hero,
// reduced motion) render the same curated frame the paused timelines resolve.
// phase !== 0 is only a valid proxy for that while no q-window wraps past the
// end of the glider cycle; keep alive-windows contiguous from their phase.
const lifeCellClassName = (cell: LifeCell) =>
  [
    "dynamic-app-cell",
    `dynamic-app-cell--${cell.life}`,
    cell.tone === "bright" ? "" : `dynamic-app-cell--${cell.tone}`,
    cell.life.startsWith("q") && cell.phase !== 0
      ? "dynamic-app-cell--rest-off"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

const LifeRect = ({
  cell,
  colOffset = 0,
  rowOffset = 0,
}: {
  cell: LifeCell;
  colOffset?: number;
  rowOffset?: number;
}) => (
  <rect
    className={lifeCellClassName(cell)}
    style={
      cell.phase ? ({ "--life-phase": cell.phase } as CSSProperties) : undefined
    }
    x={(cell.col + colOffset) * LIFE_PITCH + LIFE_INSET}
    y={(cell.row + rowOffset) * LIFE_PITCH + LIFE_INSET}
    width={LIFE_CELL}
    height={LIFE_CELL}
    rx="4"
    vectorEffect="non-scaling-stroke"
  />
);

const DynamicAppsMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => (
  <svg
    className="h-full w-full"
    viewBox="0 0 320 400"
    preserveAspectRatio={surface === "hero" ? "xMidYMid slice" : "none"}
  >
    {lifeBoardCells.map((cell) => (
      <LifeRect key={`${cell.col}-${cell.row}`} cell={cell} />
    ))}
    <g className="dynamic-app-glider">
      {gliderCells.map((cell) => (
        <LifeRect
          key={`glider-${cell.col}-${cell.row}`}
          cell={cell}
          colOffset={GLIDER_ORIGIN.col}
          rowOffset={GLIDER_ORIGIN.row}
        />
      ))}
    </g>
  </svg>
);

const AgentOSMotif = ({ surface }: Pick<ProductMotifProps, "surface">) => (
  <svg
    className="h-full w-full"
    viewBox="0 0 320 400"
    preserveAspectRatio={surface === "hero" ? "xMidYMid slice" : "none"}
  >
    {agentOSCircles.map((circle) => (
      <circle
        key={`${circle.cx}-${circle.cy}`}
        className={`agentos-circle agentos-circle--${circle.direction} agentos-circle--${circle.tone}`}
        style={
          {
            "--agentos-circle-delay": `${circle.delay}ms`,
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
