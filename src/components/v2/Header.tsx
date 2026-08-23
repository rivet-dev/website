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
import { Icon } from "@rivet-gg/icons";
import {
	EYEBROW_CLASS,
	EYEBROW_ON_INK_CLASS,
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
import {
	findProductForPath,
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
					href={href}
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

function ProductsDropdown({
	active,
	lightTheme = false,
	align = "center",
}: {
	active?: boolean;
	lightTheme?: boolean;
	align?: "center" | "start";
}) {
	const [isOpen, setIsOpen] = useState(false);
	const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lightDropdownRef = useRef<HTMLDivElement>(null);
	const lightTriggerRef = useRef<HTMLButtonElement>(null);
	const focusFromPointerRef = useRef(false);
	const openAtTriggerPointerDownRef = useRef<boolean | null>(null);
	const lightDropdownId = useId();

	// The product verticals, in registry order. Each item opens the product's
	// overview; its product bar then exposes the documentation and other sections.
	const products = productVerticals.map((product) => ({
		id: product.id,
		label: product.name,
		href: product.href,
		description: product.description,
		accent: productAccent(product.id),
		product,
	}));

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
				lightTheme &&
				document.activeElement instanceof Node &&
				lightDropdownRef.current?.contains(document.activeElement)
			) {
				return;
			}
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
		if (!lightTheme || !isOpen) return;

		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (lightDropdownRef.current?.contains(event.target as Node)) return;
			if (closeTimeoutRef.current) {
				clearTimeout(closeTimeoutRef.current);
				closeTimeoutRef.current = null;
			}
			setIsOpen(false);
		};

		document.addEventListener("pointerdown", closeOnOutsidePointer, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
		};
	}, [isOpen, lightTheme]);

	if (lightTheme) {
		return (
			<div
				ref={lightDropdownRef}
				className={cn("group/products px-2.5 py-2", align === "start" && "relative")}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onPointerDownCapture={(event) => {
					// Pointer activation focuses the button before `click`. Let `click`
					// perform the toggle so touch users do not immediately reopen it.
					focusFromPointerRef.current = true;
					openAtTriggerPointerDownRef.current =
						event.target instanceof Node &&
						lightTriggerRef.current?.contains(event.target)
							? isOpen
							: null;
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
					setIsOpen(false);
				}}
				onKeyDown={(event) => {
					if (event.key !== "Escape" || !isOpen) return;
					event.preventDefault();
					event.stopPropagation();
					cancelClose();
					lightTriggerRef.current?.focus();
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
							"cursor-pointer flex items-center gap-1 relative rounded-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
							"!text-ink-soft hover:!text-ink",
							active && "!text-ink",
							// Invisible hover bridge spanning the visual gap down to the
							// dropdown panel so moving the mouse from the trigger to the
							// panel does not cross a dead zone and close the menu.
							"after:absolute after:left-0 after:right-0 after:top-full after:h-7 after:content-['']",
						)}
						onMouseEnter={handleMouseEnter}
						onClick={() => {
							cancelClose();
							const openAtPointerDown = openAtTriggerPointerDownRef.current;
							openAtTriggerPointerDownRef.current = null;
							setIsOpen((open) =>
								openAtPointerDown === null ? !open : !openAtPointerDown,
							);
						}}
					>
						Products
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
						// bg-paper/95: at /80 the product bar's 2px accent tab underline
						// ghosted through the frosted panel as a colored smudge.
						"z-50 -translate-y-1 overflow-hidden rounded-2xl border border-ink/10 bg-paper/95 p-1.5 opacity-0 shadow-[0_18px_50px_-32px_rgba(27,25,22,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] transition-all duration-150 pointer-events-none",
						align === "start"
							? "fixed left-1/2 top-[63px] w-[min(720px,calc(100vw-3rem))] -translate-x-1/2 lg:absolute lg:left-0 lg:top-full lg:mt-3 lg:translate-x-0"
							: "fixed left-1/2 top-[63px] w-[min(720px,calc(100vw-3rem))] -translate-x-1/2",
						isOpen
							? "pointer-events-auto translate-y-0 opacity-100"
							: "pointer-events-none -translate-y-1 opacity-0",
					)}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{/* Verb-led premise grid: Orchestrate / Operate on the runtime row,
					    Automate / Deploy on the outcome row. Order comes from the
					    registry, which is kept in this lifecycle order. */}
					<div className="grid gap-1 sm:grid-cols-2">
						{products.map((product) => (
							<div key={product.href} className="flex flex-col">
								{/* The verb sits outside the link so the hover tint colors
								    only the product lockup, not the category label. */}
								{product.product.verb && (
									<div className={`${EYEBROW_CLASS} px-3 pt-3 pb-1`}>
										{product.product.verb}
									</div>
								)}
								<a
									href={product.href}
									className={cn(
										"flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-inset",
										product.accent?.tintHover ?? "hover:bg-ink/[0.07]",
									)}
								>
									{/* The product color is the tile, not the mark. */}
									<ProductBadge product={product.product} className="size-8" />
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2 text-sm font-medium leading-tight text-ink">
											{product.label}
											{product.product.badge && (
												<span className="shrink-0 rounded-sm border border-ink/10 bg-ink/[0.06] px-1.5 py-px text-[10px] font-medium leading-[1.4] text-ink-soft whitespace-nowrap">
													{product.product.badge}
												</span>
											)}
										</div>
										<div className="mt-0.5 text-pretty text-xs leading-snug text-ink-soft">
											{product.product.premise ?? product.description}
										</div>
									</div>
								</a>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="px-2.5 py-2"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
				<DropdownMenuTrigger asChild>
					<RivetHeader.NavItem asChild>
						<button
							type="button"
							className={cn(
								"cursor-pointer flex items-center gap-1 relative transition-colors duration-200",
								lightTheme ? "!text-ink-soft hover:!text-ink" : "!text-zinc-400 hover:!text-white",
								active && !lightTheme && "!text-white",
								"after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:content-['']",
							)}
							onPointerDown={handlePointerDown}
							onMouseEnter={handleMouseEnter}
						>
							Products
							<Icon icon={faChevronDown} className="h-3 w-3 ml-0.5" />
						</button>
					</RivetHeader.NavItem>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className={cn(
						"min-w-[280px] p-4 rounded-xl shadow-xl",
						lightTheme
							? "bg-white/95 backdrop-blur-lg border border-ink/10"
							: "bg-black/95 backdrop-blur-lg border border-white/10",
					)}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					sideOffset={0}
					alignOffset={0}
					side="bottom"
				>
					<div className="flex flex-col gap-1">
						{products.map((product) => (
							<React.Fragment key={product.href}>
								<a
									href={product.href}
									className={cn(
										"group flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
										lightTheme ? "hover:bg-ink/[0.04]" : "hover:bg-white/5",
									)}
								>
									<ProductBadge product={product.product} className="size-6" />
									<div className="flex flex-col">
										<div className={cn(
											"font-medium text-sm transition-colors",
											lightTheme ? "text-ink" : "text-white group-hover:text-white",
										)}>
											{product.label}
										</div>
										<div className={cn(
											"text-xs transition-colors leading-relaxed",
											lightTheme ? "text-ink-faint group-hover:text-ink-soft" : "text-zinc-400 group-hover:text-zinc-300",
										)}>
											{product.description}
										</div>
									</div>
								</a>
								{product.subItems?.map((sub) => (
									<a
										key={sub.href}
										href={sub.href}
										className={cn(
											"group flex items-center gap-2.5 py-1.5 pl-12 pr-3 rounded-lg transition-colors cursor-pointer",
											lightTheme ? "hover:bg-ink/[0.04]" : "hover:bg-white/5",
										)}
									>
										<sub.icon
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												lightTheme ? "text-ink-faint group-hover:text-ink-soft" : "text-zinc-500 group-hover:text-zinc-300",
											)}
										/>
										<span
											className={cn(
												"text-xs transition-colors",
												lightTheme ? "text-ink-faint group-hover:text-ink-soft" : "text-zinc-400 group-hover:text-zinc-300",
											)}
										>
											{sub.label}
										</span>
									</a>
								))}
							</React.Fragment>
						))}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
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
		<ProductBar initialPathname={pathname} productId={productId} tabId={tabId} sectionLabel={sectionLabel} />
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
							/>
						}
						sheetClassName="!bg-paper [&>button]:!bg-paper [&>button]:!text-ink [&>button]:!border-ink/15"
						lightTheme={isLightTheme}
						breadcrumbs={
							<div className="flex items-center font-v2 subpixel-antialiased [&_a]:!text-ink-soft [&_a:hover]:!text-ink [&_a[aria-current=page]]:!text-ink [&_button]:!text-ink-soft">
								{/* Same anchored panel the other pages use. The floating header
								    used to get a full-width centered sheet, which read as a
								    different component. */}
								<ProductsDropdown active={active === "product"} lightTheme align="start" />
								<TextNavItem
									href="/docs"
									ariaCurrent={active === "docs" ? "page" : undefined}
								>
									Documentation
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
			mobileBreadcrumbs={<DocsMobileNavigation tree={mobileSidebar} sidebarData={sidebarData} isLightTheme={isLightTheme} />}
			breadcrumbs={
				<div className={cn(
					"flex items-center font-v2 subpixel-antialiased",
					isLightTheme && "[&_a]:!text-ink-soft [&_a:hover]:!text-ink [&_a[aria-current=page]]:!text-ink [&_button]:!text-ink-soft",
				)}>
					<ProductsDropdown active={active === "product"} lightTheme={isLightTheme} align="start" />
					{/* Inside a product the second row carries that product's own
					    Documentation tab, so the global one is dropped rather than
					    repeated one line apart with a different destination. */}
					{!showProductBar && (
						<TextNavItem
							href="/docs"
							ariaCurrent={active === "docs" ? "page" : undefined}
						>
							Documentation
						</TextNavItem>
					)}
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
}: {
	tree?: ReactNode;
	sidebarData?: SidebarItem[];
	isLightTheme?: boolean;
}) {
	const pathname = usePathname() || "";
	const current = findProductForPath(pathname.replace(/\/$/, ""));
	const isDocsPage = Boolean(current) || pathname.startsWith("/integrations");

	// On mobile the product bar collapses into this sheet: the tab dropdown
	// lists the current product's three tabs, and the Products list switches
	// verticals.
	const sections = current
		? visibleTabs(current.product).map((tab) => ({
				id: tab.id,
				label: tab.title,
				href: tab.href,
			}))
		: [{ id: "integrations", label: "Integrations", href: "/integrations" }];

	const mainLinks = [
		{ href: "/docs", label: "Documentation" },
		{ href: "/enterprise", label: "Enterprise" },
		{ href: "/cloud", label: "Pricing" },
	];

	const products = productVerticals.map((product) => ({
		id: product.id,
		label: product.name,
		href: product.href,
		product,
	}));

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

				{/* Products section */}
				<div className="text-ink-faint py-2 px-2 text-xs uppercase tracking-wide">
					Products
				</div>
				{products.map((product) => (
					<a
						key={product.href}
						href={product.href}
						target={product.external ? "_blank" : undefined}
						rel={product.external ? "noopener noreferrer" : undefined}
						className="text-ink py-2 px-2 pl-4 hover:bg-ink/5 rounded-sm transition-colors flex items-center gap-2"
					>
						<ProductBadge product={product.product} className="size-6" />
						{product.label}
						{product.product.verb && (
							<span className={`${EYEBROW_CLASS} ml-auto`}>
								{product.product.verb}
							</span>
						)}
					</a>
				))}

				{/* Main navigation links */}
				{mainLinks.map(({ href, label }) => (
					<a
						key={href}
						href={href}
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
										<a href={href}>{label}</a>
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

			{/* Products section */}
			<div className="text-zinc-500 py-2 px-2 text-xs uppercase tracking-wide">
				Products
			</div>
			{products.map((product) => (
				<a
					key={product.href}
					href={product.href}
					target={product.external ? "_blank" : undefined}
					rel={product.external ? "noopener noreferrer" : undefined}
					className="text-white py-2 px-2 pl-4 hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2"
				>
					<ProductBadge product={product.product} className="size-6" />
					{product.label}
					{product.product.verb && (
						<span className={`${EYEBROW_ON_INK_CLASS} ml-auto`}>
							{product.product.verb}
						</span>
					)}
				</a>
			))}

			{/* Main navigation links */}
			{mainLinks.map(({ href, label }) => (
				<a
					key={href}
					href={href}
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
									<a href={href}>{label}</a>
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
