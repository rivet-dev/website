"use client";
import { usePathname } from "@/hooks/usePathname";
import { SidebarAccentProvider, Tree } from "@/components/DocsNavigation";
import { NavigationStateProvider } from "@/providers/NavigationStateProvider";
import type { SidebarItem } from "@/lib/sitemap";
import logoUrl from "@/images/rivet-logos/icon-text-white.svg";
import logoTextBlackUrl from "@/images/rivet-logos/icon-text-black.svg";
import logoIconUrl from "@/images/rivet-logos/icon-white.svg";
import { cn } from "@rivet-gg/components";
import { Header as RivetHeader } from "@rivet-gg/components/header";
import { Icon, type IconProp } from "@rivet-gg/icons";
import {
	EYEBROW_CLASS,
	HEADER_PRIMARY_INK_BUTTON_CLASS,
	HEADER_SECONDARY_BUTTON_CLASS,
} from "@/components/marketing/typography";
import { SITE_WIDE_GUTTERED_RAIL_CLASS } from "@/components/marketing/layout";
import React, { type ReactNode, useEffect, useId, useRef, useState } from "react";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@rivet-gg/components";
import { faArrowRight, faChevronDown } from "@rivet-gg/icons";
import { GitHubDropdown } from "./GitHubDropdown";
import { HeaderSearch } from "./HeaderSearch";
import { LogoContextMenu } from "./LogoContextMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DocsTabs, ProductBar, ProductBadge } from "@/components/ProductBar";
import { DOCS_TABS, activeDocsTab } from "@/sitemap/docsTabs";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import {
	DOCS_MENU,
	SOLUTIONS_MENU,
	SOLUTIONS_MENU_FOOTER,
} from "@/data/nav-menus";
import { findStandaloneProduct, getProduct, visibleTabs } from "@/sitemap/products";
import { wordmarkMaskStyle } from "@/lib/product-accent";

// Both assets carry the same black badge; only the word color differs.
// CSS selects the asset before hydration, without inverting the badge.
function RivetLogo({ className }: { className?: string }) {
	return (
		<span className={cn("block w-20 shrink-0", className)}>
			<img className="rivet-logo-light" src={logoTextBlackUrl.src} width={80} height={27} alt="Rivet logo" />
			<img className="rivet-logo-dark" src={logoUrl.src} width={80} height={27} alt="Rivet logo" />
		</span>
	);
}

interface TextNavItemProps {
	href: string;
	children: ReactNode;
	className?: string;
	ariaCurrent?: boolean | "page" | "step" | "location" | "date" | "time";
}

function TextNavItem({
	href,
	children,
	className,
	ariaCurrent,
}: TextNavItemProps) {
	return (
		<div className={cn("px-2.5 py-2", className)}>
			<RivetHeader.NavItem asChild>
				<a
					href={canonicalizeInternalHref(href)}
					className={cn(
						"text-zinc-400 hover:text-white transition-colors duration-200",
						ariaCurrent === "page" && "text-white",
					)}
					aria-current={ariaCurrent}
				>
					{children}
				</a>
			</RivetHeader.NavItem>
		</div>
	);
}

/**
 * The shared header menu shell: hover-to-open with a close delay, click to pin,
 * Escape to dismiss, and an invisible bridge across the gap down to the panel.
 *
 * Extracted from the Products menu so Solutions and Documentation behave
 * identically rather than each growing their own timing.
 */
