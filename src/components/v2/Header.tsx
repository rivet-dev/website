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
import { faChevronDown } from "@rivet-gg/icons";
import { GitHubDropdown } from "./GitHubDropdown";
import { HeaderSearch } from "./HeaderSearch";
import { LogoContextMenu } from "./LogoContextMenu";
import { ProductBar, ProductBadge } from "@/components/ProductBar";
import { productAccent } from "@/lib/product-accent";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import { DOCS_MENU, SOLUTIONS_MENU } from "@/data/nav-menus";
import {
	findProductForPath,
	getProduct,
	visibleProducts as productVerticals,
	visibleTabs,
} from "@/sitemap/products";

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

/** One row in either header menu: mark, label, and a line of premise. */
function MenuRow({
	icon,
	label,
	description,
	badge,
	accent,
	lightTheme,
}: {
	icon: IconProp;
	label: string;
	description: string;
	badge?: string;
	accent?: ReturnType<typeof productAccent>;
	lightTheme: boolean;
}) {
	return (
		<>
			{/* The accent is the tile, never the mark — same rule as ProductBadge. */}
			<span
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-[34.375%]",
					accent?.fill ?? (lightTheme ? "bg-ink" : "bg-white/10"),
				)}
			>
				<Icon icon={icon} aria-hidden="true" className="h-4 w-4 text-white" />
			</span>
			<span className="min-w-0 flex-1">
				<span
					className={cn(
						"flex items-center gap-2 text-sm font-medium leading-tight",
						lightTheme ? "text-ink" : "text-white",
					)}
				>
					{label}
					{badge && (
						<span
							className={cn(
								"shrink-0 rounded-sm border px-1.5 py-px text-[10px] font-medium leading-[1.4] whitespace-nowrap",
								lightTheme
									? "border-ink/10 bg-ink/[0.06] text-ink-soft"
									: "border-white/15 bg-white/10 text-zinc-300",
							)}
						>
							{badge}
						</span>
					)}
				</span>
				<span
					className={cn(
						"mt-0.5 block text-pretty text-xs leading-snug",
						lightTheme ? "text-ink-soft" : "text-zinc-400",
					)}
				>
					{description}
				</span>
			</span>
		</>
	);
}

/**
 * Solutions: the audiences from the landing page's "Built for every kind of
 * agent" section. The rows do not navigate — the pages behind them do not exist
 * yet — so they render as plain list items rather than as links that 404.
 */
function SolutionsDropdown({ lightTheme = false }: { lightTheme?: boolean }) {
	return (
		<NavDropdown label="Solutions" lightTheme={lightTheme} align="start">
			<ul className="grid gap-1 sm:grid-cols-2">
				{SOLUTIONS_MENU.map((item) => (
					<li
						key={item.id}
						className="flex items-center gap-3 rounded-xl px-3 py-2.5"
					>
						<MenuRow
							icon={item.icon}
							label={item.label}
							description={item.description}
							lightTheme={lightTheme}
						/>
					</li>
				))}
			</ul>
		</NavDropdown>
	);
}

