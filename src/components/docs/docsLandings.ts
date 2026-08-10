import {
	faCloudflare,
	faLayerGroup,
	faNextjs,
	faNodeJs,
	faReact,
	faRust,
	faSupabase,
} from "@rivet-gg/icons";
import type { DocsLandingData } from "./DocsLanding";

const actors: DocsLandingData = {
	title: "Actors",
	subtitle:
		"Long-lived processes with durable state, realtime events, and built-in hibernation. Pick a stack to start building.",
	logo: "actors",
	sections: [
		{
			title: "Get Started",
			items: [
				{ title: "Node.js & Bun", href: "/actors/docs/quickstart/backend", icon: faNodeJs, description: "Set up actors with Node.js, Bun, and web frameworks." },
				{ title: "React", href: "/actors/docs/quickstart/react", icon: faReact, description: "Build realtime React applications backed by actors." },
				{ title: "Next.js", href: "/actors/docs/quickstart/next-js", icon: faNextjs, description: "Server-rendered Next.js experiences backed by actors." },
				{ title: "Rust", href: "/actors/docs/quickstart/rust", icon: faRust, badge: "Beta", description: "Build a Rivet Actor in Rust." },
				{ title: "Effect.ts", href: "/actors/docs/quickstart/effect", icon: faLayerGroup, badge: "Beta", description: "The Effect SDK with typed Schema actions." },
				{ title: "Cloudflare Workers", href: "/actors/docs/quickstart/cloudflare", icon: faCloudflare, description: "Run RivetKit on Cloudflare Workers." },
				{ title: "Supabase Functions", href: "/actors/docs/quickstart/supabase", icon: faSupabase, description: "Run RivetKit on Supabase Edge Functions." },
			],
		},
	],
};

// Keyed by content slug path, which is product-scoped: `actors/docs` is the
// Actors Documentation overview. The Deploy overviews render as normal prose
// while that tab is being written from scratch, so they show their TODO callout
// instead of an icon grid.
export const docsLandings: Record<string, DocsLandingData> = {
	"actors/docs": actors,
};
