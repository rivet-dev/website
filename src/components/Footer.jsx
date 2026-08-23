"use client";
import { useEffect, useState } from "react";
import { usePathname } from "@/hooks/usePathname";
import { fetchOpeningsCount } from "@/lib/careers";
import { Button } from "@/components/Button";
import routes from "@/generated/routes.json";
import clsx from "clsx";
import { VISIBLE_PRODUCTS } from "@/sitemap/product-metadata";
import { SITE_WIDE_GUTTERED_RAIL_CLASS } from "@/components/marketing/layout";

import imgLogo from "@/images/rivet-logos/icon-white.svg";
import imgYC from "@/images/logos/yc.svg";
import imgA16z from "@/images/logos/a16z.svg";
import {
	Icon,
	faDiscord,
	faGithub,
	faLinkedin,
	faTwitter,
} from "@rivet-gg/icons";

const footer = {
	// Derived so the footer cannot drift from the product registry. Each entry
	// points at the product's Overview page, matching the header switcher.
	product: VISIBLE_PRODUCTS.map((item) => ({ name: item.name, href: `/${item.id}` })),
	company: [
		{ name: "Cloud Pricing", href: "/cloud" },
		{ name: "Enterprise", href: "/enterprise" },
		{ name: "Careers", href: "/careers" },
		{ name: "Talk to an engineer", href: "/talk-to-an-engineer" },
		{ name: "YC & Speedrun Deal", href: "/startups" },
	],
	devs: [
		{ name: "Documentation", href: "/docs" },
		{ name: "Changelog", href: "/changelog/" },
		{ name: "Status Page", href: "https://rivet.betteruptime.com/" },
	],
	resources: [
		{ name: "Blog", href: "/blog" },
		{ name: "Open-Source Friends", href: "/oss-friends" },
		{ name: "Press Kit", href: "https://releases.rivet.dev/press-kit.zip" },
	],
	compare: [
		{
			name: "Temporal",
			href: "/workflows/compare/rivet-workflows-vs-temporal",
		},
		{
			name: "Cloudflare",
			href: "/actors/compare/rivet-actors-vs-cloudflare-durable-objects",
		},
	],
	legal: [
		{ name: "Terms", href: "/terms" },
		{ name: "Privacy Policy", href: "/privacy" },
		{ name: "Acceptable Use", href: "/acceptable-use" },
	],
	social: [
		{
			name: "Discord",
			href: "https://discord.gg/aXYfyNxYVn",
			icon: faDiscord,
		},
		{
			name: "Twitter",
			href: "https://x.com/rivet_dev",
			icon: faTwitter,
		},
		{
			name: "GitHub",
			href: "https://github.com/rivet-dev",
			icon: faGithub,
		},
		{
			name: "LinkedIn",
			href: "https://www.linkedin.com/company/72072261/",
			icon: faLinkedin,
		},
	],
};

function PageLink({ label, page, previous = false }) {
	const title = routes.pages[page.href]?.title ?? page.title ?? label;
	return (
		<>
			<Button
				href={page.href}
				aria-label={`${label}: ${page.title}`}
				variant="secondary"
				arrow={previous ? "left" : "right"}
			>
				{title}
			</Button>
		</>
	);
}

export function PageNextPrevious({ navigation }) {
	const pathname = usePathname();
	const allPages = navigation.sidebar.groups.flatMap((group) => group.pages);
	const currentPageIndex = allPages.findIndex(
		(page) => page.href === pathname,
	);

	if (currentPageIndex === -1) {
		return null;
	}

	const previousPage = allPages[currentPageIndex - 1];
	const nextPage = allPages[currentPageIndex + 1];

	if (!previousPage && !nextPage) {
		return null;
	}

	return (
		<div className={clsx("mb-4 flex", "mx-auto max-w-5xl")}>
			{previousPage && (
				<div className="flex flex-col items-start gap-3">
					<PageLink label="Previous" page={previousPage} previous />
				</div>
			)}
			{nextPage && (
				<div className="ml-auto flex flex-col items-end gap-3">
					<PageLink label="Next" page={nextPage} />
				</div>
			)}
		</div>
	);
}

