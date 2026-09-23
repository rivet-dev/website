"use client";

import { faSparkles } from "@rivet-gg/icons";
import { useEffect, useRef } from "react";
import { ArgumentSection } from "./ArgumentSection";

/**
 * Code that exists only at runtime — a script an agent writes mid-task, or a
 * backend a product generates for one user — and where it runs.
 *
 * The figure is flat: three lanes of code stream in from the left into a
 * rounded square with the spark pressed into it, and a steady stream of
 * Actors (a red triangle, a blue circle, or an accent square, dealt so every
 * three show all three) comes out the right. Both edges fade. Drawn on a
 * canvas in theme tokens read from CSS, so it follows light and dark. Under
 * prefers-reduced-motion it holds one frame.
 */

// --- Canvas plumbing ---------------------------------------------------------

interface Colors {
	/** Figure accent (`--runtime-highlight`). */
	hl: (alpha?: number) => string;
	/** Text ink (`--site-ink`), theme aware. */
	ink: (alpha?: number) => string;
	/** Opaque surface (`--site-surface`), for faces that must hide what is behind them. */
	bg: (alpha?: number) => string;
}
type Draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number, c: Colors, cycle: number) => void;

const readColors = (el: HTMLElement): Colors => {
	const style = getComputedStyle(el);
	const hl = style.getPropertyValue("--runtime-highlight").trim() || "183 75 35";
	const ink = style.getPropertyValue("--site-ink").trim() || "27 25 22";
	const bg = style.getPropertyValue("--site-surface").trim() || "255 255 255";
	return {
		hl: (alpha = 1) => `rgb(${hl} / ${alpha})`,
		ink: (alpha = 1) => `rgb(${ink} / ${alpha})`,
		bg: (alpha = 1) => `rgb(${bg} / ${alpha})`,
	};
};

