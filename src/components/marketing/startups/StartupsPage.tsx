'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import {
	CARD_TITLE_CLASS,
	BODY_CLASS,
	HERO_H1_CLASS,
	INK_PANEL_LIGHT_BUTTON_CLASS,
	PRIMARY_INK_BUTTON_CLASS,
	SECTION_H2_CLASS,
} from '@/components/marketing/typography';
import { ClosingCtaPanel } from '@/components/marketing/ClosingCtaPanel';
import { SectionRule } from '@/components/marketing/SectionRule';
import imgYC from '@/images/logos/yc.svg';
import imgA16z from '@/images/logos/a16z.svg';
import {
	SITE_CARD_CLASS,
	SITE_GUTTER_CLASS,
	SITE_STANDARD_RAIL_CLASS,
	SITE_UTILITY_HERO_CLASS,
} from '@/components/marketing/layout';

const StartupImageCycler = ({ images }: { images: { src: string; alt: string; mobileObjectPosition?: string }[] }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [showFan, setShowFan] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reduceMotion = useReducedMotion() ?? false;

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!reduceMotion) return;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setShowFan(false);
	}, [reduceMotion]);

	const handleClick = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setShowFan(false);
		setCurrentIndex((prev) => (prev + 1) % images.length);
	};

	const handleMouseEnter = () => {
		if (reduceMotion) return;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setShowFan(true);
		timeoutRef.current = setTimeout(() => {
			setShowFan(false);
			timeoutRef.current = null;
		}, 1000);
	};

	const handleMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setShowFan(false);
	};

	const getNextIndices = (count: number) => {
		const indices: number[] = [];
		for (let i = 1; i <= count; i++) {
			indices.push((currentIndex + i) % images.length);
		}
		return indices;
	};

	const fanCards = getNextIndices(1);

	return (
		<button
			type="button"
			aria-label={images[currentIndex].alt}
			className="relative mx-auto block aspect-[3/4] w-[280px] cursor-pointer appearance-none border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:aspect-[4/3] sm:w-[320px] md:w-[400px]"
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleMouseEnter}
			onBlur={handleMouseLeave}
		>
			{/* Fanned card behind */}
			{fanCards.map((imageIndex, i) => {
				const rotation = showFan ? (i + 1) * 6 : 0;
				const translateX = showFan ? (i + 1) * 15 : 0;
				const translateY = showFan ? (i + 1) * -5 : 0;
				const scale = 1 - (i + 1) * 0.02;

				return (
					<div
						key={`fan-${i}`}
						aria-hidden="true"
						className="absolute inset-0 overflow-hidden rounded-xl border border-ink/10 bg-white/55 p-2 transition-all duration-300 ease-out motion-reduce:transition-none sm:p-3"
						style={{
							transform: `rotate(${rotation}deg) translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
							zIndex: 3 - i,
							opacity: showFan ? 0.6 : 0,
						}}
					>
						<img
							src={images[imageIndex].src}
							alt={images[imageIndex].alt}
							loading="lazy"
							decoding="async"
							className="w-full h-full rounded-md border border-ink/10 object-cover select-none pointer-events-none"
							style={images[imageIndex].mobileObjectPosition ? { objectPosition: images[imageIndex].mobileObjectPosition } : undefined}
						/>
					</div>
				);
			})}

			{/* Main card */}
			<div
				className="absolute inset-0 overflow-hidden rounded-xl border border-ink/10 bg-white/55 p-2 transition-transform duration-300 ease-out motion-reduce:transition-none sm:p-3"
				style={{
					zIndex: 10,
					transform: showFan ? 'rotate(-3deg) translateX(-10px)' : 'rotate(0deg) translateX(0px)',
				}}
			>
				<div className="relative h-full w-full overflow-hidden rounded-md border border-ink/10">
					{images.map((image, index) => (
						<img
							key={image.src}
							src={image.src}
							alt={image.alt}
							loading={index === 0 ? 'eager' : 'lazy'}
							decoding="async"
							aria-hidden={index !== currentIndex}
							className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-300 motion-reduce:transition-none ${
								index === currentIndex ? 'opacity-100' : 'opacity-0'
							}`}
							style={image.mobileObjectPosition ? { objectPosition: image.mobileObjectPosition } : undefined}
						/>
					))}
				</div>
			</div>
		</button>
	);
};

