// Product wordmarks live here so `products.ts` stays importable outside Vite.
// Asset imports are Vite-only, and the sitemap consistency check
// (`pnpm check:sitemap`) loads the registry under plain tsx.
//
// The SVGs are white-on-transparent and get inverted on the porcelain field.
import actorsLogoUrl from "@/images/products/actors-logo.svg";
import agentosLogoUrl from "@/images/products/agentos-logo.svg";

export const productLogos: Record<string, { src: string }> = {
	actors: actorsLogoUrl,
	agentos: agentosLogoUrl,
};
