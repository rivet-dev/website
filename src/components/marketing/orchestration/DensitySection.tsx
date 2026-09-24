"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ArgumentSection } from "./ArgumentSection";
import { DENSITY, DENSITY_MULTIPLE } from "./benchmarks";

/**
 * Two servers of the same size filling up over the same stretch of time. The
 * pod server takes four blocks and is full; the Actor server keeps packing in
 * cells long after, and the counter under each one climbs as it goes.
 *
 * Cells drop into the box from above under gravity: they accelerate from a
 * standstill, hit their slot at full speed, and bounce a couple of times with
 * decaying height before settling. Every cell is released from the same line
 * above the box, so lower rows fall longer and land harder. Cells are
 * released one at a time in reading order from the bottom row up — left to
 * right, then the next row — fast at first and slowing as the box fills, so
 * the last few land one deliberate drop at a time. Pods release on equal
 * intervals: four cells, no curve. Pods fall under the same gravity and keep
 * a touch more of their speed on each bounce. Nothing squashes or sinks below
 * its slot; every landing is a clean bounce. On
 * reset every cell falls out through the bottom, bottom rows first, slightly
 * staggered, and only the counters run down.
 *
 * Each box is one canvas. Every cell's position is a pure function of the time
 * into the cycle, so a dropped frame never delays a row or leaves a cell out of
 * step — the next frame simply draws the right state. The loop only runs while
 * the figure is on screen.
 *
 * The cell counts are not to scale — at the real ratio an Actor would be a
 * sub-pixel speck — so the counter carries the impression and the caption
 * carries the number.
 */
const ACTOR_COLUMNS = 16;
const ACTOR_CELLS = ACTOR_COLUMNS * ACTOR_COLUMNS;
const POD_COLUMNS = 2;
const POD_CELLS = POD_COLUMNS * POD_COLUMNS;
const BOX_PX = 96;
/** Room above the box for cells to fall in from. */
const HEADROOM_PX = 40;

const FILL_MS = 3600;
const HOLD_MS = 1600;
/** Long enough for the last staggered cell to finish falling out. */
const CLEAR_MS = 750;
const OUT_MS = 380;
const CYCLE_MS = FILL_MS + HOLD_MS + CLEAR_MS;
/**
 * How much the Actor fill decelerates. Fill progress is `1 - (1 - u)^k` in
 * time, so cells release a few milliseconds apart at the bottom and the gaps
 * stretch toward the top: with 256 cells over the fill window the first gaps
 * are ~7ms and the last ~90ms. 1 would be linear.
 */
const FILL_EASE = 2;

/** Time (0..1 of the fill) at which an eased fill reaches progress `p`. */
const easedReleaseTime = (p: number) => 1 - (1 - p) ** (1 / FILL_EASE);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface Kind {
	columns: number;
	/** Inner padding and gap between cells, matching the old DOM grid. */
	pad: number;
	gap: number;
	/**
	 * When the `index`th cell (in fill order) is released, as 0..1 of the fill
	 * window, given how many cells the box holds.
	 */
	releaseTime: (index: number, count: number) => number;
	/** Bottom rows leave first, and each row peels left to right. */
	outDelay: (row: number, col: number) => number;
	/** Fraction of impact speed kept after each bounce. */
	restitution: number;
	color: (c: Colors, alpha: number) => string;
}

/**
 * One gravity for both boxes, in px/s²: it is the same server, and matching
 * fall times are what make the pod side read as the same drop at a bigger
 * scale. Sized so the longest fall (bottom row of the Actor box) takes ~270ms.
 */
const GRAVITY = 3000;
/** Cells are released this far above the box top. */
const RELEASE_ABOVE_PX = 20;

const ACTOR_KIND: Kind = {
	columns: ACTOR_COLUMNS,
	pad: 1,
	gap: 1,
	releaseTime: (index, count) => easedReleaseTime(index / count),
	outDelay: (row, col) => (ACTOR_COLUMNS - 1 - row) * 14 + col * 5,
	restitution: 0.28,
	color: (c, alpha) => c.hl(0.8 * alpha),
};
const POD_KIND: Kind = {
	columns: POD_COLUMNS,
	pad: 2,
	gap: 2,
	// Four pods on a fixed beat, the last one landing well before the hold.
	releaseTime: (index, count) => (index / count) * 0.8,
	outDelay: (row, col) => (POD_COLUMNS - 1 - row) * 140 + col * 70,
	restitution: 0.3,
	color: (c, alpha) => c.ink(0.55 * alpha),
};

