import { Card, CardGroup } from "@/components/Card";
import { deployOptionsForRole } from "@rivetkit/shared-data";
import { faCloudArrowUp, faServer, faShareNodes } from "@rivet-gg/icons";
import { SELF_HOST_ROUTE_PREFIX } from "@/sitemap/deploy";

/**
 * The quickstart's deployment section, and the highest-traffic surface in the
 * docs. It leads with the three deployment models because this is the main
 * place a new reader ever learns BYOC exists, then lists providers beneath.
 *
 * Provider support comes from `@rivetkit/shared-data`, the same source
 * `deployMatrix` reads, so the two cannot disagree about which platform hosts
 * what.
 */
export function Hosting() {
	const base = SELF_HOST_ROUTE_PREFIX;

	const models = [
		{
			title: "Fully managed",
			icon: faCloudArrowUp,
			href: "https://dashboard.rivet.dev",
			description:
				"Rivet runs the control plane and your nodes. Nothing to operate.",
		},
		{
			title: "Bring your own compute",
			icon: faShareNodes,
			href: `${base}/nodes`,
			description:
				"Rivet runs the control plane. Your nodes run on your own infrastructure.",
		},
		{
			title: "Full self-hosting",
			icon: faServer,
			href: `${base}/control-plane`,
			description:
				"You run the control plane and your nodes. No dependency on Rivet Cloud.",
		},
	];

	return (
		<>
			<p>
				In development, Rivet runs a local control plane for you and keeps Actor data on your machine.
			</p>

			<p>
				To scale Rivet in production, pick how much of it you want to run
				yourself:
			</p>

			<CardGroup>
				{models.map(({ title, href, icon, description }) => (
					<Card key={href} title={title} href={href} icon={icon}>
						{description}
					</Card>
				))}
			</CardGroup>

			<p>
				If you are running your own nodes, follow the guide for your hosting
				provider:
			</p>

			<CardGroup>
				{deployOptionsForRole("worker")
					.filter((option) => !option.specializedPlatform)
					.map(({ displayName: title, slug, icon }) => (
						<Card
							key={slug}
							title={title}
							href={`${base}/nodes/${slug}`}
							icon={icon}
						/>
					))}
			</CardGroup>
		</>
	);
}
