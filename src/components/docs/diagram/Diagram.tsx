/**
 * `<Diagram>`: the shared architecture diagram for docs and guides.
 *
 * Every architecture diagram on the site is drawn from the same parts, so they
 * share one style: white nodes on hairlines, product tiles for Rivet libraries,
 * stacked cards for "one per key", numbered call order, a dotted connector for
 * optional parts, and a legend generated from what the diagram uses. Colors are
 * site tokens with the light palette as fallback, so dark mode needs no remap.
 *
 * Authors describe the diagram as data and place nodes on a pixel grid. Edges
 * connect nodes by id and route themselves; `via`, offsets, and `labelAt` adjust
 * a route or label when the default placement is not the clearest.
 *
 *     <Diagram
 *       id="personal-agent"
 *       label="Twilio posts each text to your server, which calls the user's agent."
 *       stackLabel="One per phone number"
 *       nodes={[
 *         { id: "twilio", x: 20, y: 150, w: 150, title: "Twilio", subtitle: "SMS and Verify" },
 *         { id: "assistant", x: 600, y: 150, product: "agents", stack: true, title: "`assistant`" },
 *       ]}
 *       edges={[{ from: "twilio", to: "assistant", label: "`submit`", step: 1 }]}
 *     />
 *
 * Text fields accept backticks for code: "`onAnswer` texts the reply".
 */
import {
	faBox,
	faBrowser,
	faChartLine,
	faClock,
	faCube,
	faDatabase,
	faDesktop,
	faEnvelope,
	faFolder,
	faGithub,
	faKey,
	faMicrophone,
	faPhone,
	faServer,
	faSlack,
	faSparkles,
	faUser,
	faWebhook,
} from "@rivet-gg/icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ReactNode } from "react";
import actorsMark from "@/images/products/actors-logo.svg?raw";
import agentosMark from "@/images/products/agentos-logo.svg?raw";
import agentsMark from "@/images/products/agents-logo.svg?raw";
import dynamicAppsMark from "@/images/products/dynamic-apps-logo.svg?raw";
import sandboxAgentMark from "@/images/products/sandbox-agent-logo.svg?raw";
import secureExecMark from "@/images/products/secure-exec-logo.svg?raw";
import workflowsMark from "@/images/products/workflows-logo.svg?raw";

export type DiagramProduct =
	| "actors"
	| "agents"
	| "agentos"
	| "workflows"
	| "dynamic-apps"
	| "sandbox-agent"
	| "secure-exec";

type Point = [number, number];
type Side = "left" | "right" | "top" | "bottom";

export interface DiagramNode {
	id: string;
	x: number;
	y: number;
	/** Defaults to 170. */
	w?: number;
	/** Defaults to 60. */
	h?: number;
	/**
	 * - `node` (default): a component, service, or library.
	 * - `group`: a container drawn behind the nodes placed inside it, titled at the top.
	 * - `slot`: a small inner part of a group, such as a route or a handler.
	 * - `boundary`: a dashed deployment or machine boundary with an uppercase label.
	 */
	kind?: "node" | "group" | "slot" | "boundary";
	title?: string;
	subtitle?: string;
	/** Product tile in the top-left corner. Use it for every Rivet library in the diagram. */
	product?: DiagramProduct;
	/** Draws the node as a stack of cards: one instance per key. Name the key with `stackLabel`. */
	stack?: boolean;
	/** Dashed outline and muted text for a part the reader may leave out. */
	optional?: boolean;
	/** Pale fill for the one node the reader should look at first. */
	highlight?: boolean;
}

export interface DiagramEdge {
	from: string;
	to: string;
	fromSide?: Side;
	toSide?: Side;
	/** Shifts the start along its side, in pixels from the side's center. */
	fromOffset?: number;
	/** Shifts the end along its side, in pixels from the side's center. */
	toOffset?: number;
	/** Corner points between the start and the end, for routes around other nodes. */
	via?: Point[];
	label?: string;
	/** Baseline position of the label. Defaults to just above the longest segment. */
	labelAt?: Point;
	labelAnchor?: "start" | "middle" | "end";
	/** Call-order badge, drawn left of the label. */
	step?: number;
	stepAt?: Point;
	/**
	 * - `call` (default): a request in the direction of the arrow.
	 * - `reply`: a response or callback, dashed.
	 * - `optional`: a dotted connector to an optional part, with no arrowhead.
	 */
	kind?: "call" | "reply" | "optional";
	/** Arrowheads at both ends. */
	both?: boolean;
}