function NavDropdown({
	label,
	active,
	lightTheme = false,
	align = "center",
	children,
}: {
	label: string;
	active?: boolean;
	lightTheme?: boolean;
	align?: "center" | "start";
	children: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lightDropdownRef = useRef<HTMLDivElement>(null);
	const lightTriggerRef = useRef<HTMLButtonElement>(null);
	const focusFromPointerRef = useRef(false);
	const pinnedOpenRef = useRef(false);
	const lightDropdownId = useId();

	const cancelClose = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
			closeTimeoutRef.current = null;
		}
	};

	const scheduleClose = () => {
		cancelClose();
		closeTimeoutRef.current = setTimeout(() => {
			if (
				document.activeElement instanceof Node &&
				lightDropdownRef.current?.contains(document.activeElement)
			) {
				return;
			}
			pinnedOpenRef.current = false;
			setIsOpen(false);
		}, 150);
	};

	const handleMouseEnter = () => {
		cancelClose();
		setIsOpen(true);
	};

	const handleMouseLeave = () => {
		scheduleClose();
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			cancelClose();
			pinnedOpenRef.current = false;
			setIsOpen(false);
		}
	};

	const handlePointerDown = (e: React.PointerEvent) => {
		e.preventDefault();
		cancelClose();
		setIsOpen((prev) => !prev);
	};

	useEffect(() => {
		return () => cancelClose();
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (lightDropdownRef.current?.contains(event.target as Node)) return;
			if (closeTimeoutRef.current) {
				clearTimeout(closeTimeoutRef.current);
				closeTimeoutRef.current = null;
			}
			pinnedOpenRef.current = false;
			setIsOpen(false);
		};

		document.addEventListener("pointerdown", closeOnOutsidePointer, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
		};
	}, [isOpen]);

	return (
		<div
			ref={lightDropdownRef}
			className={cn("group/products px-2.5 py-2", align === "start" && "relative")}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onPointerDownCapture={() => {
				// Pointer activation focuses the button before `click`. Let `click`
				// perform the toggle so touch users do not immediately reopen it.
				focusFromPointerRef.current = true;
				queueMicrotask(() => {
					focusFromPointerRef.current = false;
				});
			}}
			onFocusCapture={() => {
				if (focusFromPointerRef.current) return;
				cancelClose();
				setIsOpen(true);
			}}
			onBlurCapture={(event) => {
				if (
					event.relatedTarget instanceof Node &&
					event.currentTarget.contains(event.relatedTarget)
				) {
					return;
				}
				cancelClose();
				pinnedOpenRef.current = false;
				setIsOpen(false);
			}}
			onKeyDown={(event) => {
				if (event.key !== "Escape" || !isOpen) return;
				event.preventDefault();
				event.stopPropagation();
				cancelClose();
				lightTriggerRef.current?.focus();
				pinnedOpenRef.current = false;
				setIsOpen(false);
			}}
		>
			<RivetHeader.NavItem asChild>
				<button
					ref={lightTriggerRef}
					type="button"
					aria-expanded={isOpen}
					aria-controls={lightDropdownId}
					className={cn(
						"cursor-pointer flex items-center gap-1 relative rounded-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
						lightTheme
							? "focus-visible:ring-pine focus-visible:ring-offset-paper !text-ink-soft hover:!text-ink"
							: "focus-visible:ring-white/60 focus-visible:ring-offset-neutral-950 !text-zinc-400 hover:!text-white",
						active && (lightTheme ? "!text-ink" : "!text-white"),
						// Invisible hover bridge spanning the visual gap down to the
						// dropdown panel so moving the mouse from the trigger to the
						// panel does not cross a dead zone and close the menu. Keep
						// this height >= the panel's gap below (top-[71px] / lg:mt-5).
						"after:absolute after:left-0 after:right-0 after:top-full after:h-10 after:content-['']",
					)}
					onMouseEnter={handleMouseEnter}
					onClick={() => {
						cancelClose();
						pinnedOpenRef.current = !pinnedOpenRef.current;
						setIsOpen(pinnedOpenRef.current);
					}}
				>
					{label}
					<Icon
						aria-hidden="true"
						icon={faChevronDown}
						className={cn(
							"h-3 w-3 ml-0.5 transition-transform duration-200",
							isOpen && "rotate-180",
						)}
					/>
				</button>
			</RivetHeader.NavItem>
			<div
				id={lightDropdownId}
				inert={!isOpen}
				aria-hidden={!isOpen}
				className={cn(
					// Opaque on purpose, in either theme: the dropdown overlays body
					// copy, unlike the pill at the top edge, so page content must
					// never show through it.
					"z-50 -translate-y-1 overflow-hidden rounded-2xl border p-1.5 opacity-0 backdrop-blur-[18px] backdrop-saturate-[1.4] transition-all duration-150 pointer-events-none",
					lightTheme
						? "border-ink/10 bg-white shadow-[0_18px_50px_-32px_rgba(27,25,22,0.42)]"
						: "border-white/10 bg-neutral-950 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.85)]",
					align === "start"
						? "fixed left-1/2 top-[71px] w-[min(720px,calc(100vw-3rem))] -translate-x-1/2 lg:absolute lg:left-0 lg:top-full lg:mt-5 lg:translate-x-0"
						: "fixed left-1/2 top-[71px] w-[min(720px,calc(100vw-3rem))] -translate-x-1/2",
					isOpen
						? "pointer-events-auto translate-y-0 opacity-100"
						: "pointer-events-none -translate-y-1 opacity-0",
				)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{children}
			</div>
		</div>
	);
}