interface CollapsibleSectionProps {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	background?: 'paper' | 'paper-mid';
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const sectionId = useId();
	const triggerId = `${sectionId}-trigger`;
	const panelId = `${sectionId}-panel`;

	return (
		<section className={`bg-paper ${SITE_GUTTER_CLASS}`}>
			<div className={SITE_STANDARD_RAIL_CLASS} data-site-reveal>
				<h2 className="text-balance">
					<button
						id={triggerId}
						type="button"
						aria-controls={panelId}
						aria-expanded={isOpen}
						onClick={() => setIsOpen(!isOpen)}
						className={`flex w-full items-center justify-between py-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine md:py-20 ${SECTION_H2_CLASS}`}
					>
						<span>{title}</span>
						<ChevronDown
							aria-hidden="true"
							className={`h-6 w-6 text-ink-faint transition-transform duration-200 motion-reduce:transition-none ${
								isOpen ? 'rotate-180' : ''
							}`}
						/>
					</button>
				</h2>
				<div
					id={panelId}
					role="region"
					aria-labelledby={triggerId}
					hidden={!isOpen}
					className={`grid transition-all duration-300 ease-in-out motion-reduce:transition-none ${
						isOpen ? 'grid-rows-[1fr] opacity-100 pb-16 md:pb-20' : 'grid-rows-[0fr] opacity-0'
					}`}
				>
					<div className="overflow-hidden">
						{children}
					</div>
				</div>
			</div>
		</section>
	);
}

interface StartupsPageProps {
	foundersImage: string;
	speedrunImage: string;
}