const MONO = 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace';
const SANS = "10px Manrope, ui-sans-serif, system-ui, sans-serif";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
/** Deterministic pseudo-random in [0,1) so every cycle draws the same. */
const hash = (n: number) => {
	const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

const Figure = ({
	draw,
	period,
	restAt,
	heightClass = "h-52",
}: {
	draw: Draw;
	period: number;
	/** Frame held under prefers-reduced-motion. */
	restAt: number;
	heightClass?: string;
}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let w = 0;
		let h = 0;
		const fit = () => {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			const dpr = window.devicePixelRatio || 1;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		fit();
		let colors = readColors(canvas);
		const observer = new ResizeObserver(() => {
			fit();
			draw(ctx, restAt, w, h, colors, 0);
		});
		observer.observe(canvas);
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			draw(ctx, restAt, w, h, colors, 0);
			return () => observer.disconnect();
		}
		const start = performance.now();
		let frame = 0;
		let n = 0;
		const tick = (now: number) => {
			if (++n % 60 === 0) colors = readColors(canvas);
			// The first frame's timestamp can precede `start`; never hand a draw a negative t.
			const elapsed = Math.max(0, now - start);
			draw(ctx, elapsed % period, w, h, colors, Math.floor(elapsed / period));
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [draw, period, restAt]);
	return <canvas ref={ref} aria-hidden="true" className={`block w-full ${heightClass}`} />;
};

// --- The code feed -----------------------------------------------------------

/** Short statements, so the line stays busy. */
const STATEMENTS = [
	"export default handler",
	"const rows = db.query(q)",
	"return json(rows)",
	"const pdf = await fetch(url)",
	"await db.insert({ total })",
	"for (const issue of issues)",
	"const tag = classify(issue)",
	"await label(issue, tag)",
	"app.get('/orders', list)",
	"app.listen()",
	"const posts = await feed()",
	"await mail.send(to, text)",
	"schedule('0 9 * * *', sync)",
	"await sync(accounts)",
];
const KEYWORDS = ["export", "const", "await", "return", "for", "app", "schedule", "default", "async"];

/** The statements on the tape, keyword spans marked. */
interface Segment {
	text: string;
	kw: boolean;
}
const TAPE: Segment[][] = STATEMENTS.map((line) => {
	const segments: Segment[] = [];
	for (const word of line.split(" ")) {
		const kw = KEYWORDS.includes(word.replace(/[^a-z]/gi, ""));
		const last = segments[segments.length - 1];
		if (last && last.kw === kw) last.text += ` ${word}`;
		else {
			if (last) last.text += " ";
			segments.push({ text: word, kw });
		}
	}
	return segments;
});
const TAPE_FONT = `10px ${MONO}`;
/** Belt-units of empty tape between statements. */
const TAPE_GAP = 18;

interface TapeLayout {
	/** Each statement's start offset along the tape. */
	off: number[];
	width: number[];
	/** Per statement, each segment's x offset from the statement start. */
	segX: number[][];
	total: number;
	widest: number;
}
/** Measures the tape with the canvas font, so the layout follows the loaded face. */
const measureTape = (ctx: CanvasRenderingContext2D): TapeLayout => {
	ctx.font = TAPE_FONT;
	const off: number[] = [];
	const width: number[] = [];
	const segX: number[][] = [];
	let a = 0;
	let widest = 0;
	for (const segments of TAPE) {
		const xs: number[] = [];
		let x = 0;
		for (const seg of segments) {
			xs.push(x);
			x += ctx.measureText(seg.text).width;
		}
		off.push(a);
		width.push(x);
		segX.push(xs);
		widest = Math.max(widest, x);
		a += x + TAPE_GAP;
	}
	return { off, width, segX, total: a, widest };
};

/** One statement currently on or near the belt. `q` is its global sequence number. */
interface TapeCopy {
	i: number;
	q: number;
	/** Start of the statement along the belt. */
	a: number;
	width: number;
}
/**
 * The copies whose start lies in [aMin, aMax] at belt position `g`. The tape
 * enters at `aIn` and repeats every `total` units.
 */
const tapeCopies = (layout: TapeLayout, g: number, aIn: number, aMin: number, aMax: number): TapeCopy[] => {
	const out: TapeCopy[] = [];
	const n = TAPE.length;
	for (let i = 0; i < n; i++) {
		const base = aIn + layout.off[i] + g;
		const mLo = Math.max(0, Math.ceil((base - aMax) / layout.total));
		const mHi = Math.floor((base - aMin) / layout.total);
		for (let m = mLo; m <= mHi; m++) {
			out.push({ i, q: m * n + i, a: base - m * layout.total, width: layout.width[i] });
		}
	}
	return out;
};

/** Draws the tape text in the current transform; `y` is the baseline centre. */
const drawTape = (ctx: CanvasRenderingContext2D, layout: TapeLayout, copies: TapeCopy[], y: number, c: Colors) => {
	ctx.font = TAPE_FONT;
	ctx.textBaseline = "middle";
	ctx.textAlign = "left";
	for (const cp of copies) {
		TAPE[cp.i].forEach((seg, j) => {
			ctx.fillStyle = seg.kw ? c.hl(0.95) : c.ink(0.72);
			ctx.fillText(seg.text, cp.a + layout.segX[cp.i][j], y);
		});
	}
};

// --- Shapes. 0 triangle (red), 1 circle (blue), 2 square (accent). ------------

type ShapeKind = 0 | 1 | 2;
/** Dealt in shuffled blocks of three, so every three consecutive Actors show all three kinds and no kind runs more than twice. */
const PERMS: ShapeKind[][] = [
	[0, 1, 2],
	[0, 2, 1],
	[1, 0, 2],
	[1, 2, 0],
	[2, 0, 1],
	[2, 1, 0],
];
const shapeKind = (q: number): ShapeKind => {
	const block = Math.floor(q / 3);
	return PERMS[Math.floor(hash(block * 7 + 1) * 6)][q - block * 3];
};
type Rgb = [number, number, number];
const SHAPE_RED: Rgb = [214, 70, 58];
const SHAPE_BLUE: Rgb = [64, 108, 214];
const parseRgb = (s: string): Rgb => {
	const m = s.match(/\d+/g) ?? ["183", "75", "35"];
	return [Number(m[0]), Number(m[1]), Number(m[2])];
};
const shapeRgb = (kind: ShapeKind, c: Colors): Rgb =>
	kind === 0 ? SHAPE_RED : kind === 1 ? SHAPE_BLUE : parseRgb(c.hl());
/** `rgb` moved `k` of the way toward white (k > 0) or black (k < 0). */
const shade = ([r, g, b]: Rgb, k: number, alpha = 1) => {
	const to = k > 0 ? 255 : 0;
	const m = Math.abs(k);
	return `rgb(${r + (to - r) * m} ${g + (to - g) * m} ${b + (to - b) * m} / ${alpha})`;
};
const SHAPE_SIZE = 20;
/**
 * A shape centred at (x, y), sitting square to the camera: a flat fill with
 * one soft Phong-style highlight toward the upper-left light, so it reads as
 * a solid piece without heavy shading.
 */
const drawShape = (ctx: CanvasRenderingContext2D, kind: ShapeKind, x: number, y: number, rgb: Rgb, alpha: number) => {
	ctx.beginPath();
	if (kind === 0) {
		const r = SHAPE_SIZE * 0.6;
		for (let k = 0; k < 3; k++) {
			const t = -Math.PI / 2 + (k * Math.PI * 2) / 3;
			ctx.lineTo(x + r * Math.cos(t), y + r * Math.sin(t));
		}
		ctx.closePath();
	} else if (kind === 1) {
		ctx.arc(x, y, SHAPE_SIZE * 0.5, 0, Math.PI * 2);
	} else {
		ctx.roundRect(x - SHAPE_SIZE * 0.44, y - SHAPE_SIZE * 0.44, SHAPE_SIZE * 0.88, SHAPE_SIZE * 0.88, 2.5);
	}
	ctx.fillStyle = shade(rgb, 0, alpha);
	ctx.fill();
	// Specular: one soft white spot that falls off quickly, clipped to the shape.
	ctx.save();
	ctx.clip();
	const hx = x - SHAPE_SIZE * 0.16;
	const hy = y - SHAPE_SIZE * 0.18;
	const spec = ctx.createRadialGradient(hx, hy, 0, hx, hy, SHAPE_SIZE * 0.36);
	spec.addColorStop(0, `rgb(255 255 255 / ${0.42 * alpha})`);
	spec.addColorStop(0.45, `rgb(255 255 255 / ${0.12 * alpha})`);
	spec.addColorStop(1, "rgb(255 255 255 / 0)");
	ctx.fillStyle = spec;
	ctx.fillRect(x - SHAPE_SIZE, y - SHAPE_SIZE, SHAPE_SIZE * 2, SHAPE_SIZE * 2);
	ctx.restore();
};

// --- The converter -------------------------------------------------------------

const PERIOD = 60_000;
/** Feed speed, px per ms. */
const FEED_V = 0.07;
const BOX = 84;
const BOX_R = 16;
/** Vertical spacing of the three code lanes. */
const LANE_GAP = 26;
/** Px over which the feed fades at the left edge and the Actors at the right. */
const FADE = 72;
/** Px between Actors on the way out. */
const SHAPE_PITCH = 44;
const SANS_LABEL = SANS;
const CODE_LABEL = "AI-Generated Code";
const ACTORS_LABEL = "Actors";
const ARROW_LEN = 22;

/** A small arrow pointing right, tail at (x, y). */
const arrow = (ctx: CanvasRenderingContext2D, x: number, y: number, c: Colors) => {
	ctx.strokeStyle = c.ink(0.45);
	ctx.lineWidth = 1;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + ARROW_LEN, y);
	ctx.moveTo(x + ARROW_LEN - 4, y - 3.5);
	ctx.lineTo(x + ARROW_LEN, y);
	ctx.lineTo(x + ARROW_LEN - 4, y + 3.5);
	ctx.stroke();
	ctx.lineCap = "butt";
};

