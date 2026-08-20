import { Icon, faArrowRight, faRivet, faServer } from '@rivet-gg/icons';
import type { ReactNode } from 'react';
import { FaqList } from '@/components/faq/FaqSection';
import { formatTimestamp } from '@/lib/formatDate';
import { compareEntries, compareHref, getCompareEntry } from '@/data/compare';
import type { CompareEntry } from '@/data/compare/types';
import { CatalogCard } from '@/components/marketing/editorial/CatalogCard';
import {
	CAPTION_CLASS,
	HERO_H1_CLASS,
	INK_PANEL_GHOST_BUTTON_CLASS,
	INK_PANEL_LIGHT_BUTTON_CLASS,
	PRODUCT_HERO_PRIMARY_BUTTON_CLASS,
	PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
	SECTION_H2_BASE_CLASS,
	SECTION_H2_CLASS,
	SECTION_LEDE_CENTERED_CLASS,
	SECTION_LEDE_CLASS,
} from '@/components/marketing/typography';
import { ComparisonTable } from './ComparisonTable';

// Mounted with client:visible from [product]/compare/[slug].astro because the
// FAQ accordion (FaqList) is stateful. Comparison pages are SEO entry pages,
// so keep the island lean: no framer-motion or other heavy client deps.
interface ComparePageProps {
	slug: string;
}

// Warm oil-paint texture behind the closing band, mirroring the sitewide CTA
// colophon. The veil keeps text readable even if the image fails to load.
const FOOTER_PAINTING_SRC =
	'https://assets.rivet.dev/website/images/textures/footer-abstract.webp';

function SectionHeading({
	title,
	subtitle,
	center = false,
}: {
	title: string;
	subtitle?: string;
	center?: boolean;
}) {
	return (
		<div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
			<h2 className={`text-balance ${SECTION_H2_CLASS}`}>{title}</h2>
			{subtitle && (
				<p className={center ? SECTION_LEDE_CENTERED_CLASS : SECTION_LEDE_CLASS}>{subtitle}</p>
			)}
		</div>
	);
}

function HeroSection({ entry }: { entry: CompareEntry }) {
	return (
		<section className="depth-wash relative overflow-hidden px-6 pb-24 pt-32 md:pb-28 md:pt-44">
			<div className="mx-auto w-full max-w-7xl">
				<div className="max-w-3xl">
					<h1 className={HERO_H1_CLASS}>
						{entry.rivetProductName} vs <br />
						{entry.competitorName}
					</h1>
					<p className="mt-7 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">{entry.heroSubtitle}</p>
					<div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
						<a
							href="/actors/docs/quickstart/backend"
							className={PRODUCT_HERO_PRIMARY_BUTTON_CLASS}
						>
							Get Started with {entry.rivetProductName}
							<Icon icon={faArrowRight} />
						</a>
						<a
							href="/talk-to-an-engineer"
							className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
						>
							Talk to an engineer
						</a>
					</div>
					<p className={`mt-8 ${CAPTION_CLASS}`}>
						Last updated {formatTimestamp(entry.lastUpdated)}
					</p>
				</div>
			</div>
		</section>
	);
}

