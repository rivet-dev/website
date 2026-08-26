export interface SeoOverrides {
	/** Unbranded title. BaseLayout adds the Rivet suffix. */
	seoTitle?: string;
	/** Plain-text search description. */
	seoDescription?: string;
}

const TITLE_MIN = 20;
const TITLE_MAX = 65;
const DESCRIPTION_MIN = 100;
const DESCRIPTION_MAX = 160;
const DESCRIPTION_TARGET_MIN = 110;
const DESCRIPTION_TARGET_MAX = 155;

/**
 * Content descriptions occasionally contain Markdown because they are also
 * rendered as prose. Metadata must be plain text, so normalize it at the final
 * SEO boundary without changing the visible copy or historical source.
 */
export function stripSeoMarkup(value: string): string {
	return value
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/[`*_~]+/g, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/^\s*[-#>]\s*/gm, "")
		.replace(/\s+/g, " ")
		.trim();
}

function truncateAtWord(value: string, maxLength: number): string {
	if (value.length <= maxLength) return value;
	const clipped = value.slice(0, maxLength - 1);
	const lastSpace = clipped.lastIndexOf(" ");
	return `${(lastSpace > maxLength * 0.7 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/**
 * Adds useful section context to titles that would otherwise be too short for
 * a search result. Long editorial titles are left for an explicit seoTitle.
 */
export function contextualSeoTitle(title: string, context: string): string {
	const cleanTitle = stripSeoMarkup(title);
	const candidate = `${cleanTitle} | ${context}`;
	// Account for BaseLayout's ` - Rivet` brand suffix.
	if (`${candidate} - Rivet`.length <= TITLE_MAX) return candidate;
	return cleanTitle;
}

/**
 * Fits a description into the editorial SEO guardrails. Short descriptions
 * gain page-specific context; long prose is clipped on a word boundary. This
 * is intentionally only used at metadata boundaries, never for visible copy.
 */
export function contextualSeoDescription(
	description: string,
	contextSentence: string,
): string {
	const clean = stripSeoMarkup(description);
	const context = stripSeoMarkup(contextSentence);
	let combined = clean;
	if (combined.length < DESCRIPTION_TARGET_MIN) {
		combined = `${combined} ${context}`.trim();
	}
	if (combined.length < DESCRIPTION_TARGET_MIN) {
		combined = `${combined} Review setup steps, practical examples, and production guidance.`;
	}
	return truncateAtWord(combined, DESCRIPTION_TARGET_MAX);
}

export function resolveSeoMetadata({
	title,
	description,
	seoTitle,
	seoDescription,
}: {
	title: string;
	description: string;
} & SeoOverrides): { title: string; description: string } {
	return {
		title: stripSeoMarkup(seoTitle ?? title),
		description: stripSeoMarkup(seoDescription ?? description),
	};
}

export const SEO_LENGTHS = {
	title: { min: TITLE_MIN, max: TITLE_MAX },
	description: { min: DESCRIPTION_MIN, max: DESCRIPTION_MAX },
} as const;