/**
 * The tile at the head of a menu row. Product rows take the product's accent
 * tile via `ProductBadge`; the rest take a glyph in a quiet outlined tile of
 * the same size, so both columns of a menu share one rhythm. Drawn with
 * tokens only so it holds in both themes.
 */
/**
 * The quiet outlined tile at the head of a non-product menu row, sized to the
 * product tiles beside it so both columns share one rhythm. Drawn with tokens
 * only so it holds in both themes. Takes either a Font Awesome glyph or a
 * white-on-transparent mark, which is masked and painted in the tile's text
 * color.
 */
function GlyphTile({
	lightTheme,
	className,
	children,
}: { lightTheme: boolean; className?: string; children: React.ReactNode }) {
	return (
		<span
			className={cn(
				"flex shrink-0 items-center justify-center rounded-[34.375%] border",
				lightTheme
					? "border-ink/10 bg-paper text-ink-soft group-hover:border-ink/20 group-hover:text-ink"
					: "border-white/10 bg-white/5 text-zinc-300 group-hover:text-white",
				className ?? "size-8",
			)}
		>
			{children}
		</span>
	);
}

function MenuGlyph({ icon, lightTheme }: { icon: IconProp; lightTheme: boolean }) {
	return (
		<GlyphTile lightTheme={lightTheme}>
			<Icon icon={icon} aria-hidden="true" className="h-3.5 w-3.5" />
		</GlyphTile>
	);
}

function MenuMark({
	src,
	lightTheme,
	className,
	markClassName = "size-4",
}: { src: string; lightTheme: boolean; className?: string; markClassName?: string }) {
	return (
		<GlyphTile lightTheme={lightTheme} className={className}>
			<span
				aria-hidden="true"
				style={wordmarkMaskStyle(src)}
				className={cn("inline-block bg-current", markClassName)}
			/>
		</GlyphTile>
	);
}

/** Shared row chrome for both menus: full-width link, quiet hover fill. */
function menuRowClass(lightTheme: boolean) {
	return cn(
		"group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
		lightTheme
			? "text-ink hover:bg-paper-mid focus-visible:ring-pine"
			: "text-white hover:bg-white/5 focus-visible:ring-white/60",
	);
}

/** The strip along the bottom of a menu: one quiet, arrowed link. */
function MenuFooter({
	href,
	label,
	lightTheme,
}: {
	href: string;
	label: string;
	lightTheme: boolean;
}) {
	return (
		<div
			className={cn(
				"-mx-1.5 -mb-1.5 mt-1.5 border-t px-4 py-2.5",
				lightTheme ? "border-ink/10 bg-paper" : "border-white/10 bg-white/[0.03]",
			)}
		>
			<a
				href={canonicalizeInternalHref(href)}
				className={cn(
					"group inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline",
					lightTheme ? "text-ink-soft hover:text-ink" : "text-zinc-400 hover:text-white",
				)}
			>
				{label}
				<Icon
					icon={faArrowRight}
					aria-hidden="true"
					className="h-3 w-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
				/>
			</a>
		</div>
	);
}

/**
 * Solutions: the audiences from the landing page's "Built for every kind of
 * agent" section. Each row opens the guide for building that kind of agent.
 */
