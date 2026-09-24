/**
 * Benchmark figures for the orchestration landing page.
 *
 * Every number the page shows comes from this file, so replacing one is an
 * edit here and nowhere else. Raw measured inputs sit at the top, ratios are
 * computed from them, and each measured figure carries a `method` string that
 * the page shows in an info tooltip beside the stat.
 *
 * Measured September 2026 on FoundationDB with the Rust rivetkit SDK. The
 * Kubernetes figures are typical published values, not a matched benchmark.
 */

/** Shared setup line for the measured Rivet figures. */
const SETUP = 'Measured on FoundationDB with the Rust rivetkit SDK.';

export const COLD_START = {
	/**
	 * p50 round trip of an HTTP request that wakes a hibernated actor. p99 is
	 * 27.7 ms on the same run.
	 */
	rivetMs: 12.3,
	method: `Round trip of an HTTP request waking an Actor from hibernation: 12.3 ms p50, 27.7 ms p99. ${SETUP}`,
	/**
	 * The run relies on a feature that is still behind a flag. The section
	 * renders this as a trailing sentence with the label linked to the PR.
	 */
	experimental: {
		label: 'experimental Rivet feature',
		href: 'https://github.com/rivet-dev/rivet/pull/5772',
		status: 'will be enabled by default in an upcoming update',
	},
	/** Pod scheduled to serving: image pull, runtime setup, container start. */
	kubernetesLabel: '~6 s',
	kubernetesMs: 6000,
} as const;

export const DENSITY = {
	/** Resident memory added by one running actor. */
	rivetLabel: '72.4 KB',
	rivetKb: 72.4,
	method: `RSS increase per running Actor. ${SETUP}`,
	/** Node.js runtime, container shim, pause container, kubelet tracking. */
	kubernetesLabel: '200 MB',
	kubernetesKb: 200 * 1024,
} as const;

export const SCALE = {
	/** Headline figure for the scale section. */
	headline: 'Billions',
	unit: 'of Actors',
	/** Rungs the zoom-out animation counts through, smallest first. */
	rungs: ['1', '1K', '1M', '1B'] as const,
} as const;

export const HIBERNATION = {
	/** Memory an actor holds once it has persisted its state and unloaded. */
	idleLabel: '0 MB',
	/** Wake is a cold start: the same path and figure as COLD_START. */
	wakeMs: COLD_START.rivetMs,
} as const;

/** Ratio helpers, so the page never hard-codes a multiple beside its inputs. */
export const COLD_START_MULTIPLE = Math.round(
	COLD_START.kubernetesMs / COLD_START.rivetMs,
).toLocaleString('en-US');
export const DENSITY_MULTIPLE = Math.round(
	DENSITY.kubernetesKb / DENSITY.rivetKb,
).toLocaleString('en-US');

/** The three hero stats, each anchored to the section that argues it. */
// The hero rounds to whole units; the sections below carry the exact figures.
const heroColdStartMs = Math.floor(COLD_START.rivetMs);
const heroDensityKb = Math.floor(DENSITY.rivetKb);

export const HERO_STATS = [
	{
		value: `${heroColdStartMs} ms`,
		label: 'cold starts',
		href: '#cold-start',
		aria: `${heroColdStartMs} millisecond cold starts — jump to the cold start section`,
	},
	{
		value: `${heroDensityKb} KB`,
		label: 'per Actor',
		href: '#density',
		aria: `${heroDensityKb} kilobytes of memory per Actor — jump to the density section`,
	},
	{
		value: SCALE.headline,
		label: SCALE.unit,
		href: '#scale',
		aria: `${SCALE.headline} ${SCALE.unit} — jump to the scale section`,
	},
] as const;
