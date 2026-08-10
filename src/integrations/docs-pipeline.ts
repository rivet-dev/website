/**
 * The docs MDX pipeline and route generation, inlined from the former
 * `@rivet-dev/docs-theme` package (MIT, Copyright (c) 2026 Rivet).
 *
 * Spread into `integrations` in astro.config.ts. Also wires the markdown (.md)
 * pipeline and `syntaxHighlight: false`, since Shiki runs inside the rehype
 * plugins rather than through Astro's built-in highlighter.
 */
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import type { AstroIntegration } from "astro";
import { remarkPlugins } from "../mdx/remark";
import { rehypePlugins } from "../mdx/rehype";
import generateRoutes from "./generate-routes";

/** Applies the same remark/rehype pipeline to plain `.md` as to `.mdx`. */
function markdownPipeline(): AstroIntegration {
	return {
		name: "rivet-docs/markdown-pipeline",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({
					markdown: {
						syntaxHighlight: false,
						remarkPlugins,
						rehypePlugins,
					},
				});
			},
		},
	};
}

export function docsPipeline(): AstroIntegration[] {
	return [
		react(),
		mdx({ syntaxHighlight: false, remarkPlugins, rehypePlugins }),
		generateRoutes(),
		markdownPipeline(),
	];
}

export { remarkPlugins, rehypePlugins };
