"use client";

import { productAccent } from "@/lib/product-accent";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import { useEffect, useState } from "react";
import { Terminal, Check, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  HERO_H1_CLASS,
  PRODUCT_HERO_PRIMARY_BUTTON_CLASS,
} from "../typography";
import { SITE_STANDARD_RAIL_CLASS, SITE_UTILITY_HERO_CLASS } from "../layout";

interface ThinkingImage {
  src: string;
  title: string;
  artist: string;
  date: string;
}

interface LatestPost {
  title: string;
  href: string;
  imageSrc: string | null;
}

const LATEST_POST_DISMISSED_KEY = "rivet-latest-post-dismissed";

const ThinkingImageCycler = ({ images }: { images: ThinkingImage[] }) => {
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFan, setShowFan] = useState(false);
  const [leavingCards, setLeavingCards] = useState<
    Array<{ id: string; image: ThinkingImage }>
  >([]);

  useEffect(() => {
    // Preload upcoming images to avoid decode flashes during cycling.
    const preloadAhead = Math.min(4, images.length - 1);
    for (let i = 1; i <= preloadAhead; i++) {
      const next = images[(currentIndex + i) % images.length];
      const img = new window.Image();
      img.src = next.src;
    }
  }, [currentIndex, images]);

  const handleClick = () => {
    const leavingImage = images[currentIndex];
    setLeavingCards((prev) => [
      ...prev,
      { id: `${leavingImage.src}-${Date.now()}`, image: leavingImage },
    ]);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleMouseEnter = () => {
    setShowFan(true);
  };

  const handleMouseLeave = () => {
    setShowFan(false);
  };

  const getStackIndices = (count: number) => {
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      indices.push((currentIndex + i) % images.length);
    }
    return indices;
  };

  const getStackPose = (position: number, expanded: boolean) => {
    const basePoses = [
      { x: 0, y: 0, rotate: -0.7, scale: 1 },
      { x: 5, y: 2, rotate: 1.2, scale: 0.985 },
      { x: 10, y: 4, rotate: 2.4, scale: 0.97 },
    ];

    const expandedOffsets = [
      { x: -8, y: 0, rotate: -0.9 },
      { x: 10, y: -5, rotate: 1.3 },
      { x: 20, y: -10, rotate: 2 },
    ];

    const idx = Math.min(position, basePoses.length - 1);
    const base = basePoses[idx];
    const expand = expanded ? expandedOffsets[idx] : { x: 0, y: 0, rotate: 0 };

    if (!expanded) {
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      };
    }

    return {
      x: base.x + expand.x,
      y: base.y + expand.y,
      rotate: base.rotate + expand.rotate,
      scale: base.scale,
    };
  };

  const stackCards = getStackIndices(Math.min(3, images.length));
  const currentImage = images[currentIndex];

  return (
    <button
      type="button"
      aria-label={`Show the next artwork. Current artwork: ${currentImage.title}`}
      className="relative h-[350px] w-[280px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:h-[500px] sm:w-[400px]"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {stackCards.map((imageIndex, stackPosition) => {
        const pose = getStackPose(stackPosition, showFan && !reducedMotion);
        const image = images[imageIndex];
        const isTopCard = stackPosition === 0;

        return (
          <motion.div
            key={image.src}
            className="absolute inset-0 overflow-hidden border border-ink/10"
            style={{ zIndex: 20 - stackPosition }}
            initial={false}
            animate={{ ...pose, opacity: isTopCard || showFan ? 1 : 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <img
              src={image.src}
              alt={isTopCard ? `${image.title} by ${image.artist}` : ""}
              aria-hidden={!isTopCard}
              loading={isTopCard && currentIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full select-none object-cover pointer-events-none"
            />
          </motion.div>
        );
      })}

      <AnimatePresence initial={false}>
        {leavingCards.map((card) => {
          const topPose = getStackPose(0, showFan && !reducedMotion);

          return (
            <motion.div
              key={card.id}
              className="pointer-events-none absolute inset-0 overflow-hidden border border-ink/10"
              style={{ zIndex: 30 }}
              initial={{ ...topPose, opacity: 1 }}
              animate={
                reducedMotion
                  ? { opacity: 0 }
                  : {
                      x: topPose.x - 36,
                      y: topPose.y - 2,
                      rotate: topPose.rotate - 7,
                      scale: 0.985,
                      opacity: 0,
                    }
              }
              transition={{
                duration: reducedMotion ? 0 : 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() =>
                setLeavingCards((prev) =>
                  prev.filter((prevCard) => prevCard.id !== card.id),
                )
              }
            >
              <img
                src={card.image.src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full select-none object-cover pointer-events-none"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div
        className={`pointer-events-none absolute left-0 right-0 top-full mt-5 text-center transition-all duration-200 motion-reduce:transition-none ${
          showFan ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
        style={{ zIndex: 20 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentImage.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <p className="text-sm font-medium leading-tight text-ink">
              {currentImage.title}
            </p>
            <p className="mt-1 text-xs leading-tight text-ink-faint">
              {currentImage.artist} · {currentImage.date}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </button>
  );
};

const CopyInstallButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("npx skills add rivet-dev/skills");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="group relative w-full sm:w-auto">
      {/* No <noscript> here: Astro's view-transition router strips noscript
          elements from swapped-in pages, which desyncs React hydration for any
          island that renders one (the mismatch regenerates the tree and blanks
          the hero). The scripting media query provides the no-JS fallback. */}
      <button
        type="button"
        aria-label="Copy npx skills add rivet-dev/skills"
        onClick={handleCopy}
        className="inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-md border border-ink/15 bg-white/55 px-3.5 py-2.5 font-mono text-[13px] text-ink-soft transition-colors motion-reduce:transition-none hover:border-ink/30 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto [@media(scripting:none)]:hidden"
      >
        {copied ? (
          <Check className="h-4 w-4 text-pine" />
        ) : (
          <Terminal className="h-4 w-4" />
        )}
        npx skills add rivet-dev/skills
      </button>
      <code className="hidden w-full select-all items-center justify-center gap-2.5 whitespace-nowrap rounded-md border border-ink/15 bg-white/55 px-3.5 py-2.5 font-mono text-[13px] text-ink-soft sm:w-auto [@media(scripting:none)]:flex">
        <Terminal className="h-4 w-4" aria-hidden="true" />
        npx skills add rivet-dev/skills
      </code>
      <div className="pointer-events-none absolute left-1/2 top-full mt-4 -translate-x-1/2 translate-y-2 whitespace-nowrap text-xs text-ink-faint opacity-0 transition-all duration-200 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        Give this to your coding agent
      </div>
    </div>
  );
};

interface RedesignedHeroProps {
  latestPost: LatestPost | null;
  thinkingImages: ThinkingImage[];
}

const settledHeroReveal = (delay: number) => ({
  "data-site-hero-reveal": true,
  "data-site-reveal-delay": String(delay),
  "data-site-reveal-visible": "",
  style:
    delay > 0
      ? ({ "--site-reveal-delay": `${delay}ms` } as React.CSSProperties)
      : undefined,
});

/**
 * A verb in the tagline that links to the product it names. Rendered as plain
 * emphasized text at rest — no underline — so the four verbs read as copy
 * rather than decoration; the product accent color appears only on hover.
 */
function ProductVerb({
  href,
  accent,
  children,
}: {
  href: string;
  accent: string;
  children: React.ReactNode;
}) {
  const a = productAccent(accent);
  return (
    <a
      href={canonicalizeInternalHref(href)}
      className={`rounded-sm font-medium text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${a?.textHover ?? "hover:text-ink"} ${a?.focusRing ?? "focus-visible:ring-pine"}`}
    >
      {children}
    </a>
  );
}

const LatestPostWindow = ({ post }: { post: LatestPost }) => {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    let wasDismissed = false;

    try {
      wasDismissed =
        window.sessionStorage.getItem(LATEST_POST_DISMISSED_KEY) === "true";
    } catch {
      // Storage can be unavailable in restricted browser contexts. The close
      // control should still work for the current render in that case.
    }

    setIsVisible(!wasDismissed);
  }, []);

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(LATEST_POST_DISMISSED_KEY, "true");
    } catch {
      // Keep dismissal functional even when session storage is unavailable.
    }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="absolute bottom-6 right-4 z-20 hidden w-96 rounded-xl border border-ink/15 bg-white/80 p-2.5 backdrop-blur-md transition-colors hover:border-ink/25 hover:bg-white md:right-12 md:bottom-8 xl:flex min-[1681px]:right-14"
      {...settledHeroReveal(160)}
    >
      <a
        href={canonicalizeInternalHref(post.href)}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {post.imageSrc ? (
          <img
            src={post.imageSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-[4.5rem] w-28 shrink-0 rounded-lg border border-ink/10 object-cover"
          />
        ) : null}
        <span className="min-w-0 py-0.5 pr-8">
          <span className="block text-xs font-medium text-ink-faint">
            Latest update
          </span>
          <span className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink">
            {post.title}
          </span>
        </span>
      </a>
      <button
        type="button"
        aria-label="Dismiss latest update"
        onClick={handleDismiss}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const RedesignedHero = ({
  latestPost,
  thinkingImages,
}: RedesignedHeroProps) => {
  return (
    <section
      className={`${SITE_UTILITY_HERO_CLASS} flex min-h-[100svh] flex-col justify-center`}
    >
      <div className={`relative ${SITE_STANDARD_RAIL_CLASS}`}>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-32 xl:gap-48 2xl:gap-64">
          <div className="max-w-2xl">
            <h1 {...settledHeroReveal(0)} className={`mb-5 ${HERO_H1_CLASS}`}>
              Infrastructure for the <br />
              agentic era.
            </h1>

            <p
              {...settledHeroReveal(40)}
              className="mb-8 max-w-xl text-[17px] leading-relaxed text-ink-soft"
            >
              <ProductVerb href="/actors" accent="actors">
                Orchestrate
              </ProductVerb>{" "}
              agents.{" "}
              <ProductVerb href="/agentos" accent="agentos">
                Operate
              </ProductVerb>{" "}
              their environment.{" "}
              <ProductVerb href="/workflows" accent="workflows">
                Automate
              </ProductVerb>{" "}
              their work.{" "}
              <ProductVerb href="/dynamic-apps" accent="dynamic-apps">
                Deploy
              </ProductVerb>{" "}
              what they build.
            </p>

            <div
              {...settledHeroReveal(80)}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <a href="/docs/" className={PRODUCT_HERO_PRIMARY_BUTTON_CLASS}>
                Start Building
              </a>
              <CopyInstallButton />
            </div>
          </div>

          <div
            {...settledHeroReveal(120)}
            className="relative hidden flex-shrink-0 lg:block"
          >
            <ThinkingImageCycler images={thinkingImages} />
          </div>
        </div>

        {/* Mobile: Image */}
        <div {...settledHeroReveal(120)} className="mb-10 mt-12 lg:hidden">
          <div className="flex justify-center">
            <ThinkingImageCycler images={thinkingImages} />
          </div>
        </div>
      </div>
      {latestPost ? <LatestPostWindow post={latestPost} /> : null}
    </section>
  );
};
