"use client";

import { productAccent } from "@/lib/product-accent";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import { useEffect, useState } from "react";
import { Terminal, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  HERO_H1_CLASS,
  PRODUCT_HERO_PRIMARY_BUTTON_CLASS,
} from "../typography";
import { GLOW_PILL_SURFACE_CLASS, handleGlowPillMouseMove } from "../glowPill";
import {
  SITE_STANDARD_RAIL_CLASS,
  SITE_UTILITY_HERO_CLASS,
} from "../layout";

interface ThinkingImage {
  src: string;
  title: string;
  artist: string;
  date: string;
}

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
  latestChangelogTitle: string;
  latestChangelogHref: string;
  thinkingImages: ThinkingImage[];
}

/**
 * A verb in the tagline that links to the product it names. The product accent
 * shows as an underline rather than colored text: four colored words in one
 * line reads as decoration, an underline reads as a link.
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
      className={`rounded-sm font-medium text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${a?.underline ?? ""} ${a?.focusRing ?? "focus-visible:ring-pine"}`}
    >
      {children}
    </a>
  );
}

export const RedesignedHero = ({
  latestChangelogTitle,
  latestChangelogHref,
  thinkingImages,
}: RedesignedHeroProps) => {
  return (
    <section className={`${SITE_UTILITY_HERO_CLASS} flex min-h-[100svh] flex-col justify-center`}>
      <div className={`relative ${SITE_STANDARD_RAIL_CLASS}`}>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-32 xl:gap-48 2xl:gap-64">
          <div className="max-w-2xl">
            <div data-site-hero-reveal data-site-reveal-delay="0" className="mb-7">
              <a
                href={canonicalizeInternalHref(latestChangelogHref)}
                className={`${GLOW_PILL_SURFACE_CLASS} group gap-2`}
                onMouseMove={handleGlowPillMouseMove}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 bg-accent"
                  style={{
                    boxShadow:
                      "0 0 2px rgba(203, 90, 51, 0.9), 0 0 6px rgba(203, 90, 51, 0.5), 0 0 14px rgba(171, 69, 31, 0.35)",
                  }}
                />
                <span>{latestChangelogTitle}</span>
                <ArrowRight className="h-3 w-3 text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <h1
              data-site-hero-reveal
              data-site-reveal-delay="40"
              className={`mb-5 ${HERO_H1_CLASS}`}
            >
              Infrastructure for the <br />
              agentic era.
            </h1>

            <p
              data-site-hero-reveal
              data-site-reveal-delay="80"
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
              data-site-hero-reveal
              data-site-reveal-delay="120"
              className="flex flex-col gap-3 sm:flex-row"
            >
              <a href="/docs/" className={PRODUCT_HERO_PRIMARY_BUTTON_CLASS}>
                Start Building
              </a>
              <CopyInstallButton />
            </div>
          </div>

          <div
            data-site-hero-reveal
            data-site-reveal-delay="160"
            className="relative hidden flex-shrink-0 lg:block"
          >
            <ThinkingImageCycler images={thinkingImages} />
          </div>
        </div>

        {/* Mobile: Image */}
        <div
          data-site-hero-reveal
          data-site-reveal-delay="160"
          className="mb-10 mt-12 lg:hidden"
        >
          <div className="flex justify-center">
            <ThinkingImageCycler images={thinkingImages} />
          </div>
        </div>
      </div>
    </section>
  );
};
