"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import { EYEBROW_CLASS, SECTION_H2_CLASS } from "../typography";
import styles from "./LatestPostCallout.module.css";

export interface LatestPost {
  title: string;
  description: string;
  href: string;
  image: { src: string; width: number; height: number; alt: string } | null;
}

export function LatestPostCallout({ post }: { post: LatestPost }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const storyRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const expandedHeight = useMotionValue(320);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end end"],
  });
  const progress = useTransform(() => {
    const fullHeight = expandedHeight.get();
    // The story includes the track's 80px spacing and 64px bottom padding.
    const travel = scrollYProgress.get() * (fullHeight + 144) - 80;
    // Start after a short scroll and finish exactly where sticky releases.
    const t = Math.max(0, Math.min(1, (travel - 48) / (fullHeight - 16)));
    const eased = t * t * (3 - 2 * t);
    // Grow into at most 64px of the hero's bottom padding, clear of its content.
    const clearance = Math.max(0, (travel - 16) / (fullHeight - 48));
    return Math.min(eased, clearance, 1);
  });
  const height = useTransform(
    () => 48 + (expandedHeight.get() - 48) * progress.get(),
  );
  const maxWidth = useTransform(progress, [0, 1], [672, 1152]);
  const pillOpacity = useTransform(progress, [0, 0.18], [1, 0]);
  const contentOpacity = useTransform(progress, [0.22, 0.72], [0, 1]);
  const contentY = useTransform(progress, [0.22, 1], [12, 0]);
  const imageOpacity = useTransform(progress, [0.38, 0.86], [0, 1]);
  const imageScale = useTransform(progress, [0.22, 1], [1.025, 1]);

  useEffect(() => {
    const content = contentRef.current;
    const track = trackRef.current;
    if (!content || !track) return;
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const measure = () => {
      const measuredHeight = content.offsetHeight + 2;
      const viewportHeight = document.documentElement.clientHeight;
      expandedHeight.set(measuredHeight);
      track.style.setProperty("--post-height", `${measuredHeight}px`);
      track.style.setProperty("--post-viewport-height", `${viewportHeight}px`);
      setReducedMotion(motionPreference.matches);
      // Short screens, reduced motion and no-JS get a normal in-flow card.
      setEnhanced(
        !motionPreference.matches && viewportHeight > measuredHeight + 160,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    window.addEventListener("resize", measure);
    motionPreference.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      motionPreference.removeEventListener("change", measure);
    };
  }, [expandedHeight]);

  return (
    <section
      ref={storyRef}
      aria-label="Latest update"
      className={styles.story}
      data-latest-post-story
      data-enhanced={enhanced || undefined}
    >
      <div ref={trackRef} className={styles.track}>
        <div className={styles.sticky}>
          <motion.a
            href={canonicalizeInternalHref(post.href)}
            aria-label={`Latest update: ${post.title}`}
            className={`${styles.card} border border-ink/10 bg-paper/90 backdrop-blur-[18px] backdrop-saturate-[1.4] transition-colors duration-300 hover:border-ink/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper supports-[backdrop-filter]:bg-white/40 supports-[backdrop-filter]:hover:bg-white/55 motion-reduce:transition-none`}
            style={
              enhanced
                ? { height, maxWidth }
                : { height: "auto", maxWidth: 1152 }
            }
            initial={false}
            animate="idle"
            whileHover={reducedMotion ? undefined : "active"}
            whileFocus={reducedMotion ? undefined : "active"}
          >
            <motion.div
              aria-hidden="true"
              className={`${styles.pill} gap-3 px-4`}
              style={{ opacity: enhanced ? pillOpacity : 0 }}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                <span className="hidden text-ink-soft sm:inline">
                  Latest update:{" "}
                </span>
                {post.title}
              </span>
              <CalloutArrow />
            </motion.div>

            <div ref={contentRef} className={styles.content}>
              <motion.div
                className={`grid items-center gap-6 p-6 md:min-h-[320px] md:gap-10 md:p-8 ${post.image ? "md:grid-cols-2" : ""}`}
                style={
                  enhanced
                    ? { opacity: contentOpacity, y: contentY }
                    : { opacity: 1, y: 0 }
                }
              >
                <div>
                  <p className={`${EYEBROW_CLASS} mb-3`}>Latest update</p>
                  <h2 className={SECTION_H2_CLASS}>{post.title}</h2>
                  {post.description ? (
                    <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                      {post.description}
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-pine">
                    Read update <CalloutArrow />
                  </span>
                </div>
                {post.image ? (
                  <motion.div
                    className="overflow-hidden rounded-xl border border-ink/10"
                    style={{ opacity: enhanced ? imageOpacity : 1 }}
                  >
                    <motion.img
                      src={post.image.src}
                      width={post.image.width}
                      height={post.image.height}
                      alt={post.image.alt}
                      loading="eager"
                      decoding="async"
                      className="block h-auto w-full"
                      style={{ scale: enhanced ? imageScale : 1 }}
                    />
                  </motion.div>
                ) : null}
              </motion.div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function CalloutArrow() {
  return (
    <motion.span
      aria-hidden="true"
      variants={{ idle: { x: 0 }, active: { x: 3 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex shrink-0 text-pine"
    >
      <ArrowRight className="h-4 w-4" />
    </motion.span>
  );
}
