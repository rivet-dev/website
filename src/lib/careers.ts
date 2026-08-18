// Single source for the Work at a Startup feed that powers both the /careers
// job board and the footer Careers pill. Keeping the URL and the shape logic
// here stops the server-side fetch (BaseLayout) and the client-side refresh
// (Footer) from drifting apart.
export const WAAS_JOBS_URL = "https://www.workatastartup.com/embed/rivet/jobs";

// Returns the number of open roles, or null on any failure (network error, bad
// status, unexpected shape). Callers render no pill when the count is null.
// The feed sends `access-control-allow-origin: *`, so this works from the
// browser as well as the server.
export async function fetchOpeningsCount(
	signal?: AbortSignal,
): Promise<number | null> {
	try {
		const res = await fetch(WAAS_JOBS_URL, signal ? { signal } : undefined);
		if (!res.ok) return null;
		const data = await res.json();
		return Array.isArray(data?.jobs) ? data.jobs.length : null;
	} catch {
		return null;
	}
}
