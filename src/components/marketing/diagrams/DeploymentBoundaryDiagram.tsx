import { Icon, faDatabase, faNodeJs, faRust } from "@rivet-gg/icons";
import { ACTOR_TYPES } from "@/data/actor-types";
import { productLogos } from "@/sitemap/productLogos";
import { wordmarkMaskStyle } from "@/lib/product-accent";
import foundationDbLogo from "../images/platforms/foundationdb.svg";
import postgresLogo from "../images/platforms/postgres.svg";

/**
 * What sits inside the customer's boundary, top to bottom: a Rivet Worker
 * running their code (the Actor types it hosts, on Node.js or Rust), the Rivet
 * Control Plane scheduling it, and the storage underneath. The dashed frame is
 * the boundary itself.
 *
 * The three layers are drawn as a stacked isometric deck — the 2:1 dimetric
 * plates with extruded walls from the retired "Everything agents need" stack
 * on the old homepage, over that figure's hairline grid — with a leader from
 * each plate's front edge to a card naming the layer. Upper plates paint over
 * the ones beneath so the deck reads as one object. Plates are painted in
 * neutral theme tokens; the only accent is the awake Actor slots on the worker.
 */

// --- Plate geometry ---------------------------------------------------------
// Plate half-height in local units; the diamond spans 4S wide by 2S tall.
const S = 52;
const HW = 2 * S;
const THICKNESS = 12;
// Plate corner radius: softened, not the full logo squircle, so the slices
// read as machined plates rather than badges.
const PLATE_R = 2 * S * 0.16;

// Exact side walls for the rounded top face. Under the isometric matrix, a
// local-space offset of (d, d) projects to a vertical screen-space offset of
// (0, d), so each lower edge is the matching top edge translated by THICKNESS.
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

// One plate per row. The plate fills the left of the viewBox; the leader runs
// from the midpoint of its front-right edge out to the right edge, where the
// card begins.
const CX = HW;
const CY = S + 4;
const LEADER_W = 40;
const VIEW_W = 2 * HW + LEADER_W;
const VIEW_H = 2 * S + THICKNESS + 8;
const DOT_X = CX + HW / 2;
const DOT_Y = CY + S / 2;

const ink = (alpha: number) => `rgb(var(--site-ink, 27 25 22) / ${alpha})`;
const highlight = (alpha: number) =>
	`rgb(var(--runtime-highlight, 183 75 35) / ${alpha})`;

// --- Motifs ------------------------------------------------------------------

/**
 * Worker: a 4×4 grid of Actor slots centred on the face, a few of them awake.
 * Static; the plate is a diagram, not a live view.
 */
const WorkerMotif = () => {
	const n = 4;
	const size = 14;
	const gap = 6;
	const origin = -(n * size + (n - 1) * gap) / 2;
	const awake = new Set(["0-1", "1-3", "2-0", "2-2", "3-1"]);
	return (
		<>
			{Array.from({ length: n }, (_, row) =>
				Array.from({ length: n }, (_, col) => {
					const key = `${row}-${col}`;
					return (
						<rect
							key={key}
							x={origin + col * (size + gap)}
							y={origin + row * (size + gap)}
							width={size}
							height={size}
							style={{
								fill: awake.has(key) ? highlight(0.55) : ink(0.05),
								stroke: ink(0.15),
							}}
							vectorEffect="non-scaling-stroke"
						/>
					);
				}),
			)}
		</>
	);
};

/**
 * A mark pressed into the face (debossed). The children paint in
 * `currentColor` and are drawn four times: a shadow rim shifted up into the
 * recess, a lit rim shifted down where the far wall catches the light, then
 * an opaque copy so the plate cannot show through, then the recessed face a
 * shade darker than the plate. Rims are faint so the relief stays a marking
 * rather than a badge in either theme. A local offset of (d, d) projects to
 * a vertical screen offset of d.
 */
const STAMP_RIM = 0.9;
/**
 * `scale` is the factor the children are drawn at, so the rims shift by the
 * same on-screen distance whatever the glyph's native unit size. `rim` is
 * that distance in plate pixels; solid glyphs need a little more than thin
 * strokes for the relief to read.
 */
