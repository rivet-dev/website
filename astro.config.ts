import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import sentry from "@sentry/astro";

// The docs MDX pipeline (react + mdx + remark/rehype/Shiki) and route
// generation, inlined from the former @rivet-dev/docs-theme package.
import { docsPipeline } from './src/integrations/docs-pipeline';
import { redirects } from './redirects.mjs';
import { getRouteSeoPolicy } from './src/lib/routeSeoPolicy';

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
	server: {
		allowedHosts: [
			'30025-ikymhvv49x5x9ih5uanjw.e2b.app',
			'.onamp.dev',
		],
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
			// The same policy emits page-level robots directives and decides sitemap
			// membership, so a hidden route cannot accidentally be submitted.
			filter: (page) => getRouteSeoPolicy(page).sitemap,
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
		// The island deps below fail the same way: they enter through deep island
		// graphs (Header, DocsNavigation, Footer), so on a cold server they get
		// discovered mid-hydration, the re-optimize invalidates the in-flight
		// import chain, and every large island on the page silently fails to
		// hydrate — docs sidebar dropdowns dead until a lucky reload.
		optimizeDeps: {
			include: [
				'mermaid',
				'framer-motion',
				'@rivet-gg/icons',
				'clsx',
				'sonner',
				'@radix-ui/react-slot',
				'@radix-ui/react-visually-hidden',
				'react-hook-form',
				'@hookform/resolvers/zod',
			],
		},
		ssr: {
			noExternal: ['@rivet-gg/components', '@rivet-gg/icons'],
		},
		server: {
			fs: {
				// Allow serving files from the monorepo root for artifacts
				allow: ['..'],
			},
			// Pre-transform the heavy always-on-page island entries so a cold dev
			// server has their graphs ready before the first hydration attempt.
			warmup: {
				clientFiles: [
					'./src/components/v2/Header.tsx',
					'./src/components/DocsNavigation.tsx',
					'./src/components/Footer.jsx',
					'./src/components/Providers.jsx',
				],
			},
		},
	},
});
