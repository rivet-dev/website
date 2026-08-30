import {
  ArrowUpRight,
  Brain,
  Clock3,
  Folder,
  GitBranch,
  Radio,
  Rocket,
  ScrollText,
  Shield,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { ProductBadge } from "@/components/ProductBar";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import { productAccent } from "@/lib/product-accent";
import { productLogos } from "@/sitemap/productLogos";
import { visibleProducts } from "@/sitemap/products";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { SECTION_H2_CLASS, SECTION_LEDE_CLASS } from "../typography";

type StackLayerId = "dynamic-apps" | "workflows" | "agentos" | "actors";

type AgentNeed = {
  label: string;
  icon: LucideIcon;
  layer: StackLayerId;
  href: string;
};

type StackLayer = {
  id: StackLayerId;
  name: string;
  cardWidth: number;
  descriptionLines: string[];
  side: "left" | "right";
  hex: string;
};

// `layer` names the stack layer that answers the need, driving both the
// desktop hover pairing and the grouped needs in the mobile walkthrough.
const agentNeeds: AgentNeed[] = [
  {
    label: "Durable process",
    icon: Clock3,
    layer: "actors",
    href: "/actors/docs/lifecycle",
  },
  {
    label: "Secure code execution",
    icon: SquareTerminal,
    layer: "agentos",
    href: "/agentos/docs/processes",
  },
  {
    label: "File system",
    icon: Folder,
    layer: "agentos",
    href: "/agentos/docs/filesystem",
  },
  {
    label: "Deployment",
    icon: Rocket,
    layer: "dynamic-apps",
    href: "/dynamic-apps/docs/deploy",
  },
  {
    label: "Realtime & streaming",
    icon: Radio,
    layer: "actors",
    href: "/actors/docs/events",
  },
  {
    label: "Session transcripts",
    icon: ScrollText,
    layer: "agentos",
    href: "/agentos/docs/sessions",
  },
  {
    label: "Memory",
    icon: Brain,
    layer: "actors",
    href: "/actors/docs/state",
  },
  {
    label: "Isolation",
    icon: Shield,
    layer: "agentos",
    href: "/agentos/docs/security-model",
  },
  {
    label: "Durable workflows",
    icon: GitBranch,
    layer: "workflows",
    href: "/workflows/docs",
  },
];

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PINE = "#2E4034";

// Every need in the grid maps to one layer. Description lines are manually
// wrapped for the desktop SVG, then joined for the mobile cards so both views
// always use the same copy.
// `cardWidth` is the callout card's width: SVG cannot auto-size around the
// text, so each is sized to its longest line and tuned against a screenshot.
const stackLayers: StackLayer[] = [
  {
    id: "dynamic-apps",
    name: "Dynamic Apps",
    cardWidth: 180,
    descriptionLines: ["Deploy the backends your", "agents build."],
    side: "right",
    hex: productAccent("dynamic-apps")?.hex ?? PINE,
  },
  {
    id: "workflows",
    name: "Workflows",
    cardWidth: 250,
    descriptionLines: ["Write multi-step operations", "that survive restarts."],
    side: "left",
    hex: productAccent("workflows")?.hex ?? PINE,
  },
  {
    id: "agentos",
    name: "agentOS",
    cardWidth: 220,
    descriptionLines: ["Hand every agent a computer", "of its own."],
    side: "right",
    hex: productAccent("agentos")?.hex ?? PINE,
  },
  {
    id: "actors",
    name: "Actors",
    cardWidth: 260,
    descriptionLines: ["Give every agent a durable", "process to live in."],
    side: "left",
    hex: productAccent("actors")?.hex ?? PINE,
  },
];

const STACK_FIGURE_DESCRIPTION =
  "Agents need durable processes, secure code execution, a file system, deployment, realtime and streaming, session transcripts, memory, isolation, and durable workflows. Each maps to a product layer of the Rivet stack: Dynamic Apps handles deployment; Workflows runs durable workflows; agentOS provides secure code execution, a file system, isolation, and session transcripts; and Actors provide durable processes, realtime and streaming, and memory.";

// ---------------------------------------------------------------------------
// Isometric exploded stack. 2:1 dimetric plates on the porcelain card, one per
// product, with sentence-case callouts alternating sides. Plate faces are
// opaque tints of the product accent so the exploded layers read against each
// other without shadows.
// ---------------------------------------------------------------------------

const VIEW_W = 720;
const VIEW_H = 620;
const CX = 360;
// Plate half-height in local units; the diamond spans 4S wide by 2S tall.
const S = 52;
const HW = 2 * S;
const THICKNESS = 12;
// Plate corner radius: the Rivet mark's R-ring outer silhouette — rx 30 on a
// 100-wide square in icon-white.svg (25.75 + half the 8.5 stroke on the
// 91.5 rect) — so each slice reads as the logo squircle seen edge-on. The
// tile ratio (34.375%) belongs to the badge behind the ring, not the ring.
const PLATE_R = 2 * S * 0.3;

// Exact side walls for the rounded top face. Under the isometric matrix, a
// local-space offset of (d, d) projects to a vertical screen-space offset of
// (0, d). Each lower edge is therefore the matching top edge translated by
// THICKNESS, joined by vertical lines at the two outer tangencies. The wall
// fills meet at the front center without outlining that lighting boundary.
const PLATE_Q = S - PLATE_R;
const PLATE_A = PLATE_Q + PLATE_R / Math.SQRT2;
const PLATE_RIGHT_SIDE_D = [
  `M ${PLATE_A} ${-PLATE_A}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${S} ${-PLATE_Q}`,
  `L ${S} ${PLATE_Q}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${PLATE_A} ${PLATE_A}`,
  `L ${PLATE_A + THICKNESS} ${PLATE_A + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 0 ${S + THICKNESS} ${PLATE_Q + THICKNESS}`,
  `L ${S + THICKNESS} ${-PLATE_Q + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 0 ${PLATE_A + THICKNESS} ${-PLATE_A + THICKNESS}`,
  "Z",
].join(" ");
const PLATE_LEFT_SIDE_D = [
  `M ${PLATE_A} ${PLATE_A}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${PLATE_Q} ${S}`,
  `L ${-PLATE_Q} ${S}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${-PLATE_A} ${PLATE_A}`,
  `L ${-PLATE_A + THICKNESS} ${PLATE_A + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 0 ${-PLATE_Q + THICKNESS} ${S + THICKNESS}`,
  `L ${PLATE_Q + THICKNESS} ${S + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 0 ${PLATE_A + THICKNESS} ${PLATE_A + THICKNESS}`,
  "Z",
].join(" ");
const PLATE_SIDE_OUTLINE_D = [
  `M ${PLATE_A} ${-PLATE_A}`,
  `L ${PLATE_A + THICKNESS} ${-PLATE_A + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${S + THICKNESS} ${-PLATE_Q + THICKNESS}`,
  `L ${S + THICKNESS} ${PLATE_Q + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${PLATE_A + THICKNESS} ${PLATE_A + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${PLATE_Q + THICKNESS} ${S + THICKNESS}`,
  `L ${-PLATE_Q + THICKNESS} ${S + THICKNESS}`,
  `A ${PLATE_R} ${PLATE_R} 0 0 1 ${-PLATE_A + THICKNESS} ${PLATE_A + THICKNESS}`,
  `L ${-PLATE_A} ${PLATE_A}`,
].join(" ");
const LAYER_SPACING = 146;
const FIRST_LAYER_Y = 84;
// Product tile beside each callout name, at the ProductBadge radius (34.375%).
// The wordmark SVGs carry their inset ring, so they span the tile full-bleed.
const TILE = 22;
const TILE_RX = TILE * 0.34375;
// Callout card metrics: one light card holds the tile, name, and callout lines —
// the SVG counterpart of the mobile layer list's rows (white/70 fill, ink
// hairline, rounded-lg). Height grows with the caption count.
const CARD_RX = 10;
const CARD_PAD_X = 12;
// Layer pitch while the stack is condensed (scrolled away): a closed deck
// that still shows every plate's front edge.
const COLLAPSED_SPACING = 26;

/** Product accent blended over white, as an opaque fill. */
const tint = (hex: string, alpha: number) => {
  const [r, g, b] = [1, 3, 5].map((i) =>
    Number.parseInt(hex.slice(i, i + 2), 16),
  );
  const mix = (c: number) => Math.round(255 + (c - 255) * alpha);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

const withAlpha = (hex: string, alpha: number) => {
  const [r, g, b] = [1, 3, 5].map((i) =>
    Number.parseInt(hex.slice(i, i + 2), 16),
  );
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HAIRLINE = withAlpha(INK, 0.2);

// One shared 4.8s cycle across every motif, so the whole diagram loops
// seamlessly. Under reduced motion the animations are removed and each motif
// settles on its fully-drawn state.
const MOTIF_CYCLE_S = 4.8;

/** Motif drawn on the plate's top face, in local (u, v) coordinates ±S. */
const PlateMotif = ({ id, hex }: { id: StackLayerId; hex: string }) => {
  switch (id) {
    case "dynamic-apps": {
      // Rolling deploys: three app chips fade through thirds of the cycle
      // around one static empty slot.
      const chips = [
        { x: -38, y: -36 },
        { x: -6, y: -24 },
        { x: 8, y: 16 },
      ];
      return (
        <>
          {chips.map((chip, index) => (
            <rect
              key={`${chip.x},${chip.y}`}
              x={chip.x}
              y={chip.y}
              width={24}
              height={15}
              fill={withAlpha(hex, 0.5)}
              className="as-chip"
              style={{
                animationDelay: `${-(index * MOTIF_CYCLE_S) / chips.length}s`,
              }}
            />
          ))}
          <rect
            x={-24}
            y={2}
            width={24}
            height={15}
            fill="none"
            stroke={HAIRLINE}
            vectorEffect="non-scaling-stroke"
          />
        </>
      );
    }
    case "workflows": {
      // Steps run in order: each bar fills its outlined slot, holds until the
      // run completes, then the whole run clears and starts over.
      const bars = [
        { x: -38, y: -32 },
        { x: -23, y: -7 },
        { x: -8, y: 18 },
      ];
      return (
        <>
          {bars.map((bar) => (
            <rect
              key={`slot-${bar.x}`}
              x={bar.x}
              y={bar.y}
              width={46}
              height={13}
              fill="none"
              stroke={HAIRLINE}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {bars.map((bar, index) => (
            <rect
              key={`fill-${bar.x}`}
              x={bar.x}
              y={bar.y}
              width={46}
              height={13}
              fill={withAlpha(hex, 0.5)}
              className={`as-grow as-flow-${index + 1}`}
            />
          ))}
        </>
      );
    }
    case "agentos":
      // A session typing into the window: two output lines write, hold, clear.
      return (
        <>
          <rect
            x={-34}
            y={-30}
            width={68}
            height={56}
            fill="rgba(255, 255, 255, 0.55)"
            stroke={HAIRLINE}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={-34}
            y1={-16}
            x2={34}
            y2={-16}
            stroke={HAIRLINE}
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={-26}
            y={-8}
            width={34}
            height={7}
            fill={withAlpha(hex, 0.3)}
            className="as-grow as-type-1"
          />
          <rect
            x={-26}
            y={4}
            width={44}
            height={7}
            fill={withAlpha(hex, 0.15)}
            className="as-grow as-type-2"
          />
        </>
      );
    case "actors": {
      // Actors waking and sleeping: a faint grid with cells pulsing bright at
      // staggered phases.
      const size = 12;
      const gap = 6;
      const pulses = [
        [0, 1],
        [1, 3],
        [2, 0],
        [2, 2],
        [3, 4],
        [0, 4],
        [3, 1],
        [1, 2],
      ];
      return (
        <>
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => (
              <rect
                key={`${row}-${col}`}
                x={-42 + col * (size + gap)}
                y={-33 + row * (size + gap)}
                width={size}
                height={size}
                fill={withAlpha(hex, 0.08)}
                stroke={withAlpha(INK, 0.15)}
                vectorEffect="non-scaling-stroke"
              />
            )),
          )}
          {pulses.map(([row, col], index) => (
            <rect
              key={`pulse-${row}-${col}`}
              x={-42 + col * (size + gap)}
              y={-33 + row * (size + gap)}
              width={size}
              height={size}
              fill={withAlpha(hex, 0.55)}
              className="as-actor"
              style={{
                animationDelay: `${-(index * MOTIF_CYCLE_S) / pulses.length}s`,
              }}
            />
          ))}
        </>
      );
    }
    default:
      return null;
  }
};

const StackPlateFace = ({
  cx,
  cy,
  layer,
  clipPathId,
  outline = HAIRLINE,
}: {
  cx: number;
  cy: number;
  layer: StackLayer;
  clipPathId: string;
  outline?: string;
}) => (
  <>
    {/* Exact extruded side walls, painted under the top face. */}
    <g transform={`matrix(1 0.5 -1 0.5 ${cx} ${cy})`}>
      <path d={PLATE_LEFT_SIDE_D} fill={tint(layer.hex, 0.22)} />
      <path d={PLATE_RIGHT_SIDE_D} fill={tint(layer.hex, 0.34)} />
      <path
        d={PLATE_SIDE_OUTLINE_D}
        fill="none"
        stroke={outline}
        vectorEffect="non-scaling-stroke"
      />
    </g>
    {/* Top face with the product motif, clipped to the rounded face. */}
    <g transform={`matrix(1 0.5 -1 0.5 ${cx} ${cy})`}>
      <rect
        x={-S}
        y={-S}
        width={2 * S}
        height={2 * S}
        rx={PLATE_R}
        fill={tint(layer.hex, 0.12)}
        stroke={outline}
        vectorEffect="non-scaling-stroke"
      />
      <g clipPath={`url(#${clipPathId})`}>
        <PlateMotif id={layer.id} hex={layer.hex} />
      </g>
    </g>
  </>
);

const StackPlate = ({
  cy,
  layer,
  condenseDelta,
}: {
  cy: number;
  layer: StackLayer;
  /** translateY that folds this plate onto the collapsed deck. */
  condenseDelta: number;
}) => {
  const { hex, side, name, descriptionLines } = layer;
  const dotY = cy + S / 2;
  const isRight = side === "right";
  // Leader dot on the midpoint of the front top edge facing the label.
  const dotX = isRight ? CX + HW / 2 : CX - HW / 2;
  // The whole callout — tile, name, and callout lines — sits in one light card,
  // centered on the leader line. Left-side cards anchor at the viewBox edge
  // and the leader line reaches out to meet them.
  const cardW = layer.cardWidth;
  const cardH = 60 + (descriptionLines.length - 1) * 17;
  const cardX = isRight ? CX + HW + 16 : 20;
  const cardY = dotY - cardH / 2;
  const lineEndX = isRight ? cardX - 8 : cardX + cardW + 8;
  const tileX = cardX + CARD_PAD_X;
  const tileY = cardY + 10;
  const nameX = tileX + TILE + 8;
  const logo = productLogos[layer.id];

  return (
    <g
      data-plate={layer.id}
      style={
        {
          "--agent-stack-condense": `${condenseDelta}px`,
        } as React.CSSProperties
      }
    >
      <StackPlateFace
        cx={CX}
        cy={cy}
        layer={layer}
        clipPathId="agent-stack-face-desktop"
      />
      {/* Callout: leader dot on the front edge, hairline out to the tile and
          label. Grouped so it can fade while the deck is condensed. */}
      <g data-callout="">
        <line
          x1={isRight ? dotX + 5 : dotX - 5}
          y1={dotY}
          x2={lineEndX}
          y2={dotY}
          stroke={withAlpha(INK, 0.28)}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={dotX} cy={dotY} r={3} fill={hex} />
        <rect
          x={cardX}
          y={cardY}
          width={cardW}
          height={cardH}
          rx={CARD_RX}
          fill="rgba(255, 255, 255, 0.7)"
          stroke={withAlpha(INK, 0.1)}
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={tileX}
          y={tileY}
          width={TILE}
          height={TILE}
          rx={TILE_RX}
          fill={hex}
        />
        <image href={logo.src} x={tileX} y={tileY} width={TILE} height={TILE} />
        <text
          x={nameX}
          y={cardY + 26.5}
          fontSize={15}
          fontWeight={500}
          fill={INK}
        >
          {name}
        </text>
        {descriptionLines.map((caption, index) => (
          <text
            key={caption}
            x={cardX + CARD_PAD_X}
            y={cardY + 48 + index * 17}
            fontSize={13}
            fill={INK_SOFT}
          >
            {caption}
          </text>
        ))}
      </g>
    </g>
  );
};

// Bidirectional hover/focus pairing, in plain CSS so the section stays server-
// rendered: a plate lifts the needs it answers, while a need dims every plate
// except the layer that answers it.
// The dim rules precede the highlight rules on purpose — equal specificity,
// so source order decides which wins on the answering layer's own chips.
const answeringLayers = stackLayers.filter((layer) =>
  agentNeeds.some((need) => need.layer === layer.id),
);

// Grow → hold → clear → reset, with the reset hidden behind opacity 0 so the
// 100% frame lands exactly on the 0% frame. Every bar shares the clear at
// 80–88% so a run finishes as one.
const growLoopKeyframes = (name: string, growStart: number, growEnd: number) =>
  `@keyframes ${name}{0%,${growStart}%{transform:scaleX(0);opacity:1}${growEnd}%,80%{transform:scaleX(1);opacity:1}88%{transform:scaleX(1);opacity:0}89%,94%{transform:scaleX(0);opacity:0}95%,100%{transform:scaleX(0);opacity:1}}`;

const STACK_HOVER_CSS = [
  // A technical grid sits under the whole figure. Its dark wash and hairlines
  // fade together, revealing the lighter porcelain surface as the stack opens.
  // `round` fits whole cells to the panel so no clipped rows remain at its
  // edges.
  // The static value matches the expanded state for browsers without scroll-
  // driven animations and for the non-exploding mobile rendering.
  `.agent-stack-figure [data-stack-grid]{
    background-color:${withAlpha(INK, 0.055)};
    opacity:.72;
  }
  .agent-stack-figure [data-stack-grid]::after{
    content:"";
    position:absolute;
    inset:0;
    background-image:linear-gradient(to right,${withAlpha(INK, 0.08)} 1px,transparent 1px),linear-gradient(to bottom,${withAlpha(INK, 0.08)} 1px,transparent 1px);
    background-size:32px 32px;
    background-repeat:round;
    -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 24px,#000 calc(100% - 24px),transparent 100%);
    mask-image:linear-gradient(to bottom,transparent 0,#000 24px,#000 calc(100% - 24px),transparent 100%);
  }`,
  ".agent-stack-figure [data-plate]{transition:opacity .25s ease;}",
  ".agent-stack-figure [data-need]{transition:opacity .2s ease,border-color .2s ease,background-color .2s ease;}",
  // Gated to hover-capable inputs: on touch, a tap would set a sticky :hover
  // that leaves the grid dimmed until the next tap elsewhere.
  `@media (hover: hover){
.agent-stack-figure:not(:focus-within) [data-stack-diagram]:has([data-plate]:hover) [data-plate]:not(:hover){opacity:.45;}
${answeringLayers
  .map(
    (layer) =>
      `.agent-stack-figure:not(:focus-within):has([data-need="${layer.id}"]:hover) [data-stack-diagram] [data-plate]:not([data-plate="${layer.id}"]){opacity:.45;}`,
  )
  .join("\n")}
${answeringLayers
  .map(
    (layer) =>
      `.agent-stack-figure:not(:focus-within):has([data-plate="${layer.id}"]:hover) [data-need]{opacity:.4;}`,
  )
  .join("\n")}
${answeringLayers
  .map(
    (layer) =>
      `.agent-stack-figure:not(:focus-within):has([data-plate="${layer.id}"]:hover) [data-need="${layer.id}"]{opacity:1;border-color:${withAlpha(layer.hex, 0.5)};background-color:#fff;}`,
  )
  .join("\n")}
${answeringLayers
  .map(
    (layer) =>
      `.agent-stack-figure:not(:focus-within) [data-need="${layer.id}"]:hover{border-color:${withAlpha(layer.hex, 0.5)};background-color:#fff;}`,
  )
  .join("\n")}
}`,
  // Keyboard focus gets the same reverse highlight and takes precedence if the
  // pointer happens to be resting over a different row or plate.
  answeringLayers
    .map(
      (layer) =>
        `.agent-stack-figure:has([data-need="${layer.id}"]:focus-visible) [data-stack-diagram] [data-plate]:not([data-plate="${layer.id}"]){opacity:.45;}
.agent-stack-figure [data-need="${layer.id}"]:focus-visible{border-color:${withAlpha(layer.hex, 0.5)};background-color:#fff;}`,
    )
    .join("\n"),
  "@media (prefers-reduced-motion: reduce){.agent-stack-figure [data-plate],.agent-stack-figure [data-need]{transition:none;}}",
  // The non-desktop walkthrough keeps the full deck in view. The observer only
  // changes one data attribute; CSS owns the plate lift and active-card tone.
  // The sticky diagram occupies just over a third of the mobile viewport. Keep the
  // cards in normal document flow so every need remains readable below it,
  // including the taller agentOS step, without introducing a nested scroll
  // container.
  `[data-agent-stack-story]{
    --agent-stack-sticky-top:calc(var(--header-height,3.5rem) + 2.5rem);
  }
  [data-agent-stack-story] [data-mobile-plate]{
    opacity:.24;
    transform:translateY(0);
    transition:opacity .25s ease,transform .35s cubic-bezier(.22,1,.36,1);
  }
  [data-agent-stack-story] [data-agent-stack-card]{
    transition:border-color .25s ease,background-color .25s ease;
  }
  [data-agent-stack-step][aria-current="step"] [data-agent-stack-card]{
    border-color:var(--agent-stack-layer-border);
    background-color:#fff;
  }
${stackLayers
  .map(
    (layer) =>
      `[data-agent-stack-story][data-active-layer="${layer.id}"] [data-mobile-plate="${layer.id}"]{opacity:1;transform:translateY(-8px);}`,
  )
  .join("\n")}
  @media (prefers-reduced-motion: reduce){
    [data-agent-stack-story] [data-mobile-plate],
    [data-agent-stack-story] [data-agent-stack-card]{transition:none;}
    [data-agent-stack-story][data-active-layer] [data-mobile-plate]{transform:none;}
  }`,
  // Looping motif animations, one shared 4.8s cycle, each keyframe set ending
  // exactly where it starts. `as-grow` bars scale along their own box so the
  // growth follows the plate's isometric axis. Reduced motion removes them,
  // settling on the fully-drawn frame.
  `.agent-stack-figure .as-chip{animation:agent-stack-chip ${MOTIF_CYCLE_S}s ease-in-out infinite;}
.agent-stack-figure .as-grow{transform-box:fill-box;transform-origin:left center;}
.agent-stack-figure .as-flow-1{animation:agent-stack-flow-1 ${MOTIF_CYCLE_S}s ease-in-out infinite;}
.agent-stack-figure .as-flow-2{animation:agent-stack-flow-2 ${MOTIF_CYCLE_S}s ease-in-out infinite;}
.agent-stack-figure .as-flow-3{animation:agent-stack-flow-3 ${MOTIF_CYCLE_S}s ease-in-out infinite;}
.agent-stack-figure .as-type-1{animation:agent-stack-type-1 ${MOTIF_CYCLE_S}s ease-in-out ${-MOTIF_CYCLE_S / 2}s infinite;}
.agent-stack-figure .as-type-2{animation:agent-stack-type-2 ${MOTIF_CYCLE_S}s ease-in-out ${-MOTIF_CYCLE_S / 2}s infinite;}
.agent-stack-figure .as-actor{animation:agent-stack-actor ${MOTIF_CYCLE_S}s ease-in-out infinite;}
@keyframes agent-stack-chip{0%,100%{opacity:.15}12%,55%{opacity:1}70%{opacity:.15}}
@keyframes agent-stack-actor{0%,100%{opacity:0}10%,40%{opacity:1}55%{opacity:0}}
${growLoopKeyframes("agent-stack-flow-1", 4, 22)}
${growLoopKeyframes("agent-stack-flow-2", 28, 46)}
${growLoopKeyframes("agent-stack-flow-3", 52, 70)}
${growLoopKeyframes("agent-stack-type-1", 8, 26)}
${growLoopKeyframes("agent-stack-type-2", 34, 56)}
@media (prefers-reduced-motion: reduce){.agent-stack-figure :is(.as-chip,.as-flow-1,.as-flow-2,.as-flow-3,.as-type-1,.as-type-2,.as-actor){animation:none;}}`,
  // Scroll-linked explode: the deck sits condensed while the diagram is at the
  // scrollport edges and expands over the middle of its view timeline, so it
  // reverses as you scroll away in either direction. Guarded by @supports so
  // unsupported browsers do not run this as a time-based animation; the
  // homepage script mirrors these keyframes with a Web Animations fallback.
  `@supports (animation-timeline: view()) and (view-timeline-name: --agent-stack) and (animation-timeline: --agent-stack) {
  .agent-stack-figure { view-timeline-name: --agent-stack; }
  /* Firefox requires a non-zero duration before it applies a scroll-driven
     animation. The view timeline still owns the progress, so 1ms does not
     make the animation time-based. */
  .agent-stack-figure [data-plate] { animation: agent-stack-expand 1ms linear both; animation-timeline: --agent-stack; }
  .agent-stack-figure [data-plate] > [data-callout] { animation: agent-stack-callout 1ms linear both; animation-timeline: --agent-stack; }
  @media (min-width: 1024px) {
    .agent-stack-figure [data-stack-grid] { animation: agent-stack-grid-tone 1ms linear both; animation-timeline: --agent-stack; }
  }
  @keyframes agent-stack-expand {
    0%, 30% { transform: translateY(var(--agent-stack-condense)); }
    44%, 58% { transform: translateY(0); }
    72%, 100% { transform: translateY(var(--agent-stack-condense)); }
  }
  @keyframes agent-stack-callout {
    0%, 40% { opacity: 0; visibility: hidden; }
    47%, 56% { opacity: 1; visibility: visible; }
    63%, 100% { opacity: 0; visibility: hidden; }
  }
  @keyframes agent-stack-grid-tone {
    0%, 30% { opacity: 1; }
    44%, 58% { opacity: .72; }
    72%, 100% { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .agent-stack-figure [data-plate],
    .agent-stack-figure [data-plate] > [data-callout],
    .agent-stack-figure [data-stack-grid] { animation: none; }
  }
}`,
].join("\n");

const ExplodedStackDiagram = () => (
  <svg
    viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
    className="mx-auto block w-full max-w-2xl"
    aria-hidden="true"
    data-stack-diagram=""
  >
    <defs>
      {/* Referenced from inside the iso transform, so its user space is the
          plate's local space: motifs clip to the rounded face. */}
      <clipPath id="agent-stack-face-desktop">
        <rect x={-S} y={-S} width={2 * S} height={2 * S} rx={PLATE_R} />
      </clipPath>
    </defs>
    {/* Painted bottom layer first so the condensed deck occludes top-down. */}
    {stackLayers
      .map((layer, index) => ({ layer, index }))
      .reverse()
      .map(({ layer, index }) => (
        <StackPlate
          key={layer.id}
          layer={layer}
          cy={FIRST_LAYER_Y + index * LAYER_SPACING}
          condenseDelta={
            ((stackLayers.length - 1) / 2 - index) *
            (LAYER_SPACING - COLLAPSED_SPACING)
          }
        />
      ))}
  </svg>
);

const MOBILE_VIEW_W = 220;
const MOBILE_VIEW_H = 350;
const MOBILE_CX = MOBILE_VIEW_W / 2;
const MOBILE_FIRST_LAYER_Y = 58;
const MOBILE_LAYER_SPACING = 74;

const CompactStackDiagram = () => (
  <svg
    viewBox={`0 0 ${MOBILE_VIEW_W} ${MOBILE_VIEW_H}`}
    className="block h-full w-full"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <clipPath id="agent-stack-face-mobile">
        <rect x={-S} y={-S} width={2 * S} height={2 * S} rx={PLATE_R} />
      </clipPath>
    </defs>
    {stackLayers
      .map((layer, index) => ({ layer, index }))
      .reverse()
      .map(({ layer, index }) => (
        <g key={layer.id} data-mobile-plate={layer.id}>
          <StackPlateFace
            cx={MOBILE_CX}
            cy={MOBILE_FIRST_LAYER_Y + index * MOBILE_LAYER_SPACING}
            layer={layer}
            clipPathId="agent-stack-face-mobile"
            outline={withAlpha(layer.hex, 0.55)}
          />
        </g>
      ))}
  </svg>
);

const StackLayerBadge = ({ layer }: { layer: StackLayer }) => {
  const product = visibleProducts.find(
    (candidate) => candidate.id === layer.id,
  );

  return product ? <ProductBadge product={product} className="size-8" /> : null;
};

// The walkthrough climbs the stack from the bottom up — Actors first, ending
// on Dynamic Apps — so the diagram's highlight rises as you scroll. The
// diagram itself stays authored top-down.
const mobileStackLayers = [...stackLayers].reverse();

const MobileStackStory = () => (
  <div
    className="relative z-10 lg:hidden"
    data-agent-stack-story=""
    data-active-layer={mobileStackLayers[0].id}
  >
    <div className="md:grid md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-start md:gap-8">
      <div className="sticky top-[calc(var(--header-height,3.5rem)+2.5rem)] z-20 self-start">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-paper"
        />
        <div
          className="h-[38svh] overflow-hidden rounded-xl border border-ink/10 bg-paper px-3 py-2 md:h-[46svh] md:p-5"
          data-agent-stack-diagram-panel=""
        >
          <CompactStackDiagram />
        </div>
      </div>

      <ol
        className="relative z-10 mt-6 pb-[26svh] md:mt-0"
        aria-label="Rivet stack layers"
      >
        {mobileStackLayers.map((layer, index) => {
          const needs = agentNeeds.filter((need) => need.layer === layer.id);
          const headingId = `agent-stack-layer-${layer.id}`;

          return (
            <li
              key={layer.id}
              data-agent-stack-step={layer.id}
              aria-current={index === 0 ? "step" : undefined}
              className="mb-[14svh] last:mb-0"
              style={
                {
                  "--agent-stack-layer-border": withAlpha(layer.hex, 0.55),
                  zIndex: index + 1,
                } as React.CSSProperties
              }
            >
              {/* Opaque so copy stays legible as it passes below the sticky diagram. */}
              <article
                aria-labelledby={headingId}
                data-agent-stack-card=""
                className="min-w-0 w-full rounded-xl border border-ink/10 bg-white p-4 pt-5"
              >
                <div className="flex items-center gap-3">
                  <StackLayerBadge layer={layer} />
                  <h3 id={headingId} className="text-base font-medium text-ink">
                    {layer.name}
                  </h3>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-ink-faint">
                    What agents need
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {needs.map(({ label, icon: NeedIcon, href }) => (
                      <a
                        key={label}
                        href={canonicalizeInternalHref(href)}
                        className="group inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-ink/10 bg-paper px-2.5 py-1.5 text-sm font-medium leading-snug text-ink-soft transition-colors hover:border-ink/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                      >
                        <NeedIcon
                          className="h-4 w-4 shrink-0 text-pine"
                          aria-hidden="true"
                          strokeWidth={1.75}
                        />
                        <span className="min-w-0">{label}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
                          strokeWidth={1.75}
                        />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-ink/10 pt-3">
                  <p className="text-xs font-medium text-ink-faint">
                    How this layer solves it
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {layer.descriptionLines.join(" ")}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  </div>
);

export const AgentStackSection = () => (
  <section
    aria-labelledby="agent-stack-title"
    className={`bg-paper ${SITE_SECTION_CLASS}`}
  >
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <style>{STACK_HOVER_CSS}</style>
      <div className="max-w-3xl" data-site-reveal="">
        <h2
          id="agent-stack-title"
          className={`text-balance ${SECTION_H2_CLASS}`}
        >
          Everything agents need, in one composable stack.
        </h2>
        <p className={SECTION_LEDE_CLASS}>
          Every agent feature maps to composable layers of the Rivet stack. Pick
          and choose what features you need to build production agents.
        </p>
      </div>

      <div className="mt-12">
        <div className="agent-stack-figure relative isolate overflow-visible rounded-xl border border-ink/10 bg-white/55 p-6 md:p-8 lg:hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            data-stack-grid=""
          />
          <MobileStackStory />
        </div>

        <figure
          className="agent-stack-figure relative isolate hidden items-center gap-8 overflow-hidden rounded-xl border border-ink/10 bg-white/55 p-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
          data-site-reveal=""
          data-site-reveal-delay="120"
        >
          <figcaption className="sr-only">
            {STACK_FIGURE_DESCRIPTION}
          </figcaption>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            data-stack-grid=""
          />

          <div className="relative z-10 w-full max-w-64">
            <p className="text-sm font-medium text-ink">What agents need</p>
            <div className="mt-5 grid grid-cols-1 gap-2">
              {agentNeeds.map(({ label, icon: NeedIcon, layer, href }) => (
                <a
                  key={label}
                  data-need={layer}
                  href={canonicalizeInternalHref(href)}
                  className="group flex min-h-14 items-center gap-2.5 rounded-lg border border-ink/10 bg-paper px-3 py-2.5 text-sm font-medium leading-snug text-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <NeedIcon
                    className="h-4 w-4 shrink-0 text-pine"
                    aria-hidden="true"
                    strokeWidth={1.75}
                  />
                  {label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="ml-auto h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
                    strokeWidth={1.75}
                  />
                </a>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="relative z-10 min-w-0">
            <ExplodedStackDiagram />
          </div>
        </figure>
      </div>
    </div>
  </section>
);