const Stamp = ({
	scale = 1,
	rim: rimPx = STAMP_RIM,
	children,
}: {
	scale?: number;
	rim?: number;
	children: React.ReactNode;
}) => {
	const rim = rimPx / scale;
	return (
		<>
			<g transform={`translate(${-rim} ${-rim})`} style={{ color: "rgb(0 0 0 / 0.22)" }}>
				{children}
			</g>
			<g transform={`translate(${rim} ${rim})`} style={{ color: "rgb(255 255 255 / 0.45)" }}>
				{children}
			</g>
			<g style={{ color: "rgb(var(--site-surface, 255 255 255))" }}>{children}</g>
			<g style={{ color: ink(0.2) }}>{children}</g>
		</>
	);
};

// The Rivet mark from `images/rivet-logos/icon-white.svg`, in its 68-unit box:
// the inset R-ring plus the R. Drawn inline so it paints in theme tokens
// (an `<image>` of the white asset cannot be recolored per theme).
const RIVET_RING = { x: 3, y: 3, size: 62, rx: 17.55, strokeWidth: 6 };
const RIVET_R_D =
	"M28.9979 19.7671C28.9979 19.3436 28.6541 19 28.2308 19H22.4809C20.5597 19 19 20.5597 19 22.4807V45.5125C19 47.4335 20.5597 48.9935 22.4809 48.9935H28.2308C28.6541 48.9935 28.9979 48.6496 28.9979 48.2263V19.7671ZM45.6293 38.7439C44.7861 37.231 42.8732 36.0028 41.3604 36.0028H32.5577C32.0922 36.0028 31.9249 36.3807 32.1843 36.8462L37.4298 46.2586C38.273 47.7717 40.1858 49 41.6987 49H50.5012C50.9667 49 51.1342 48.6221 50.8745 48.1563L45.6293 38.7439ZM45.9963 25.9983C45.9963 22.1359 42.8604 19 38.9977 19H32.8227C32.3682 19 31.9994 19.3688 31.9994 19.8233V32.1734C31.9994 32.6278 32.3682 32.9969 32.8227 32.9969H38.9977C42.8604 32.9969 45.9963 29.861 45.9963 25.9983Z";

/**
 * Control plane: the Rivet mark stamped on the face. Drawn in the plate's
 * local space so the iso matrix squashes it with the surface.
 */
const ControlPlaneMotif = () => {
	const mark = 46;
	const k = mark / 68;
	return (
		<g transform={`translate(${-mark / 2} ${-mark / 2}) scale(${k})`}>
			<Stamp scale={k}>
				<rect
					x={RIVET_RING.x}
					y={RIVET_RING.y}
					width={RIVET_RING.size}
					height={RIVET_RING.size}
					rx={RIVET_RING.rx}
					fill="none"
					stroke="currentColor"
					strokeWidth={RIVET_RING.strokeWidth}
				/>
				<path d={RIVET_R_D} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
			</Stamp>
		</g>
	);
};

/** Storage: a database glyph stamped on the face, the same way. */
const StorageMotif = () => {
	const [w, h, , , d] = faDatabase.icon;
	const height = 44;
	const k = height / h;
	return (
		<g transform={`translate(${(-w * k) / 2} ${-height / 2}) scale(${k})`}>
			<Stamp scale={k} rim={1.5}>
				<path d={d as string} fill="currentColor" />
			</Stamp>
		</g>
	);
};

// --- Plate -------------------------------------------------------------------