function SolutionsDropdown({ lightTheme = false }: { lightTheme?: boolean }) {
	return (
		<NavDropdown label="Solutions" lightTheme={lightTheme} align="start">
			<div className={cn(EYEBROW_CLASS, "px-3 pt-3 pb-1", !lightTheme && "!text-zinc-500")}>
				Built for every kind of agent
			</div>
			<ul className="grid gap-x-1 sm:grid-cols-2">
				{SOLUTIONS_MENU.map((item) => (
					<li key={item.id}>
						<a href={canonicalizeInternalHref(item.href)} className={menuRowClass(lightTheme)}>
							<MenuGlyph icon={item.icon} lightTheme={lightTheme} />
							<span className="min-w-0 flex-1">
								<span className="block truncate font-medium leading-tight">{item.label}</span>
								<span
									className={cn(
										"mt-0.5 block truncate text-xs leading-snug",
										lightTheme ? "text-ink-faint" : "text-zinc-400",
									)}
								>
									{item.description}
								</span>
							</span>
						</a>
					</li>
				))}
			</ul>
			<MenuFooter
				href={SOLUTIONS_MENU_FOOTER.href}
				label={SOLUTIONS_MENU_FOOTER.label}
				lightTheme={lightTheme}
			/>
		</NavDropdown>
	);
}

/**
 * Documentation, in two columns: Orchestration (what runs the workloads) and
 * Actors (the workloads themselves), split by a hairline. Product rows carry
 * their `ProductBadge`; orchestration rows carry a glyph tile of the same size.
 */
function DocsDropdown({
	active,
	lightTheme = false,
}: {
	active?: boolean;
	lightTheme?: boolean;
}) {
	return (
		<NavDropdown
			label="Documentation"
			active={active}
			lightTheme={lightTheme}
			align="start"
		>
			<div
				className={cn(
					"grid gap-y-2 sm:grid-cols-2 sm:divide-x",
					lightTheme ? "divide-ink/10" : "divide-white/10",
				)}
			>
				{DOCS_MENU.map((column, index) => (
					<div
						key={column[0].label}
						className={cn("flex flex-col", index > 0 && "sm:pl-1.5")}
					>
						{column.map((group) => (
							<div key={group.label} className="flex flex-col">
								<div
									className={cn(
										EYEBROW_CLASS,
										"px-3 pt-3 pb-1",
										!lightTheme && "!text-zinc-500",
									)}
								>
									{group.label}
								</div>
								{group.links.map((link) => {
									const product = link.productId
										? getProduct(link.productId)
										: undefined;
									return (
										<a
											key={link.href}
											href={canonicalizeInternalHref(link.href)}
											className={cn(menuRowClass(lightTheme), "font-medium")}
										>
											{product ? (
												<ProductBadge product={product} className="size-8" />
											) : link.markSrc ? (
												<MenuMark src={link.markSrc} lightTheme={lightTheme} />
											) : link.icon ? (
												<MenuGlyph icon={link.icon} lightTheme={lightTheme} />
											) : (
												<span aria-hidden="true" className="size-8 shrink-0" />
											)}
											<span className="min-w-0 flex-1 truncate">{link.label}</span>
										</a>
									);
								})}
							</div>
						))}
					</div>
				))}
			</div>
		</NavDropdown>
	);
}

interface HeaderProps {
	active?:
	| "product"
	| "docs"
	| "cookbook"
	| "blog"
	| "pricing"
	| "learn";
	subnav?: ReactNode;
	mobileSidebar?: ReactNode;
	sidebarData?: SidebarItem[];
	variant?: "floating" | "full-width";
	learnMode?: boolean;
	showProductBar?: boolean;
	light?: boolean;
	initialPathname?: string;
	productId?: string;
	tabId?: string;
	sectionLabel?: string;
	pageFamily?: "default" | "site";
}

