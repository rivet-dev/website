"use client";

import { useEffect, useRef } from "react";
import { ArgumentSection } from "./ArgumentSection";
import { SCALE } from "./benchmarks";

/**
 * A rack of machines filling with Actors.
 *
 * "Adding capacity means adding machines." Each machine is a small cube drawn
 * on a canvas in orthographic isometric projection: eight faint ink corner
 * dots for its outline and a 4×4×4 lattice of accent dots for the Actors it
 * runs. Machines drop into a growing cubic arrangement — 1, 8, 27, 64 — and
 * each fills the moment it lands; the camera pulls back as the rack grows,
 * and the whole thing turns slowly so the depth reads. At the end the rack
 * falls away and it starts over.
 *
 * The readout carries the real story, not the dot count. The first machine
 * lands and fills 1 → 64, counting every Actor as it appears; from there each
 * stage stands for a rung of `SCALE.rungs`: the next seven machines take it
 * to "1K", the next nineteen to "1M", and the last thirty-seven to "1B".
 * Sixty-four cubes of sixty-four dots is nowhere near a billion — the shapes
 * stand for the scale, the number states it. Between rungs the readout rolls
 * on a log scale as the stage's machines fill, so the digits turn at one
 * steady rate.
 */
const MACHINE_N = 4;
const STAGES = SCALE.rungs.length;
/** Ms per stage: drops start at 200, the last one lands by ~1800. */
const STAGE_MS = 2600;
/** Ms for the rack to fall away before the cycle restarts. */
const RESET_MS = 1400;
const CYCLE_MS = STAGES * STAGE_MS + RESET_MS;
/**
 * The Actor count at the end of each stage; what the readout rolls between.
 * The first is the literal dot count of one machine, the rest are the rungs.
 */
const RUNG_COUNTS = [MACHINE_N ** 3, 1e3, 1e6, 1e9] as const;
/** Edge of the whole rack in CSS px. The isometric silhouette is ~1.6× this tall. */
const EDGE_PX = 108;
/** Slot pitch in machine edges: a small gap between neighbours. */
const PITCH_PER_MACHINE = 1.12;
/** One full turn every 50s: slow enough to read as a still object. */
const TURN_MS = 50_000;
const TILT = Math.atan(Math.SQRT1_2); // true isometric, ~35.26°

/**
 * Canvas cannot resolve CSS variables, so colors are read from the figure's
 * computed style. --runtime-highlight is the same accent the cold-start and
 * density figures use (the site accent, see theme.css); --site-ink is the text
 * color. Both are "r g b" space-separated.
 */
interface Colors {
	highlight: string;
	ink: string;
}
const readColors = (el: HTMLElement): Colors => {
	const style = getComputedStyle(el);
	return {
		highlight:
			style.getPropertyValue("--runtime-highlight").trim() || "183 75 35",
		ink: style.getPropertyValue("--site-ink").trim() || "27 25 22",
	};
};
const parseRgb = (c: string) =>
	c.split(/\s+/).map((v) => Number.parseInt(v, 10) || 0);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0..1 progress of `t` across [a, b], clamped. */
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) =>
	t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