export interface DiagramNote {
	x: number;
	y: number;
	text: string;
	anchor?: "start" | "middle" | "end";
}

export type DiagramLegendItem = "stack" | DiagramProduct | "call" | "reply" | "optional";

export interface DiagramProps {
	/** Unique per page. Prefixes marker ids. */
	id: string;
	/** Screen-reader description of the whole diagram, including the call order. */
	label: string;
	nodes: DiagramNode[];
	edges?: DiagramEdge[];
	notes?: DiagramNote[];
	/** What one stacked card stands for, such as "One per phone number". */
	stackLabel?: string;
	/** Defaults to the items the diagram uses. Pass `false` to hide the legend. */
	legend?: DiagramLegendItem[] | false;
	/** Override the computed canvas size. */
	width?: number;
	height?: number;
	/** Below this width the diagram scrolls sideways instead of shrinking. */
	minWidth?: number;
}

const C = {
	ink: "rgb(var(--site-ink, 27 25 22))",
	inkSoft: "rgb(var(--site-ink-soft, 86 82 74))",
	inkFaint: "rgb(var(--site-ink-faint, 138 133 120))",
	stack: "rgb(var(--site-ink, 27 25 22) / 0.3)",
	surface: "rgb(var(--site-surface, 255 255 255))",
	region: "rgb(var(--site-paper-mid, 243 241 236))",
	boundary: "rgb(var(--site-paper-mid, 250 248 243))",
	tint: "rgb(var(--site-pine, 46 64 52) / 0.12)",
	pine: "rgb(var(--site-pine, 46 64 52))",
	badgeText: "rgb(var(--site-paper, 255 255 255))",
};
const SANS = "system-ui, sans-serif";
const MONO = "ui-monospace, monospace";
const STACK_OFFSET = 6;
const STACK_DEPTH = 2;

const PRODUCTS: Record<DiagramProduct, { color: string; name: string; mark: string }> = {
	actors: { color: "#5B5D63", name: "Rivet Actor", mark: actorsMark },
	agents: { color: "#2C5A7A", name: "Agent", mark: agentsMark },
	agentos: { color: "#9C3A3F", name: "agentOS VM", mark: agentosMark },
	workflows: { color: "#6A4C93", name: "Workflow", mark: workflowsMark },
	"dynamic-apps": { color: "#2F6B4B", name: "Dynamic App", mark: dynamicAppsMark },
	"sandbox-agent": { color: "#8A4B2E", name: "Sandbox Agent", mark: sandboxAgentMark },
	"secure-exec": { color: "#1B1916", name: "Secure Exec", mark: secureExecMark },
};