interface Colors {
	hl: (alpha: number) => string;
	ink: (alpha: number) => string;
}
const readColors = (el: HTMLElement): Colors => {
	const style = getComputedStyle(el);
	const hl = style.getPropertyValue("--runtime-highlight").trim() || "183 75 35";
	const ink = style.getPropertyValue("--site-ink").trim() || "27 25 22";
	return {
		hl: (alpha) => `rgb(${hl} / ${alpha})`,
		ink: (alpha) => `rgb(${ink} / ${alpha})`,
	};
};

/** Bounces with an apex lower than this are not worth drawing. */
const MIN_BOUNCE_PX = 0.35;

interface DropState {
	/** Vertical offset from the slot; negative is above it. */
	y: number;
	alpha: number;
}

const AT_REST: DropState = { y: 0, alpha: 1 };

/**
 * Where a cell released `dtMs` ago is, having been dropped from `h` px above
 * its slot. Closed-form ballistics rather than an easing curve: a fall under
 * constant gravity, then a run of bounces, each launched at `restitution`
 * times the speed of the impact before it. The cell never deforms or sinks
 * below its slot: a landing is a clean bounce. The run ends once a bounce
 * would be too small to see. Every value is a function of `dtMs` alone, so a
 * dropped frame lands on the right state.
 */
function dropIn(dtMs: number, h: number, kind: Kind): DropState {
	// No cell is still moving this long after release; skip the bounce walk.
	if (dtMs > 1500) return AT_REST;
	const t = dtMs / 1000;
	const g = GRAVITY;
	const fallTime = Math.sqrt((2 * h) / g);
	// Cells appear as they leave the release line, over the first few px.
	const alpha = Math.min(1, dtMs / 40);
	if (t < fallTime) {
		return { y: -h + (g * t * t) / 2, alpha };
	}
	let elapsed = fallTime;
	let impactSpeed = g * fallTime;
	for (;;) {
		const launchSpeed = impactSpeed * kind.restitution;
		const apex = (launchSpeed * launchSpeed) / (2 * g);
		if (apex < MIN_BOUNCE_PX) return AT_REST;
		// Airborne: up at the launch speed, back down under gravity.
		const flight = (2 * launchSpeed) / g;
		if (t < elapsed + flight) {
			const tau = t - elapsed;
			return { y: -(launchSpeed * tau - (g * tau * tau) / 2), alpha };
		}
		elapsed += flight;
		impactSpeed = launchSpeed;
	}
}

/** A cell's vertical offset and opacity while falling out; `b` is 0..1 of the fall. */
function fallOut(b: number, fall: number): { y: number; alpha: number } {
	return { y: fall * b * b, alpha: 1 - clamp01((b - 0.45) / 0.55) };
}

/**
 * Draws one box at time `t` into the cycle. Returns the count to show under it.
 */
function drawBox(ctx: CanvasRenderingContext2D, kind: Kind, t: number, colors: Colors): number {
	const { columns, pad, gap } = kind;
	const inner = BOX_PX - 2 - 2 * pad; // inside the 1px border and padding
	const cell = (inner - (columns - 1) * gap) / columns;
	const pitch = cell + gap;
	const left = 1 + pad;
	// Canvas rows are drawn from the top; `row` 0 is the bottom of the box.
	const topOf = (row: number) => HEADROOM_PX + 1 + pad + (columns - 1 - row) * pitch;
	const floorY = HEADROOM_PX + BOX_PX;

	ctx.clearRect(0, 0, BOX_PX, HEADROOM_PX + BOX_PX);

	// Empty slots.
	ctx.fillStyle = colors.ink(0.07);
	for (let row = 0; row < columns; row++) {
		for (let col = 0; col < columns; col++) {
			ctx.fillRect(left + col * pitch, topOf(row), cell, cell);
		}
	}

	// Cells that fall out through the floor are clipped there; cells falling
	// in from above are not, which is what the headroom is for.
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, BOX_PX, floorY - 1);
	ctx.clip();

	const clearing = t >= FILL_MS + HOLD_MS;
	const cellCount = columns * columns;
	// Cells released so far; it is what the counter shows while filling.
	let released = 0;

	for (let row = 0; row < columns; row++) {
		// Every cell is released from the same line above the box, so lower rows
		// fall further, take longer, and land harder.
		const drop = (columns - 1 - row) * (BOX_PX / columns) + RELEASE_ABOVE_PX;
		const fall = (columns - row) * (BOX_PX / columns) + 4;
		const y0 = topOf(row);
		for (let col = 0; col < columns; col++) {
			// Fill order: the bottom row left to right, then the row above it.
			const releaseAt = FILL_MS * kind.releaseTime(row * columns + col, cellCount);
			if (t < releaseAt) continue;
			released++;
			const x = left + col * pitch;
			let y = 0;
			let alpha = 1;
			if (clearing) {
				const b = (t - FILL_MS - HOLD_MS - kind.outDelay(row, col)) / OUT_MS;
				if (b >= 1) continue;
				if (b > 0) ({ y, alpha } = fallOut(b, fall));
			} else {
				({ y, alpha } = dropIn(t - releaseAt, drop, kind));
			}
			ctx.fillStyle = kind.color(colors, alpha);
			ctx.fillRect(x, y0 + y, cell, cell);
		}
	}
	ctx.restore();

	if (clearing) {
		const down = clamp01(1 - (t - FILL_MS - HOLD_MS) / OUT_MS);
		return Math.round(down * cellCount);
	}
	return released;
}