/**
 * Documentation, in two columns: Orchestration (what runs the workloads) and
 * Actors (the workloads themselves).
 *
 * Keeps the Products menu's panel geometry and its `ProductBadge` tiles, with a
 * quiet column label in place of the per-row verb eyebrow.
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
			<div className="grid gap-x-1 gap-y-2 sm:grid-cols-2">
				{DOCS_MENU.map((column) => (
					<div key={column.label} className="flex flex-col">
						<div
							className={cn(
								EYEBROW_CLASS,
								"px-3 pt-3 pb-1",
								!lightTheme && "!text-zinc-500",
							)}
						>
							{column.label}
						</div>
						{column.links.map((link) => {
							const product = link.productId
								? getProduct(link.productId)
								: undefined;
							const accent = link.productId
								? productAccent(link.productId)
								: undefined;
							return (
								<a
									key={link.href}
									href={canonicalizeInternalHref(link.href)}
									className={cn(
										"flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
										lightTheme
											? cn(
													"text-ink focus-visible:ring-pine",
													accent?.tintHover ?? "hover:bg-ink/[0.07]",
												)
											: "text-white focus-visible:ring-white/60 hover:bg-white/5",
									)}
								>
									{/* The product color is the tile, not the mark. Rows with no
									    product keep the row rhythm with an empty gutter. */}
									{product ? (
										<ProductBadge product={product} className="size-7" />
									) : (
										<span aria-hidden="true" className="size-7 shrink-0" />
									)}
									<span className="min-w-0 flex-1 truncate">{link.label}</span>
								</a>
							);
						})}
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

	// Inside a product vertical the second header row is the product bar: which
	// product you are in, a switcher, and that product's three docs tabs.
	const effectiveSubnav = showProductBar ? (
		<ProductBar initialPathname={pathname} productId={productId} tabId={tabId} sectionLabel={sectionLabel} dark={!isLightTheme} />
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
					<div className="absolute inset-0 -z-[1] overflow-hidden rounded-2xl bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-[18px] backdrop-saturate-[1.4]" />
					<RivetHeader
						className={headerStyles}
						logo={
							<>
								{/* Mobile logo */}
								<div className="md:hidden ml-1">
									<a href="/">
										<img
											src={logoTextBlackUrl.src}
											width={80}
											height={27}
											className="w-20 shrink-0"
											alt="Rivet logo"
										/>
									</a>
								</div>
								{/* Desktop logo */}
								<div className="hidden md:block">
									<LogoContextMenu>
										<a href="/">
											<img
												src={logoTextBlackUrl.src}
												width={80}
												height={27}
												className="ml-1 w-20 shrink-0"
												alt="Rivet logo"
											/>
										</a>
									</LogoContextMenu>
								</div>
							</>
						}
						subnav={effectiveSubnav}
						support={null}
						links={
							<div className="flex flex-row items-center gap-2">
								<GitHubDropdown className={cn("hidden md:inline-flex", HEADER_SECONDARY_BUTTON_CLASS)} />
								<a
									href="https://dashboard.rivet.dev"
									className={cn("font-v2 subpixel-antialiased", HEADER_PRIMARY_INK_BUTTON_CLASS)}
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
									href="/cloud"
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
				"sticky top-0 z-50",
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
							<img
								src={isLightTheme ? logoTextBlackUrl.src : logoUrl.src}
								width={80}
								height={27}
								className="w-20 shrink-0"
								alt="Rivet logo"
								loading="eager"
								decoding="async"
							/>
						</a>
					</LogoContextMenu>
				</div>
			}
			subnav={effectiveSubnav}
			support={<></>}
			links={
				<div className="flex flex-row items-center gap-2">
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
							"font-v2 subpixel-antialiased",
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
					{/* Inside a product the second row carries that product's own
					    Documentation tab, so the global one is dropped rather than
					    repeated one line apart with a different destination. */}
					{!showProductBar && (
						<DocsDropdown active={active === "docs"} lightTheme={isLightTheme} />
					)}
					<TextNavItem href="/registry">
						Registry
					</TextNavItem>
					<TextNavItem href="/enterprise">
						Enterprise
					</TextNavItem>
					<TextNavItem
						href="/cloud"
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
	const pathCurrent = findProductForPath(pathname.replace(/\/$/, ""));
	const explicitProduct = productId
		? productVerticals.find((product) => product.id === productId)
		: undefined;
	const explicitTab = explicitProduct && tabId
		? explicitProduct.tabs.find((tab) => tab.id === tabId)
		: undefined;
	const current = explicitProduct && explicitTab
		? { product: explicitProduct, tab: explicitTab }
		: pathCurrent;
	const isGlobalDocsPage =
		pathname.startsWith("/docs/") && Boolean(sidebarData?.length);
	const isDocsPage =
		Boolean(current) ||
		pathname.startsWith("/integrations") ||
		isGlobalDocsPage;

	// On mobile the product bar collapses into this sheet. Product entries link
	// to their overviews; the section dropdown lists the remaining tabs.
	const sections = current
		? visibleTabs(current.product).map((tab) => ({
				id: tab.id,
				label: tab.title,
				href: tab.href,
			}))
		: isGlobalDocsPage
			? [{ id: "docs", label: "Documentation", href: "/docs/" }]
			: [{ id: "integrations", label: "Integrations", href: "/integrations" }];

	const mainLinks = [
		{ href: "/registry", label: "Registry" },
		{ href: "/enterprise", label: "Enterprise" },
		{ href: "/cloud", label: "Pricing" },
	];

	const currentSection = current
		? sections.find((section) => section.id === current.tab.id)
		: sections[0];

	if (isLightTheme) {
		return (
			<div className="flex flex-col gap-2 font-v2 subpixel-antialiased text-sm">
				{/* Home logo */}
				<a href="/" className="py-3 px-2">
					<img
						src={logoTextBlackUrl.src}
						alt="Rivet"
						width={80}
						height={27}
						className="w-20"
					/>
				</a>

				{/* Documentation, flattened from the desktop menu's two columns. */}
				{DOCS_MENU.map((column) => (
					<div key={column.label}>
						<div className="text-ink-faint py-2 px-2 text-xs uppercase tracking-wide">
							{column.label}
						</div>
						{column.links.map((link) => {
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
							<SidebarAccentProvider productId={current?.product.id}>
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
			{DOCS_MENU.map((column) => (
				<div key={column.label}>
					<div className="text-zinc-500 py-2 px-2 text-xs uppercase tracking-wide">
						{column.label}
					</div>
					{column.links.map((link) => {
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