function markInner(svg: string) {
	return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

interface Run {
	text: string;
	mono: boolean;
}

/** Splits "`code` prose" into runs so code renders in monospace. */
function runs(text: string): Run[] {
	return text
		.split("`")
		.map((part, index) => ({ text: part, mono: index % 2 === 1 }))
		.filter((run) => run.text.length > 0);
}

/** Approximate rendered width, good enough for layout and legend spacing. */
function textWidth(text: string, size: number) {
	return runs(text).reduce((sum, run) => sum + run.text.length * (run.mono && size >= 13 ? size - 1 : size) * (run.mono ? 0.6 : 0.5), 0);
}

function RichText(props: {
	x: number;
	y: number;
	text: string;
	size: number;
	fill: string;
	weight?: number;
	anchor?: "start" | "middle" | "end";
}) {
	const parts = runs(props.text);
	return (
		<text
			x={props.x}
			y={props.y}
			fontSize={props.size}
			fontWeight={props.weight}
			fill={props.fill}
			textAnchor={props.anchor ?? "middle"}
			fontFamily={SANS}
		>
			{parts.map((run, index) => (
				<tspan
					// biome-ignore lint/suspicious/noArrayIndexKey: runs are static text.
					key={index}
					fontFamily={run.mono ? MONO : undefined}
					fontSize={run.mono && props.size >= 13 ? props.size - 1 : undefined}
				>
					{run.text}
				</tspan>
			))}
		</text>
	);
}

function size(node: DiagramNode) {
	return { w: node.w ?? 170, h: node.h ?? 60 };
}

/** The node's outline including stacked cards, which extend right and down. */
function extent(node: DiagramNode) {
	const { w, h } = size(node);
	const extra = node.stack ? STACK_OFFSET * STACK_DEPTH : 0;
	return { left: node.x, top: node.y, right: node.x + w + extra, bottom: node.y + h + extra };
}

function pickSides(a: DiagramNode, b: DiagramNode): [Side, Side] {
	const ea = extent(a);
	const eb = extent(b);
	if (eb.left >= ea.right) return ["right", "left"];
	if (eb.right <= ea.left) return ["left", "right"];
	if (eb.top >= ea.bottom) return ["bottom", "top"];
	return ["top", "bottom"];
}

function anchor(node: DiagramNode, side: Side, offset = 0): Point {
	const { w, h } = size(node);
	const e = extent(node);
	switch (side) {
		case "left":
			return [e.left, node.y + h / 2 + offset];
		case "right":
			return [e.right, node.y + h / 2 + offset];
		case "top":
			return [node.x + w / 2 + offset, e.top];
		case "bottom":
			return [node.x + w / 2 + offset, e.bottom];
	}
}

/** Moves a point toward the previous one, so an arrowhead stops short of the node edge. */
function pullBack(point: Point, toward: Point, distance: number): Point {
	const dx = toward[0] - point[0];
	const dy = toward[1] - point[1];
	const length = Math.hypot(dx, dy) || 1;
	return [point[0] + (dx / length) * distance, point[1] + (dy / length) * distance];
}

function route(edge: DiagramEdge, from: DiagramNode, to: DiagramNode): Point[] {
	const [autoFrom, autoTo] = pickSides(from, to);
	const start = anchor(from, edge.fromSide ?? autoFrom, edge.fromOffset);
	const end = anchor(to, edge.toSide ?? autoTo, edge.toOffset);
	let points: Point[];
	if (edge.via) {
		points = [start, ...edge.via, end];
	} else if (start[0] === end[0] || start[1] === end[1]) {
		points = [start, end];
	} else if ((edge.fromSide ?? autoFrom) === "left" || (edge.fromSide ?? autoFrom) === "right") {
		const midX = Math.round((start[0] + end[0]) / 2);
		points = [start, [midX, start[1]], [midX, end[1]], end];
	} else {
		const midY = Math.round((start[1] + end[1]) / 2);
		points = [start, [start[0], midY], [end[0], midY], end];
	}
	points[points.length - 1] = pullBack(points[points.length - 1], points[points.length - 2], 2);
	if (edge.both || edge.kind === "optional") {
		points[0] = pullBack(points[0], points[1], 2);
	}
	return points;
}

function longestSegment(points: Point[]): [Point, Point] {
	let best: [Point, Point] = [points[0], points[1]];
	let bestLength = -1;
	for (let i = 1; i < points.length; i++) {
		const length = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
		if (length > bestLength) {
			bestLength = length;
			best = [points[i - 1], points[i]];
		}
	}
	return best;
}

interface PlacedLabel {
	x: number;
	y: number;
	anchor: "start" | "middle" | "end";
	text: string;
}

function placeLabel(edge: DiagramEdge, points: Point[]): PlacedLabel | undefined {
	if (!edge.label) return undefined;
	if (edge.labelAt) {
		return { x: edge.labelAt[0], y: edge.labelAt[1], anchor: edge.labelAnchor ?? "middle", text: edge.label };
	}
	const [a, b] = longestSegment(points);
	if (a[1] === b[1]) {
		return { x: Math.round((a[0] + b[0]) / 2), y: a[1] - 8, anchor: edge.labelAnchor ?? "middle", text: edge.label };
	}
	return { x: a[0] + 10, y: Math.round((a[1] + b[1]) / 2) + 4, anchor: edge.labelAnchor ?? "start", text: edge.label };
}

/** Gap from a step badge's center to the start of its label. */
const BADGE_GAP = 14;

/**
 * Places the step badge left of its label. A centered label is re-anchored to
 * start just after the badge, so badge and label center as one unit and the
 * badge never overlaps the text, whatever font the browser picks.
 */
function placeStep(
	edge: DiagramEdge,
	label: PlacedLabel | undefined,
	points: Point[],
): { step?: Point; label?: PlacedLabel } {
	if (edge.step === undefined) return { label };
	if (edge.stepAt) return { step: edge.stepAt, label };
	if (label) {
		if (label.anchor === "start") return { step: [label.x - BADGE_GAP, label.y - 4], label };
		const width = textWidth(label.text, 12);
		if (label.anchor === "end") return { step: [Math.round(label.x - width - BADGE_GAP), label.y - 4], label };
		const left = Math.round(label.x - (width + BADGE_GAP + 9) / 2 + 9);
		return { step: [left, label.y - 4], label: { ...label, x: left + BADGE_GAP, anchor: "start" } };
	}
	const [a, b] = longestSegment(points);
	return { step: [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2)] };
}

