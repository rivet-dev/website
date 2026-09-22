/**
 * Placeholder figures for the orchestration landing page.
 *
 * NOT MEASURED. These are stand-ins so the page can be designed and reviewed
 * before the orchestrator benchmarks exist. Every number the page shows comes
 * from this file, so replacing them later is an edit here and nowhere else.
 *
 * When real figures land, follow the pattern in `src/data/bench.ts`: raw
 * measured inputs at the top, ratios computed from them, and a dated note
 * naming the baseline hardware.
 */

export const COLD_START = {
	/** Actor boot to first request handled, including durable state init. */
	rivetMs: 5,
	/** Pod scheduled to serving: image pull, runtime setup, container start. */
	kubernetesLabel: '~6 s',
	kubernetesMs: 6000,
} as const;

export const DENSITY = {
	/** Resident memory held by one running actor. */
	rivetLabel: '2 MB',
	rivetMb: 2,
	/** Node.js runtime, container shim, pause container, kubelet tracking. */
	kubernetesLabel: '200 MB',
	kubernetesMb: 200,
} as const;

export const SCALE = {
	/** Headline figure for the scale section. */
	headline: 'Billions',
	unit: 'of actors',
	/** Rungs the zoom-out animation counts through, smallest first. */
	rungs: ['1', '1K', '1M', '1B'] as const,
} as const;

/** Ratio helpers, so the page never hard-codes a multiple beside its inputs. */
export const COLD_START_MULTIPLE = Math.round(
	COLD_START.kubernetesMs / COLD_START.rivetMs,
).toLocaleString('en-US');
export const DENSITY_MULTIPLE = Math.round(
	DENSITY.kubernetesMb / DENSITY.rivetMb,
).toLocaleString('en-US');

/** The three hero stats, each anchored to the section that argues it. */
export const HERO_STATS = [
	{
		value: `${COLD_START.rivetMs} ms`,
		label: 'cold starts',
		href: '#cold-start',
		aria: `${COLD_START.rivetMs} millisecond cold starts — jump to the cold start section`,
	},
	{
		value: DENSITY.rivetLabel,
		label: 'per actor',
		href: '#density',
		aria: `${DENSITY.rivetLabel} of memory per actor — jump to the density section`,
	},
	{
		value: SCALE.headline,
		label: SCALE.unit,
		href: '#scale',
		aria: `${SCALE.headline} ${SCALE.unit} — jump to the scale section`,
	},
] as const;