const Plate = ({
	clipId,
	children,
}: {
	clipId: string;
	/** Motif drawn on the face. Wrapped in `IsoMotif` when it lives in local space. */
	children: React.ReactNode;
}) => (
	<svg
		viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
		className="block h-auto w-full"
		aria-hidden="true"
	>
		<defs>
			<clipPath id={clipId}>
				<rect x={-S} y={-S} width={2 * S} height={2 * S} rx={PLATE_R} />
			</clipPath>
		</defs>
		{/* Extruded side walls, painted under the top face. The face is opaque
		    surface under a faint ink wash so the plate beneath cannot show
		    through where the deck overlaps. */}
		<g transform={`matrix(1 0.5 -1 0.5 ${CX} ${CY})`}>
			<path d={PLATE_LEFT_SIDE_D} style={{ fill: "rgb(var(--site-surface, 255 255 255))" }} />
			<path d={PLATE_RIGHT_SIDE_D} style={{ fill: "rgb(var(--site-surface, 255 255 255))" }} />
			<path d={PLATE_LEFT_SIDE_D} style={{ fill: ink(0.12) }} />
			<path d={PLATE_RIGHT_SIDE_D} style={{ fill: ink(0.2) }} />
			<path
				d={PLATE_SIDE_OUTLINE_D}
				fill="none"
				style={{ stroke: ink(0.25) }}
				vectorEffect="non-scaling-stroke"
			/>
			<rect
				x={-S}
				y={-S}
				width={2 * S}
				height={2 * S}
				rx={PLATE_R}
				style={{ fill: "rgb(var(--site-surface, 255 255 255))" }}
			/>
			<rect
				x={-S}
				y={-S}
				width={2 * S}
				height={2 * S}
				rx={PLATE_R}
				style={{ fill: ink(0.05), stroke: ink(0.25) }}
				vectorEffect="non-scaling-stroke"
			/>
		</g>
		{children}
		{/* Leader: dot on the front edge, hairline out to the card. */}
		<circle cx={DOT_X} cy={DOT_Y} r={3} style={{ fill: ink(0.45) }} />
		<line
			x1={DOT_X + 5}
			y1={DOT_Y}
			x2={VIEW_W}
			y2={DOT_Y}
			style={{ stroke: ink(0.25) }}
			vectorEffect="non-scaling-stroke"
		/>
	</svg>
);

/** Wraps a motif authored in the plate's local (u, v) space and clips it to the face. */
const IsoMotif = ({ clipId, children }: { clipId: string; children: React.ReactNode }) => (
	<g transform={`matrix(1 0.5 -1 0.5 ${CX} ${CY})`}>
		<g clipPath={`url(#${clipId})`}>{children}</g>
	</g>
);

// --- Cards -------------------------------------------------------------------

const Pill = ({ children }: { children: React.ReactNode }) => (
	<span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded border border-ink/10 bg-white/75 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-ink-soft">
		{children}
	</span>
);

const StorageBadge = ({
	label,
	imageSrc,
	imageClassName = "h-3.5 w-3.5",
}: {
	label: string;
	imageSrc: string;
	imageClassName?: string;
}) => (
	<Pill>
		<img
			src={imageSrc}
			alt=""
			aria-hidden="true"
			className={`shrink-0 object-contain ${imageClassName}`}
		/>
		<span className="truncate text-ink">{label}</span>
	</Pill>
);

/** A quiet outlined tile, one per Actor type or runtime, so the row reads as one set. */
const RuntimeTile = ({ children }: { children: React.ReactNode }) => (
	<span className="flex size-6 shrink-0 items-center justify-center rounded-[34.375%] border border-ink/10 bg-paper text-ink-soft">
		{children}
	</span>
);

/**
 * The Actor types the worker hosts, then the runtimes it hosts them on. All in
 * the same monochrome tile so the marks and the language glyphs share one
 * rhythm; the marks are masked and painted in the tile's text color. The two
 * groups are separated by spacing only, so the runtimes can wrap to a second
 * line in the narrow card without stranding a divider.
 */
const WorkerRuntimes = () => (
	<div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
		<div className="flex items-center gap-1">
			{ACTOR_TYPES.map((type) => {
				const logo = productLogos[type.id];
				return logo ? (
					<RuntimeTile key={type.id}>
						<span
							aria-hidden="true"
							style={wordmarkMaskStyle(logo.src)}
							className="inline-block size-3.5 bg-current"
						/>
					</RuntimeTile>
				) : null;
			})}
		</div>
		<div className="flex items-center gap-1">
			<RuntimeTile>
				<Icon icon={faNodeJs} className="size-3.5" />
			</RuntimeTile>
			<RuntimeTile>
				{/* The Rust gear fills its box; a step down keeps it level with the Node hexagon. */}
				<Icon icon={faRust} className="size-3" />
			</RuntimeTile>
		</div>
	</div>
);

