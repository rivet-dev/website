import { Icon } from "@rivet-gg/icons";
import { platformsFor } from "@/sitemap/deployMatrix";
import { EYEBROW_CLASS } from "../typography";

/**
 * Where the control plane can run, as a footer to the self-hosting section.
 *
 * Derived from `deployMatrix` rather than hand-listed, so it can never claim a
 * platform the guides do not cover. Scoped to the control-plane role on
 * purpose: the serverless targets are worker-only, and listing them beside the
 * self-hosting argument implied you could put the control plane on Vercel.
 *
 * Kept apart from the tools list — that one is what you write actors in, this
 * one is where you run them.
 */
const clouds = platformsFor("actors", "control-plane");

export const CloudStrip = () => (
	<div className="mt-12 border-t border-ink/10 pt-8" data-site-reveal="">
		<h3 className={EYEBROW_CLASS}>Supported clouds</h3>
		<ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-6">
			{clouds.map((cloud) => (
				<li
					key={cloud.slug}
					className="flex items-center gap-2 text-sm text-ink-faint"
				>
					<Icon
						icon={cloud.icon}
						aria-hidden="true"
						className="h-4 w-4 opacity-70"
					/>
					{cloud.displayName}
				</li>
			))}
		</ul>
	</div>
);
