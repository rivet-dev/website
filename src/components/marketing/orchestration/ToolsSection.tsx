"use client";

import { Reveal } from "../motion";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { SECTION_H2_CLASS, SECTION_LEDE_CENTERED_CLASS } from "../typography";

/**
 * The languages and libraries you write actors with.
 *
 * Distinct from the cloud list under self-hosting: that one answers "where can
 * this run", this one answers "what do I write it in". Conflating the two put
 * Kubernetes next to React, which told the reader neither thing.
 */
const tools = [
	{ label: "TypeScript", src: "/images/tools/typescript.svg" },
	{ label: "Node.js", src: "/images/tools/nodejs.svg" },
	{ label: "Rust", src: "/images/tools/rust.svg" },
	{ label: "React", src: "/images/tools/react.svg" },
	{ label: "Effect", src: "/images/tools/effect.svg" },
];

export const ToolsSection = () => (
	<section className={`bg-paper ${SITE_SECTION_CLASS}`}>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<Reveal>
				<div className="mx-auto max-w-3xl text-center">
					<h2 className={SECTION_H2_CLASS}>
						Works with the tools you already use.
					</h2>
					<p className={SECTION_LEDE_CENTERED_CLASS}>
						Typed SDKs for the languages you write backends in, and
						first-party React hooks for the interfaces on top of them.
					</p>
				</div>
			</Reveal>

			<Reveal delay={0.1}>
				<ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
					{tools.map((tool) => (
						<li
							key={tool.label}
							className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-white/55 px-4 py-3"
						>
							<img
								src={tool.src}
								alt=""
								aria-hidden="true"
								loading="lazy"
								className="h-5 w-5 object-contain"
							/>
							<span className="text-sm font-medium text-ink">{tool.label}</span>
						</li>
					))}
				</ul>
			</Reveal>
		</div>
	</section>
);
