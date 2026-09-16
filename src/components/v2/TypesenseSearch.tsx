"use client";

import Typesense from "typesense";
import { Button, Dialog, DialogPortal, Kbd, cn } from "@rivet-gg/components";
import { useCallback, useEffect, useState } from "react";

const TYPESENSE_HOST =
	import.meta.env.PUBLIC_TYPESENSE_HOST ||
	"3lsug6t152oxcjndp-1.a1.typesense.net";
const TYPESENSE_PORT = Number(import.meta.env.PUBLIC_TYPESENSE_PORT) || 443;
const TYPESENSE_PROTOCOL =
	import.meta.env.PUBLIC_TYPESENSE_PROTOCOL || "https";
const TYPESENSE_SEARCH_API_KEY =
	import.meta.env.PUBLIC_TYPESENSE_SEARCH_API_KEY ||
	"pKb2bCyP3pHvB4H46bv6mi0t13zuhCTp";
const TYPESENSE_COLLECTION_NAME =
	import.meta.env.PUBLIC_TYPESENSE_COLLECTION_NAME || "rivet-docs";

const searchClient = new Typesense.Client({
	nodes: [
		{
			host: TYPESENSE_HOST,
			port: TYPESENSE_PORT,
			protocol: TYPESENSE_PROTOCOL,
		},
	],
	apiKey: TYPESENSE_SEARCH_API_KEY,
	connectionTimeoutSeconds: 2,
});

/** Mirrors `SearchDocument` in `src/metadata/search-index.ts`. */
interface SearchDocument {
	id: string;
	title: string;
	description: string;
	slug: string;
	headings: string[];
	content: string;
	path: string;
	product: string;
	section: string;
}

interface SearchResult {
	id: string;
	title: string;
	path: string;
	/** `Rivet Cloud › BYOC`; the section is empty for a product's root page. */
	crumbs: string[];
	/** Best matching passage, with `<mark>` around matched tokens. */
	snippet: string;
}

const MARK = /<\/?mark>/;

/**
 * Typesense returns snippets as-is apart from the `<mark>` tags it inserts, so
 * a page that documents HTML would inject markup if rendered as HTML. Split on
 * the tags instead and render the text between them as text.
 */
function Snippet({ value }: { value: string }) {
	const parts = value.split(MARK);
	return (
		<>
			{parts.map((part, index) =>
				index % 2 === 1 ? (
					<mark
						key={index}
						className="rounded-sm bg-pine/15 px-0.5 text-ink"
					>
						{part}
					</mark>
				) : (
					<span key={index}>{part}</span>
				),
			)}
		</>
	);
}

