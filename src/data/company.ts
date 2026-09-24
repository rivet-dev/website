// Company facts, in one place. BaseLayout emits them as the site-wide
// Organization JSON-LD. Anything that is a claim about the business (founding
// year, address, support channels) lives here rather than being typed into a page.
//
// Keep pricing in sync with `src/components/marketing/pricing/PricingPageClient.tsx`
// and support channels with `src/pages/support.astro`.

import { AUTHORS } from "@/lib/article";

export const COMPANY = {
	name: "Rivet",
	legalName: "Rivet Gaming, Inc.",
	url: "https://rivet.dev",
	description:
		"Rivet is the open-source orchestrator for agentic workloads: a control plane that runs agents, workflows, and sandboxes as durable Actors, on Rivet Cloud or self-hosted.",
	foundingDate: "2022",
	// Rivet Gaming, Inc. is a Delaware corporation headquartered in San Francisco.
	address: {
		streetAddress: "2261 Market Street STE 22704",
		addressLocality: "San Francisco",
		addressRegion: "CA",
		postalCode: "94114",
		addressCountry: "US",
	},
	logo: {
		url: "https://assets.rivet.dev/website/public/icons/android-chrome-512x512.png",
		width: 512,
		height: 512,
	},
	email: "support@rivet.dev",
	social: {
		x: "https://x.com/rivet_dev",
		github: "https://github.com/rivet-dev",
		linkedin: "https://www.linkedin.com/company/72072261/",
		discord: "https://discord.gg/aXYfyNxYVn",
	},
} as const;

export interface Founder {
	id: keyof typeof AUTHORS;
	name: string;
	role: string;
	sameAs: string[];
}

export const FOUNDERS: Founder[] = [
	{
		id: "nathan-flurry",
		name: AUTHORS["nathan-flurry"].name,
		role: AUTHORS["nathan-flurry"].role,
		sameAs: [
			AUTHORS["nathan-flurry"].socials.twitter,
			AUTHORS["nathan-flurry"].socials.github,
			"https://www.linkedin.com/in/nathanflurry/",
		],
	},
	{
		id: "nicholas-kissel",
		name: AUTHORS["nicholas-kissel"].name,
		role: AUTHORS["nicholas-kissel"].role,
		sameAs: [
			AUTHORS["nicholas-kissel"].socials.twitter,
			AUTHORS["nicholas-kissel"].socials.github,
			"https://www.linkedin.com/in/nicholaskissel/",
		],
	},
];

/** The Organization node shared by every page's JSON-LD graph. */
export function organizationSchema() {
	return {
		"@type": "Organization",
		"@id": `${COMPANY.url}/#organization`,
		name: COMPANY.name,
		legalName: COMPANY.legalName,
		url: COMPANY.url,
		description: COMPANY.description,
		foundingDate: COMPANY.foundingDate,
		logo: {
			"@type": "ImageObject",
			url: COMPANY.logo.url,
			width: COMPANY.logo.width,
			height: COMPANY.logo.height,
		},
		address: {
			"@type": "PostalAddress",
			...COMPANY.address,
		},
		founder: FOUNDERS.map((founder) => ({
			"@type": "Person",
			name: founder.name,
			jobTitle: founder.role,
			sameAs: founder.sameAs,
		})),
		sameAs: Object.values(COMPANY.social),
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer support",
			email: COMPANY.email,
			url: `${COMPANY.url}/support/`,
		},
	};
}