/** Deterministic pseudo-random in [0, 1) so the reset stagger is the same every cycle. */
const hash = (n: number) => {
	const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/*
 * Rendering.
 *
 * At the last stage 64 machines × 64 Actors is ~4,600 dots redrawn every frame
 * as the rack turns. Rather than one canvas `arc` per dot, the figure is a
 * software point splatter: each frame projects every dot with inline math and
 * stamps a pre-rendered anti-aliased disc (cached per quarter-pixel radius and
 * sub-pixel phase) into a Float32Array of per-pixel opacity — one plane per
 * color, accent for Actors and ink for machine outlines. All dots on a plane
 * share a color, so compositing is order independent (α = 1 − Π(1 − aᵢ)) and
 * there is no depth sort. The two planes are blended into an ImageData and
 * blitted once over the dirty rectangle. Nothing is allocated per frame, and
 * the loop only runs while the section is on screen.
 */

/** Anti-aliased disc: per-pixel coverage of a circle at a sub-pixel offset. */
interface Disc {
	/** Pixels per side; odd, centered. */
	size: number;
	/** Offset from the stamp's top-left to the dot's integer pixel. */
	reach: number;
	coverage: Float32Array;
}
/** Radii and sub-pixel positions are quantized to quarter pixels for the cache. */
const QUANTA = 4;
const DISCS = new Map<number, Disc>();
const disc = (radius: number, fx: number, fy: number): Disc => {
	const rq = Math.max(1, Math.round(radius * QUANTA));
	const px = Math.floor(fx * QUANTA);
	const py = Math.floor(fy * QUANTA);
	const key = (rq * QUANTA + px) * QUANTA + py;
	let d = DISCS.get(key);
	if (d) return d;
	const r = rq / QUANTA;
	const reach = Math.ceil(r + 0.5);
	const size = reach * 2 + 1;
	const coverage = new Float32Array(size * size);
	const cx = reach + (px + 0.5) / QUANTA;
	const cy = reach + (py + 0.5) / QUANTA;
	for (let j = 0; j < size; j++) {
		for (let i = 0; i < size; i++) {
			// Distance from the pixel center to the disc center; one pixel of
			// linear falloff across the rim.
			coverage[j * size + i] = clamp01(
				r - Math.hypot(i + 0.5 - cx, j + 0.5 - cy) + 0.5,
			);
		}
	}
	d = { size, reach, coverage };
	DISCS.set(key, d);
	return d;
};

type Plane = 0 | 1;
const ACCENT: Plane = 0;
const INK: Plane = 1;

/**
 * Two per-pixel opacity planes and the ImageData they are blended into. Sized
 * to the canvas in device pixels; the canvas is a fixed square so it is built
 * once.
 */
class Splatter {
	private readonly planes: [Float32Array, Float32Array];
	private readonly image: ImageData;
	private highlight = [183, 75, 35];
	private ink = [27, 25, 22];
	/** Dirty rectangle of the current frame, in device pixels. */
	private minX = 0;
	private minY = 0;
	private maxX = 0;
	private maxY = 0;

	constructor(
		private readonly ctx: CanvasRenderingContext2D,
		readonly width: number,
		readonly height: number,
	) {
		this.planes = [
			new Float32Array(width * height),
			new Float32Array(width * height),
		];
		this.image = ctx.createImageData(width, height);
	}

	setColors(colors: Colors) {
		this.highlight = parseRgb(colors.highlight);
		this.ink = parseRgb(colors.ink);
	}

	begin() {
		this.planes[0].fill(0);
		this.planes[1].fill(0);
		this.minX = this.width;
		this.minY = this.height;
		this.maxX = -1;
		this.maxY = -1;
	}

	/** Composite one dot at device-pixel (x, y). */
	splat(x: number, y: number, radius: number, opacity: number, plane: Plane) {
		if (opacity <= 0.004) return;
		const ix = Math.floor(x);
		const iy = Math.floor(y);
		const { size, reach, coverage } = disc(radius, x - ix, y - iy);
		const x0 = ix - reach;
		const y0 = iy - reach;
		const { width, height } = this;
		if (x0 + size < 0 || y0 + size < 0 || x0 >= width || y0 >= height) return;
		const alpha = this.planes[plane];
		for (let j = 0; j < size; j++) {
			const yy = y0 + j;
			if (yy < 0 || yy >= height) continue;
			const row = yy * width;
			const maskRow = j * size;
			for (let i = 0; i < size; i++) {
				const xx = x0 + i;
				if (xx < 0 || xx >= width) continue;
				const c = coverage[maskRow + i] * opacity;
				if (c <= 0) continue;
				const k = row + xx;
				// "Over" with a shared color reduces to α' = α + c − αc.
				alpha[k] += c - alpha[k] * c;
			}
		}
		if (x0 < this.minX) this.minX = x0;
		if (y0 < this.minY) this.minY = y0;
		if (x0 + size > this.maxX) this.maxX = x0 + size;
		if (y0 + size > this.maxY) this.maxY = y0 + size;
	}

	/** Blend the planes into the image and blit the dirty rectangle. */
	end() {
		const { ctx, width, height, image } = this;
		ctx.clearRect(0, 0, width, height);
		if (this.maxX < 0) return;
		const x0 = Math.max(0, this.minX);
		const y0 = Math.max(0, this.minY);
		const x1 = Math.min(width, this.maxX);
		const y1 = Math.min(height, this.maxY);
		const data = image.data;
		const [accent, ink] = this.planes;
		const [hr, hg, hb] = this.highlight;
		const [ir, ig, ib] = this.ink;
		for (let y = y0; y < y1; y++) {
			const row = y * width;
			for (let x = x0; x < x1; x++) {
				const k = row + x;
				const h = accent[k];
				const n = ink[k];
				const o = k * 4;
				if (h <= 0 && n <= 0) {
					data[o + 3] = 0;
					continue;
				}
				// Color is the coverage-weighted mix of the two planes.
				const w = h / (h + n);
				data[o] = ir + (hr - ir) * w;
				data[o + 1] = ig + (hg - ig) * w;
				data[o + 2] = ib + (hb - ib) * w;
				data[o + 3] = (h + n - h * n) * 255;
			}
		}
		ctx.putImageData(image, 0, 0, x0, y0, x1 - x0, y1 - y0);
	}
}

/** Flat xyz grid, n per axis, centered in [-0.5, 0.5]. */
const buildGrid = (n: number): Float32Array => {
	const out = new Float32Array(n * n * n * 3);
	let o = 0;
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			for (let k = 0; k < n; k++) {
				out[o++] = (i + 0.5) / n - 0.5;
				out[o++] = (j + 0.5) / n - 0.5;
				out[o++] = (k + 0.5) / n - 0.5;
			}
		}
	}
	return out;
};
/** The Actor lattice inside one machine. */
const MACHINE_GRID = buildGrid(MACHINE_N);
const DOTS_PER_MACHINE = MACHINE_N ** 3;