export function Header({
	active,
	subnav,
	mobileSidebar,
	sidebarData,
	variant = "full-width",
	learnMode = false,
	showProductBar = false,
	light = false,
	initialPathname = "",
	productId,
	tabId,
	sectionLabel,
	pageFamily = "default",
}: HeaderProps) {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		if (variant === "floating") {
			const handleScroll = () => {
				setIsScrolled(window.scrollY > 20);
			};

			window.addEventListener("scroll", handleScroll);
			return () => window.removeEventListener("scroll", handleScroll);
		}
	}, [variant]);

	const clientPathname = usePathname();
	const pathname = clientPathname || initialPathname;
	// The floating variant only renders on marketing pages, which are all
	// porcelain. The full-width variant is porcelain for docs (light=true) and
	// stays dark for the Learn section.
	const isLightTheme = variant === "floating" || light;

	// On docs pages the second header row is the docs tab strip, identical on
	// every docs page. Standalone subsites (agentOS, Secure Exec) keep their own
	// product bar instead: the product lockup plus that product's tabs.
	const standalone =
		(productId ? getProduct(productId) : undefined) ?? findStandaloneProduct(pathname);
	const effectiveSubnav = showProductBar ? (
		standalone?.standalone ? (
			<ProductBar initialPathname={pathname} productId={standalone.id} tabId={tabId} dark={!isLightTheme} />
		) : (
			<DocsTabs initialPathname={pathname} dark={!isLightTheme} />
		)
	) : (
		subnav
	);

	// Set body attribute for global CSS targeting (e.g., mobile sheet styling)
	useEffect(() => {
		if (isLightTheme) {
			document.body.setAttribute('data-light-theme', 'true');
		} else {
			document.body.removeAttribute('data-light-theme');
		}
		return () => {
			document.body.removeAttribute('data-light-theme');
		};
	}, [isLightTheme]);

	if (variant === "floating") {
		const headerStyles = cn(
			"border-transparent static bg-transparent rounded-2xl [&>div:first-child]:px-3 backdrop-blur-none transition-all hover:opacity-100",
			pageFamily === "site" ? "w-full max-w-none" : "max-w-[960px] md:max-w-[1200px]",
			isScrolled ? "opacity-100" : "opacity-100 md:opacity-80",
		);

		return (
			<div
				className={cn(
					"fixed top-2 z-50 w-full",
					pageFamily === "site"
						? cn("left-1/2 -translate-x-1/2 md:top-4", SITE_WIDE_GUTTERED_RAIL_CLASS)
						: "max-w-[960px] px-3 md:left-1/2 md:top-4 md:-translate-x-1/2 md:px-6",
					isLightTheme && "selection:bg-orange-200 selection:text-orange-900"
				)}
				data-light-theme={isLightTheme ? "true" : undefined}
			>
				<div
					className={cn(
						"hero-bg-exclude",
						'relative before:pointer-events-none before:absolute before:inset-[-1px] before:z-20 before:block before:rounded-2xl before:border before:border-ink/10 before:content-[""] before:transition-colors before:duration-300 before:ease-in-out',
					)}
				>
					{/* White glass pill: frosted fill with a soft top sheen. The pill's
						outline is the ink/10 hairline on the parent's ::before, so this
						layer carries no border of its own. */}
					<div className="site-header-glass absolute inset-0 -z-[1] overflow-hidden rounded-2xl bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-[18px] backdrop-saturate-[1.4]" />
					<RivetHeader
						className={headerStyles}
						logo={
							<>
								{/* Mobile logo */}
								<div className="md:hidden ml-1">
									<a href="/">
										<RivetLogo />
									</a>
								</div>
								{/* Desktop logo */}
								<div className="hidden md:block">
									<LogoContextMenu>
										<a href="/">
											<RivetLogo className="ml-1" />
										</a>
									</LogoContextMenu>
								</div>
							</>
						}
						subnav={effectiveSubnav}
						support={null}
						links={
							<div className="flex flex-row items-center gap-2">
								<ThemeToggle />
								<GitHubDropdown className={cn("hidden md:inline-flex", HEADER_SECONDARY_BUTTON_CLASS)} />
								<a
									href="https://dashboard.rivet.dev"
									className={cn("site-header-action font-v2 subpixel-antialiased", HEADER_PRIMARY_INK_BUTTON_CLASS)}
								>
									Sign In
								</a>
							</div>
						}
						mobileBreadcrumbs={
							<DocsMobileNavigation
								tree={mobileSidebar}
								sidebarData={sidebarData}
								isLightTheme={isLightTheme}
								productId={productId}
								tabId={tabId}
							/>
						}
						sheetClassName="!bg-paper [&>button]:!bg-paper [&>button]:!text-ink [&>button]:!border-ink/15"
						lightTheme={isLightTheme}
						breadcrumbs={
							<div className="flex items-center font-v2 subpixel-antialiased [&_a]:!text-ink-soft [&_a:hover]:!text-ink [&_a[aria-current=page]]:!text-ink [&_button]:!text-ink-soft">
								{/* Same anchored panel the other pages use. The floating header
								    used to get a full-width centered sheet, which read as a
								    different component. */}
								<SolutionsDropdown lightTheme />
								<DocsDropdown active={active === "docs"} lightTheme />
								<TextNavItem href="/registry">
									Registry
								</TextNavItem>
								<TextNavItem href="/enterprise">
									Enterprise
								</TextNavItem>
								<TextNavItem
									href="/pricing"
									ariaCurrent={active === "pricing" ? "page" : undefined}
								>
									Pricing
								</TextNavItem>
							</div>
						}
					/>
				</div>
			</div>
		);
	}

	// Full-width variant
	return (
		<RivetHeader
			className={cn(
				"site-header-glass sticky top-0 z-50",
				// Same glass recipe as the floating pill so both headers read as one
				// material: frosted white fill, soft top sheen, one closing hairline.
				// bg-paper/90 is the fallback when backdrop-filter is unsupported.
				isLightTheme
					? "border-b border-ink/10 bg-paper/90 supports-[backdrop-filter]:bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-[18px] backdrop-saturate-[1.4] [&_button[data-mobile-menu-trigger]]:text-ink"
					: "bg-neutral-950/80 backdrop-blur-lg",
				pageFamily === "site"
					? "[&>div:first-child]:mx-auto [&>div:first-child]:w-full [&>div:first-child]:max-w-[1800px] [&>div:first-child]:px-4 md:[&>div:first-child]:px-12 min-[1681px]:[&>div:first-child]:px-14"
					: "[&>div:first-child]:px-3 md:[&>div:first-child]:max-w-none md:[&>div:first-child]:px-0 md:px-8",
				// 0 padding on bottom for larger screens when subnav is showing
				effectiveSubnav ? "pb-2 md:pb-0 md:pt-3 md:[&>div:first-child>div:first-child]:min-h-12 md:[&>div:first-child>div:first-child]:mb-3" : "md:py-4",
				// Learn mode styling
				!isLightTheme && learnMode && "bg-[#1c1917] border-b border-[#44403c]",
			)}
			logo={
				<div className="hidden md:block">
					<LogoContextMenu>
						<a href="/">
							<RivetLogo />
						</a>
					</LogoContextMenu>
				</div>
			}
			subnav={effectiveSubnav}
			support={<></>}
			links={
				<div className="flex flex-row items-center gap-2">
					{isLightTheme && <ThemeToggle />}
					{!learnMode && <HeaderSearch light={isLightTheme} />}
					<GitHubDropdown
						className={
							isLightTheme
								? HEADER_SECONDARY_BUTTON_CLASS
								: "inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/90 transition-colors hover:border-white/20 hover:text-white"
						}
					/>
					<a
						href="https://dashboard.rivet.dev"
						className={cn(
							"site-header-action font-v2 subpixel-antialiased",
							isLightTheme
								? HEADER_PRIMARY_INK_BUTTON_CLASS
								: "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:border-white/20",
						)}
					>
						Sign In
					</a>
				</div>
			}
			lightTheme={isLightTheme}
			sheetClassName={isLightTheme ? "!bg-paper [&>button]:!bg-paper [&>button]:!text-ink [&>button]:!border-ink/15" : undefined}
			mobileBreadcrumbs={<DocsMobileNavigation tree={mobileSidebar} sidebarData={sidebarData} isLightTheme={isLightTheme} productId={productId} tabId={tabId} />}
			breadcrumbs={
				<div className={cn(
					"flex items-center font-v2 subpixel-antialiased",
					isLightTheme && "[&_a]:!text-ink-soft [&_a:hover]:!text-ink [&_a[aria-current=page]]:!text-ink [&_button]:!text-ink-soft",
				)}>
					<SolutionsDropdown lightTheme={isLightTheme} />
					{/* On the main docs pages the second row is the docs tab strip,
					    which lists the same sections the menu does, so the menu is
					    dropped rather than repeated one line apart. Standalone
					    subsites (agentOS, Secure Exec) carry their own product bar
					    and keep the menu as the way back into the main docs. */}
					{(!showProductBar || standalone?.standalone) && (
						<DocsDropdown active={active === "docs"} lightTheme={isLightTheme} />
					)}
					<TextNavItem href="/registry">
						Registry
					</TextNavItem>
					<TextNavItem href="/enterprise">
						Enterprise
					</TextNavItem>
					<TextNavItem
						href="/pricing"
						ariaCurrent={active === "pricing" ? "page" : undefined}
					>
						Pricing
					</TextNavItem>
				</div>
			}
		/>
	);
}

