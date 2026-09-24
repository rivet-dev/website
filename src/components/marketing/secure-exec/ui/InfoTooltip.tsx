"use client";

/**
 * The small ⓘ affordance used across the Secure Exec page: an icon that reveals
 * a bubble on hover. Shared by the benchmark charts, the capability tiles, and
 * the comparison table so detail can sit out of the way until it is wanted.
 *
 * The offset between icon and bubble is padding on the positioned wrapper, not
 * a margin, so the gap is part of the hover target. With a margin the pointer
 * leaves the group while crossing it and the bubble vanishes before it can be
 * reached — which also makes links inside a bubble unclickable.
 */
export function InfoTooltip({
  children,
  placement = "top",
  align = "left",
}: {
  children: React.ReactNode;
  /**
   * Bubbles inside a horizontally scrolling container must open downwards:
   * `overflow-x-auto` also clips vertically, so an upward bubble is cut off.
   */
  placement?: "top" | "bottom";
  /** Right-align near the right edge, so the bubble stays on screen. */
  align?: "left" | "right";
}) {
  return (
    <span className="relative group/tip inline-flex ml-1.5 align-middle">
      <svg
        className="w-3.5 h-3.5 text-zinc-600 group-hover/tip:text-zinc-400 cursor-help transition-colors"
        viewBox="0 0 16 16"
        fill="currentColor"
        role="img"
        aria-label="More information"
      >
        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zm-1-6a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
      <span
        className={`absolute ${placement === "top" ? "bottom-full pb-2" : "top-full pt-2"} ${
          align === "left" ? "left-0" : "right-0"
        } z-50 w-80 opacity-0 pointer-events-none transition-opacity duration-200 group-hover/tip:opacity-100 group-hover/tip:pointer-events-auto`}
      >
        <span className="block rounded-lg border border-zinc-700/50 bg-zinc-800/95 p-3 text-left text-[11px] leading-relaxed text-zinc-300 shadow-xl backdrop-blur-sm [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-zinc-200 [&_strong]:font-medium">
          {children}
        </span>
      </span>
    </span>
  );
}
