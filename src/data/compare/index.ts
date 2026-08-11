import type { CompareEntry } from './types';
import { cloudflareDurableObjects } from './cloudflare-durable-objects';
import { temporal } from './temporal';

// Ordered registry of comparison pages. Adding a page means adding one data
// module in this directory and one line here; the /compare routes and the
// "Other comparisons" links derive from this list.
export const compareEntries: CompareEntry[] = [cloudflareDurableObjects, temporal];

export function getCompareEntry(slug: string): CompareEntry | undefined {
	return compareEntries.find((entry) => entry.slug === slug);
}

export function compareEntriesForProduct(productId: string): CompareEntry[] {
	return compareEntries.filter((entry) => entry.product === productId);
}

/** Canonical path for a comparison, e.g. `/workflows/compare/rivet-workflows-vs-temporal`. */
export function compareHref(entry: CompareEntry): string {
	return `/${entry.product}/compare/${entry.slug}`;
}