interface Machine {
	/** Integer slot in the rack. */
	x: number;
	y: number;
	z: number;
	/** Stage the machine arrives in and its drop order within that stage. */
	stage: number;
	order: number;
	/** Machines arriving in the same stage. */
	peers: number;
}

/**
 * Slots with max(x, y, z) = s belong to stage s, so each stage's cube is the
 * lower-front-left corner of the next. Within a stage, machines drop
 * bottom-up and back-to-front so the drops read as stacking.
 */
const MACHINES: Machine[] = (() => {
	const out: Machine[] = [];
	for (let stage = 0; stage < STAGES; stage++) {
		const slots: { x: number; y: number; z: number }[] = [];
		for (let x = 0; x <= stage; x++) {
			for (let y = 0; y <= stage; y++) {
				for (let z = 0; z <= stage; z++) {
					if (Math.max(x, y, z) === stage) slots.push({ x, y, z });
				}
			}
		}
		slots.sort((a, b) => b.y - a.y || a.z - b.z || a.x - b.x);
		slots.forEach((slot, order) =>
			out.push({ ...slot, stage, order, peers: slots.length }),
		);
	}
	return out;
})();

/** When, within its stage, a machine's drop begins (ms). */
const dropStart = (m: Machine) => 200 + (m.order / m.peers) * 1100;
const DROP_MS = 500;
/** Fill runs from part way through the drop to a little after landing. */
const FILL_FROM = 350;
const FILL_MS = 450;
/** The window in which a stage's machines fill; the readout rolls across it. */
const STAGE_FILL_START = 200 + FILL_FROM;
const STAGE_FILL_END = 200 + 1100 + FILL_FROM + FILL_MS;