const LayerRow = ({
	title,
	detail,
	zIndex,
	plate,
	children,
}: {
	title: string;
	detail?: string;
	/** Upper rows paint over lower ones, so the deck occludes top-down. */
	zIndex: number;
	plate: React.ReactNode;
	children?: React.ReactNode;
}) => (
	<div className="relative flex items-center" style={{ zIndex }}>
		{/* The plate bleeds above and below its row, so neighbouring plates
		    overlap by that bleed while the cards keep their own spacing. */}
		<div className="-my-3 w-40 shrink-0 sm:-my-4 sm:w-56 md:-my-5 md:w-64">{plate}</div>
		<div className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-white/70 px-3.5 py-3">
			<p className="text-sm font-medium text-ink">{title}</p>
			{detail && <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{detail}</p>}
			{children}
		</div>
	</div>
);

const DEPLOYMENT_BOUNDARY_DESCRIPTION =
	"In your VPC, on-prem, air-gapped, or embedded: a Rivet Worker running your agents, workflows, sandboxes, and dynamic apps on Node.js or Rust; the Rivet Control Plane scheduling, routing, and observing them; and Postgres or FoundationDB underneath, tiered to S3.";

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
		className={`dbd-figure relative isolate flex flex-col overflow-hidden rounded-xl border border-dashed border-ink/25 bg-white/55 p-4 md:p-5 ${className ?? ""}`}
	>
		<style>{`
			.dbd-figure [data-stack-grid] {
				background-color: ${ink(0.055)};
				opacity: .72;
			}
			.dbd-figure [data-stack-grid]::after {
				content: "";
				position: absolute;
				inset: 0;
				background-image:
					linear-gradient(to right, ${ink(0.08)} 1px, transparent 1px),
					linear-gradient(to bottom, ${ink(0.08)} 1px, transparent 1px);
				background-size: 32px 32px;
				background-repeat: round;
				-webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
				mask-image: linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
			}
		`}</style>
		{/* The hairline grid from the old stack figure, under everything. */}
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
			data-stack-grid=""
		/>
		<p className="text-sm font-medium leading-relaxed text-ink">
			In your VPC, on-prem, air-gapped, or embedded.
		</p>

		<div className="mt-3 flex flex-1 flex-col justify-center gap-2 py-3 sm:py-4 md:py-5">
			<LayerRow
				title="Rivet Worker"
				detail="Your code, using the Rivet SDK"
				zIndex={3}
				plate={
					<Plate clipId="dbd-face-worker">
						<IsoMotif clipId="dbd-face-worker">
							<WorkerMotif />
						</IsoMotif>
					</Plate>
				}
			>
				<WorkerRuntimes />
			</LayerRow>

			<LayerRow
				title="Rivet Control Plane"
				zIndex={2}
				plate={
					<Plate clipId="dbd-face-control">
						<IsoMotif clipId="dbd-face-control">
							<ControlPlaneMotif />
						</IsoMotif>
					</Plate>
				}
			>
				<div className="mt-2 flex flex-wrap gap-1.5">
					<Pill>Scheduling</Pill>
					<Pill>Routing</Pill>
					<Pill>Observability</Pill>
				</div>
			</LayerRow>

			<LayerRow
				title="Durable storage"
				detail="Postgres or FoundationDB for persistence, tiered to S3"
				zIndex={1}
				plate={
					<Plate clipId="dbd-face-storage">
						<IsoMotif clipId="dbd-face-storage">
							<StorageMotif />
						</IsoMotif>
					</Plate>
				}
			>
				<div className="mt-2 flex flex-wrap gap-1.5">
					<StorageBadge label="Postgres" imageSrc={postgresLogo.src} />
					<StorageBadge
						label="FoundationDB"
						imageSrc={foundationDbLogo.src}
						imageClassName="h-3.5 w-5"
					/>
					<StorageBadge label="S3" imageSrc="/images/registry/s3.svg" />
				</div>
			</LayerRow>
		</div>
	</div>
);
