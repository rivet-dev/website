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
// Absolute targets are supported but restricted to a single allowed host, so a
// bad entry can never point traffic at an arbitrary domain. See
// `EXTERNAL_REDIRECT_HOST` below and the matching check in
// `scripts/generate-caddy-redirects.mjs`. Nothing currently uses it: agentOS
// briefly had its own site and is now a vertical here.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const explicitRedirects = {
	// Integrations moved out of the documentation URL hierarchy.
	'/docs/integrations': '/integrations/',
	'/docs/integrations/vercel-eve': '/integrations/vercel-eve/',
	'/docs/integrations/vercel-workflow': '/actors/integrations/workflow-sdk/',
	'/integrations/vercel-workflow': '/actors/integrations/workflow-sdk/',
	// The Tutorials tab became Learn.
	'/actors/tutorials': '/actors/learn/',
	'/agentos/tutorials': '/agentos/docs/',
	'/dynamic-apps/tutorials': '/dynamic-apps/docs/',
	'/workflows/tutorials': '/workflows/docs/',
	// Cookbook became the Actors Learn tab; integrations became per-product.
	'/cookbook': '/actors/learn/',
	'/integrations': '/actors/integrations/',
	'/cookbook/ai-agent': '/actors/learn/ai-agent/',
	'/cookbook/chat-room': '/actors/learn/chat-room/',
	'/cookbook/collaborative-text-editor': '/actors/learn/collaborative-text-editor/',
	'/cookbook/cron-jobs': '/actors/learn/cron-jobs/',
	'/cookbook/live-cursors': '/actors/learn/live-cursors/',
	'/cookbook/multiplayer-game': '/actors/learn/multiplayer-game/',
	'/cookbook/per-tenant-database': '/actors/learn/per-tenant-database/',
	'/cookbook/vpc-air-gapped': '/actors/learn/vpc-air-gapped/',
	'/integrations/flue': '/actors/integrations/flue/',
	'/integrations/vercel-eve': '/actors/integrations/vercel-eve/',
	'/integrations/vercel-workflows': '/actors/integrations/workflow-sdk/',
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
	// agentOS briefly lived at https://agentos-sdk.dev and is now a product
	// vertical on this site, so these land on `/agentos/*` rather than off-site.
	'/agent-os': '/agentos',
	'/agent-os/pricing': '/pricing',
	'/agent-os/use-cases': '/agentos/use-cases',
	'/agent-os/registry': '/agentos/registry',
	'/registry': '/agentos/registry',
	// The integrations pages live under the Actors vertical now. These two are
	// not covered by legacyDocsRedirects because they moved tab, not just prefix.
	'/docs/integrations': '/actors/integrations/',
	'/docs/integrations/flue': '/actors/integrations/flue/',
	'/docs/integrations/vercel-eve': '/actors/integrations/vercel-eve/',
	'/docs/integrations/vercel-workflows': '/actors/integrations/workflow-sdk/',
	// The Vercel Workflows page is named after the SDK it integrates with.
	'/actors/integrations/vercel-workflows': '/actors/integrations/workflow-sdk/',
	// `/contact` was never a page here; sales is the live destination.
	'/contact': '/sales/',

	// Retired pages. These were live URLs, so they redirect rather than 404.
	// `/pricing` was a page that did nothing but redirect; a real 301 here beats
	// Astro's static redirect, which serves HTTP 200 with a meta refresh.
	'/pricing': '/cloud/',
	'/meme/wired-in': '/',
	// Deployment folded into the shared Self-Host section.
	'/agentos/docs/deployment': '/agentos/self-host/',
	// Air-gapped deployment is a self-hosting topic, not an actors cookbook.
	'/actors/learn/vpc-air-gapped': '/actors/self-host/control-plane/vm/',
	'/cookbook/vpc-air-gapped': '/actors/self-host/control-plane/vm/',
	// Rivet Compute is a Cloud feature, not a self-hosting target.
	'/docs/deploy/rivet-compute': '/cloud/docs/compute/',
	'/docs/deploy/freestyle': '/actors/self-host/workers/freestyle/',
	'/docs/deploy/hetzner': '/actors/self-host/workers/vm/',
	'/docs/self-hosting/render': '/actors/self-host/control-plane/render/',
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
	'/learn': '/actors/learn/',
	'/learn/act-1/scene-1-a-radically-simpler-architecture':
		'/actors/learn/a-radically-simpler-architecture/',
	'/docs/tools/actors': '/actors/docs/',
	// The "append .md to any docs URL" feature was documented but never built.
	// Its docs page and the hand-written markdown exports are both gone.
	'/docs/general/docs-for-llms': '/actors/docs/general/skill/',
	'/actors/docs/general/docs-for-llms': '/actors/docs/general/skill/',
	'/install': '/agentos/docs/quickstart',
	// The "From Unix to Agents" essay has no page on this site; the product
	// overview is the closest surviving destination.
	'/from-unix-to-agents': '/agentos',
	'/docs/agent-os': '/agentos/docs',
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
// to `to`.
//
// When `to` ends with `from`, the rule is a pure re-parenting and the request's
// suffix is carried through: `/registry/pi` -> `/agentos/registry/pi`. Otherwise
// the suffix is dropped and every sub-path collapses onto `to`, which is what
// the old marketing paths need since they have no 1:1 mapping.
export const wildcardRedirects = [
	{ from: '/registry', to: '/agentos/registry' },
	// Deep TypeDoc URLs are heavily linked from old docs and search results.
	{ from: '/typedoc', to: '/actors/docs' },
	{ from: '/learn', to: '/actors/learn' },
	{ from: '/compare', to: '/actors/compare' },
	{ from: '/docs/agent-os', to: '/agentos/docs' },
	{ from: '/agent-os', to: '/agentos' },
];
