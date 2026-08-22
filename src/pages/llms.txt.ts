import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { getDocsPath } from '../metadata/shared';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
	const siteUrl = site?.toString().replace(/\/$/, '') || 'https://rivet.dev';

	// Get all content collections
	const [docs, posts] = await Promise.all([
		getCollection('docs'),
		getCollection('posts'),
	]);

	// Build docs URLs (exclude cloud docs)
	const docsUrls = docs
		.filter(doc => !doc.id.startsWith('cloud'))
		.map(doc => {
			const cleanPath = doc.id.replace(/\/index$/, '').replace(/^index$/, '');
			return `${siteUrl}${getDocsPath(cleanPath)}/`;
		})
		.sort();

	// Build blog URLs. A post is published at exactly one path: changelog
	// entries under /changelog/, everything else under /blog/. Listing a post
	// under both emits a URL that 404s. Mirrors the filters in
	// src/pages/blog/[...slug].astro and src/pages/changelog/[...slug].astro.
	const blogUrls = posts
		.filter(post => post.data.category !== 'changelog' && !post.data.unpublished)
		.map(post => {
			const slug = post.id.replace(/\/page$/, '');
			return `${siteUrl}/blog/${slug}/`;
		})
		.sort();

	// Build changelog URLs
	const changelogUrls = posts
		.filter(post => post.data.category === 'changelog' && !post.data.unpublished)
		.map(post => {
			const slug = post.id.replace(/\/page$/, '');
			return `${siteUrl}/changelog/${slug}/`;
		})
		.sort();

	// Static site pages. Every entry must be a page this build emits: a URL that
	// 301s or 404s is worse than a missing one, because the reader cannot tell.
	const staticUrls = [
		`${siteUrl}/`,
		`${siteUrl}/docs/`,
		`${siteUrl}/actors/`,
		`${siteUrl}/agentos/`,
		`${siteUrl}/dynamic-apps/`,
		`${siteUrl}/workflows/`,
		`${siteUrl}/cloud/`,
		`${siteUrl}/enterprise/`,
		`${siteUrl}/startups/`,
		`${siteUrl}/changelog/`,
		`${siteUrl}/blog/`,
		`${siteUrl}/support/`,
		`${siteUrl}/talk-to-an-engineer/`,
		`${siteUrl}/oss-friends/`,
		`${siteUrl}/terms/`,
		`${siteUrl}/privacy/`,
		`${siteUrl}/acceptable-use/`,
		`${siteUrl}/rss/feed.xml`,
		`${siteUrl}/changelog.json`,
	].sort();

	// Combine all URLs
	const allUrls = [...new Set([
		...staticUrls,
		...docsUrls,
		...blogUrls,
		...changelogUrls,
	])].sort();

	const content = [
		'# Rivet Documentation Index',
		'',
		...allUrls
	].join('\n');

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
