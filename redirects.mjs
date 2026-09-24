// Single source of truth for SEO redirects.
//
// Imported by `astro.config.mjs` (so the dev server and the static HTML
// fallback pages stay in sync) and by `scripts/generate-caddy-redirects.mjs`
// (which emits real HTTP 301s at the Caddy layer for production).
//
// Keys and values are path-only (no origin) for internal redirects. Internal
// targets should end in `/` to match the site's canonical trailing-slash form
// and avoid a second redirect hop.
//
// Absolute targets are supported but restricted to explicitly allowed hosts,
// so a bad entry can never point traffic at an arbitrary domain. See
// `EXTERNAL_REDIRECT_HOSTS` below and the matching check in
// `scripts/generate-caddy-redirects.mjs`.
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const explicitRedirects = {
	// Public community short link. Keep this slashless in authored links, while
	// Caddy serves both variants so copied URLs cannot fall through to a 404.
	'/discord': 'https://discord.gg/rivet-developer-network-822914074136018994',
	// Integrations moved out of the documentation URL hierarchy.
	'/docs/integrations/vercel-workflow': '/integrations/workflow-sdk/',
	'/integrations/vercel-workflow': '/integrations/workflow-sdk/',
	// The docs overview briefly lived under `/orchestrate/`; it is back at `/docs/`.
	'/orchestrate/docs': '/docs/',
	'/orchestrate': '/docs/',
	// The self-host overview became the Deploy section root.
	'/docs/deploy/self-host': '/docs/deploy/',
	// Product marketing pages folded into each product's docs overview.
	'/actors': '/actors/docs/',
	'/workflows': '/workflows/docs/',
	'/dynamic-apps': '/dynamic-apps/docs/',
	// The Tutorials tab became Learn.
	'/actors/tutorials': '/guides/',
	'/agentos/tutorials': '/agentos/docs/',
	'/dynamic-apps/tutorials': '/dynamic-apps/docs/',
	'/workflows/tutorials': '/workflows/docs/',
	// Cookbook became the Actors Learn tab.
	'/cookbook': '/guides/',
	'/cookbook/ai-agent': '/guides/ai-agent/',
	'/cookbook/chat-room': '/guides/chat-room/',
	'/cookbook/collaborative-text-editor': '/guides/collaborative-text-editor/',
	'/cookbook/cron-jobs': '/guides/cron-jobs/',
	'/cookbook/live-cursors': '/guides/live-cursors/',
	'/cookbook/multiplayer-game': '/guides/multiplayer-game/',
	'/cookbook/per-tenant-database': '/guides/per-tenant-database/',
	// Documentation restructure
	'/docs/setup': '/actors/docs/',
	// Dead links inside dated changelog posts. Neither target ever existed, so
	// these point at the nearest real page rather than being rewritten in the
	// posts, which are historical records.
	'/docs/actors/ai-and-user-generated-actors': '/agentos/docs/',
	'/integrations/better-auth': '/integrations/',
	'/docs/deploy/cli': '/actors/docs/cli/',
	'/docs/actors/queue': '/actors/docs/queues/',
	'/docs/actors/websockets': '/actors/docs/websocket-handler/',
	'/docs/actors/http': '/actors/docs/http-api/',
	'/docs/actors/run': '/actors/docs/lifecycle/',
	'/docs/actors/scheduling': '/actors/docs/schedule/',
	'/docs/actors/external-sql': '/actors/docs/state/',
	'/docs/actors/raw-sql': '/actors/docs/sqlite/',
	// Empty moved-page stubs were retired. Preserve both their current product
	// URLs and legacy flat-docs spellings as one-hop redirects.
	'/actors/docs/helper-types': '/actors/docs/types/',
	'/docs/actors/helper-types': '/actors/docs/types/',
	'/actors/docs/scaling': '/actors/docs/design-patterns/',
	'/docs/actors/scaling': '/actors/docs/design-patterns/',
	'/actors/docs/sharing-and-joining-state': '/actors/docs/design-patterns/',
	'/docs/actors/sharing-and-joining-state': '/actors/docs/design-patterns/',
	'/docs/actors/ephemeral-variables': '/actors/docs/state/',
	'/docs/actors/persistence': '/actors/docs/state/',
	'/docs/actors/postgres': '/actors/docs/state/',
	// Platform docs moved to clients/connect
	'/docs/platforms/react': '/actors/docs/clients/react/',
	'/docs/platforms/next-js': '/actors/docs/clients/javascript/',
	// Registry configuration moved
	'/docs/connect/registry-configuration': '/actors/docs/general/registry-configuration/',
	// Quickstart index merged into the Actors introduction
	'/docs/actors/quickstart': '/actors/docs/',
	// Connect tab renamed to Deploy
	'/docs/connect': '/docs/deploy/self-host/workers/',
	'/docs/connect/aws-ecs': '/docs/deploy/self-host/workers/',
	'/docs/connect/aws-lambda': '/docs/deploy/self-host/workers/',
	'/docs/connect/cloudflare': '/docs/deploy/self-host/workers/',
	'/docs/connect/custom': '/docs/deploy/self-host/workers/',
	'/docs/connect/freestyle': '/docs/deploy/self-host/workers/',
	'/docs/connect/gcp-cloud-run': '/docs/deploy/self-host/workers/',
	'/docs/connect/hetzner': '/docs/deploy/self-host/workers/',
	'/docs/connect/kubernetes': '/docs/deploy/self-host/workers/',
	'/docs/connect/railway': '/docs/deploy/self-host/workers/',
	'/docs/connect/rivet-compute': '/docs/deploy/self-host/workers/',
	'/docs/connect/supabase': '/docs/deploy/self-host/workers/',
	'/docs/connect/vercel': '/docs/deploy/self-host/workers/',
	'/docs/connect/vm-and-bare-metal': '/docs/deploy/self-host/workers/',
	// Cloud docs removed - redirect to relevant sections
	'/docs/cloud': '/docs/deploy/',
	'/docs/cloud/api/actors/create': '/actors/docs/',
	'/docs/cloud/api/routes/update': '/actors/docs/',
	'/docs/cloud/self-hosting/single-container': '/docs/deploy/self-host/control-plane/',
	// Next.js client redirect (linked from homepage)
	'/docs/clients/next-js': '/actors/docs/clients/javascript/',
	// Self-hosting redirect
	'/docs/general/self-hosting': '/docs/deploy/self-host/control-plane/',
	// Removed solution pages. `/actors/` itself now redirects to the docs, so
	// land there directly rather than chaining.
	'/agent': '/actors/docs/',
	'/solutions/agents': '/',
	'/solutions/app-generators': '/',
	'/solutions/collaborative-state': '/',
	'/solutions/game-servers': '/',
	'/solutions/games': '/',
	'/solutions/geo-distributed-db': '/',
	'/solutions/per-tenant-db': '/',
	'/solutions/user-session-store': '/',
	'/solutions/workflows': '/',
	// Changelog list view merged into the blog index
	'/changelog': '/blog/',
	// agentOS briefly lived at https://agentos-sdk.dev and is now a product
	// vertical on this site, so these land on `/agentos/*` rather than off-site.
	'/agent-os': '/agentos/',
	'/agent-os/pricing': '/pricing/',
	'/agent-os/use-cases': '/agentos/use-cases/',
	'/agent-os/registry': '/agentos/registry/',
	// The integrations pages live at the site root now. These are not covered
	// by legacyDocsRedirects because they moved tab, not just prefix.
	'/docs/integrations': '/integrations/',
	'/docs/integrations/flue': '/integrations/flue/',
	'/docs/integrations/vercel-eve': '/integrations/vercel-eve/',
	'/docs/integrations/vercel-workflows': '/integrations/workflow-sdk/',
	// The Vercel Workflows page is named after the SDK it integrates with.
	'/actors/integrations/vercel-workflows': '/integrations/workflow-sdk/',
	'/integrations/vercel-workflows': '/integrations/workflow-sdk/',
	// `/contact` was never a page here; `/sales` itself now redirects, so land
	// directly on the live destination to avoid a 301 chain.
	'/contact': '/talk-to-an-engineer/',

	// The Rivet Cloud marketing page became the pricing page. Its docs moved
	// into the Deploy section; those redirects are derived from the bundle's
	// content tree in `cloudDocsRedirects()` below.
	'/cloud': '/pricing/',
	// Retired pages. These were live URLs, so they redirect rather than 404.
	'/meme/wired-in': '/',
	// The Open-Source Friends page was retired. It had no equivalent and was
	// part of a reciprocal-linking network, so preserve inbound links to home.
	'/oss-friends': '/',
	// Deployment folded into the shared Self-Host section.
	'/agentos/docs/deployment': '/docs/deploy/',
	// Bindings were renamed to host functions.
	'/agentos/docs/bindings': '/agentos/docs/host-functions/',
	// Air-gapped deployment is a self-hosting topic, not an actors cookbook.
	'/guides/vpc-air-gapped': '/docs/deploy/self-host/control-plane/vm/',
	'/cookbook/vpc-air-gapped': '/docs/deploy/self-host/control-plane/vm/',
	// Rivet Compute is a Cloud feature, not a self-hosting target.
	'/docs/deploy/rivet-compute': '/docs/deploy/cloud/compute/',
	'/docs/deploy/freestyle': '/docs/deploy/self-host/workers/freestyle/',
	'/docs/deploy/hetzner': '/docs/deploy/self-host/workers/vm/',
	'/docs/self-hosting/render': '/docs/deploy/self-host/control-plane/render/',
	// Comparison slugs name the product, not the company.
	'/compare/rivet-vs-cloudflare-durable-objects':
		'/actors/compare/rivet-actors-vs-cloudflare-durable-objects/',
	'/compare/rivet-vs-temporal': '/workflows/compare/rivet-workflows-vs-temporal/',
	'/actors/compare/rivet-vs-cloudflare-durable-objects':
		'/actors/compare/rivet-actors-vs-cloudflare-durable-objects/',
	'/workflows/compare/rivet-vs-temporal':
		'/workflows/compare/rivet-workflows-vs-temporal/',
	// The generated TypeDoc site and the hand-maintained config schema were
	// retired; the Actors reference docs are the closest live destination.
	'/typedoc': '/actors/docs/',
	'/rivet.schema.json': '/actors/docs/',
	// The standalone "Actors course" is now a guide in the Actors Learn tab.
	'/learn': '/guides/',
	'/learn/act-1/scene-1-a-radically-simpler-architecture':
		'/guides/a-radically-simpler-architecture/',
	'/docs/tools/actors': '/actors/docs/',
	// The "append .md to any docs URL" feature was documented but never built.
	// Its docs page and the hand-written markdown exports are both gone.
	'/docs/general/docs-for-llms': '/actors/docs/general/skill/',
	'/actors/docs/general/docs-for-llms': '/actors/docs/general/skill/',
	'/install': '/agentos/docs/quickstart/',
	// The "From Unix to Agents" essay has no page on this site; the product
	// overview is the closest surviving destination.
	'/from-unix-to-agents': '/agentos/',
	'/docs/agent-os': '/agentos/docs/',
	// The agentOS workspace cookbook was never rewritten; land on its docs.
	'/cookbook/ai-agent-workspace': '/agentos/docs/',
	// Workflows became its own product vertical. The legacy `/docs/actors/...`
	// entry is spelled out here because `legacyDocsRedirects()` derives from the
	// Actors content tree, which no longer has the page.
	'/actors/docs/workflows': '/workflows/docs/',
	'/docs/actors/workflows': '/workflows/docs/',
	// Dynamic Apps became its own product vertical. The page was a single
	// agentOS doc and is now a whole docs section, so every legacy spelling of
	// the old URL lands on the section overview.
	'/agentos/docs/apps': '/dynamic-apps/docs/',
	'/docs/agent-os/apps': '/dynamic-apps/docs/',
	'/agent-os/docs/apps': '/dynamic-apps/docs/',
	// The standalone sales page folds into the talk-to-an-engineer flow.
	'/sales': '/talk-to-an-engineer/',
};