const Box = ({
	kind,
	canvasRef,
}: {
	kind: Kind;
	canvasRef: RefObject<HTMLCanvasElement | null>;
}) => (
	<div aria-hidden="true" className="relative h-24 w-24 border border-ink/15">
		<canvas
			ref={canvasRef}
			className="pointer-events-none absolute -left-px block"
			style={{
				width: BOX_PX,
				height: BOX_PX + HEADROOM_PX,
				top: -(HEADROOM_PX + 1),
			}}
		/>
	</div>
);

export const DensityFigure = () => {
	const rootRef = useRef<HTMLDivElement>(null);
	const actorCanvasRef = useRef<HTMLCanvasElement>(null);
	const podCanvasRef = useRef<HTMLCanvasElement>(null);
	const actorCountRef = useRef<HTMLSpanElement>(null);
	const podCountRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		const actorCanvas = actorCanvasRef.current;
		const podCanvas = podCanvasRef.current;
		const actorCount = actorCountRef.current;
		const podCount = podCountRef.current;
		if (!root || !actorCanvas || !podCanvas || !actorCount || !podCount) return;
		const actorCtx = actorCanvas.getContext("2d");
		const podCtx = podCanvas.getContext("2d");
		if (!actorCtx || !podCtx) return;

		const dpr = window.devicePixelRatio || 1;
		for (const [canvas, ctx] of [
			[actorCanvas, actorCtx],
			[podCanvas, podCtx],
		] as const) {
			canvas.width = Math.round(BOX_PX * dpr);
			canvas.height = Math.round((BOX_PX + HEADROOM_PX) * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		let colors = readColors(root);
		let lastActors = -1;
		let lastPods = -1;
		const paint = (t: number) => {
			const actors = drawBox(actorCtx, ACTOR_KIND, t, colors);
			const pods = drawBox(podCtx, POD_KIND, t, colors);
			// Text nodes only change when the number does, so the counters do not
			// force a layout every frame.
			if (actors !== lastActors) actorCount.textContent = String((lastActors = actors));
			if (pods !== lastPods) podCount.textContent = String((lastPods = pods));
		};

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			paint(FILL_MS + HOLD_MS / 2);
			return;
		}

		let frame = 0;
		let n = 0;
		const start = performance.now();
		const tick = (now: number) => {
			if (++n % 60 === 0) colors = readColors(root);
			paint((now - start) % CYCLE_MS);
			frame = requestAnimationFrame(tick);
		};
		// Only animate while on screen; the clock keeps running so the cycle
		// picks up at the right point when it comes back.
		const observer = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame);
			if (entry.isIntersecting) frame = requestAnimationFrame(tick);
		});
		observer.observe(root);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className="flex h-52 items-center justify-center gap-12"
			aria-label={`A Rivet Actor holds ${DENSITY.rivetLabel}; a Kubernetes pod holds ${DENSITY.kubernetesLabel}`}
		>
			<div className="flex flex-col items-center gap-3">
				<Box kind={ACTOR_KIND} canvasRef={actorCanvasRef} />
				<p className="text-center text-xs font-medium text-highlight">
					Rivet Actors
					<br />
					<span className="font-mono tabular-nums" ref={actorCountRef}>0</span> × {DENSITY.rivetLabel}
				</p>
			</div>
			<div className="flex flex-col items-center gap-3">
				<Box kind={POD_KIND} canvasRef={podCanvasRef} />
				<p className="text-center text-xs text-ink-faint">
					Kubernetes pods
					<br />
					<span className="font-mono tabular-nums" ref={podCountRef}>0</span> × {DENSITY.kubernetesLabel}
				</p>
			</div>
		</div>
	);
};

export const DensitySection = () => (
	<ArgumentSection
		id="density"
		heading={`Run ${DENSITY_MULTIPLE}× more workloads per server.`}
		lede={
			<>
				An Actor lives inside a worker process you already run, not in its
				own container or VM. A server that held hundreds of pods holds hundreds
				of thousands of Actors.
			</>
		}
		stat={{
			value: DENSITY.rivetLabel,
			unit: "per running Actor",
			method: DENSITY.method,
		}}
		figure={<DensityFigure />}
	/>
);
