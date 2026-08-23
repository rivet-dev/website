import { motion, useReducedMotion } from "framer-motion";
import { TalkToAnEngineerForm } from "./form";
import { HERO_H1_CLASS, SUBTITLE_CLASS } from "../typography";
import { ProductBadge } from "@/components/ProductBar";
import { visibleProducts } from "@/sitemap/products";
import {
	SITE_CARD_CLASS,
	SITE_STANDARD_RAIL_CLASS,
	SITE_UTILITY_HERO_CLASS,
} from "../layout";

// Rodin, "The Thinker" (1904). Transparent cutout that anchors the right
// column; the product marks float around it.
const THINKER_SRC = "/images/thinking/the-thinker.webp";

// Resting tilt, float offset, and placement per product mark, so the four
// badges orbit the figure — the agentOS treatment. Positions hug the
// silhouette of this exact cutout (head crown, shoulder, shin, rock base);
// re-tune by eye if the-thinker.webp is ever re-cropped.
const TILT = [-7, 6, 5, -6];
const OFFSET = [-10, 12, 14, -8];
const POSITIONS = [
	"left-[12%] -top-6", // Actors — above the bowed head, reaching toward the h1
	"right-[14%] top-[26%]", // agentOS — overlapping the curve of the back
	"-left-6 bottom-[30%]", // Workflows — beside the shin, drifting into the gutter
	"right-[6%] -bottom-2", // Dynamic Apps — overlapping the rock's base corner
];

function ProductIconCluster() {
	const reduceMotion = useReducedMotion() ?? false;

	return (
		<div className="relative w-fit">
			{/* The figure sits behind the marks. The box shrink-wraps the cutout
			    so the badge offsets track the silhouette. */}
			<img
				src={THINKER_SRC}
				alt="Rodin's The Thinker"
				loading="eager"
				decoding="async"
				data-site-reveal
				data-site-reveal-delay="80"
				className="h-[32rem] w-auto object-contain xl:h-[42rem]"
			/>

			{visibleProducts.map((product, i) => {
				const tilt = TILT[i % TILT.length];
				const offset = OFFSET[i % OFFSET.length];
				const position = POSITIONS[i % POSITIONS.length];

				return (
					<motion.a
						key={product.id}
						href={product.href}
						aria-label={product.name}
						initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: tilt }}
						whileInView={
							reduceMotion
								? undefined
								: { opacity: 1, rotate: tilt, y: [offset, offset - 10, offset] }
						}
						viewport={{ once: true }}
						whileHover={reduceMotion ? undefined : { rotate: 0, scale: 1.06 }}
						transition={{
							opacity: { duration: 0.5, delay: i * 0.09 },
							rotate: { duration: 0.4, delay: i * 0.09 },
							scale: { duration: 0.25 },
							y: reduceMotion
								? undefined
								: {
										duration: 4.2 + i * 0.5,
										repeat: Infinity,
										ease: "easeInOut",
										delay: i * 0.35,
									},
						}}
						style={reduceMotion ? { rotate: tilt, y: offset } : undefined}
						className={`group absolute ${position} flex items-center justify-center rounded-[34.375%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
					>
						{/* The product color is the tile, the mark rides in cream — the
						    same lockup geometry as the header dropdown. */}
						<ProductBadge product={product} className="size-20" />

						{/* Name shows only on hover, in a pill below the logo. */}
						<span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-medium text-ink opacity-0 shadow-[0_8px_24px_-12px_rgba(27,25,22,0.35)] transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none">
							{product.name}
						</span>
					</motion.a>
				);
			})}
		</div>
	);
}

export default function TalkToAnEngineerPageClient() {
	return (
		<main id="main-content" tabIndex={-1}>
			<section className={SITE_UTILITY_HERO_CLASS}>
				{/* 2x2 grid: heading and form stack on the left rail; the statue
				    spans both rows, pinned to the right rail and centered
				    vertically against the heading + form column. */}
				<div className={`grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 ${SITE_STANDARD_RAIL_CLASS}`}>
					<header data-site-reveal>
						<h1 className={HERO_H1_CLASS}>Talk to an Engineer</h1>
						<p className={`${SUBTITLE_CLASS} max-w-md`}>
							Connect with one of our engineers to discuss your
							technical needs and how Rivet can help.
						</p>
					</header>

					<div className={`self-start lg:col-start-1 lg:row-start-2 ${SITE_CARD_CLASS}`} data-site-reveal data-site-reveal-delay="40">
						<TalkToAnEngineerForm />
					</div>

					<div className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:self-center lg:justify-self-end">
						<ProductIconCluster />
					</div>
				</div>
			</section>
		</main>
	);
}
