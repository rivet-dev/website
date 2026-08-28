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

// The subset of the Work at a Startup job shape we read. The feed is untyped
// JSON, so treat every field as best-effort: the mapper below re-checks types
// at runtime rather than trusting this interface.
export interface WaasJob {
	id?: number | string;
	title?: string;
	description?: string;
	job_type?: string;
	remote?: string;
	location?: string | null;
	salary_min?: number | null;
	salary_max?: number | null;
	pretty_updated_at?: string;
	skills?: Array<{ name?: string }>;
}

// Returns the full open-role list, or `[]` when the feed can't be read after
// retries, so a slow or dead feed degrades to zero JobPosting nodes instead of
// breaking `astro build`. Retries with a per-attempt timeout for two reasons:
// a single transient blip during a heavy build must not silently drop every
// posting (the whole point of the call), and a reachable-but-hung feed must not
// stall the build (Node fetch has no default response timeout).
export async function fetchJobs({
	attempts = 3,
	timeoutMs = 8000,
}: { attempts?: number; timeoutMs?: number } = {}): Promise<WaasJob[]> {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const res = await fetch(WAAS_JOBS_URL, { signal: AbortSignal.timeout(timeoutMs) });
			if (!res.ok) throw new Error(`unexpected status ${res.status}`);
			const data = await res.json();
			if (Array.isArray(data?.jobs)) return data.jobs as WaasJob[];
			throw new Error("unexpected feed shape");
		} catch {
			// Retry transient failures; fall through to [] after the last attempt.
			if (attempt < attempts) {
				await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
			}
		}
	}
	return [];
}

const WAAS_EMPLOYMENT_TYPES: Record<string, string> = {
	fulltime: "FULL_TIME",
	parttime: "PART_TIME",
	contract: "CONTRACTOR",
	intern: "INTERN",
	internship: "INTERN",
	temporary: "TEMPORARY",
};

// "MM/DD/YYYY" -> ISO-8601 "YYYY-MM-DD", or null when the shape is unexpected.
// datePosted is required by Google, so an unparseable date drops the whole
// posting (see toJobPosting) rather than emitting one without it.
function toIsoDate(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const parts = value.split("/");
	if (parts.length !== 3) return null;
	const [month, day, year] = parts;
	if (!/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day) || !/^\d{4}$/.test(year)) {
		return null;
	}
	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Maps a WAAS job to a schema.org JobPosting node for injection inside the
// careers page's JSON-LD @graph — so it carries no own `@context` (the graph
// supplies one). Returns null when the row can't make a Google-valid posting:
// every field access is guarded because this runs over untyped third-party
// JSON in Astro page frontmatter, where a single throwing row would fail the
// build. We intentionally omit `validThrough` (the feed has no expiry, and a
// fabricated date silently drops the posting once passed) and a per-job `url`
// (there is no per-role route on rivet.dev; pointing off-site would 404 once a
// role is pulled, which risks a stale-posting manual action).
export function toJobPosting(job: WaasJob): Record<string, unknown> | null {
	if (!job || typeof job.title !== "string" || typeof job.description !== "string") {
		return null;
	}

	const datePosted = toIsoDate(job.pretty_updated_at);
	if (!datePosted) return null;

	// Only remote roles can be given a schema-valid location from this feed
	// (TELECOMMUTE, no address). The feed exposes no structured address for
	// onsite roles, so we skip those from the JSON-LD rather than emit a posting
	// missing the required location. Every current role is remote-only.
	const isRemote = job.remote === "only" || job.remote === "allowed";
	if (!isRemote) return null;

	const employmentType = typeof job.job_type === "string" ? WAAS_EMPLOYMENT_TYPES[job.job_type] : undefined;
	const hasSalary = typeof job.salary_min === "number" && typeof job.salary_max === "number";
	const skills = Array.isArray(job.skills)
		? job.skills
				.map((skill) => skill?.name)
				.filter((name): name is string => typeof name === "string" && name.length > 0)
		: [];

	return {
		"@type": "JobPosting",
		title: job.title,
		// HTML is valid (and preferred) for JobPosting.description. Injection is
		// safe because it is serialized through jsonLdString, which escapes "<".
		description: job.description,
		datePosted,
		// Remote-only: mark TELECOMMUTE and omit a physical jobLocation.
		// applicantLocationRequirements is deliberately omitted — the feed has no
		// machine-readable allowed-country list and the roles are globally open
		// ("wherever they live"), so we accept the Rich Results "recommended
		// field" notice rather than fabricate one from the sanctions exclusions.
		jobLocationType: "TELECOMMUTE",
		hiringOrganization: {
			"@type": "Organization",
			// Reuse the site-wide Organization node so consumers merge rather than
			// duplicate the entity.
			"@id": "https://rivet.dev/#organization",
			name: "Rivet",
			sameAs: "https://rivet.dev",
			logo: "https://assets.rivet.dev/website/public/icons/android-chrome-512x512.png",
		},
		...(job.id !== undefined && job.id !== null
			? { identifier: { "@type": "PropertyValue", name: "Rivet", value: String(job.id) } }
			: {}),
		...(hasSalary
			? {
					baseSalary: {
						"@type": "MonetaryAmount",
						// Inferred: the feed carries no currency field, but the US entity
						// and "$"/"K" salary strings imply USD.
						currency: "USD",
						value: {
							"@type": "QuantitativeValue",
							minValue: job.salary_min,
							maxValue: job.salary_max,
							unitText: "YEAR",
						},
					},
				}
			: {}),
		...(skills.length ? { skills: skills.join(", ") } : {}),
	};
}
