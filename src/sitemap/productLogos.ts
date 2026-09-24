// Product wordmarks live here so `products.ts` stays importable outside Vite.
// Asset imports are Vite-only, and the sitemap consistency check
// (`pnpm check:sitemap`) loads the registry under plain tsx.
//
// The SVGs are white-on-transparent, so their alpha channel is the shape of the
// mark. Consumers mask an element with them and fill it with the product accent
// (see `wordmarkMaskStyle` in `src/lib/product-accent.ts`).
import actorsLogoUrl from "@/images/products/actors-logo.svg";
import agentsLogoUrl from "@/images/products/agents-logo.svg";
import agentosLogoUrl from "@/images/products/agentos-logo.svg";
import dynamicAppsLogoUrl from "@/images/products/dynamic-apps-logo.svg";
import integrationsLogoUrl from "@/images/products/integrations-logo.svg";
import secureExecLogoUrl from "@/images/products/secure-exec-logo.svg";
import workflowsLogoUrl from "@/images/products/workflows-logo.svg";

// Rivet Cloud stays off this map on purpose: its product-bar mark is the
// faCloud glyph (see `products.ts`), not the R-in-ring wordmark.
export const productLogos: Record<string, { src: string }> = {
	actors: actorsLogoUrl,
	// Agents share the Actors accent (see `product-accent.ts`) but carry their
	// own mark: the ring with the robot glyph the homepage plate uses.
	agents: agentsLogoUrl,
	agentos: agentosLogoUrl,
	// Sandboxes are agentOS as an API, so they carry the agentOS mark.
	sandboxes: agentosLogoUrl,
	workflows: workflowsLogoUrl,
	"dynamic-apps": dynamicAppsLogoUrl,
	// The puzzle-piece glyph inside the same inset ring as the actor types.
	integrations: integrationsLogoUrl,
	// The secureexec.dev wordmark, stacked. It fills the tile without the inset
	// ring the pillars carry: inside the ring it is illegible at product-bar size.
	"secure-exec": secureExecLogoUrl,
};