// Every docs page moved out of the flat `/docs/...` hierarchy when the site
// split into per-product verticals (`/actors/docs/...`). The legacy map is
// derived from the content tree rather than hand-maintained, so it cannot drift
// as pages are added or renamed. Explicit entries above win on collision.
// This module lives at the repository root, but it is also bundled into the
// site build (`RerootLinks.astro` reads the map), where `import.meta.url` is a
// chunk under `dist/`. Walk up from wherever we are to the checkout that holds
// `src/content` so both callers resolve the same directory.
const CONTENT_ROOT = (() => {
	let dir = path.dirname(fileURLToPath(import.meta.url));
	for (;;) {
		const candidate = path.join(dir, 'src/content');
		if (existsSync(candidate)) return candidate;
		const parent = path.dirname(dir);
		if (parent === dir) throw new Error('redirects.mjs: cannot locate src/content');
		dir = parent;
	}
})();

function mdxSlugs(dir) {
	const slugs = [];
	const walk = (current, prefix) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const next = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) {
				walk(path.join(current, entry.name), next);
			} else if (entry.name.endsWith('.mdx')) {
				const slug = next.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '');
				slugs.push(slug.replace(/\/$/, ''));
			}
		}
	};
	walk(dir, '');
	return slugs;
}

function legacyDocsRedirects() {
	const map = {};

	// Actors documentation: `/docs/actors/state` -> `/actors/docs/state`, and the
	// former docs-root sections (`clients`, `general`, `cli`) moved underneath it.
	for (const slug of mdxSlugs(path.join(CONTENT_ROOT, 'docs/actors/docs'))) {
		const target = slug ? `/actors/docs/${slug}/` : '/actors/docs/';
		const movedFromDocsRoot =
			slug === 'cli' || slug.startsWith('clients/') || slug.startsWith('general/');
		const legacy = movedFromDocsRoot
			? `/docs/${slug}`
			: slug
				? `/docs/actors/${slug}`
				: '/docs/actors';
		map[legacy] = target;
	}

	// The old Deploy and Self-Hosting sections merged into the Deploy
	// section: app deployment became `workers`, running Rivet yourself became
	// `control-plane`. Pages land on the matching group overview until each
	// guide is rewritten. `/docs/deploy` itself is a real page again (the
	// Deploy overview), so only the Self-Hosting root gets a redirect.
	const SECTION_TARGETS = {
		deploy: '/docs/deploy/self-host/workers/',
		'self-hosting': '/docs/deploy/self-host/control-plane/',
	};
	for (const [section, target] of Object.entries(SECTION_TARGETS)) {
		if (section !== 'deploy') map[`/docs/${section}`] = target;
		for (const slug of mdxSlugs(path.join(CONTENT_ROOT, `_pending-rewrite/${section}`))) {
			if (!slug) continue;
			map[`/docs/${section}/${slug}`] = target;
		}
	}

	return map;
}