function Badge({ at, n }: { at: Point; n: number }) {
	return (
		<g>
			<circle cx={at[0]} cy={at[1]} r={9} fill={C.ink} />
			<text x={at[0]} y={at[1] + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.badgeText} fontFamily={SANS}>
				{n}
			</text>
		</g>
	);
}

function ProductTile({ product, x, y, size: s }: { product: DiagramProduct; x: number; y: number; size: number }) {
	const { color, mark } = PRODUCTS[product];
	return (
		<svg x={x} y={y} width={s} height={s} viewBox="0 0 128 128" aria-hidden="true">
			{/* Inline style, not a fill attribute: theme.css remaps vendored diagrams by fill hex, which would retint Secure Exec ink. */}
			<rect width={128} height={128} rx={44} style={{ fill: color }} />
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: the marks are local, trusted SVG files. */}
			<g fill="none" dangerouslySetInnerHTML={{ __html: markInner(mark) }} />
		</svg>
	);
}

function NodeShape({ node }: { node: DiagramNode }) {
	const { w, h } = size(node);
	const kind = node.kind ?? "node";
	const cx = node.x + w / 2;
	const cy = node.y + h / 2;

	if (kind === "boundary") {
		return (
			<g>
				<rect x={node.x} y={node.y} width={w} height={h} rx={10} fill={C.boundary} stroke={C.pine} strokeWidth={1.4} strokeDasharray="7 6" />
				{node.title && (
					<text x={node.x + 16} y={node.y + 22} fontSize={11} fontFamily={MONO} fontWeight={600} letterSpacing="0.14em" fill={C.pine}>
						{node.title.toUpperCase()}
					</text>
				)}
			</g>
		);
	}

	if (kind === "group") {
		return (
			<g>
				<rect x={node.x} y={node.y} width={w} height={h} rx={9} fill={C.region} stroke={C.ink} strokeWidth={1.4} />
				{node.title && <RichText x={cx} y={node.y + 22} text={node.title} size={13} weight={600} fill={C.ink} />}
				{node.subtitle && <RichText x={cx} y={node.y + 38} text={node.subtitle} size={12} fill={C.inkSoft} />}
			</g>
		);
	}

	if (kind === "slot") {
		return (
			<g>
				<rect x={node.x} y={node.y} width={w} height={h} rx={6} fill={C.surface} stroke={C.inkFaint} strokeWidth={1.2} />
				{node.title && <RichText x={cx} y={cy + 4} text={node.title} size={12} fill={C.ink} />}
			</g>
		);
	}

	const stroke = node.optional ? C.inkFaint : C.ink;
	const fill = node.highlight ? C.tint : C.surface;
	const tileSize = h >= 56 ? 28 : 20;
	const textX = node.product ? cx + 20 : cx;
	const titleY = node.subtitle ? cy - 3 : cy + 5;
	return (
		<g>
			{node.stack &&
				Array.from({ length: STACK_DEPTH }, (_, i) => STACK_DEPTH - i).map((depth) => (
					<rect
						key={depth}
						x={node.x + depth * STACK_OFFSET}
						y={node.y + depth * STACK_OFFSET}
						width={w}
						height={h}
						rx={7}
						fill={C.surface}
						stroke={C.stack}
						strokeWidth={1.2}
					/>
				))}
			<rect
				x={node.x}
				y={node.y}
				width={w}
				height={h}
				rx={7}
				fill={fill}
				stroke={stroke}
				strokeWidth={1.4}
				strokeDasharray={node.optional ? "5 4" : undefined}
			/>
			{node.product && <ProductTile product={node.product} x={node.x + 13} y={node.y + 16} size={tileSize} />}
			{node.title && (
				<RichText x={textX} y={titleY} text={node.title} size={14} weight={600} fill={node.optional ? C.inkSoft : C.ink} />
			)}
			{node.subtitle && (
				<RichText x={textX} y={cy + 16} text={node.subtitle} size={12} fill={node.optional ? C.inkFaint : C.inkSoft} />
			)}
		</g>
	);
}