function ChoiceList({
	heading,
	choices,
}: {
	heading: string;
	choices: CompareEntry['whenToChooseRivet'];
}) {
	return (
		<div>
			<div className="text-sm font-medium text-ink-faint">{heading}</div>
			<div className="mt-5 space-y-5">
				{choices.map((choice) => (
					<div key={choice.title}>
						<div className="text-[15px] font-medium text-ink">{choice.title}</div>
						<div className="mt-1 text-sm leading-relaxed text-ink-soft">{choice.description}</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Catalog-card treatment for the two overview plates. The Rivet plate uses
// CatalogCard's highlight prop for its pine frame.
function OverviewPanel({
	icon,
	name,
	summary,
	children,
	highlight = false,
}: {
	icon: ReactNode;
	name: string;
	summary: string;
	children: ReactNode;
	highlight?: boolean;
}) {
	return (
		<CatalogCard
			highlight={highlight}
			title={
				<span className="flex items-center gap-3">
					<span className="text-pine">{icon}</span>
					{name}
				</span>
			}
		>
			<p className="mt-4 text-sm leading-relaxed text-ink-soft">{summary}</p>
			<div className="my-7 h-px bg-ink/10" />
			{children}
		</CatalogCard>
	);
}

function OverviewSection({ entry }: { entry: CompareEntry }) {
	return (
		<section className="border-t border-ink/10 bg-paper-mid px-6 py-16 md:py-32">
			<div className="mx-auto max-w-7xl">
				<SectionHeading
					title="Two approaches, side by side"
					subtitle="What each platform is, and the situations where it is the right choice."
				/>
				<div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
					<OverviewPanel
						icon={<Icon icon={faRivet} className="h-4 w-4" />}
						name={entry.rivetProductName}
						summary={entry.rivetSummary}
						highlight
					>
						<ChoiceList
							heading={`When to choose ${entry.rivetProductName}`}
							choices={entry.whenToChooseRivet}
						/>
						<div className="mt-8">
							<a
								href="/actors/docs/quickstart/backend"
								className="group inline-flex items-center gap-2 rounded-sm text-sm font-medium text-pine hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
							>
								Get started with {entry.rivetProductName}
								<Icon
									icon={faArrowRight}
									className="transition-transform motion-reduce:transition-none group-hover:translate-x-0.5"
								/>
							</a>
						</div>
					</OverviewPanel>

					<OverviewPanel
						icon={<Icon icon={entry.competitorIcon ?? faServer} className="h-4 w-4" />}
						name={entry.competitorName}
						summary={entry.competitorSummary}
					>
						<ChoiceList
							heading={`When to choose ${entry.competitorName}`}
							choices={entry.whenToChooseCompetitor}
						/>
					</OverviewPanel>
				</div>
			</div>
		</section>
	);
}

function ComparisonSection({ entry }: { entry: CompareEntry }) {
	return (
		<section className="border-t border-ink/10 bg-paper px-6 py-16 md:py-32">
			<div className="mx-auto max-w-7xl">
				<SectionHeading
					title="Feature comparison"
					subtitle="A detailed breakdown of capabilities across both platforms."
				/>
				<div className="mt-14">
					<ComparisonTable
						featureGroups={entry.featureGroups}
						competitorName={entry.competitorName}
						competitorIcon={entry.competitorIcon}
						rivetProductName={entry.rivetProductName}
					/>
				</div>
			</div>
		</section>
	);
}

function VerdictSection({ entry }: { entry: CompareEntry }) {
	return (
		<section className="border-t border-ink/10 bg-paper-mid px-6 py-16 md:py-32">
			<div className="mx-auto max-w-2xl text-center">
				<SectionHeading title="Which should you pick?" center />
				<div className="mt-8 space-y-5">
					{entry.verdict.map((paragraph, index) => (
						<p
							key={paragraph}
							className={
								index === 0
									? 'text-lg leading-8 text-ink'
									: 'text-base leading-relaxed text-ink-soft'
							}
						>
							{paragraph}
						</p>
					))}
				</div>
			</div>
		</section>
	);
}

function MigrationSection({ migration }: { migration: NonNullable<CompareEntry['migration']> }) {
	return (
		<section className="border-t border-ink/10 px-6 py-16 md:py-32">
			<div className="mx-auto max-w-2xl text-center">
				<SectionHeading title={migration.heading} center />
				<p className="mt-8 text-base leading-relaxed text-ink-soft">{migration.body}</p>
				<div className="mt-8">
					<a
						href="/talk-to-an-engineer"
						className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
					>
						Talk to an engineer
					</a>
				</div>
			</div>
		</section>
	);
}

function FaqSectionLight({ entry, background }: { entry: CompareEntry; background: 'paper' | 'paper-mid' }) {
	return (
		<section className={`border-t border-ink/10 px-6 py-16 md:py-32 ${background === 'paper-mid' ? 'bg-paper-mid' : 'bg-paper'}`}>
			<div className="mx-auto max-w-3xl">
				<SectionHeading title="Frequently asked questions" />
				<div className="mt-10">
					<FaqList items={entry.faq} theme="light" />
				</div>
			</div>
		</section>
	);
}

function OtherComparisonsSection({ entry, background }: { entry: CompareEntry; background: 'paper' | 'paper-mid' }) {
	const others = compareEntries.filter((other) => other.slug !== entry.slug);
	if (others.length === 0) {
		return null;
	}

	return (
		<section className={`border-t border-ink/10 px-6 py-16 md:py-32 ${background === 'paper-mid' ? 'bg-paper-mid' : 'bg-paper'}`}>
			<div className="mx-auto max-w-7xl">
				<SectionHeading title="Other comparisons" />
				<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
					{others.map((other) => (
						<CatalogCard
							key={other.slug}
							href={`${compareHref(other)}/`}
							title={other.title}
							linkLabel="Read the comparison"
						>
							<p className="mt-2 text-sm leading-relaxed text-ink-soft">{other.description}</p>
						</CatalogCard>
					))}
				</div>
			</div>
		</section>
	);
}

// Static mirror of the landing footer colophon (RedesignedCTA). This page
// ships zero island JavaScript, so the entrance animations are omitted.
function CTASection() {
	return (
		<section className="border-t border-ink/10 bg-paper px-4 py-14 text-center md:px-6 md:py-24">
			<div className="selection-paper relative mx-auto flex min-h-[26rem] max-w-screen-2xl items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-ink px-6 py-20 text-cream md:min-h-[34rem] md:px-10 lg:aspect-[2563/1440] lg:min-h-0">
				<img
					aria-hidden="true"
					src={FOOTER_PAINTING_SRC}
					alt=""
					loading="lazy"
					decoding="async"
					className="absolute inset-0 h-full w-full object-cover object-center lg:object-contain"
				/>
				<div className="relative z-[1] mx-auto max-w-3xl">
					<h2 className={`${SECTION_H2_BASE_CLASS} mb-6 text-cream`}>
						Infrastructure for <br />
						the agentic era.
					</h2>
					<p className="mb-9 text-base leading-relaxed text-cream/65">
						Build with agents, build for agents, and run it where your data lives.
					</p>
					<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
						<a
							href="/docs"
							className={INK_PANEL_LIGHT_BUTTON_CLASS}
						>
							Start Building
						</a>
						<a
							href="/talk-to-an-engineer"
							className={INK_PANEL_GHOST_BUTTON_CLASS}
						>
							Talk to an Engineer
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}

export function ComparePage({ slug }: ComparePageProps) {
	const entry = getCompareEntry(slug);
	if (!entry) {
		throw new Error(`Unknown compare entry: ${slug}`);
	}
	const hasMigration = Boolean(entry.migration);

	return (
		<div className="paper-grain min-h-screen bg-paper font-sans text-ink-soft">
			<main id="main-content" tabIndex={-1}>
				<HeroSection entry={entry} />
				<OverviewSection entry={entry} />
				<ComparisonSection entry={entry} />
				<VerdictSection entry={entry} />
				{entry.migration && <MigrationSection migration={entry.migration} />}
				<FaqSectionLight entry={entry} background={hasMigration ? 'paper-mid' : 'paper'} />
				<OtherComparisonsSection entry={entry} background={hasMigration ? 'paper' : 'paper-mid'} />
				<CTASection />
			</main>
		</div>
	);
}
