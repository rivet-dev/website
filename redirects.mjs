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
// External redirects to the agentOS site (`https://agentos-sdk.dev`) are also
// supported. agentOS was split out into its own site, so every `/agent-os` and
// `/docs/agent-os` path redirects out to it. See `EXTERNAL_REDIRECT_HOST` and
// `wildcardRedirects` below, and the matching handling in
// `scripts/generate-caddy-redirects.mjs`.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const explicitRedirects = {
	'/docs': '/actors/docs/',
	// Integrations moved out of the documentation URL hierarchy.
	'/docs/integrations': '/integrations/',
	'/docs/integrations/vercel-eve': '/integrations/vercel-eve/',
	'/docs/integrations/vercel-workflow': '/integrations/vercel-workflows/',
	'/integrations/vercel-workflow': '/integrations/vercel-workflows/',
	// Documentation restructure
	'/docs/setup': '/actors/docs/',
	// Dead links inside dated changelog posts. Neither target ever existed, so
	// these point at the nearest real page rather than being rewritten in the
	// posts, which are historical records.
	'/docs/actors/ai-and-user-generated-actors': '/agentos/docs/',
	'/integrations/better-auth': '/integrations/',
	// Managed deploy has no docs page: it collapses into the quickstart's final
	// step. Point at the quickstart rather than the dashboard, so a docs URL
	// keeps its search signal instead of bouncing to an external app.
	'/docs/deploy/rivet-compute': '/actors/docs/quickstart/backend/',
	'/docs/deploy/cli': '/actors/docs/cli/',
	'/docs/actors/queue': '/actors/docs/queues/',
	'/docs/actors/websockets': '/actors/docs/websocket-handler/',
	'/docs/actors/http': '/actors/docs/http-api/',
	'/docs/actors/run': '/actors/docs/lifecycle/',
	'/docs/actors/scheduling': '/actors/docs/schedule/',
	'/docs/actors/external-sql': '/actors/docs/state/',
	'/docs/actors/raw-sql': '/actors/docs/sqlite/',
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
	'/docs/connect': '/actors/self-host/',
	'/docs/connect/aws-ecs': '/actors/self-host/',
	'/docs/connect/aws-lambda': '/actors/self-host/',
	'/docs/connect/cloudflare': '/actors/self-host/',
	'/docs/connect/custom': '/actors/self-host/',
	'/docs/connect/freestyle': '/actors/self-host/',
	'/docs/connect/gcp-cloud-run': '/actors/self-host/',
	'/docs/connect/hetzner': '/actors/self-host/',
	'/docs/connect/kubernetes': '/actors/self-host/',
	'/docs/connect/railway': '/actors/self-host/',
	'/docs/connect/rivet-compute': '/actors/self-host/',
	'/docs/connect/supabase': '/actors/self-host/',
	'/docs/connect/vercel': '/actors/self-host/',
	'/docs/connect/vm-and-bare-metal': '/actors/self-host/',
	// Cloud docs removed - redirect to relevant sections
	'/docs/cloud': '/actors/self-host/',
	'/docs/cloud/api/actors/create': '/actors/docs/',
	'/docs/cloud/api/routes/update': '/actors/docs/',
	'/docs/cloud/self-hosting/single-container': '/actors/self-host/',
	// Next.js client redirect (linked from homepage)
	'/docs/clients/next-js': '/actors/docs/clients/javascript/',
	// Self-hosting redirect
	'/docs/general/self-hosting': '/actors/self-host/',
	// Removed solution pages
	'/agent': '/actors/',
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
	// agentOS moved to its own site at https://agentos-sdk.dev.
	// Marketing pages and the former "From Unix to Agents" essay all point at the
	// new site root. Per-page marketing paths do not have a clean 1:1 mapping on
	// the new site, so the whole `/agent-os` prefix collapses to the root.
	'/agent-os': 'https://agentos-sdk.dev',
	'/agent-os/pricing': 'https://agentos-sdk.dev',
	'/agent-os/use-cases': 'https://agentos-sdk.dev',
	'/agent-os/registry': 'https://agentos-sdk.dev',
	'/from-unix-to-agents': 'https://agentos-sdk.dev',
	'/install': 'https://agentos-sdk.dev',
	'/registry': 'https://agentos-sdk.dev',
	// agentOS docs collapse to the new site root.
	'/docs/agent-os': 'https://agentos-sdk.dev',
	// The agentOS workspace cookbook moved with the rest of agentOS.
	'/cookbook/ai-agent-workspace': 'https://agentos-sdk.dev',
};

// Every docs page moved out of the flat `/docs/...` hierarchy when the site
// split into per-product verticals (`/actors/docs/...`). The legacy map is
// derived from the content tree rather than hand-maintained, so it cannot drift
// as pages are added or renamed. Explicit entries above win on collision.
const CONTENT_ROOT = fileURLToPath(new URL('./src/content', import.meta.url));

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

	// The old Deploy and Self-Hosting sections merged into the per-product
	// Self-Host tab: app deployment became `workers`, running Rivet yourself
	// became `control-plane`. Pages land on the matching section overview until
	// each guide is rewritten.
	const SECTION_TARGETS = {
		deploy: '/actors/self-host/workers/',
		'self-hosting': '/actors/self-host/control-plane/',
	};
	for (const [section, target] of Object.entries(SECTION_TARGETS)) {
		map[`/docs/${section}`] = target;
		for (const slug of mdxSlugs(path.join(CONTENT_ROOT, `_pending-rewrite/${section}`))) {
			if (!slug) continue;
			map[`/docs/${section}/${slug}`] = target;
		}
	}

	return map;
}

export const redirects = { ...legacyDocsRedirects(), ...explicitRedirects };


// External host that wildcard and absolute-URL redirect targets are restricted
// to. Used by both the Astro config and the Caddy generator so neither consumer
// can accidentally emit a redirect to an arbitrary host.
export const EXTERNAL_REDIRECT_HOST = 'agentos-sdk.dev';

// Wildcard (prefix) redirects. Any request under `from` (at any depth) is sent
// to `to`. agentOS moved to its own site as a single destination, so every
// `/agent-os/*` and `/docs/agent-os/*` sub-path collapses to the new site root
// rather than mapping its suffix through. The `/agent-os` prefix subsumes
// `/agent-os/registry/*` and any other deep marketing path.
export const wildcardRedirects = [
	{ from: '/agent-os', to: 'https://agentos-sdk.dev' },
	{ from: '/docs/agent-os', to: 'https://agentos-sdk.dev' },
];
