import { ownsDocsBundle, PRODUCTS } from "./product-metadata";

/**
 * The Guides tab (`/guides/`). Every product bundle may ship guides:
 *
 *   <repo>/<bundle>/content/guides/<slug>.mdx   -> /guides/<slug>/
 *   <repo>/<bundle>/sidebar.json "guides"       -> groups of the Guides sidebar
 *
 * A bundle links its guides as `/guides/<slug>`, where they render, so nothing
 * is re-rooted. The website owns only the overview (`src/content/guides/index.mdx`).
 * Guides render through `src/pages/guides/[...slug].astro`, and their
 * `<CodeSnippet>` paths resolve against the bundle's own repo.
 */
export const GUIDES_ROUTE_PREFIX = "/guides";

/** The bundle directory and `sidebar.json` key that hold a bundle's guides. */
export const GUIDES_SECTION = "guides";

/**
 * Bundles that may ship guides, in the order the Guides sidebar merges them.
 * Shared bundles (`bundleOf`) are read once, through their source product.
 */
export const GUIDE_BUNDLES: string[] = PRODUCTS.filter(
	(product) => ownsDocsBundle(product) && !product.bundleOf && !product.unlaunched,
).map((product) => product.id);

/**
 * Guide slugs from highest to lowest priority, ranked by search demand and fit
 * (see `~/.agents/research/guides-seo`). The Guides sidebar sorts the pages of
 * every group by this order; guides missing from it keep their bundle order
 * after the ranked ones.
 */
export const GUIDE_PRIORITY: string[] = [
	"run-untrusted-code",
	"slack-bot",
	"durable-ai-agents",
	"deploy-ai-agent",
	"run-claude-code",
	"run-codex",
	"run-opencode",
	"run-amp",
	"chat-room",
	"nextjs-stateful-backend",
	"multi-agent-system",
	"human-in-the-loop",
	"background-coding-agent",
	"per-tenant-database",
	"build-coding-agent",
	"agent-filesystem",
	"run-ai-generated-code",
	"database-per-ai-generated-app",
	"coding-agents-cloud",
	"ai-workflows",
	"host-ai-generated-apps",
	"rate-limit-llm-calls",
	"database-per-user",
	"database-per-agent",
	"code-interpreter",
	"handle-webhooks",
	"agent-memory",
	"cron-jobs",
	"collaborative-text-editor",
	"collaborative-text-editor-ot",
	"mcp-server",
	"battle-royale",
	"io-game",
	"arena-game",
	"turn-based-game",
	"open-world-game",
	"party-game",
	"ranked-game",
	"idle-game",
	"physics-2d-game",
	"physics-3d-game",
	"authentication",
	"live-cursors",
	"webhook-delivery",
	"browser-automation",
	"voice-agent",
	"gdpr-data-residency",
	"tenant-audit-log",
	"hipaa-agents",
	"soc2-agent-evidence",
	"regulated-industry-agents",
	"outbound-proxy",
	"sandbox-egress-allowlist",
	"prevent-ssrf-agents",
	"credential-brokering",
	"private-networking",
	"static-egress-ips",
	"workload-identity",
	"sso-internal-agents",
	"least-privilege-agents",
	"pii-redaction",
	"usage-metering",
	"a2a-client",
	"mcp-gateway",
	"multi-tenant-saas-architecture",
	"organizations-rbac",
	"internal-agent-platform",
	"internal-coding-agent-platform",
	"run-customer-code",
	"cross-tenant-analytics",
	"incident-response-agent",
	"data-analysis-agent",
	"scheduled-reporting-agents",
	"iot-digital-twin",
	"grpo-code-rewards",
	"tool-use-rl",
	"parallel-agent-evals",
	"verifier-service",
	"rl-environment-actor",
	"code-generation-benchmarks",
	"text-to-sql-rl-environment",
	"prevent-reward-hacking",
	"capture-agent-trajectories",
	"rl-rollout-cost",
	"openenv",
	"harbor-evals",
	"code-mode",
	"agent-bash-tool",
	"mcp-server-per-user",
	"test-ai-written-code",
	"scheduled-agent-runs",
	"shared-agent-filesystem",
	"persistent-computer-per-user",
	"mount-external-sandbox",
];

export function guideHref(slug: string): string {
	return slug ? `${GUIDES_ROUTE_PREFIX}/${slug}/` : `${GUIDES_ROUTE_PREFIX}/`;
}

/**
 * The bundle and guide slug of a docs content id, e.g.
 * `agents/guides/sign-in-with-chatgpt` -> `{ bundle: "agents", slug: "sign-in-with-chatgpt" }`.
 * Undefined for ids outside a bundle's guides, and for a bundle's own
 * `guides/index.mdx`, which the website overview replaces.
 */
export function guideForContentId(
	contentId: string,
): { bundle: string; slug: string } | undefined {
	for (const bundle of GUIDE_BUNDLES) {
		const prefix = `${bundle}/${GUIDES_SECTION}/`;
		if (!contentId.startsWith(prefix)) continue;
		const slug = contentId.slice(prefix.length).replace(/\/index$/, "");
		return slug && slug !== "index" ? { bundle, slug } : undefined;
	}
	return undefined;
}

/**
 * Site slug (no leading slash) of a guide's content id, e.g.
 * `actors/guides/chat-room` -> `guides/chat-room`. Undefined for other ids.
 */
export function guidesSlugForContentId(contentId: string): string | undefined {
	const guide = guideForContentId(contentId);
	return guide && `${GUIDES_ROUTE_PREFIX.slice(1)}/${guide.slug}`;
}

/** Whether a docs content id sits in a bundle's guides section. */
export function isGuidesContentId(contentId: string): boolean {
	return GUIDE_BUNDLES.some(
		(bundle) =>
			contentId === `${bundle}/${GUIDES_SECTION}` ||
			contentId.startsWith(`${bundle}/${GUIDES_SECTION}/`),
	);
}