const SPARK_UNITS = faSparkles.icon[1];
const SPARK_SIZE = 32;
/** Built on first draw: `Path2D` only exists in the browser and this module also renders on the server. */
let sparkPath: Path2D | undefined;
/**
 * The spark pressed into the square (debossed), the way the marks on the
 * deployment plates are: a dark rim shifted toward the light, a lit rim
 * shifted away, an opaque copy so the face cannot show through, then the
 * recessed face in ink.
 */
const spark = (ctx: CanvasRenderingContext2D, cx: number, cy: number, c: Colors) => {
	sparkPath ??= new Path2D(faSparkles.icon[4] as string);
	const k = SPARK_SIZE / SPARK_UNITS;
	const rim = 0.9 / k;
	ctx.save();
	ctx.translate(cx - SPARK_SIZE / 2, cy - SPARK_SIZE / 2);
	ctx.scale(k, k);
	const passes: [number, string][] = [
		[-rim, "rgb(0 0 0 / 0.22)"],
		[rim, "rgb(255 255 255 / 0.5)"],
		[0, c.bg()],
		[0, c.ink(0.22)],
	];
	for (const [d, fill] of passes) {
		ctx.save();
		ctx.translate(d, d);
		ctx.fillStyle = fill;
		ctx.fill(sparkPath);
		ctx.restore();
	}
	ctx.restore();
};