// The Rivet Cloud bundle (`cloud/docs/content`) used to be served at
// `/cloud/docs/...` and `/cloud/byoc/...`, then briefly at
// `/orchestrate/deploy/...`; it now renders inside the Deploy section at
// `/docs/deploy/...`. Mirrors `deployRouteSlugForContentId` in
// `src/sitemap/deploy.ts`, which this plain `.mjs` module cannot import.
function cloudDocsRedirects() {
	const map = {};
	const SECTIONS = { docs: 'cloud', byoc: 'byoc' };
	for (const [section, segment] of Object.entries(SECTIONS)) {
		for (const slug of mdxSlugs(path.join(CONTENT_ROOT, `docs/cloud/${section}`))) {
			const target = slug ? `/docs/deploy/${segment}/${slug}/` : `/docs/deploy/${segment}/`;
			map[slug ? `/cloud/${section}/${slug}` : `/cloud/${section}`] = target;
			map[slug ? `/orchestrate/deploy/${segment}/${slug}` : `/orchestrate/deploy/${segment}`] = target;
		}
	}
	return map;
}

// The Self-Host guides were served once per product (`/actors/self-host/...`,
// `/workflows/self-host/...`, ...) before collapsing into the single copy at
// `/docs/deploy/self-host/...`.
function selfHostRedirects() {
	const map = {};
	const PRODUCTS = ['actors', 'workflows', 'dynamic-apps', 'agentos'];
	for (const slug of mdxSlugs(path.join(CONTENT_ROOT, 'self-host'))) {
		const target = slug ? `/docs/deploy/self-host/${slug}/` : '/docs/deploy/';
		for (const product of PRODUCTS) {
			map[slug ? `/${product}/self-host/${slug}` : `/${product}/self-host`] = target;
		}
	}
	return map;
}