const LEGEND_NAMES: Record<"call" | "reply" | "optional", string> = {
	call: "Call",
	reply: "Reply",
	optional: "Optional",
};

function legendItems(props: DiagramProps): DiagramLegendItem[] {
	if (props.legend === false) return [];
	if (props.legend) return props.legend;
	const items: DiagramLegendItem[] = [];
	if (props.nodes.some((node) => node.stack)) items.push("stack");
	for (const product of Object.keys(PRODUCTS) as DiagramProduct[]) {
		if (props.nodes.some((node) => node.product === product)) items.push(product);
	}
	const edges = props.edges ?? [];
	if (edges.some((edge) => (edge.kind ?? "call") === "call")) items.push("call");
	if (edges.some((edge) => edge.kind === "reply")) items.push("reply");
	if (edges.some((edge) => edge.kind === "optional") || props.nodes.some((node) => node.optional)) items.push("optional");
	return items;
}

function Legend({ items, y, stackLabel, markerId }: { items: DiagramLegendItem[]; y: number; stackLabel: string; markerId: string }) {
	let x = 20;
	const parts = items.map((item) => {
		const start = x;
		let icon: ReactNode;
		let text: string;
		let iconWidth: number;
		if (item === "stack") {
			iconWidth = 24;
			text = stackLabel;
			icon = (
				<g>
					<rect x={start + 8} y={y - 15} width={16} height={12} rx={3} fill={C.surface} stroke={C.stack} strokeWidth={1} />
					<rect x={start + 4} y={y - 19} width={16} height={12} rx={3} fill={C.surface} stroke={C.stack} strokeWidth={1} />
					<rect x={start} y={y - 23} width={16} height={12} rx={3} fill={C.surface} stroke={C.ink} strokeWidth={1.2} />
				</g>
			);
		} else if (item === "call" || item === "reply") {
			iconWidth = 30;
			text = LEGEND_NAMES[item];
			icon = (
				<line
					x1={start}
					y1={y - 4}
					x2={start + 30}
					y2={y - 4}
					stroke={C.ink}
					strokeWidth={1.4}
					strokeDasharray={item === "reply" ? "5 4" : undefined}
					markerEnd={`url(#${markerId})`}
				/>
			);
		} else if (item === "optional") {
			iconWidth = 30;
			text = LEGEND_NAMES.optional;
			icon = (
				<line x1={start} y1={y - 4} x2={start + 30} y2={y - 4} stroke={C.inkFaint} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="0.1 6" />
			);
		} else {
			iconWidth = 18;
			text = PRODUCTS[item].name;
			icon = <ProductTile product={item} x={start} y={y - 13} size={18} />;
		}
		const textX = start + iconWidth + 8 + (item === "stack" ? 2 : 0);
		x = textX + textWidth(text, 12) * 1.08 + 26;
		return (
			<g key={item}>
				{icon}
				<text x={textX} y={y} fontSize={12} fill={C.inkSoft} fontFamily={SANS}>
					{text}
				</text>
			</g>
		);
	});
	return { node: <g>{parts}</g>, right: x - 26 };
}

