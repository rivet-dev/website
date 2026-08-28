'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-site-reveal], [data-site-reveal-group], [data-site-hero-reveal]';
const VISIBLE_ATTRIBUTE = 'data-site-reveal-visible';
const PENDING_ATTRIBUTE = 'data-site-reveal-pending';
const OBSERVER_READY_ATTRIBUTE = 'data-site-motion-observer-ready';

const findHydratingIsland = (element: HTMLElement) => {
	let ancestor = element.parentElement;

	while (ancestor) {
		if (ancestor.matches('astro-island[ssr]')) {
			let boundary = element.parentElement;
			let isSlottedContent = false;

			while (boundary && boundary !== ancestor) {
				if (boundary.tagName === 'ASTRO-SLOT') {
					isSlottedContent = true;
					break;
				}
				boundary = boundary.parentElement;
			}

			// Astro preserves slotted server HTML when the wrapping island hydrates,
			// so reveal attributes on that content cannot be discarded.
			if (!isSlottedContent) return ancestor as HTMLElement;
		}

		ancestor = ancestor.parentElement;
	}

	return null;
};

// Astro pages keep their content server-rendered. This observer gives those
// blocks the same one-time fade-rise used by marketing/motion.tsx without
// turning every section into a separate hydrated React island.
export function ScrollObserver() {
	useEffect(() => {
		let observer: IntersectionObserver | undefined;
		const pendingHydrationListeners = new Map<HTMLElement, EventListener>();
		const reveal = (element: HTMLElement) => {
			element.removeAttribute(PENDING_ATTRIBUTE);
			element.setAttribute(VISIBLE_ATTRIBUTE, '');
		};

		const clearPendingHydrationListeners = () => {
			pendingHydrationListeners.forEach((listener, island) => {
				island.removeEventListener('astro:hydrate', listener);
			});
			pendingHydrationListeners.clear();
		};

		const revealAll = (elements: HTMLElement[]) => {
			elements.forEach(reveal);
		};

		const observe = () => {
			observer?.disconnect();
			clearPendingHydrationListeners();

			const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
			const observableElements: HTMLElement[] = [];

			elements.forEach((element) => {
				// An island can replace its server-rendered children while it hydrates.
				// Wait for that boundary before mutating reveal state so the visible
				// attribute cannot be discarded by a nested island's hydration pass.
				const hydratingIsland = findHydratingIsland(element);
				if (hydratingIsland) {
					if (!pendingHydrationListeners.has(hydratingIsland)) {
						const handleHydration = () => {
							pendingHydrationListeners.delete(hydratingIsland);
							observe();
						};
						pendingHydrationListeners.set(hydratingIsland, handleHydration);
						hydratingIsland.addEventListener('astro:hydrate', handleHydration, { once: true });
					}
					return;
				}
				observableElements.push(element);

				const delay = Number(element.dataset.siteRevealDelay ?? 0);
				if (Number.isFinite(delay) && delay > 0) {
					element.style.setProperty('--site-reveal-delay', `${delay}ms`);
				}

				if (!element.hasAttribute('data-site-reveal-group')) return;

				const stagger = Number(element.dataset.siteRevealStagger ?? 70);
				Array.from(element.children).forEach((child, index) => {
					if (!(child instanceof HTMLElement) || !child.hasAttribute('data-site-reveal-child')) return;
					child.style.setProperty('--site-reveal-delay', `${Math.max(0, stagger) * index}ms`);
				});
			});

			// Content that is already on screen should be settled on first paint.
			// Only off-screen blocks enter the pending state that CSS animates out
			// when the observer reveals them later.
			observableElements.forEach((element) => {
				if (element.hasAttribute(VISIBLE_ATTRIBUTE)) {
					element.removeAttribute(PENDING_ATTRIBUTE);
					return;
				}

				const bounds = element.getBoundingClientRect();
				const isInViewport = bounds.bottom >= 0 && bounds.top <= window.innerHeight;
				if (isInViewport) reveal(element);
				else element.setAttribute(PENDING_ATTRIBUTE, '');
			});

			if (!('IntersectionObserver' in window)) {
				revealAll(observableElements);
				return;
			}

			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) return;
						reveal(entry.target as HTMLElement);
						observer?.unobserve(entry.target);
					});
				},
				{ rootMargin: '-10% 0px', threshold: 0.01 },
			);

			observableElements.forEach((element) => {
				if (!element.hasAttribute(VISIBLE_ATTRIBUTE)) observer?.observe(element);
			});
		};

		observe();
		document.documentElement.setAttribute(OBSERVER_READY_ATTRIBUTE, '');
		document.addEventListener('astro:page-load', observe);

		return () => {
			observer?.disconnect();
			clearPendingHydrationListeners();
			document.documentElement.removeAttribute(OBSERVER_READY_ATTRIBUTE);
			document.removeEventListener('astro:page-load', observe);
		};
	}, []);

	return null;
}