// The Actors bundle's `learn` section rendered at `/actors/learn/...` before
// it became the site-wide Guides tab at `/guides/...`. Website-owned guides in
// `src/content/guides` never had another URL, but are included so the map
// lists every guide.
function guidesRedirects() {
	const map = {};
	for (const slug of mdxSlugs(path.join(CONTENT_ROOT, 'docs/actors/learn'))) {
		map[slug ? `/actors/learn/${slug}` : '/actors/learn'] = slug ? `/guides/${slug}/` : '/guides/';
	}
	return map;
}

// The Actors bundle's `integrations` section rendered at
// `/actors/integrations/...` before it became the site-wide Integrations tab
// at `/integrations/...`. Every page keeps its slug.
function integrationsRedirects() {
	const map = {};
	for (const slug of mdxSlugs(path.join(CONTENT_ROOT, 'docs/integrations/docs'))) {
		map[slug ? `/actors/integrations/${slug}` : '/actors/integrations'] = slug
			? `/integrations/${slug}/`
			: '/integrations/';
	}
	return map;
}

// The Actors bundle was split into three: Actors, the product-agnostic docs at
// `/docs/`, and Integrations. Two things moved at once, so both are mapped here.
//
//   - Twelve pages about running workloads rather than writing actors left the
//     Actors vertical for `/docs/`.
//   - The bundle's `general/` subdirectory was flattened away, so every page
//     that stayed lost that path segment.
//
// The old `/docs/general/<page>` spellings are covered too: those URLs predate
// the per-product split and `legacyDocsRedirects` used to map them into
// `/actors/docs/general/`, which no longer exists.
function bundleSplitRedirects() {
	// Old slug under `/actors/docs/` -> new path.
	const MOVED = {
		cli: '/docs/cli/',
		'container-runner': '/docs/container-runner/',
		statuses: '/docs/statuses/',
		versions: '/docs/versions/',
		'general/edge': '/docs/regions/',
		'general/endpoints': '/docs/endpoints/',
		'general/environment-variables': '/docs/environment-variables/',
		'general/pool-configuration': '/docs/pool-configuration/',
		'general/runtime-modes': '/docs/runtime-modes/',
		'general/skill': '/docs/skill/',
		'general/tracing': '/docs/tracing/',
	};
	// Pages that stayed in the Actors bundle but lost the `general/` segment.
	const FLATTENED = [
		'actor-configuration',
		'cors',
		'http-server',
		'logging',
		'production-checklist',
		'registry-configuration',
		'wasm-vs-native-sdk',
	];

	const map = {};
	for (const [slug, target] of Object.entries(MOVED)) {
		map[`/actors/docs/${slug}`] = target;
		// Only the `general/`-prefixed legacy spellings get a `/docs/` entry. A
		// flat one such as `/docs/cli` is now the destination itself, and mapping
		// it would be a self-redirect.
		if (slug.includes('/')) map[`/docs/${slug}`] = target;
	}
	for (const slug of FLATTENED) {
		map[`/actors/docs/general/${slug}`] = `/actors/docs/${slug}/`;
		map[`/docs/general/${slug}`] = `/actors/docs/${slug}/`;
	}
	// `debugging` split in two, keeping both URLs live: the management and runner
	// APIs at `/docs/debugging`, the actor inspector at `/actors/docs/debugging`.
	// Neither needs a redirect.
	//
	// Retired pages.
	map['/actors/docs/fetch-and-websocket-handler'] = '/actors/docs/websocket-handler/';
	map['/actors/use-cases'] = '/actors/docs/';
	map['/actors/learn/a-radically-simpler-architecture'] =
		'/guides/a-radically-simpler-architecture/';
	return map;
}