export default function StartupsPage({ foundersImage, speedrunImage }: StartupsPageProps) {
	const benefits = [
		{ title: '50% off for 12 months', description: '50% off the Team plan' },
		{ title: 'Priority Slack support', description: 'Direct access to our engineering team for fast answers and guidance' },
		{ title: 'Architecture review', description: '1-on-1 session with our team to optimize your actor architecture' },
	];

	const eligibility = [
		'Current YC company or YC alumni',
		'OR current a16z Speedrun company or Speedrun alumni',
		'New Rivet Cloud customer',
	];

	const steps = [
		{ number: 1, title: 'Reach out', description: 'Contact us through the form below or find the deal on Bookface/Speedrun portal' },
		{ number: 2, title: 'Verify your company', description: "We'll confirm your YC or Speedrun affiliation" },
		{ number: 3, title: 'Start building', description: 'Get your discount applied and start shipping with Rivet' },
	];

	return (
		<main id="main-content" tabIndex={-1}>
			{/* Hero Section */}
			<section className={`${SITE_UTILITY_HERO_CLASS} flex flex-col justify-center lg:min-h-screen`}>
				{/* Centered content */}
				<div className="flex flex-col justify-center">
					<div className={SITE_STANDARD_RAIL_CLASS}>
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-20">
							<div className="max-w-xl" data-site-reveal>
								<h1 className={`mb-6 ${HERO_H1_CLASS}`}>
									Built for Demo Day and Beyond
								</h1>
								<p className="text-[17px] leading-relaxed text-ink-soft">
									As{' '}
									<span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/15 bg-white/55 px-2.5 py-0.5 text-sm text-ink-soft align-middle">
										<img src={imgYC.src} alt="Y Combinator logo" width={16} height={16} className="h-4 w-auto" loading="eager" decoding="async" />
										<span>YC W23</span>
									</span>
									{' '}and{' '}
									<span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/15 bg-white/55 px-2.5 py-0.5 text-sm text-ink-soft align-middle">
										<img src={imgA16z.src} alt="Andreessen Horowitz (a16z) logo" width={16} height={12} className="h-3 w-auto invert" loading="eager" decoding="async" />
										<span>a16z SR002</span>
									</span>
									{' '}alumni, we're offering fellow YC and Speedrun companies pricing and support to ship faster.
								</p>
							</div>
							{/* Desktop: Overlapping photos */}
							<div className="hidden lg:block flex-shrink-0 relative w-[500px] h-[400px]" data-site-reveal data-site-reveal-delay="40">
								<div className="absolute top-0 left-0 w-[320px] h-[240px] overflow-hidden rounded-xl border border-ink/10 bg-white/55 p-2 sm:p-3">
									<img
										src={foundersImage}
										alt="Rivet founders Nathan Flurry and Nicholas Kissel at Y Combinator W23 Demo Day"
										width={320}
										height={240}
										loading="eager"
										decoding="async"
										className="w-full h-full rounded-md border border-ink/10 object-cover"
									/>
								</div>
								<div className="absolute bottom-0 right-0 w-[320px] h-[240px] overflow-hidden rounded-xl border border-ink/10 bg-white/55 p-2 sm:p-3">
									<img
										src={speedrunImage}
										alt="Andreessen Horowitz a16z Speedrun SR002 cohort presentation"
										width={320}
										height={240}
										loading="lazy"
										decoding="async"
										className="w-full h-full rounded-md border border-ink/10 object-cover"
									/>
								</div>
							</div>
							{/* Mobile: Click to switch photos */}
							<div className="lg:hidden" data-site-reveal data-site-reveal-delay="40">
								<StartupImageCycler
									images={[
										{ src: foundersImage, alt: 'Rivet founders Nathan Flurry and Nicholas Kissel at Y Combinator W23 Demo Day' },
										{ src: speedrunImage, alt: 'Andreessen Horowitz a16z Speedrun SR002 cohort presentation', mobileObjectPosition: 'right center' },
									]}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom section */}
				<div className="mt-12">
					<div className={SITE_STANDARD_RAIL_CLASS}>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6" data-site-reveal data-site-reveal-delay="80">
							<div>
								<h2 className={CARD_TITLE_CLASS}>
									50% off Rivet Cloud for 12 months
								</h2>
								<p className={`mt-1 ${BODY_CLASS}`}>
									Everything you need to build and scale stateful workloads at startup speed.
								</p>
							</div>
							<a
								href="https://forms.gle/J8USsTND8NAKJ18W9"
								target="_blank"
								rel="noopener noreferrer"
								className={PRIMARY_INK_BUTTON_CLASS}
							>
								Claim the deal
							</a>
						</div>
					</div>
				</div>
			</section>

			<SectionRule />

			{/* What You Get */}
			<CollapsibleSection title="What you get" background="paper-mid">
				<p className="mb-12 max-w-xl text-[17px] leading-relaxed text-ink-soft">
					Everything you need to build and scale stateful workloads at startup speed.
				</p>
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{benefits.map((benefit, idx) => (
						<div key={idx} className="flex flex-col border-t border-ink/10 pt-6">
							<h3 className={`mb-2 ${CARD_TITLE_CLASS}`}>{benefit.title}</h3>
							<p className={BODY_CLASS}>{benefit.description}</p>
						</div>
					))}
				</div>
			</CollapsibleSection>

			<SectionRule />

			{/* Eligibility */}
			<CollapsibleSection title="Eligibility">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{eligibility.map((item, idx) => (
						<div key={idx} className={`flex items-center gap-3 ${SITE_CARD_CLASS}`}>
							<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
								<Check className="h-4 w-4 text-pine" />
							</div>
							<span className={BODY_CLASS}>{item}</span>
						</div>
					))}
				</div>
			</CollapsibleSection>

			<SectionRule />

			{/* How to Claim */}
			<CollapsibleSection title="How to claim" background="paper-mid">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{steps.map((step, idx) => (
						<div key={idx} className="flex flex-col border-t border-ink/10 pt-6">
							<div className="mb-3 flex h-6 w-6 items-center justify-center rounded-full border border-pine/30 font-mono text-xs text-pine">
								{step.number}
							</div>
							<h3 className={`mb-2 ${CARD_TITLE_CLASS}`}>{step.title}</h3>
							<p className={BODY_CLASS}>{step.description}</p>
						</div>
					))}
				</div>
			</CollapsibleSection>

			<SectionRule />

			{/* CTA */}
			<ClosingCtaPanel
				title="Ready to build?"
				footnote={
					<>
						Questions?{' '}
						<a
							href="/support"
							className="rounded-sm text-cream underline underline-offset-2 transition-colors motion-reduce:transition-none hover:text-cream/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
						>
							Contact us
						</a>
					</>
				}
			>
				<a
					href="https://forms.gle/J8USsTND8NAKJ18W9"
					target="_blank"
					rel="noopener noreferrer"
					className={INK_PANEL_LIGHT_BUTTON_CLASS}
				>
					Claim the deal
				</a>
			</ClosingCtaPanel>
		</main>
	);
}