// Live opening count for the Careers pill. `initialOpenings` is fetched
// server-side (BaseLayout) so the pill is in the initial HTML — no dependency on
// the visitor's browser reaching workatastartup.com. The client refresh keeps a
// statically-built page current; a blocked or failed refresh keeps the seed.
const CAREERS_HREF = "/careers";

function useOpeningsCount(initial) {
	const [count, setCount] = useState(initial ?? null);

	useEffect(() => {
		const controller = new AbortController();
		fetchOpeningsCount(controller.signal).then((next) => {
			if (next !== null) setCount(next);
		});
		return () => controller.abort();
	}, []);

	return count;
}

function SmallPrint({ initialOpenings, pageFamily = "default" }) {
	const openings = useOpeningsCount(initialOpenings);
	return (
		<div className={clsx("mx-auto w-full py-16", pageFamily === "site" ? "max-w-none" : "max-w-7xl")}>
			<div className="grid grid-cols-1 min-[440px]:grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-7">
				{/* Brand column */}
				<div className="col-span-1 min-[440px]:col-span-2 md:col-span-4 lg:col-span-1 space-y-6">
					<img className="h-8 w-8" src={imgLogo.src} alt="Rivet" />
					<p className="text-sm text-ink-faint">
						Infrastructure for the agentic era
					</p>
					<div className="flex gap-4">
						{footer.social.map((item) => (
							<a
								key={item.name}
								href={item.href}
								className="text-ink-faint hover:text-ink transition-colors"
							>
								<span className="sr-only">{item.name}</span>
								<Icon icon={item.icon} aria-hidden="true" />
							</a>
						))}
					</div>
				</div>

				{/* Product */}
				<div>
					<h3 className="text-sm font-medium text-ink-faint mb-4">Products</h3>
					<ul className="space-y-3">
						{footer.product.map((item) => (
							<li key={item.name}>
								<a
									href={item.href}
									target={item.target}
									className="text-sm text-ink-soft hover:text-ink transition-colors"
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Developers */}
				<div>
					<h3 className="text-sm font-medium text-ink-faint mb-4">Developers</h3>
					<ul className="space-y-3">
						{footer.devs.map((item) => (
							<li key={item.name}>
								<a
									href={item.href}
									target={item.target}
									className="text-sm text-ink-soft hover:text-ink transition-colors"
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Resources */}
				<div>
					<h3 className="text-sm font-medium text-ink-faint mb-4">Resources</h3>
					<ul className="space-y-3">
						{footer.resources.map((item) => (
							<li key={item.name}>
								<a
									href={item.href}
									target={item.newTab ? "_blank" : null}
									className="text-sm text-ink-soft hover:text-ink transition-colors"
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Compare */}
				<div>
					<h3 className="text-sm font-medium text-ink-faint mb-4">Compare</h3>
					<ul className="space-y-3">
						{footer.compare.map((item) => (
							<li key={item.name}>
								<a
									href={item.href}
									className="text-sm text-ink-soft hover:text-ink transition-colors"
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Company */}
				<div>
					<h3 className="text-sm font-medium text-ink-faint mb-4">Company</h3>
					<ul className="space-y-3">
						{footer.company.map((item) => (
							<li key={item.name} className="flex items-center gap-2">
								<a
									href={item.href}
									className="text-sm text-ink-soft hover:text-ink transition-colors"
								>
									{item.name}
								</a>
								{item.href === CAREERS_HREF && openings > 0 && (
									<span
										className="rounded-full border border-pine/25 bg-pine/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-pine"
										aria-label={`${openings} open ${openings === 1 ? "position" : "positions"}`}
									>
										{openings}
									</span>
								)}
							</li>
						))}
					</ul>
				</div>

				{/* Legal */}
				<div>
					<h3 className="text-sm font-medium text-ink-faint mb-4">Legal</h3>
					<ul className="space-y-3">
						{footer.legal.map((item) => (
							<li key={item.name}>
								<a
									href={item.href}
									className="text-sm text-ink-soft hover:text-ink transition-colors"
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Investor badges */}
			<div className="mt-12 flex flex-col min-[440px]:flex-row flex-wrap items-start min-[440px]:items-center gap-4">
				<span className="text-xs text-ink-faint">Backed by</span>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink-soft">
						<img src={imgYC.src} alt="Y Combinator" className="h-4 w-auto" />
						<span>Y Combinator</span>
					</div>
					<div className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink-soft">
						<img src={imgA16z.src} alt="a16z" className="h-3 w-auto footer-invert" />
						<span>a16z Speedrun</span>
					</div>
				</div>
				<a
					href="/startups"
					className="text-xs text-ink-faint hover:text-ink transition-colors"
					style={{
						backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
						backgroundSize: '6px 1px',
						backgroundPosition: '0 100%',
						backgroundRepeat: 'repeat-x',
						paddingBottom: '4px'
					}}
				>
					Are you as well?
				</a>
				<span className="ml-auto flex items-center gap-1.5 text-xs text-ink-faint">
					<svg width="14" height="10" viewBox="0 0 14 10" fill="none">
						<rect width="14" height="10" fill="white" />
						<rect y="0" width="14" height="1.2" fill="black" />
						<rect y="2.2" width="14" height="1.2" fill="black" />
						<rect y="4.4" width="14" height="1.2" fill="black" />
						<rect y="6.6" width="14" height="1.2" fill="black" />
						<rect y="8.8" width="14" height="1.2" fill="black" />
						<rect width="5" height="5" fill="black" />
					</svg>
					Built in San Francisco, United States and around the world
				</span>
			</div>

			{/* Copyright */}
			<div className="mt-12 border-t border-ink/10 pt-8">
				<p className="text-xs text-ink-faint">
					&copy; {new Date().getFullYear()} Rivet Gaming, Inc. All rights reserved.
				</p>
				<p className="mt-2 text-xs text-ink-faint/80">
					Cloudflare® and Durable Objects™ are trademarks of Cloudflare, Inc. No affiliation or endorsement implied.
				</p>
			</div>
		</div>
	);
}

// The footer is light by default to match the porcelain surfaces (marketing
// and docs). Only the Learn section keeps its dark shell, so that path applies
// a dark override wrapper instead.
const DARK_THEMED_PATH_PREFIXES = ['/learn'];

export function Footer({ initialPathname = "", initialOpenings = null, pageFamily = "default" }) {
	// usePathname returns "" during SSR; fall back to the server-provided path
	// so docs pages do not flash a light footer before hydration.
	const pathname = usePathname() || initialPathname;
	const isDark = DARK_THEMED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

	return (
		<div
			data-page-family={pageFamily}
			className={
				isDark
					? '[&_*]:!border-white/10 [&_a]:!text-zinc-400 [&_a:hover]:!text-white [&_h3]:!text-zinc-500 [&_p]:!text-zinc-600 [&_span]:!text-zinc-500'
					: 'bg-paper [&_.footer-invert]:invert'
			}
		>
			<hr className={isDark ? 'mb-8 border-white/10' : 'mb-8 border-ink/10'} />

			<footer
				aria-labelledby="footer-heading"
				className={
					pageFamily === "site"
						? SITE_WIDE_GUTTERED_RAIL_CLASS
						: "mx-auto max-w-screen-2xl px-6 lg:px-12"
				}
			>
				<h2 id="footer-heading" className="sr-only">
					Footer
				</h2>
				<SmallPrint initialOpenings={initialOpenings} pageFamily={pageFamily} />
			</footer>
		</div>
	);
}