export const redirects = {
	...legacyDocsRedirects(),
	...bundleSplitRedirects(),
	...cloudDocsRedirects(),
	...selfHostRedirects(),
	...guidesRedirects(),
	...integrationsRedirects(),
	...explicitRedirects,
};


// External hosts that wildcard and absolute-URL redirect targets are restricted
// to. Used by both the Astro config and the Caddy generator so neither consumer
// can accidentally emit a redirect to an arbitrary host.
export const EXTERNAL_REDIRECT_HOSTS = ['agentos-sdk.dev', 'discord.gg'];

// Wildcard (prefix) redirects. Any request under `from` (at any depth) is sent
// to `to`.
//
// When `to` ends with `from`, the rule is a pure re-parenting and the request's
// suffix is carried through: `/agent-os/docs` -> `/agentos/docs`. Otherwise
// the suffix is dropped and every sub-path collapses onto `to`, which is what
// the old marketing paths need since they have no 1:1 mapping.
export const wildcardRedirects = [
	// Deep TypeDoc URLs are heavily linked from old docs and search results.
	{ from: '/typedoc', to: '/actors/docs' },
	{ from: '/learn', to: '/guides' },
	{ from: '/compare', to: '/actors/compare' },
	{ from: '/docs/agent-os', to: '/agentos/docs' },
	{ from: '/agent-os', to: '/agentos' },
	// Unknown deep paths under the old Rivet Cloud docs collapse onto the new
	// section roots; every real page has an explicit entry above.
	{ from: '/cloud/docs', to: '/docs/deploy/cloud' },
	{ from: '/cloud/byoc', to: '/docs/deploy/byoc' },
	// Same for the retired `/orchestrate/` namespace and the per-product
	// Self-Host and Learn tabs. Real pages have explicit entries above; anything
	// else lands on the section root.
	{ from: '/orchestrate/docs', to: '/docs' },
	{ from: '/orchestrate/deploy', to: '/docs/deploy' },
	{ from: '/orchestrate', to: '/docs' },
	{ from: '/actors/learn', to: '/guides' },
	// Integrations briefly lived under the Actors vertical; they are a
	// site-wide section at the root now. Real pages have explicit entries above
	// (`integrationsRedirects`); unknown deep paths land on the section root.
	{ from: '/actors/integrations', to: '/integrations' },
	{ from: '/actors/self-host', to: '/docs/deploy' },
	{ from: '/workflows/self-host', to: '/docs/deploy' },
	{ from: '/dynamic-apps/self-host', to: '/docs/deploy' },
	{ from: '/agentos/self-host', to: '/docs/deploy' },
];
