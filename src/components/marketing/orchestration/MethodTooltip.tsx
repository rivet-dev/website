"use client";

import { useId, type ReactNode } from "react";

/**
 * The small ⓘ beside a benchmark figure that says how the number was measured.
 * Detail stays out of the stat until it is wanted, so the figure reads as a
 * figure and the method is one hover (or focus) away.
 *
 * The gap between the dot and the bubble is padding on the positioned wrapper,
 * not a margin, so the pointer never leaves the hover target while crossing it.
 * Colors come from the themed `white`/`ink` tokens, so the bubble follows dark
 * mode without its own palette.
 */
export function MethodTooltip({
	children,
	align = "left",
}: {
	children: ReactNode;
	/** Right-align near the right edge, so the bubble stays on screen. */
	align?: "left" | "right";
}) {
	const id = useId();
	return (
		<span className="group/tip relative inline-flex">
			<button
				type="button"
				aria-label="How this was measured"
				aria-describedby={id}
				className="inline-flex h-5 w-5 items-center justify-center rounded-full text-ink/35 transition-colors hover:text-ink-faint focus-visible:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/40"
			>
				<svg
					className="h-3 w-3"
					viewBox="0 0 16 16"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zm-1-6a1 1 0 110-2 1 1 0 010 2z" />
				</svg>
			</button>
			<span
				id={id}
				role="tooltip"
				className={`pointer-events-none absolute bottom-full z-30 w-60 pb-2 opacity-0 transition-opacity duration-150 group-hover/tip:pointer-events-auto group-hover/tip:opacity-100 group-focus-within/tip:pointer-events-auto group-focus-within/tip:opacity-100 motion-reduce:transition-none ${
					align === "left" ? "left-0" : "right-0"
				}`}
			>
				<span className="block rounded-md border border-ink/15 bg-white p-3 text-left text-xs font-normal leading-relaxed tracking-normal text-ink-soft shadow-lg">
					{children}
				</span>
			</span>
		</span>
	);
}
