// Product wordmarks live here so `products.ts` stays importable outside Vite.
// Asset imports are Vite-only, and the sitemap consistency check
// (`pnpm check:sitemap`) loads the registry under plain tsx.
//
// The SVGs are white-on-transparent, so their alpha channel is the shape of the
// mark. Consumers mask an element with them and fill it with the product accent
// (see `wordmarkMaskStyle` in `src/lib/product-accent.ts`).
import actorsLogoUrl from "@/images/products/actors-logo.svg";
import agentosLogoUrl from "@/images/products/agentos-logo.svg";
import dynamicAppsLogoUrl from "@/images/products/dynamic-apps-logo.svg";
import workflowsLogoUrl from "@/images/products/workflows-logo.svg";

export const productLogos: Record<string, { src: string }> = {
	actors: actorsLogoUrl,
	agentos: agentosLogoUrl,
	workflows: workflowsLogoUrl,
	"dynamic-apps": dynamicAppsLogoUrl,
};