export function TypesenseSearch({ light = false }: { light?: boolean }) {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [inputFocused, setInputFocused] = useState(false);
	const [failed, setFailed] = useState(false);

	const handleResultClick = useCallback((result: SearchResult) => {
		window.location.href = result.path;
		setIsOpen(false);
		setQuery("");
	}, []);

	useEffect(
		function setShortcutListener() {
			const handleKeyDown = (e: KeyboardEvent) => {
				if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
					e.preventDefault();
					setIsOpen((prev) => !prev);
				}
				if (e.key === "Escape") {
					if (isOpen) {
						if (!inputFocused) {
							e.preventDefault();
							e.stopPropagation();
							setIsOpen(false);
						}
					}
				}
				if (isOpen && results.length > 0) {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setSelectedIndex(
							(prev) => (prev + 1) % results.length,
						);
					}
					if (e.key === "ArrowUp") {
						e.preventDefault();
						setSelectedIndex(
							(prev) =>
								(prev - 1 + results.length) % results.length,
						);
					}
					if (e.key === "Enter" && selectedIndex >= 0) {
						e.preventDefault();
						handleResultClick(results[selectedIndex]);
					}
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		},
		[isOpen, results, selectedIndex, handleResultClick, inputFocused],
	);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		const searchDebounce = setTimeout(async () => {
			try {
				const searchResults = await searchClient
					.collections<SearchDocument>(TYPESENSE_COLLECTION_NAME)
					.documents()
					.search({
						q: query,
						// A hit on the page's own name (title or URL slug)
						// outranks a heading, which outranks a mention in the
						// body. Without the ordering every page that says
						// "state" ties with the State page.
						query_by: "title,slug,headings,description,content",
						query_by_weights: "10,8,6,4,1",
						per_page: 10,
						highlight_fields: "content,description",
						highlight_affix_num_tokens: 10,
					});

				const hits =
					searchResults.hits?.map((hit) => {
						const highlight = hit.highlight ?? {};
						return {
							id: hit.document.id,
							title: hit.document.title,
							path: hit.document.path,
							crumbs: [
								hit.document.product,
								hit.document.section,
							].filter(Boolean),
							snippet:
								highlight.content?.snippet ??
								highlight.description?.snippet ??
								hit.document.description,
						};
					}) ?? [];

				setResults(hits);
				setSelectedIndex(0);
				setFailed(false);
			} catch (error) {
				console.error("Search error:", error);
				setResults([]);
				setFailed(true);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(searchDebounce);
	}, [query]);

	return (
		<>
			<Button
				onClick={() => setIsOpen(true)}
				variant="outline"
				className={cn(
					"relative h-8 w-full justify-start rounded-md text-sm font-normal shadow-none hidden md:flex md:w-24 lg:w-40",
					light
						? "border-ink/15 bg-white/55 text-ink-faint hover:border-ink/30 hover:bg-white hover:text-ink"
						: "bg-paper text-ink-faint",
				)}
			>
				<span className="hidden lg:inline-flex">Search...</span>
				<span className="inline-flex lg:hidden">Search...</span>
				<Kbd
					className={cn(
						"absolute right-1.5 top-1/2 -translate-y-1/2 hidden sm:flex",
						light && "!border-ink/20 !bg-ink/[0.06] !text-ink-soft",
					)}
				>
					<Kbd.Key />K
				</Kbd>
			</Button>
			<Dialog open={isOpen}>
				<DialogPortal>
					<div
						className="fixed inset-0 z-50 bg-paper/80 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					>
						<div
							role="dialog"
							aria-modal="true"
							aria-label="Search documentation"
							className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-ink/10 bg-paper text-ink shadow-lg"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center border-b border-ink/10 px-3">
								<input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onFocus={() => setInputFocused(true)}
									onBlur={() => setInputFocused(false)}
									className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
									placeholder="Search documentation..."
									autoFocus
								/>
							</div>
							<div className="max-h-[300px] overflow-y-auto">
								{isLoading && (
									<div className="p-4 text-center text-sm text-ink-faint">
										Searching...
									</div>
								)}
								{!isLoading && query && failed && (
									<div className="p-4 text-center text-sm text-ink-faint">
										Search is unavailable right now.
									</div>
								)}
								{!isLoading &&
									query &&
									!failed &&
									results.length === 0 && (
										<div className="p-4 text-center text-sm text-ink-faint">
											No results found for "{query}"
										</div>
									)}
								{!isLoading &&
									results.map((result, index) => (
										<div
											key={result.id}
											className={cn(
												"p-3 hover:bg-ink/[0.04] cursor-pointer border-b border-ink/10 last:border-b-0",
												index === selectedIndex &&
													"bg-ink/[0.04]",
											)}
											onClick={() =>
												handleResultClick(result)
											}
										>
											<div className="text-sm font-medium text-ink">
												{result.title}
											</div>
											<div className="mb-1 text-xs text-pine">
												{result.crumbs.join(" › ")}
											</div>
											{result.snippet && (
												<div className="text-xs text-ink-faint line-clamp-2">
													<Snippet
														value={result.snippet}
													/>
												</div>
											)}
										</div>
									))}
							</div>
							<div className="flex items-center justify-between p-3 pt-2 border-t border-ink/10">
								<p className="text-xs text-ink-faint">
									Press{" "}
									<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-ink/10 bg-paper-mid px-1.5 font-mono text-[10px] font-medium">
										⌘K
									</kbd>{" "}
									to search
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsOpen(false)}
									className="h-auto p-1 text-xs text-ink hover:bg-ink/[0.06] hover:text-ink focus-visible:ring-2 focus-visible:ring-pine"
								>
									ESC
								</Button>
							</div>
						</div>
					</div>
				</DialogPortal>
			</Dialog>
		</>
	);
}
