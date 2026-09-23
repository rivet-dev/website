'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

// ---------------------------------------------------------------------------
// The three deployment models drawn on one shared axis: every variant is the
// identical backend → control plane → storage stack, and only the containment
// boundary moves. Pine names what Rivet Cloud runs, ink names what you run,
// and the dashed arrow is the BYOC operator dialling out across the network
// boundary. Pine only — no ember; the page's one accent CTA lives elsewhere.
// Restated from the self-host docs (src/content/self-host/index.mdx) and the
// BYOC docs (/docs/deploy/byoc/).
// ---------------------------------------------------------------------------

export type DeploymentDiagramVariant = 'managed' | 'byoc' | 'self-hosted';

const DEPLOYMENT_DIAGRAM_ARIA: Record<DeploymentDiagramVariant, string> = {
	managed:
		'Fully managed architecture: your backend, the control plane, and storage all run inside Rivet Cloud.',
	byoc:
		'Bring-your-own-cloud architecture: your backend, the control plane, and storage all run inside your VPC. A Rivet operator connects outbound to Rivet Cloud, which manages updates and maintenance.',
	'self-hosted':
		'Fully self-hosted architecture: your backend, the control plane, and storage all run on infrastructure you control.',
};

// Staged fade-in gated on scroll-into-view; settled instantly under reduced
// motion. Same hook as workflowDiagrams.tsx.
const useDiagram = () => {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: '-15% 0px' });
	const reduced = useReducedMotion();
	const show = (order: number) =>
		reduced
			? { initial: { opacity: 1 }, animate: { opacity: 1 } }
			: {
					initial: { opacity: 0 },
					animate: inView ? { opacity: 1 } : { opacity: 0 },
					transition: { duration: 0.35, delay: 0.15 + order * 0.18, ease: 'easeOut' as const },
				};
	return { ref, show };
};

type Show = ReturnType<typeof useDiagram>['show'];

const Node = ({ title, sub, ink }: { title: string; sub: string; ink?: boolean }) =>
	ink ? (
		<div className='rounded-lg bg-ink px-3 py-2.5 text-center'>
			<span className='block text-[13px] font-medium leading-tight text-cream'>{title}</span>
			<span className='mt-0.5 block font-mono text-[9.5px] text-cream/55'>{sub}</span>
		</div>
	) : (
		<div className='rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-center'>
			<span className='block text-[13px] font-medium leading-tight text-ink'>{title}</span>
			<span className='mt-0.5 block font-mono text-[10px] text-ink-faint'>{sub}</span>
		</div>
	);

// In-zone edge: a plain hairline. `flex-1` lets connectors absorb the height
// difference so all three variants stretch to the same footprint with their
// nodes sitting level.
const Connector = ({ show, at }: { show: Show; at: number }) => (
	<motion.div aria-hidden='true' className='mx-auto min-h-4 w-px flex-1 bg-ink/20' {...show(at)} />
);

const ZONE_LABEL = {
	pine: { box: 'border-pine/40 bg-pine/[0.04]', label: 'text-pine' },
	ink: { box: 'border-ink/30', label: 'text-ink-faint' },
} as const;

const Zone = ({
	tone,
	label,
	grow,
	show,
	at,
	children,
}: {
	tone: keyof typeof ZONE_LABEL;
	label: string;
	grow?: boolean;
	show: Show;
	at: number;
	children: React.ReactNode;
}) => (
	<motion.div
		className={`flex flex-col rounded-xl border border-dashed p-3.5 ${ZONE_LABEL[tone].box} ${grow ? 'flex-1' : ''}`}
		{...show(at)}
	>
		<p className={`mb-2.5 text-sm font-medium ${ZONE_LABEL[tone].label}`}>{label}</p>
		<div className='flex flex-1 flex-col'>{children}</div>
	</motion.div>
);

// The one edge that crosses the network boundary: a dashed arrow pointing
// from your VPC into Rivet Cloud (the operator dials out; no inbound path
// to your infra). The shaft sits on the diagram's center axis — the
// label hangs off it absolutely so it cannot push the arrow off-center.
const CrossConnector = ({ show, at }: { show: Show; at: number }) => (
	<motion.div className='relative flex min-h-7 flex-1 justify-center' {...show(at)}>
		<span aria-hidden='true' className='block w-px border-l border-dashed border-ink/30' />
		<span
			aria-hidden='true'
			className='absolute bottom-0 left-1/2 -translate-x-1/2 border-x-[3px] border-t-[5px] border-x-transparent border-t-ink/30'
		/>
		<span className='absolute left-1/2 top-1/2 ml-2 -translate-y-1/2 font-mono text-[10px] text-ink-faint'>
			outbound
		</span>
	</motion.div>
);

const Backend = () => <Node title='Your backend' sub='application code' />;
const ControlPlane = () => <Node title='Control plane' sub='scheduling · routing' ink />;
const Storage = () => <Node title='Storage' sub='Actor state' />;
const Management = () => <Node title='Managed by Rivet' sub='updates · maintenance' />;

export const DeploymentDiagram = ({ variant }: { variant: DeploymentDiagramVariant }) => {
	const { ref, show } = useDiagram();

	return (
		<div
			ref={ref}
			role='img'
			aria-label={DEPLOYMENT_DIAGRAM_ARIA[variant]}
			className='mx-auto flex h-full w-full max-w-xs flex-col'
		>
			{variant === 'byoc' ? (
				<>
					<Zone tone='ink' label='Your VPC' grow show={show} at={0}>
						<motion.div {...show(1)}>
							<Backend />
						</motion.div>
						<Connector show={show} at={1.5} />
						<motion.div {...show(2)}>
							<ControlPlane />
						</motion.div>
						<Connector show={show} at={2.5} />
						<motion.div {...show(3)}>
							<Storage />
						</motion.div>
					</Zone>
					<CrossConnector show={show} at={3.5} />
					<Zone tone='pine' label='Rivet Cloud' show={show} at={4}>
						<motion.div {...show(4.5)}>
							<Management />
						</motion.div>
					</Zone>
				</>
			) : (
				<Zone
					tone={variant === 'managed' ? 'pine' : 'ink'}
					label={variant === 'managed' ? 'Rivet Cloud' : 'Your infrastructure'}
					grow
					show={show}
					at={0}
				>
					<motion.div {...show(1)}>
						<Backend />
					</motion.div>
					<Connector show={show} at={1.5} />
					<motion.div {...show(2)}>
						<ControlPlane />
					</motion.div>
					<Connector show={show} at={2.5} />
					<motion.div {...show(3)}>
						<Storage />
					</motion.div>
				</Zone>
			)}
		</div>
	);
};