export function Diagram(props: DiagramProps) {
	const byId = new Map(props.nodes.map((node) => [node.id, node]));
	const markerId = `${props.id}-arrow`;
	const edges = (props.edges ?? []).map((edge) => {
		const from = byId.get(edge.from);
		const to = byId.get(edge.to);
		if (!from || !to) {
			throw new Error(`<Diagram id="${props.id}">: edge ${edge.from} -> ${edge.to} names a node that does not exist`);
		}
		const points = route(edge, from, to);
		const { step, label } = placeStep(edge, placeLabel(edge, points), points);
		return { edge, points, label, step };
	});

	// Content bounds: nodes, routes, labels, notes.
	let right = 0;
	let bottom = 0;
	for (const node of props.nodes) {
		const e = extent(node);
		right = Math.max(right, e.right);
		bottom = Math.max(bottom, e.bottom);
	}
	for (const { points, label } of edges) {
		for (const [px, py] of points) {
			right = Math.max(right, px);
			bottom = Math.max(bottom, py);
		}
		if (label) {
			const width = textWidth(label.text, 12);
			const labelRight = label.anchor === "start" ? label.x + width : label.anchor === "middle" ? label.x + width / 2 : label.x;
			right = Math.max(right, labelRight);
			bottom = Math.max(bottom, label.y + 4);
		}
	}
	for (const note of props.notes ?? []) {
		right = Math.max(right, note.x + (note.anchor === "start" || !note.anchor ? textWidth(note.text, 12) : 0));
		bottom = Math.max(bottom, note.y + 4);
	}

	const items = legendItems(props);
	const legendY = bottom + 31;
	const legend = items.length > 0 ? Legend({ items, y: legendY, stackLabel: props.stackLabel ?? "One per key", markerId }) : undefined;
	const width = props.width ?? Math.ceil(Math.max(right, legend?.right ?? 0) + 15);
	const height = props.height ?? Math.ceil((legend ? legendY : bottom) + 11);
	const minWidth = props.minWidth ?? (width > 640 ? Math.round(width * 0.83) : undefined);

	const regions = props.nodes.filter((node) => node.kind === "boundary" || node.kind === "group");
	const parts = props.nodes.filter((node) => node.kind !== "boundary" && node.kind !== "group");

	return (
		<div className="not-prose" style={{ overflowX: "auto" }} data-diagram={props.id}>
			<svg
				viewBox={`0 0 ${width} ${height}`}
				role="img"
				aria-label={props.label}
				style={{
					width: "100%",
					minWidth: minWidth ? `${minWidth}px` : undefined,
					maxWidth: `${width}px`,
					height: "auto",
					display: "block",
					margin: "2.5rem auto",
					fontFamily: SANS,
				}}
			>
				<defs>
					<marker id={markerId} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
						<path d="M0 0 L10 5 L0 10 z" fill={C.ink} />
					</marker>
				</defs>
				{regions.map((node) => (
					<NodeShape key={node.id} node={node} />
				))}
				{edges.map(({ edge, points }) => {
					const d = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px} ${py}`).join(" ");
					if (edge.kind === "optional") {
						return (
							<path
								key={`${edge.from}-${edge.to}`}
								d={d}
								fill="none"
								stroke={C.inkFaint}
								strokeWidth={2.2}
								strokeLinecap="round"
								strokeDasharray="0.1 6"
							/>
						);
					}
					return (
						<path
							key={`${edge.from}-${edge.to}`}
							d={d}
							fill="none"
							stroke={C.ink}
							strokeWidth={1.4}
							strokeDasharray={edge.kind === "reply" ? "5 4" : undefined}
							markerEnd={`url(#${markerId})`}
							markerStart={edge.both ? `url(#${markerId})` : undefined}
						/>
					);
				})}
				{parts.map((node) => (
					<NodeShape key={node.id} node={node} />
				))}
				{edges.map(({ edge, label, step }) => (
					<g key={`${edge.from}-${edge.to}-label`}>
						{label && <RichText x={label.x} y={label.y} text={label.text} size={12} fill={C.inkSoft} anchor={label.anchor} />}
						{step && edge.step !== undefined && <Badge at={step} n={edge.step} />}
					</g>
				))}
				{(props.notes ?? []).map((note) => (
					<RichText key={`${note.x}-${note.y}`} x={note.x} y={note.y} text={note.text} size={12} fill={C.inkSoft} anchor={note.anchor ?? "start"} />
				))}
				{legend?.node}
			</svg>
		</div>
	);
}

