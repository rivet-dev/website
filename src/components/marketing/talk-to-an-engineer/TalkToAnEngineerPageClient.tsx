import { motion, useReducedMotion } from "framer-motion";
import { TalkToAnEngineerForm } from "./form";
import { HERO_H1_CLASS, SUBTITLE_CLASS } from "../typography";
import { ProductBadge } from "@/components/ProductBar";
import { visibleProducts } from "@/sitemap/products";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import {
	SITE_CARD_CLASS,
	SITE_STANDARD_RAIL_CLASS,
	SITE_UTILITY_HERO_CLASS,
} from "../layout";

// Rodin, "The Thinker" (1904). Transparent cutout that anchors the right
// column; the product marks float around it.
const THINKER_SRC = "/images/thinking/the-thinker.webp";

// Give every product its own spot around this cutout, independent of the
// product list order. Keep the face and torso clear as the badges float.
const PLACEMENTS: Record<string, { position: string; tilt: number; offset: number }> = {
	actors: { position: "left-[2%] -top-8", tilt: -7, offset: -10 },
	agentos: { position: "right-0 top-[22%]", tilt: 6, offset: 12 },
	workflows: { position: "-left-6 top-[46%]", tilt: 5, offset: 14 },
	"dynamic-apps": { position: "right-[2%] bottom-[1%]", tilt: -6, offset: -8 },
	"secure-exec": { position: "left-[2%] bottom-[5%]", tilt: -8, offset: -6 },
};

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
				const { tilt, offset, position } = PLACEMENTS[product.id];

				return (
					<motion.a
						key={product.id}
						href={canonicalizeInternalHref(product.href)}
						aria-label={product.name}
						initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: tilt }}
						animate={reduceMotion ? { opacity: 1, rotate: tilt, y: offset } : undefined}
						whileInView={
							reduceMotion
								? undefined
								: { opacity: 1, rotate: tilt, y: [offset, offset - 10, offset] }
						}
						viewport={{ once: true }}
						whileHover={reduceMotion ? undefined : { rotate: 0, scale: 1.06 }}
						transition={reduceMotion ? { duration: 0 } : {
							opacity: { duration: 0.5, delay: i * 0.09 },
							rotate: { duration: 0.4, delay: i * 0.09 },
							scale: { duration: 0.25 },
							y: {
								duration: 4.2 + i * 0.5,
								repeat: Infinity,
								ease: "easeInOut",
								delay: i * 0.35,
							},
						}}
						className={`group absolute ${position} flex items-center justify-center rounded-[34.375%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
					>
						{/* The product color is the tile, the mark rides in white — the
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