/**
 * 0..1 of a machine's Actors present at `local` ms into its own stage. The
 * lone first machine fills across the whole window so the 1 → 64 count can
 * be read; later machines fill just after they land.
 */
const machineFill = (m: Machine, local: number) =>
	m.stage === 0
		? span(local, STAGE_FILL_START, STAGE_FILL_END)
		: span(local, dropStart(m) + FILL_FROM, dropStart(m) + FILL_FROM + FILL_MS);

/** "1", "412K", "1M", "38B" — compact, no decimals, tabular-friendly. */
const formatCount = (count: number): string => {
	// Thresholds sit at the rounding boundary so 999.6K becomes 1M, not 1000K.
	if (count < 999.5) return Math.round(count).toString();
	if (count < 999_500) return `${Math.round(count / 1e3)}K`;
	if (count < 999_500_000) return `${Math.round(count / 1e6)}M`;
	return `${Math.round(count / 1e9)}B`;
};

/**
 * Linear on a log scale, so each frame multiplies the count by the same small
 * factor and the digits roll at one steady rate; an eased curve here sprints
 * through the middle decade and then crawls ("997, 999, 1000") at the top.
 */
const rollLog = (from: number, to: number, t: number) =>
	formatCount(10 ** lerp(Math.log10(from), Math.log10(to), t));

/**
 * Project a rack-space point (machine edges, rack centered on the origin) to
 * canvas device pixels. Yaw about the vertical axis, tilt toward the viewer,
 * drop the depth axis. `out[2]` is depth in edge units, larger meaning nearer.
 */
const makeProjector = (
	yaw: number,
	scale: number,
	centerX: number,
	centerY: number,
) => {
	const cy = Math.cos(yaw);
	const sy = Math.sin(yaw);
	const ct = Math.cos(TILT);
	const st = Math.sin(TILT);
	return (x: number, y: number, z: number, out: Float64Array) => {
		const x1 = x * cy - z * sy;
		const z1 = x * sy + z * cy;
		out[0] = centerX + x1 * scale;
		out[1] = centerY + (y * ct - z1 * st) * scale;
		out[2] = y * st + z1 * ct;
	};
};
const P = new Float64Array(3);

/**
 * Pointer position in canvas device pixels, or null when the pointer is off
 * the rack. Actors within GLOW_PX of it glow: full opacity, a little larger,
 * with a soft halo, falling off smoothly with distance. No animation of its
 * own; each frame reads the current position.
 */
interface Pointer {
	x: number;
	y: number;
}
const GLOW_PX = 64;

/**
 * Draw one frame at `t` ms into the cycle and return the readout text.
 *
 * @param dpr device pixels per CSS px; the splatter is in device pixels
 */