/** Fades whatever has been drawn between x0 (gone) and x1 (kept). */
const fadeX = (ctx: CanvasRenderingContext2D, x0: number, x1: number, w: number, h: number) => {
	ctx.save();
	ctx.globalCompositeOperation = "destination-out";
	const grd = ctx.createLinearGradient(x0, 0, x1, 0);
	grd.addColorStop(0, "rgb(0 0 0 / 1)");
	grd.addColorStop(1, "rgb(0 0 0 / 0)");
	ctx.fillStyle = grd;
	ctx.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), h);
	ctx.restore();
};

const converter: Draw = (ctx, t, w, h, c, cycle) => {
	ctx.clearRect(0, 0, w, h);
	const ms = t + cycle * PERIOD;
	const g = ms * FEED_V + 4000;
	const cx = w / 2;
	const cy = h / 2 - 8;
	const boxL = cx - BOX / 2;
	const boxR = cx + BOX / 2;
	const layout = measureTape(ctx);

	// Three lanes of code, each its own phase of the same tape, riding right
	// into the square. Anything past its left edge is inside.
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, boxL, h);
	ctx.clip();
	for (let lane = 0; lane < 3; lane++) {
		const y = cy + (lane - 1) * LANE_GAP;
		const phase = -lane * (layout.total / 3) - lane * 37;
		const copies = tapeCopies(layout, g, -layout.total + phase, -layout.widest, boxL);
		drawTape(ctx, layout, copies, y, c);
	}
	ctx.restore();
	fadeX(ctx, 0, FADE, w, h);

	// Actors: a single stream out of the right edge, shape q at
	// x = boxR + (g - q * pitch), riding right and fading off the edge.
	for (let q = Math.ceil((g - (w - boxR)) / SHAPE_PITCH); q <= Math.floor(g / SHAPE_PITCH); q++) {
		const x = boxR + (g - q * SHAPE_PITCH);
		const alpha = span(x, boxR - 2, boxR + 14) * (1 - span(x, w - FADE, w));
		if (alpha <= 0) continue;
		const kind = shapeKind(q);
		drawShape(ctx, kind, x, cy, shapeRgb(kind, c), alpha);
	}

	// The square: a flat plate with a hairline and the spark pressed into it.
	ctx.beginPath();
	ctx.roundRect(boxL, cy - BOX / 2, BOX, BOX, BOX_R);
	ctx.fillStyle = c.bg();
	ctx.fill();
	const plate = ctx.createLinearGradient(boxL, cy - BOX / 2, boxR, cy + BOX / 2);
	plate.addColorStop(0, c.ink(0.05));
	plate.addColorStop(1, c.ink(0.1));
	ctx.fillStyle = plate;
	ctx.fill();
	ctx.strokeStyle = c.ink(0.22);
	ctx.lineWidth = 1;
	ctx.stroke();
	spark(ctx, cx, cy, c);

	// Labels below, running with the flow.
	ctx.font = SANS_LABEL;
	ctx.textBaseline = "middle";
	ctx.fillStyle = c.ink(0.5);
	const ly = h - 14;
	ctx.textAlign = "left";
	ctx.fillText(CODE_LABEL, FADE - 24, ly);
	arrow(ctx, FADE - 24 + ctx.measureText(CODE_LABEL).width + 8, ly, c);
	ctx.textAlign = "right";
	const ax = w - FADE + 24;
	ctx.fillText(ACTORS_LABEL, ax, ly);
	arrow(ctx, ax - ctx.measureText(ACTORS_LABEL).width - 8 - ARROW_LEN, ly, c);
};

const GeneratedCodeFigure = () => (
	<Figure draw={converter} period={PERIOD} restAt={30_000} heightClass="h-52" />
);

export const GeneratedCodeSection = () => (
	<ArgumentSection
		heading="Run code agents generate at runtime."
		lede={
			<>
				An agent writes a script mid-task to get something done, or your
				product generates a whole backend for a user who described what they
				wanted. Either way the code is new, untrusted, and needs to run now —
				so each piece gets an Actor of its own, with its own database and
				filesystem and no reach into anyone else's. Nothing to provision
				first, and nothing running once it goes idle.
			</>
		}
		links={[
			{ label: "Dynamic Apps", href: "/dynamic-apps/docs/" },
			{ label: "Secure Exec", href: "/secure-exec/" },
		]}
		figure={<GeneratedCodeFigure />}
		srCaption="Three streams of AI-generated code flow into a converter, and a stream of Actors flows out the other side."
		figureFirst
	/>
);
