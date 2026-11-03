import { guidesSidebar } from "@/sitemap/products";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import type { AnyPage } from "@/lib/sitemap";
import { DiagramMini } from "@/components/docs/diagram/Diagram";
import type { DiagramSpec } from "@/components/docs/diagram/fromMdx";

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

/** Flattens the guide categories into one group each. Nested sections are inlined. */
function guideGroups(): GuideGroup[] {
	const pagesOf = (items: AnyPage[]): GuideGroup["pages"] =>
		items.flatMap((item) => {
			if ("pages" in item) return pagesOf(item.pages);
			if (!("title" in item) || !item.title || item.external) return [];
			return [{ title: item.title, href: canonicalizeInternalHref(item.href) }];
		});
	return guidesSidebar()
		.map((section) => ({ title: section.title, pages: pagesOf(section.pages) }))
		.filter((group) => group.pages.length > 0);
}

/**
 * Every guide, generated from the same categories the Overview tab's sidebar
 * lists: one h3 per category (the page supplies the h2), then a card per guide. Adding a guide
 * to any bundle's `guides` sidebar updates both. The docs overview (`/docs/`)
 * renders it.
 *
 * `descriptions` maps each guide href to its frontmatter description and
 * `diagrams` to the data of its `<Diagram>`, drawn as a thumbnail on the card;
 * the route supplies both from the content collections.
 */
export function GuideCards({
	descriptions,
	diagrams,
}: {
	descriptions: Record<string, string | undefined>;
	diagrams: Record<string, DiagramSpec | undefined>;
}) {
	return (
		<>
			{guideGroups().map((group) => (
				<section key={group.title}>
					<h3 id={slugify(group.title)}>{group.title}</h3>
					<div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
						{group.pages.map((page) => (
							<a
								key={page.href}
								href={page.href}
								className="group flex flex-col gap-1 rounded-lg border border-ink/10 bg-white/55 p-4 no-underline transition-colors hover:border-ink/25"
							>
								{diagrams[page.href] ? (
									<div className="mb-3 h-32 rounded-md border border-ink/5 bg-paper/60 px-2 py-3">
										<DiagramMini {...(diagrams[page.href] as DiagramSpec)} />
									</div>
								) : null}
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

/** Binds the route's data so MDX can render a bare `<GuideCards />`. */
export function createGuideCards(props: Parameters<typeof GuideCards>[0]) {
	return function BoundGuideCards() {
		return <GuideCards {...props} />;
	};
}
