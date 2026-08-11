import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import sentry from "@sentry/astro";

// The docs MDX pipeline (react + mdx + remark/rehype/Shiki) and route
// generation, inlined from the former @rivet-dev/docs-theme package.
import { docsPipeline } from './src/integrations/docs-pipeline';
import { redirects } from './redirects.mjs';

// Wildcard sub-path redirects (`wildcardRedirects` in redirects.mjs) are applied
// only at the Caddy layer in production. Astro's static output treats a redirect
// key containing a rest param (`[...slug]`) as a dynamic route that needs
// `getStaticPaths`, so feeding external-URL wildcards here aborts the build. The
// explicit non-wildcard entries below still cover every real former route on the
// dev server; deep sub-paths fall through to Caddy in production.
export default defineConfig({
	site: 'https://rivet.dev',
	output: 'static',
	trailingSlash: 'ignore',
	image: {
		// Allow build-time optimization of artwork hosted on the assets CDN.
		domains: ['assets.rivet.dev'],
	},
	// SEO Redirects - Astro generates HTML redirect files for static builds and
	// serves them on the dev server. The same map drives real HTTP 301s at the
	// Caddy layer in production (see scripts/generate-caddy-redirects.mjs), so it
	// lives in a shared module to keep the two from drifting.
	redirects: redirects,
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},
	build: {
		assets: '_astro',
		format: 'directory',
	},
	// markdown (.md) remark/rehype + syntaxHighlight:false are configured by
	// docsPipeline()'s markdown integration; .mdx is handled by its mdx().
	integrations: [
		...docsPipeline(),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap({
			// Cookbooks and comparison guides are intentionally hidden from the site
			// and kept out of SEO, so exclude them from the sitemap.
			//
			// Self-host guides are generated for every product from one source and
			// all canonicalize to the Actors variant, so only that variant belongs
			// in the sitemap. Submitting the copies asks Google to index pages the
			// canonical tag then excludes.
			filter: (page) =>
				!page.includes('/api/') &&
				!page.includes('/internal/') &&
				!page.includes('/cookbook') &&
				!page.includes('/compare') &&
				!/\/(?!actors\/)[^/]+\/self-host\//.test(page),
		}),
		sentry({
      		project: "website",
      		org: "rivet-gaming",
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
	],
	vite: {
		resolve: {
			// Product docs are symlinked in from their own repos, so Vite resolves
			// bare specifiers relative to the *source* repo, which has no copy of
			// these. Aliasing to the local packages lets product MDX import shared
			// components and icons regardless of where the bundle is checked out.
			alias: {
				'@rivet-gg/icons': fileURLToPath(new URL('./packages/icons/dist/index.js', import.meta.url)),
			},
		},
		// Mermaid is large and only dynamically imported by MermaidScript, so Vite
		// discovers it late and re-optimizes mid-session, which invalidates the
		// in-flight chunk and serves a 504 "Outdated Optimize Dep" for every
		// diagram. Pre-bundling it at server start keeps its chunk hash stable.
		optimizeDeps: {
			include: ['mermaid'],
		},
		ssr: {
			noExternal: ['@rivet-gg/components', '@rivet-gg/icons'],
		},
		server: {
			fs: {
				// Allow serving files from the monorepo root for artifacts
				allow: ['..'],
			},
		},
	},
});
