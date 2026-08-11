import { Icon } from "@rivet-gg/icons";
import actorsLogo from "@/images/products/actors-logo.svg";
import { wordmarkMaskStyle } from "@/lib/product-accent";

export interface DocsLandingItem {
	title: string;
	href: string;
	icon: any;
	description?: string;
	badge?: string;
	/** SVG wordmark shown instead of the glyph, e.g. a product logo. */
	logoSrc?: string;
	/** Tailwind text-color class for the glyph, e.g. a product accent. */
	iconClassName?: string;
	/** Tailwind background class that paints `logoSrc`, e.g. a product accent. */
	logoClassName?: string;
	/** Tailwind border class applied on hover, e.g. a product accent hairline. */
	hoverBorderClassName?: string;
}

export interface DocsLandingSection {
	title: string;
	items: DocsLandingItem[];
}

export interface DocsLandingData {
	title: string;
	subtitle?: string;
	/** Cards per row at `lg`. Defaults to 3. */
	columns?: 2 | 3;
	// Optional product logo shown above the title in the hero. "actors" renders
	// the static actors logo.
	logo?: "actors";
	sections: DocsLandingSection[];
}

function HeroTitle({
	title,
	logo,
}: {
	title: string;
	logo?: "actors";
}) {
	if (logo === "actors") {
		return (
			<div className="mb-4 flex items-center justify-center gap-3">
				{/* The mark is a solid-white SVG, so it is masked and refilled with
				    ink to read on the porcelain field. */}
				<span
					aria-hidden="true"
					style={wordmarkMaskStyle(actorsLogo.src)}
					className="inline-block h-8 w-8 bg-ink md:h-9 md:w-9"
				/>
				<h1 className="text-4xl font-medium tracking-tight text-ink">
					{title}
				</h1>
			</div>
		);
	}
	return (
		<h1 className="mb-4 text-4xl font-medium tracking-tight text-ink">
			{title}
		</h1>
	);
}

// Faint grid backdrop for the card illustration area. Masked with a radial fade
// so the grid is strongest behind the icon and dissolves toward the edges. Uses
// ink-tinted hairlines so it reads on the light porcelain background.
const gridStyle = {
	backgroundImage:
		"linear-gradient(to right, rgba(20,22,20,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,22,20,0.05) 1px, transparent 1px)",
	backgroundSize: "24px 24px",
	maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)",
	WebkitMaskImage:
		"radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)",
};

function LandingCard({ item }: { item: DocsLandingItem }) {
	return (
		<a
			href={item.href}
			className={`group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/55 no-underline transition-colors ${item.hoverBorderClassName ?? "hover:border-ink/25"}`}
		>
			<div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-ink/10">
				<div className="absolute inset-0" style={gridStyle} />
				{item.logoSrc ? (
					// Product wordmarks are white-on-transparent, so the SVG supplies
					// the silhouette and the accent class supplies the hue.
					<span
						aria-hidden="true"
						style={wordmarkMaskStyle(item.logoSrc)}
						className={`relative inline-block h-14 w-14 transition-transform duration-200 group-hover:scale-105 bg-ink`}
					/>
				) : (
					<Icon
						icon={item.icon}
						className={`relative text-6xl transition-transform duration-200 group-hover:scale-105 text-ink-soft`}
					/>
				)}
			</div>
			<div className="flex flex-col gap-1.5 p-5">
				<div className="flex items-center gap-2">
					<span className="font-medium text-ink">{item.title}</span>
					{item.badge && (
						<span className="rounded-full border border-ink/10 bg-ink/[0.06] px-2 py-0.5 text-[11px] font-medium text-ink-soft">
							{item.badge}
						</span>
					)}
				</div>
				{item.description && (
					<p className="text-sm leading-relaxed text-ink-soft">
						{item.description}
					</p>
				)}
			</div>
		</a>
	);
}

export function DocsLanding({ title, subtitle, logo, sections, columns = 3 }: DocsLandingData) {
	const showHeaders = sections.length > 1;

	return (
		<div className="mx-auto flex min-h-[calc(100vh-var(--header-height,3.5rem)-0.5rem)] w-full max-w-5xl flex-col justify-center px-2 py-8">
			<header className="mx-auto mb-16 max-w-2xl text-center">
				<HeroTitle title={title} logo={logo} />
				{subtitle && (
					<p className="text-lg leading-relaxed text-ink-soft">{subtitle}</p>
				)}
			</header>
			<div className="flex flex-col gap-14">
				{sections.map((section) => (
					<section key={section.title}>
						{showHeaders && (
							<h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink-faint">
								{section.title}
							</h2>
						)}
						<div
							className={`grid gap-5 sm:grid-cols-2 ${columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
						>
							{section.items.map((item) => (
								<LandingCard key={item.href} item={item} />
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