const drawFrame = (
	out: Splatter,
	t: number,
	elapsed: number,
	dpr: number,
	pointer: Pointer | null,
): string => {
	const cycleT = t % CYCLE_MS;
	const stage = Math.min(STAGES - 1, Math.floor(cycleT / STAGE_MS));
	const local = cycleT - stage * STAGE_MS;
	const resetting = cycleT >= STAGES * STAGE_MS;
	const resetT = resetting ? cycleT - STAGES * STAGE_MS : 0;

	// The rack is centered on the current stage's cube, easing as it grows so
	// the camera appears to pull back.
	const sizeNow = stage + 1;
	const sizePrev = Math.max(1, stage);
	const growT = stage === 0 ? 1 : easeInOutCubic(span(local, 0, 900));
	const size = lerp(sizePrev, sizeNow, growT);
	const scale = (EDGE_PX / (size * PITCH_PER_MACHINE)) * dpr; // device px per machine edge
	const center = ((size - 1) * PITCH_PER_MACHINE) / 2;
	const yaw = Math.PI / 4 + (elapsed / TURN_MS) * Math.PI * 2;
	const project = makeProjector(yaw, scale, out.width / 2, out.height / 2);
	// Depth spans ±(rack diagonal)/2 in edge units; normalize to 0..1 near.
	const depthRange = size * PITCH_PER_MACHINE * 1.74;
	const actorRadius = Math.max(0.7 * dpr, scale * 0.045);
	const cornerRadius = 0.9 * dpr;
	const glowR = GLOW_PX * dpr;
	const glowR2 = glowR * glowR;
	const px = pointer ? pointer.x : 0;
	const py = pointer ? pointer.y : 0;

	out.begin();
	for (const m of MACHINES) {
		if (m.stage > stage) continue;
		let drop = 1;
		let fill = 1;
		if (m.stage === stage) {
			const at = dropStart(m);
			drop = easeOutCubic(span(local, at, at + DROP_MS));
			fill = machineFill(m, local);
			if (drop <= 0) continue;
		}
		const dots = Math.floor(fill * DOTS_PER_MACHINE);
		let fall = 0;
		let gone = 0;
		if (resetting) {
			const at = hash(m.order * 7 + m.stage * 31) * 500;
			const f = span(resetT, at, at + 700);
			fall = f * f * 2.2;
			gone = span(resetT, at + 250, at + 700);
			if (gone >= 1) continue;
		}
		const ox = m.x * PITCH_PER_MACHINE - center;
		const oy = m.y * PITCH_PER_MACHINE - center - (1 - drop) * 2.4 + fall;
		const oz = m.z * PITCH_PER_MACHINE - center;
		const alpha = (1 - gone) * Math.min(1, drop * 1.5);

		// The machine's outline as faint ink corner dots, then its Actors.
		for (let i = 0; i < 8; i++) {
			project(
				ox + ((i & 1) - 0.5),
				oy + (((i >> 1) & 1) - 0.5),
				oz + (((i >> 2) & 1) - 0.5),
				P,
			);
			out.splat(P[0], P[1], cornerRadius, 0.5 * alpha, INK);
		}
		for (let i = 0; i < dots * 3; i += 3) {
			project(
				ox + MACHINE_GRID[i],
				oy + MACHINE_GRID[i + 1],
				oz + MACHINE_GRID[i + 2],
				P,
			);
			const near = clamp01(P[2] / depthRange + 0.5);
			let opacity = alpha * (0.45 + 0.5 * near);
			let radius = actorRadius;
			if (pointer) {
				const dx = P[0] - px;
				const dy = P[1] - py;
				const d2 = dx * dx + dy * dy;
				if (d2 < glowR2) {
					// Gaussian-ish falloff: a hot core under the pointer with a long
					// soft tail to the rim, so the spread reads as a glow rather
					// than a disc. exp(-4.5 u²) is ~0.01 at the rim.
					const u2 = d2 / glowR2;
					const glow = Math.exp(-4.5 * u2) * (1 - u2);
					// Full opacity and larger toward the core; no halo, because at
					// the dense stages thousands of overlapping halos fuse into a blob.
					opacity += (alpha - opacity) * Math.min(1, glow * 1.6);
					radius *= 1 + 0.7 * glow;
				}
			}
			out.splat(P[0], P[1], radius, opacity, ACCENT);
		}
	}
	out.end();

	if (resetting)
		return rollLog(RUNG_COUNTS[STAGES - 1], 1, span(resetT, 0, 1000));
	if (stage === 0) {
		// One machine, counted literally: the readout is its visible dots.
		const fill = machineFill(MACHINES[0], local);
		return formatCount(Math.max(1, Math.floor(fill * DOTS_PER_MACHINE)));
	}
	return rollLog(
		RUNG_COUNTS[stage - 1],
		RUNG_COUNTS[stage],
		span(local, STAGE_FILL_START, STAGE_FILL_END),
	);
};

/** Frame held under prefers-reduced-motion: the full rack, "1B". */
const REST_AT = STAGES * STAGE_MS - 1;

