import { guidesSidebar } from "@/sitemap/products";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import type { AnyPage, SidebarItem } from "@/lib/sitemap";

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

interface GuideGroup {
	title: string;
	pages: { title: string; href: string }[];
}

/**
 * Flattens the Guides sidebar into one group per section, dropping the
 * section's link back to this overview. Nested sections are inlined.
 */
function guideGroups(overviewHref: string): GuideGroup[] {
	const pagesOf = (items: AnyPage[]): GuideGroup["pages"] =>
		items.flatMap((item) => {
			if ("pages" in item) return pagesOf(item.pages);
			if (!("title" in item) || !item.title || item.external) return [];
			const href = canonicalizeInternalHref(item.href);
			return href === overviewHref ? [] : [{ title: item.title, href }];
		});
	return guidesSidebar()
		.filter((item): item is Extract<SidebarItem, { pages: AnyPage[] }> => "pages" in item)
		.map((section) => ({ title: section.title, pages: pagesOf(section.pages) }))
		.filter((group) => group.pages.length > 0);
}

/**
 * The Guides overview, generated from the same sidebar the tab is built from:
 * one heading per sidebar section, then a card per guide in it. Adding a guide
 * to the Actors bundle's sidebar or to `SITE_GUIDES` updates both.
 *
 * `descriptions` maps each guide href to its frontmatter description; the
 * route supplies it from the content collections.
 */
export function GuideCards({
	overviewHref,
	descriptions,
}: {
	overviewHref: string;
	descriptions: Record<string, string | undefined>;
}) {
	return (
		<>
			{guideGroups(canonicalizeInternalHref(overviewHref)).map((group) => (
				<section key={group.title}>
					<h2 id={slugify(group.title)}>{group.title}</h2>
					<div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
						{group.pages.map((page) => (
							<a
								key={page.href}
								href={page.href}
								className="group flex flex-col gap-1 rounded-lg border border-ink/10 bg-white/55 p-4 no-underline transition-colors hover:border-ink/25"
							>
								<span className="text-[15px] font-medium text-ink">{page.title}</span>
								{descriptions[page.href] ? (
									<p className="text-[13px] leading-snug text-ink-soft">
										{descriptions[page.href]}
									</p>
								) : null}
							</a>
						))}
					</div>
				</section>
			))}
		</>
	);
}

/** Binds the overview's data so MDX can render a bare `<GuideCards />`. */
export function createGuideCards(props: Parameters<typeof GuideCards>[0]) {
	return function BoundGuideCards() {
		return <GuideCards {...props} />;
	};
}
