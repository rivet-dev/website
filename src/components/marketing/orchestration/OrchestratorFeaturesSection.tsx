"use client";

import {
	Icon,
	faEarthAmericas,
	faNetworkWired,
	faShieldCheck,
	faArrowRotateLeft,
	faReact,
	faGaugeHigh,
	faTerminal,
	faClockRotateLeft,
	faLayerGroup,
	faServer,
	faRobot,
	faCodeBranch,
} from "@rivet-gg/icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../motion";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import {
	SECTION_H2_CLASS,
	SECTION_LEDE_CENTERED_CLASS,
} from "../typography";
import { canonicalizeInternalHref } from "@/lib/internalHref";

interface Feature {
	icon: IconDefinition;
	title: string;
	description: string;
	href: string;
}

const features: Feature[] = [
	{
		icon: faArrowRotateLeft,
		title: "Fault tolerance by design",
		description:
			"A worker going down reschedules its Actors elsewhere with their state intact. No replay harness or checkpointing of your own.",
		href: "/actors/docs/",
	},
	{
		icon: faEarthAmericas,
		title: "Multi-region",
		description:
			"Place Actors near the users and data they serve, and route requests to wherever each one currently lives.",
		href: "/actors/docs/general/edge",
	},
	{
		icon: faNetworkWired,
		title: "HTTP & WebSocket networking",
		description:
			"Address an Actor directly over HTTP or hold a live WebSocket to it. No queue or broker in between.",
		href: "/actors/docs/",
	},
	{
		icon: faShieldCheck,
		title: "End-to-end type safety",
		description:
			"Actor definitions generate their own client types, so a signature change breaks the build rather than production.",
		href: "/actors/docs/",
	},
	{
		icon: faReact,
		title: "React SDK",
		description:
			"First-party hooks that subscribe a component to an Actor's state and keep it live as the Actor updates.",
		href: "/actors/docs/",
	},
	{
		icon: faGaugeHigh,
		title: "OpenTelemetry & observability",
		description:
			"Traces, metrics, and structured logs emitted in OTel format, into the collector you already run.",
		href: "/actors/docs/",
	},
	{
		icon: faTerminal,
		title: "Single Rust binary",
		description:
			"The control plane ships as one static binary with no external dependencies to stand up first.",
		href: "/docs/deploy/self-host/control-plane/",
	},
	{
		icon: faClockRotateLeft,
		title: "Cron & scheduling",
		description:
			"Wake an Actor on a schedule or at a timestamp it sets for itself, without a separate scheduler.",
		href: "/actors/docs/",
	},
	{
		icon: faRobot,
		title: "Sleeps when idle",
		description:
			"Idle Actors release their resources and wake with durable state intact when the next request arrives.",
		href: "/actors/docs/",
	},
	{
		icon: faCodeBranch,
		title: "Actor-to-actor calls",
		description:
			"Actors address each other by key and call across the cluster as if the other one were local.",
		href: "/actors/docs/",
	},
	{
		icon: faServer,
		title: "No Kubernetes operator",
		description:
			"One control plane behind a load balancer, speaking plain HTTP inside your VPC. No CRDs, no operator, no service mesh to keep alive.",
		href: "/docs/deploy/self-host/control-plane/",
	},
	{
		icon: faLayerGroup,
		title: "Open source",
		description:
			"Apache 2.0, self-hostable in full. The managed service runs the same control plane you can run yourself.",
		href: "https://github.com/rivet-dev/rivet",
	},
];

export const OrchestratorFeaturesSection = () => (
	<section className={`bg-paper ${SITE_SECTION_CLASS}`}>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<Reveal>
				<div className="mx-auto max-w-4xl text-center">
					<h2 className={SECTION_H2_CLASS}>
						Other powerful features of the Rivet Orchestrator.
					</h2>
					<p className={SECTION_LEDE_CENTERED_CLASS}>
						Routing, scheduling, types, and telemetry, built in.
					</p>
				</div>
			</Reveal>

			<Reveal>
				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature) => (
						<a
							key={feature.title}
							href={canonicalizeInternalHref(feature.href)}
							className="group block cursor-pointer rounded-xl border border-ink/10 bg-white/55 p-5 transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/50 motion-reduce:transition-none"
						>
							<span className="flex items-center gap-2.5">
								<Icon
									icon={feature.icon}
									className="h-4 w-4 text-ink-soft transition-colors group-hover:text-ink"
								/>
								<span className="text-base font-medium leading-snug tracking-tight text-ink">
									{feature.title}
								</span>
								<ArrowRight className="ml-auto h-3.5 w-3.5 -translate-x-1 text-ink-faint opacity-0 transition-[opacity,transform,color] duration-200 group-hover:translate-x-0 group-hover:text-ink-soft group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
							</span>
							<span className="mt-2.5 block text-sm leading-relaxed text-ink-soft transition-colors group-hover:text-ink">
								{feature.description}
							</span>
						</a>
					))}
				</div>
			</Reveal>

		</div>
	</section>
);
