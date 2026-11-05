/**
 * Benchmark figures for the orchestration landing page.
 *
 * Every number the page shows comes from this file, so replacing one is an
 * edit here and nowhere else. Raw measured inputs sit at the top, ratios are
 * computed from them, and each measured figure carries a `method` string that
 * the page shows in an info tooltip beside the stat.
 *
 * The cold start comes from the benchmark documented at /docs/benchmarking.
 * The density figure was measured in September 2026 with the Rust rivetkit
 * SDK. The sandbox figures are a documented default allocation and a separate
 * third-party benchmark, not a matched benchmark. /docs/benchmarking names the
 * baseline and its sources.
 */

/** Setup line for the density figure. */
const SETUP = 'Measured with the Rust rivetkit SDK.';

export const COLD_START = {
	/**
	 * p99 round trip of a request that creates a new Actor, from the
	 * benchmark at /docs/benchmarking. p50 is 6.92 ms on the same run.
	 */
	rivetMs: 4.99,
	method:
		'Round trip from sending a request to the first reply from a newly created Rivet Actor: 4.99 ms p99, on a three-zone cluster. The sandbox figure is a p99 from a third-party sandbox benchmark run on October 30, 2026.',
	/** Methodology section linked from the stat's tooltip. */
	benchmarkHref: '/docs/benchmarking/#results',
	/** p99 sandbox start, from the baseline at /docs/benchmarking. */
	sandboxLabel: '1.70 s',
	sandboxMs: 1700,
} as const;

export const DENSITY = {
	/** Resident memory added by one running actor. */
	rivetLabel: '72.4 KB',
	rivetKb: 72.4,
	method: `RSS increase per running Actor. ${SETUP} The sandbox figure is a provider's documented default allocation as of November 4, 2026, not measured memory use.`,
	/** Methodology section linked from the stat's tooltip. */
	benchmarkHref: '/docs/benchmarking/#comparison-baseline',
	/** Default memory allocated to one sandbox, from the baseline at /docs/benchmarking. */
	sandboxLabel: '512 MiB',
	sandboxKb: 512 * 1024,
} as const;

export const STORAGE = {
	/** S3 Standard list price per GB-month in us-east-1, first 50 TB tier. */
	s3UsdPerGbMonth: 0.023,
	/** Amazon EBS gp3 list price per GB-month in us-east-1. */
	gp3UsdPerGbMonth: 0.08,
	/** Copies held by replicated SSD storage, matching S3's minimum of three zones. */
	replicas: 3,
	method:
		'Storage at rest using AWS list prices in us-east-1: S3 Standard at $0.023 per GB-month, compared with three Amazon EBS gp3 copies at $0.08 per GB-month each. Excludes request and transfer costs.',
	/** Methodology section linked from the stat's tooltip. */
	benchmarkHref: '/docs/benchmarking/#storage-cost',
} as const;

/** SQLite query latency, timed on the node, from /docs/benchmarking. */
export const SQLITE_LATENCY = {
	/** p99 query latencies; the p50s are on /docs/benchmarking. */
	writeP99: '1.07 ms',
	readP99: '1.36 ms',
	method:
		'Write and read latencies are p99 SQLite queries timed in the Rivet Actor, excluding the client round trip. Writes are single-row inserts acknowledged by 2 of 3 instances across zones. Reads are the first random point read after sleep on a 50 MB database.',
	benchmarkHref: '/docs/benchmarking/#results',
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
} as const;

/** Ratio helpers, so the page never hard-codes a multiple beside its inputs. */
export const COLD_START_MULTIPLE = Math.round(
	COLD_START.sandboxMs / COLD_START.rivetMs,
).toLocaleString('en-US');
export const DENSITY_MULTIPLE = Math.round(
	DENSITY.sandboxKb / DENSITY.rivetKb,
).toLocaleString('en-US');

export const STORAGE_MULTIPLE = (
	(STORAGE.gp3UsdPerGbMonth * STORAGE.replicas) /
	STORAGE.s3UsdPerGbMonth
).toFixed(1);

/** The three hero stats, each anchored to the section that argues it. */
// The hero rounds; the sections below carry the exact figures.
const heroColdStartMs = String(COLD_START.rivetMs);
const heroDensityKb = Math.floor(DENSITY.rivetKb);

export const HERO_STATS = [
	{
		value: `${heroColdStartMs} ms`,
		label: 'p99 cold starts',
		href: '#cold-start',
		aria: `${heroColdStartMs} millisecond p99 cold starts — jump to the cold start section`,
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
