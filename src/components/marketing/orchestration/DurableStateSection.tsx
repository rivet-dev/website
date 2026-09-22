"use client";

import { ArgumentSection } from "./ArgumentSection";

/**
 * The three durable surfaces an actor owns, as tiles.
 *
 * Borrows the staggered-square treatment from the agentOS foundation cards:
 * a rounded square holding a mark and a small label, grayscale and quiet at
 * rest, coming up to full color when the section is hovered. Offsets and slight
 * rotations keep the row from reading as a toolbar.
 */
const surfaces = [
	{
		label: "SQLite",
		src: "/images/registry/sqlite3.svg",
		offset: "translate-y-2",
		rotation: -5,
	},
	{
		label: "POSIX filesystem",
		src: "/images/registry/linux.svg",
		offset: "-translate-y-3",
		rotation: 4,
	},
	{
		label: "S3 tiered storage",
		src: "/images/registry/s3.svg",
		offset: "translate-y-1",
		rotation: -2,
	},
];

const DurableStateFigure = () => (
	<div className="group flex h-52 items-center justify-center gap-5">
		{surfaces.map((surface) => (
			<div
				key={surface.label}
				className={`flex size-[104px] flex-col items-center justify-center rounded-xl bg-ink/[0.035] opacity-65 grayscale ring-1 ring-ink/[0.08] transition-[filter,opacity,background-color] duration-300 group-hover:bg-white group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none ${surface.offset}`}
				style={{ rotate: `${surface.rotation}deg` }}
			>
				<img
					src={surface.src}
					alt=""
					aria-hidden="true"
					loading="lazy"
					className="h-7 w-7 object-contain"
				/>
				<span className="mt-2 px-2 text-center text-[10px] font-medium leading-tight text-ink-soft transition-colors duration-300 group-hover:text-ink">
					{surface.label}
				</span>
			</div>
		))}
		<span className="sr-only">
			Every actor owns a SQLite database, a POSIX filesystem, and object
			storage.
		</span>
	</div>
);

export const DurableStateSection = () => (
	<ArgumentSection
		heading="Durable state for every workload."
		lede={
			<>
				Persistence is part of the orchestrator, not a database you bolt onto
				it. Every actor owns a SQLite database for structured state and a POSIX
				filesystem for everything else, both tiered to S3 — so the hot working
				set stays local while the rest lives in object storage, and no actor is
				pinned to a disk on one machine. An idle actor costs nothing to keep,
				so millions can sit parked with their state intact until something
				addresses one.
			</>
		}
		links={[
			{
				label: "Storage architecture",
				href: "/orchestration/deploy/control-plane/storage/",
			},
		]}
		figure={<DurableStateFigure />}
	/>
);