function DocsMobileNavigation({
	tree,
	sidebarData,
	isLightTheme = false,
	productId,
	tabId,
}: {
	tree?: ReactNode;
	sidebarData?: SidebarItem[];
	isLightTheme?: boolean;
	productId?: string;
	tabId?: string;
}) {
	const pathname = usePathname() || "";
	const trimmedPath = pathname.replace(/\/$/, "");
	const activeTab = activeDocsTab(trimmedPath);
	// Standalone subsites collapse their own product bar into the sheet.
	const standalone =
		(productId ? getProduct(productId) : undefined) ?? findStandaloneProduct(trimmedPath);
	const standaloneTab = standalone?.standalone
		? (tabId ?? trimmedPath.split("/")[2] ?? "overview")
		: undefined;
	// A docs page is anything that hands the header a sidebar, plus the shared
	// integrations root, which has none until a product is chosen.
	const isDocsPage =
		Boolean(activeTab) ||
		Boolean(standaloneTab) ||
		Boolean(sidebarData?.length) ||
		pathname.startsWith("/integrations");

	// On mobile the second header row collapses into this sheet's section
	// dropdown: the docs tab strip, or a standalone product's own tabs.
	const sections =
		standalone?.standalone
			? [
					{ id: "overview", label: standalone.name, href: standalone.href },
					...visibleTabs(standalone).map((tab) => ({ id: tab.id, label: tab.title, href: tab.href })),
				]
			: DOCS_TABS.map((tab) => ({ id: tab.id, label: tab.title, href: tab.href }));

	const mainLinks = [
		{ href: "/registry", label: "Registry" },
		{ href: "/enterprise", label: "Enterprise" },
		{ href: "/pricing", label: "Pricing" },
	];

	const currentSection = sections.find((section) => section.id === (standaloneTab ?? activeTab));

	if (isLightTheme) {
		return (
			<div className="flex flex-col gap-2 font-v2 subpixel-antialiased text-sm">
				{/* Home logo */}
				<a href="/" className="py-3 px-2">
					<RivetLogo />
				</a>

				{/* Documentation, flattened from the desktop menu's two columns. */}
				{DOCS_MENU.flat().map((group) => (
					<div key={group.label}>
						<div className="text-ink-faint py-2 px-2 text-xs uppercase tracking-wide">
							{group.label}
						</div>
						{group.links.map((link) => {
							const product = link.productId
								? getProduct(link.productId)
								: undefined;
							return (
								<a
									key={link.href}
									href={canonicalizeInternalHref(link.href)}
									className="text-ink py-2 px-2 pl-4 hover:bg-ink/5 rounded-sm transition-colors flex items-center gap-2"
								>
									{product ? (
										<ProductBadge product={product} className="size-6" />
									) : link.markSrc ? (
										<MenuMark src={link.markSrc} lightTheme className="size-6" markClassName="size-3.5" />
									) : (
										<span aria-hidden="true" className="size-6 shrink-0" />
									)}
									{link.label}
								</a>
							);
						})}
					</div>
				))}

				{/* Main navigation links */}
				{mainLinks.map(({ href, label }) => (
					<a
						key={href}
						href={canonicalizeInternalHref(href)}
						className="text-ink py-2 px-2 hover:bg-ink/5 rounded-sm transition-colors"
					>
						{label}
					</a>
				))}

				{/* Docs section dropdown + sidebar tree */}
				{isDocsPage && (
					<>
						<div className="border-t-2 border-ink/10 my-2" />

						{/* Section dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="w-full justify-between h-9 text-sm border-ink/15 bg-white/55 text-ink hover:bg-white/70 hover:border-ink/30"
								>
									{currentSection?.label || "Select Section"}
									<Icon icon={faChevronDown} className="h-3.5 w-3.5 ml-2" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-[calc(100vw-3rem)] bg-white border border-ink/10 text-ink [&_[role=menuitem]]:text-ink [&_[role=menuitem][data-highlighted]]:bg-ink/[0.06] [&_[role=menuitem][data-highlighted]]:text-ink">
								{sections.map(({ id, label, href }) => (
									<DropdownMenuItem key={id} asChild>
										<a href={canonicalizeInternalHref(href)}>{label}</a>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Tree/sidebar content */}
						{tree && <div className="mt-1">{tree}</div>}
						{!tree && sidebarData && (
							<SidebarAccentProvider productId={productId}>
								<NavigationStateProvider>
									<div className="mt-1">
										<Tree pages={sidebarData} />
									</div>
								</NavigationStateProvider>
							</SidebarAccentProvider>
						)}
					</>
				)}

				{/* Dashboard button */}
				<div className="mt-4 pt-4 border-t border-ink/10">
					<a
						href="https://dashboard.rivet.dev/"
						className="flex items-center justify-center w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-ink/85"
					>
						Dashboard
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 font-v2 subpixel-antialiased text-sm">
			{/* Home logo - full logo on small screens, icon only on tablet */}
			<a href="/" className="py-3 px-2">
				<img
					src={logoUrl.src}
					alt="Rivet"
					width={80}
					height={27}
					className="w-20 sm:hidden"
				/>
				<img
					src={logoIconUrl.src}
					alt="Rivet"
					width={32}
					height={32}
					className="w-8 h-8 hidden sm:block"
				/>
			</a>

			{/* Documentation, mirroring the light-theme sheet above. */}
			{DOCS_MENU.flat().map((group) => (
				<div key={group.label}>
					<div className="text-zinc-500 py-2 px-2 text-xs uppercase tracking-wide">
						{group.label}
					</div>
					{group.links.map((link) => {
						const product = link.productId
							? getProduct(link.productId)
							: undefined;
						return (
							<a
								key={link.href}
								href={canonicalizeInternalHref(link.href)}
								className="text-white py-2 px-2 pl-4 hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2"
							>
								{product ? (
									<ProductBadge product={product} className="size-6" />
								) : link.markSrc ? (
									<MenuMark src={link.markSrc} lightTheme={false} className="size-6" markClassName="size-3.5" />
								) : (
									<span aria-hidden="true" className="size-6 shrink-0" />
								)}
								{link.label}
							</a>
						);
					})}
				</div>
			))}

			{/* Main navigation links */}
			{mainLinks.map(({ href, label }) => (
				<a
					key={href}
					href={canonicalizeInternalHref(href)}
					className="text-white py-2 px-2 hover:bg-white/5 rounded-sm transition-colors"
				>
					{label}
				</a>
			))}

			{/* Separator and docs content */}
			{isDocsPage && (
				<>
					<div className="border-t-2 border-white/10 my-2" />

					{/* Section dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="w-full justify-between h-9 text-sm border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"
							>
								{currentSection?.label || "Select Section"}
								<Icon icon={faChevronDown} className="h-3.5 w-3.5 ml-2" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-[calc(100vw-3rem)] bg-black/95 backdrop-blur-lg border-white/10">
							{sections.map(({ id, label, href }) => (
								<DropdownMenuItem
									key={id}
									asChild
									className="text-white hover:bg-white/5 focus:bg-white/5"
								>
									<a href={canonicalizeInternalHref(href)}>{label}</a>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Tree/sidebar content */}
					{tree && <div className="mt-1">{tree}</div>}
					{!tree && sidebarData && (
						<NavigationStateProvider>
							<div className="mt-1">
								<Tree pages={sidebarData} />
							</div>
						</NavigationStateProvider>
					)}
				</>
			)}

			{/* Dashboard button */}
			<div className="mt-4 pt-4 border-t border-white/10">
				<a
					href="https://dashboard.rivet.dev/"
					className="flex items-center justify-center w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
				>
					Dashboard
				</a>
			</div>
		</div>
	);
}