const ScaleFigure = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const readoutRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const readout = readoutRef.current;
		if (!canvas || !readout) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const dpr = window.devicePixelRatio || 1;
		const width = Math.round(canvas.clientWidth * dpr);
		const height = Math.round(canvas.clientHeight * dpr);
		canvas.width = width;
		canvas.height = height;
		// Pixels are written directly, so no CSS-pixel transform on the context.
		const out = new Splatter(ctx, width, height);
		out.setColors(readColors(canvas));

		let pointer: Pointer | null = null;
		let lastReadout = "";
		const paint = (t: number, elapsed: number) => {
			const label = drawFrame(out, t, elapsed, dpr, pointer);
			if (label !== lastReadout) {
				lastReadout = label;
				readout.textContent = label;
			}
		};
		// ThemeScript dispatches this after flipping html[data-theme].
		const onThemeChange = () => {
			out.setColors(readColors(canvas));
			if (reduceMotion) paint(REST_AT, 0);
		};
		window.addEventListener("theme-change", onThemeChange);

		// The glow is read by the next frame; under reduced motion there is no
		// loop, so the resting frame is repainted on each move instead.
		const onPointerMove = (e: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			pointer = {
				x: ((e.clientX - rect.left) / rect.width) * width,
				y: ((e.clientY - rect.top) / rect.height) * height,
			};
			if (reduceMotion) paint(REST_AT, 0);
		};
		const onPointerLeave = () => {
			pointer = null;
			if (reduceMotion) paint(REST_AT, 0);
		};
		canvas.addEventListener("pointermove", onPointerMove);
		canvas.addEventListener("pointerleave", onPointerLeave);
		const removePointer = () => {
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerleave", onPointerLeave);
		};

		if (reduceMotion) {
			paint(REST_AT, 0);
			return () => {
				removePointer();
				window.removeEventListener("theme-change", onThemeChange);
			};
		}

		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			// The first frame's timestamp can predate `start`; a negative elapsed
			// would put the cycle in the wrong stage.
			const elapsed = Math.max(0, now - start);
			paint(elapsed, elapsed);
			frame = requestAnimationFrame(tick);
		};
		// Only animate while on screen; the clock keeps running so the cycle
		// picks up at the right point when it comes back.
		const observer = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame);
			if (entry.isIntersecting) frame = requestAnimationFrame(tick);
		});
		observer.observe(canvas);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			removePointer();
			window.removeEventListener("theme-change", onThemeChange);
		};
	}, []);

	// The rack is a fixed 13rem square; beside the readout that is wider than a
	// phone-width card, so below sm the readout drops under it.
	return (
		<div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-6">
			<canvas
				ref={canvasRef}
				className="h-52 w-52 shrink-0"
				aria-hidden="true"
			/>

			{/* The readout is written straight from the animation clock rather
			    than through state, so it rolls every frame in step with the dots.
			    It has a fixed width, not a minimum, so "1" and "130M" occupy the
			    same box and the digits can never shift the rack or the label. */}
			<div className="flex shrink-0 items-baseline gap-1.5" aria-hidden="true">
				<span
					ref={readoutRef}
					className="w-[5.5ch] text-right text-3xl font-medium tabular-nums text-highlight"
				>
					{SCALE.rungs[0]}
				</span>
				<span className="text-sm text-ink-faint">Actors</span>
			</div>
			<span className="sr-only">
				{SCALE.headline} {SCALE.unit} on one control plane.
			</span>
		</div>
	);
};

export const ScaleSection = () => (
	<ArgumentSection
		id="scale"
		heading="Built for scale."
		lede={
			<>
				Actors are scheduled independently, so adding capacity means adding
				machines. The same control plane runs a thousand Actors or a billion.
			</>
		}
		stat={{ value: SCALE.headline, unit: SCALE.unit }}
		figure={<ScaleFigure />}
	/>
);
