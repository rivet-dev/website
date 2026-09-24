"use client";

import { ArrowRight } from "lucide-react";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import styles from "./LatestPostCallout.module.css";

export interface LatestPost {
  title: string;
  description: string;
  href: string;
  image: { src: string; width: number; height: number; alt: string } | null;
}

/**
 * The latest changelog post, as one line.
 *
 * It used to grow out of a sticky pill into a full card with the post image as
 * the hero scrolled past. Both the growth and the expanded card are gone: this
 * is a title and an arrow, and nothing else.
 */
export function LatestPostCallout({ post }: { post: LatestPost }) {
  return (
    <section
      aria-label="Latest update"
      className={styles.story}
      data-latest-post-story
    >
      <a
        href={canonicalizeInternalHref(post.href)}
        className={`${styles.card} group border border-ink/10 bg-white/55 px-4 py-2.5 transition-colors duration-200 hover:border-ink/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-reduce:transition-none`}
      >
        <span className="flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            <span className="hidden text-ink-soft sm:inline">
              Latest update:{" "}
            </span>
            {post.title}
          </span>
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-pine transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </a>
    </section>
  );
}
