"use client";

import { usePathname } from "@/hooks/usePathname";
import { findProductForPath, products, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { cn } from "@rivet-gg/components";
import { Icon, faCheck, faChevronDown } from "@rivet-gg/icons";
import { useEffect, useRef, useState } from "react";

// Product wordmarks are white-on-transparent, so they need inverting on the
// porcelain field. Glyph fallbacks already inherit the ink color.
export function ProductMark({
	product,
	className,
}: { product: Product; className?: string }) {
	const logo = productLogos[product.id];
	if (logo) {
		return (
			<img
				src={logo.src}
				alt=""
				aria-hidden="true"
				width={18}
				height={18}
				className={cn("shrink-0 invert opacity-85", className)}
				loading="lazy"
				decoding="async"
			/>
		);
	}
	if (product.icon) {
		return (
			<Icon
				icon={product.icon}
				aria-hidden="true"
				className={cn("shrink-0 text-ink-soft", className)}
			/>
		);
	}
	return null;
}

function ProductSwitcher({
	current,
	currentTabId,
	label,
}: {
	current?: Product;
	currentTabId: string;
	/** Used by docs sections that are not a product vertical (integrations). */
	label?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen]);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				aria-expanded={isOpen}
				aria-haspopup="menu"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex h-9 items-center gap-2 rounded-lg border border-ink/15 bg-white/55 pl-2.5 pr-2 text-sm text-ink transition-colors hover:border-ink/30"
			>
				{current && (
					<ProductMark product={current} className="h-[18px] w-[18px]" />
				)}
				<span className="font-medium">{current?.name ?? label}</span>
				<Icon
					icon={faChevronDown}
					aria-hidden="true"
					className={cn(
						"h-3 w-3 text-ink-faint transition-transform duration-150",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			<div
				role="menu"
				className={cn(
					"absolute left-0 top-full z-50 mt-2 w-[24rem] overflow-hidden rounded-2xl border border-ink/10 bg-paper/95 p-1.5 shadow-[0_18px_50px_-32px_rgba(27,25,22,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] transition-all duration-150",
					isOpen
						? "pointer-events-auto translate-y-0 opacity-100"
						: "pointer-events-none -translate-y-1 opacity-0",
				)}
			>
				{products.map((product) => {
					const isCurrent = product.id === current?.id;
					// Switching products keeps you on the same tab, which is the
					// whole point of the switcher: compare Deploy to Deploy.
					const target =
						product.tabs.find((tab) => tab.id === currentTabId)?.href ??
						product.tabs[0].href;
					return (
						<a
							key={product.id}
							href={target}
							role="menuitem"
							className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-ink/[0.07]"
						>
							<ProductMark product={product} className="h-[18px] w-[18px]" />
							<div className="min-w-0 flex-1">
								<div className="text-sm font-medium leading-tight text-ink">
									{product.name}
								</div>
								<div className="text-xs leading-tight text-ink-faint">
									{product.description}
								</div>
							</div>
							{isCurrent && (
								<Icon
									icon={faCheck}
									aria-hidden="true"
									className="h-3 w-3 text-pine"
								/>
							)}
						</a>
					);
				})}
			</div>
		</div>
	);
}

/**
 * Second header row inside a product vertical: which product you are in, a
 * switcher to jump to the same tab of another product, and that product's three
 * docs tabs.
 */
export function ProductBar({
	initialPathname = "",
	productId,
	tabId,
	sectionLabel,
}: {
	initialPathname?: string;
	productId?: string;
	tabId?: string;
	/** Label for docs sections that are not a product vertical. */
	sectionLabel?: string;
}) {
	// usePathname is empty during SSR and the first client render, so seed it
	// from the Astro-provided pathname.
	const pathname = usePathname() || initialPathname;
	const fromPath = findProductForPath(pathname.replace(/\/$/, ""));
	const product =
		products.find((candidate) => candidate.id === productId) ??
		fromPath?.product;
	const activeTabId = tabId ?? fromPath?.tab.id;

	if (!product && !sectionLabel) return null;

	return (
		<div className="-mx-8 hidden h-14 items-center gap-5 bg-[#e9e9eb] px-8 md:flex">
			<ProductSwitcher
				current={product}
				currentTabId={activeTabId ?? "docs"}
				label={sectionLabel}
			/>
			<div className="flex h-full items-center gap-4">
				{product?.tabs.map((tab) => (
					<a
						key={tab.id}
						href={tab.href}
						aria-current={tab.id === activeTabId ? "page" : undefined}
						className="flex h-full items-center rounded-none border-b-2 border-transparent px-0 text-sm text-ink-faint transition-colors hover:text-ink-soft aria-[current=page]:border-pine aria-[current=page]:text-ink"
					>
						{tab.title}
					</a>
				))}
			</div>
		</div>
	);
}