/**
 * Icons for nodes that are not Rivet libraries, picked from the node's text.
 * Only the mini view uses them, where there is no room for titles. The first
 * matching rule wins, so specific names come before generic ones.
 */
const MINI_ICONS: [RegExp, IconDefinition][] = [
	[/slack/, faSlack],
	[/github|linear/, faGithub],
	[/twilio|sms|phone|caller/, faPhone],
	[/voice|media|audio/, faMicrophone],
	[/email/, faEnvelope],
	[/llm|model|openai|anthropic|codex|claude|cursor api|amp service/, faSparkles],
	[/sandbox|e2b|daytona|freestyle|browserbase/, faBox],
	[/sqlite|database|postgres|table|state|vector/, faDatabase],
	[/s3|bucket|storage|pypi|registry/, faFolder],
	[/cron|schedule|timer/, faClock],
	[/webhook|stripe|provider/, faWebhook],
	[/oauth|auth|token|jwt/, faKey],
	[/telemetry|trace|metric/, faChartLine],
	[/browser|website|visitor|page/, faBrowser],
	[/user|client|player|approver|editor|chat|caller|customer|remote agent|mcp/, faUser],
	[/app|dashboard|portal|ui|builder/, faDesktop],
	[/api|server|backend|cms|service|worker|vercel|rivet/, faServer],
];

function miniIcon(node: DiagramNode): IconDefinition {
	const text = `${node.title ?? ""} ${node.subtitle ?? ""}`.toLowerCase();
	return MINI_ICONS.find(([pattern]) => pattern.test(text))?.[1] ?? faCube;
}

function MiniIcon({ icon, cx, cy, size: s, fill }: { icon: IconDefinition; cx: number; cy: number; size: number; fill: string }) {
	const [w, h, , , path] = icon.icon;
	return (
		<svg x={cx - s / 2} y={cy - s / 2} width={s} height={s} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
			{(Array.isArray(path) ? path : [path]).map((d) => (
				<path key={d.slice(0, 16)} d={d} fill={fill} />
			))}
		</svg>
	);
}

/**
 * A thumbnail of a `<Diagram>` for cards: the same layout and routes, with
 * every node reduced to its icon (the product tile for Rivet libraries) and no
 * labels, steps, or legend. Pass the same `nodes` and `edges` as the diagram.
 */
