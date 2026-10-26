import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Preview {
	title: string;
	description: string;
	/** Markup of the page's first diagram, copied from the rendered page. */
	diagram?: string;
	headings: string[];
}

interface Shown {
	href: string;
	top: number;
	left: number;
	preview?: Preview;
}

const CARD_WIDTH = 440;

// One fetch per page for the whole session, shared across sidebars.
const cache = new Map<string, Promise<Preview | undefined>>();

function loadPreview(href: string): Promise<Preview | undefined> {
	let pending = cache.get(href);
	if (!pending) {
		pending = fetch(href)
			.then((response) => (response.ok ? response.text() : undefined))
			.then((html) => (html ? parsePreview(html) : undefined))
			.catch(() => undefined);
		cache.set(href, pending);
	}
	return pending;
}

function parsePreview(html: string): Preview | undefined {
	const doc = new DOMParser().parseFromString(html, "text/html");
	const article = doc.querySelector(".docs-article");
	const title = article?.querySelector("h1")?.textContent?.trim();
	if (!article || !title) return undefined;
	// Prefer the page's own lead paragraph. The meta description is padded for search engines.
	const lead = article.querySelector(":scope > h1 ~ p");
	const description =
		lead?.textContent?.trim() ||
		doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ||
		"";
	const svg = article.querySelector('[data-diagram] svg, svg[role="img"]');
	if (svg instanceof SVGElement) {
		// Fill the card instead of keeping the page's minimum width.
		svg.style.minWidth = "0";
		svg.style.margin = "0";
		svg.style.width = "100%";
		svg.style.maxWidth = "none";
	}
	const headings = [...article.querySelectorAll("h2")]
		.map((heading) => heading.textContent?.trim() ?? "")
		.filter(Boolean)
		.slice(0, 6);
	return { title, description, diagram: svg?.outerHTML, headings };
}

function internalLink(target: EventTarget | null): HTMLAnchorElement | undefined {
	const link = target instanceof Element ? target.closest("a[href]") : null;
	if (!(link instanceof HTMLAnchorElement)) return undefined;
	if (link.target === "_blank" || link.origin !== window.location.origin) return undefined;
	if (link.getAttribute("aria-current") === "page") return undefined;
	return link;
}

/**
 * Hover previews for sidebar links. Wraps the sidebar tree; hovering a link
 * opens a card right away and fetches that page once and shows its title, description, first
 * diagram, and sections in a card beside the sidebar, so readers can skim what
 * each page holds without opening it. Pointer devices only.
 */
export function SidebarPreview({ children }: { children: React.ReactNode }) {
	const [shown, setShown] = useState<Shown>();
	const current = useRef<string | undefined>(undefined);

	const hide = useCallback(() => {
		current.current = undefined;
		setShown(undefined);
	}, []);

	const onOver = useCallback((event: React.PointerEvent) => {
		// Touch taps also fire pointer events; previews are for a mouse only.
		if (event.pointerType !== "mouse" || window.innerWidth < 1024) return;
		const link = internalLink(event.target);
		if (!link) return;
		const href = link.pathname;
		if (current.current === href) return;
		current.current = href;
		const rect = link.getBoundingClientRect();
		const sidebar = link.closest("[data-sidebar-preview]")?.getBoundingClientRect();
		const left = (sidebar?.right ?? rect.right) + 12;
		const top = Math.min(Math.max(rect.top - 12, 76), window.innerHeight - 340);
		setShown({ href, top, left });
		loadPreview(href).then((preview) => {
			if (current.current === href) setShown({ href, top, left, preview });
		});
	}, []);

	const onOut = useCallback(
		(event: React.PointerEvent) => {
			const next = internalLink(event.relatedTarget);
			if (!next || next.pathname !== current.current) hide();
		},
		[hide],
	);

	return (
		<div data-sidebar-preview="" onPointerOver={onOver} onPointerOut={onOut} onClick={hide}>
			{children}
			{/* Portaled: the sidebar's mask would clip a fixed card drawn inside it. */}
			{shown &&
				createPortal(
				<div
					role="tooltip"
					className="pointer-events-none fixed z-50 rounded-xl border border-ink/10 p-4 shadow-xl"
					style={{
						top: shown.top,
						left: shown.left,
						width: CARD_WIDTH,
						background: "rgb(var(--site-surface, 255 255 255))",
					}}
				>
					{shown.preview ? (
						<>
							<p className="text-[15px] font-medium text-ink">{shown.preview.title}</p>
							{shown.preview.description ? (
								<p className="mt-1 line-clamp-3 text-[13px] leading-snug text-ink-soft">{shown.preview.description}</p>
							) : null}
							{shown.preview.diagram ? (
								<div
									className="docs-article not-prose mt-3 max-h-56 overflow-hidden rounded-md border border-ink/5 bg-paper/60 p-2"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: same-origin markup from this site's own rendered page.
									dangerouslySetInnerHTML={{ __html: shown.preview.diagram }}
								/>
							) : null}
							{shown.preview.headings.length > 0 ? (
								<ul className="mt-3 flex flex-wrap gap-1.5">
									{shown.preview.headings.map((heading) => (
										<li key={heading} className="rounded-md bg-ink/5 px-2 py-0.5 text-[12px] text-ink-soft">
											{heading}
										</li>
									))}
								</ul>
							) : null}
						</>
					) : (
						<div className="space-y-2">
							<div className="h-4 w-1/2 animate-pulse rounded bg-ink/10" />
							<div className="h-3 w-5/6 animate-pulse rounded bg-ink/10" />
							<div className="h-32 animate-pulse rounded bg-ink/5" />
						</div>
					)}
				</div>,
					document.body,
				)}
		</div>
	);
}
