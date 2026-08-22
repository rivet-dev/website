'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-site-reveal], [data-site-reveal-group], [data-site-hero-reveal]';
const VISIBLE_ATTRIBUTE = 'data-site-reveal-visible';
const OBSERVER_READY_ATTRIBUTE = 'data-site-motion-observer-ready';

// Astro pages keep their content server-rendered. This observer gives those
// blocks the same one-time fade-rise used by marketing/motion.tsx without
// turning every section into a separate hydrated React island.
export function ScrollObserver() {
	useEffect(() => {
		let observer: IntersectionObserver | undefined;

		const revealAll = () => {
			document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
				element.setAttribute(VISIBLE_ATTRIBUTE, '');
			});
		};

		const observe = () => {
			observer?.disconnect();

			const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

			elements.forEach((element) => {
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

			if (!('IntersectionObserver' in window)) {
				revealAll();
				return;
			}

			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) return;
						entry.target.setAttribute(VISIBLE_ATTRIBUTE, '');
						observer?.unobserve(entry.target);
					});
				},
				{ rootMargin: '-10% 0px', threshold: 0.01 },
			);

			elements.forEach((element) => {
				if (!element.hasAttribute(VISIBLE_ATTRIBUTE)) observer?.observe(element);
			});
		};

		observe();
		document.documentElement.setAttribute(OBSERVER_READY_ATTRIBUTE, '');
		document.addEventListener('astro:page-load', observe);

		return () => {
			observer?.disconnect();
			document.documentElement.removeAttribute(OBSERVER_READY_ATTRIBUTE);
			document.removeEventListener('astro:page-load', observe);
		};
	}, []);

	return null;
}