export function DiagramMini({ id, nodes, edges = [] }: Pick<DiagramProps, "id" | "nodes" | "edges">) {
	const byId = new Map(nodes.map((node) => [node.id, node]));
	const markerId = `${id}-mini-arrow`;
	const routes = edges.flatMap((edge) => {
		const from = byId.get(edge.from);
		const to = byId.get(edge.to);
		return from && to ? [{ edge, points: route(edge, from, to) }] : [];
	});
	let left = Number.POSITIVE_INFINITY;
	let top = Number.POSITIVE_INFINITY;
	let right = 0;
	let bottom = 0;
	const grow = ([x, y]: Point) => {
		left = Math.min(left, x);
		top = Math.min(top, y);
		right = Math.max(right, x);
		bottom = Math.max(bottom, y);
	};
	for (const node of nodes) {
		const e = extent(node);
		grow([e.left, e.top]);
		grow([e.right, e.bottom]);
	}
	for (const { points } of routes) points.forEach(grow);
	const pad = 12;
	const regions = nodes.filter((node) => node.kind === "boundary" || node.kind === "group");
	const parts = nodes.filter((node) => node.kind !== "boundary" && node.kind !== "group");

	return (
		<svg
			viewBox={`${left - pad} ${top - pad} ${right - left + pad * 2} ${bottom - top + pad * 2}`}
			aria-hidden="true"
			style={{ width: "100%", height: "100%", display: "block" }}
			preserveAspectRatio="xMidYMid meet"
		>
			<defs>
				<marker id={markerId} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
					<path d="M0 0 L10 5 L0 10 z" fill={C.inkSoft} />
				</marker>
			</defs>
			{regions.map((node) => {
				const { w, h } = size(node);
				return node.kind === "boundary" ? (
					<rect key={node.id} x={node.x} y={node.y} width={w} height={h} rx={12} fill={C.boundary} stroke={C.pine} strokeWidth={2.4} strokeDasharray="10 8" />
				) : (
					<rect key={node.id} x={node.x} y={node.y} width={w} height={h} rx={12} fill={C.region} stroke={C.inkFaint} strokeWidth={2.4} />
				);
			})}
			{routes.map(({ edge, points }) => (
				<path
					key={`${edge.from}-${edge.to}`}
					d={points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ")}
					fill="none"
					stroke={edge.kind === "optional" ? C.inkFaint : C.inkSoft}
					strokeWidth={3}
					strokeDasharray={edge.kind === "optional" ? "1 9" : edge.kind === "reply" ? "9 7" : undefined}
					strokeLinecap="round"
					markerEnd={edge.kind === "optional" ? undefined : `url(#${markerId})`}
					markerStart={edge.both ? `url(#${markerId})` : undefined}
				/>
			))}
			{parts.map((node) => {
				const { w, h } = size(node);
				const cx = node.x + w / 2;
				const cy = node.y + h / 2;
				if (node.kind === "slot") {
					return <rect key={node.id} x={node.x} y={node.y} width={w} height={h} rx={8} fill={C.surface} stroke={C.inkFaint} strokeWidth={2.4} />;
				}
				const glyph = h - 10;
				const tile = node.product ? PRODUCTS[node.product] : undefined;
				return (
					<g key={node.id}>
						{node.stack &&
							Array.from({ length: STACK_DEPTH }, (_, i) => STACK_DEPTH - i).map((depth) => (
								<rect
									key={depth}
									x={node.x + depth * STACK_OFFSET}
									y={node.y + depth * STACK_OFFSET}
									width={w}
									height={h}
									rx={10}
									fill={C.surface}
									stroke={C.stack}
									strokeWidth={2.4}
								/>
							))}
						<rect
							x={node.x}
							y={node.y}
							width={w}
							height={h}
							rx={10}
							style={{ fill: tile ? tile.color : C.surface }}
							stroke={tile ? "none" : node.optional ? C.inkFaint : C.ink}
							strokeWidth={2.6}
							strokeDasharray={node.optional ? "8 6" : undefined}
						/>
						{tile ? (
							<svg x={cx - glyph / 2} y={cy - glyph / 2} width={glyph} height={glyph} viewBox="0 0 128 128" aria-hidden="true">
								{/* biome-ignore lint/security/noDangerouslySetInnerHtml: the marks are local, trusted SVG files. */}
								<g fill="none" dangerouslySetInnerHTML={{ __html: markInner(tile.mark) }} />
							</svg>
						) : (
							<MiniIcon icon={miniIcon(node)} cx={cx} cy={cy} size={h - 22} fill={node.optional ? C.inkFaint : C.inkSoft} />
						)}
					</g>
				);
			})}
		</svg>
	);
}
