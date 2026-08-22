'use client';

import { Database, Globe, Infinity, Layers, Wifi, GitBranch, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
	BODY_CLASS,
	CARD_TITLE_CLASS,
	PRIMARY_INK_BUTTON_CLASS,
	PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
	SECTION_H2_CLASS,
	SUBTITLE_CLASS,
} from '../typography';
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from '../layout';

const actorFeatures = [
	{
		icon: Database,
		title: 'In-memory state',
		description: 'State lives with the Actor for local reads and writes.',
	},
	{
		icon: Infinity,
		title: 'Runs indefinitely, sleeps when idle',
		description: 'Long-lived when active, hibernates when idle.',
	},
	{
		icon: Layers,
		title: 'Scales to zero, bursts to thousands',
		description: 'Sleeps at near-zero cost when idle, fans out when traffic spikes.',
	},
	{
		icon: Globe,
		title: 'Global edge network',
		description: 'Deploy close to your users without complexity.',
	},
	{
		icon: Wifi,
		title: 'WebSockets',
		description: 'Real-time bidirectional streaming built in.',
	},
	{
		icon: GitBranch,
		title: 'Workflows, Queues, Scheduling',
		description: 'Multi-step operations, durable queues, and timers.',
	},
];

export const ActorsPrimitiveSection = () => (
	<section className={`relative bg-paper ${SITE_SECTION_CLASS}`}>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<div className='max-w-3xl'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					<h2 className={SECTION_H2_CLASS}>One actor per agent, per session, per user.</h2>
				</motion.div>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.05 }}
					className={SUBTITLE_CLASS}
				>
					Rivet Actors give agents and realtime apps durable, stateful processes in your existing Node.js or Bun backend.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='mt-6 flex flex-wrap gap-3'
				>
					<a href='/actors/docs' className={PRIMARY_INK_BUTTON_CLASS}>
						Documentation
					</a>
					<a href='/actors' className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}>
						Details
						<ArrowRight className='h-3.5 w-3.5' />
					</a>
				</motion.div>
			</div>

			<div className='mt-12 grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3'>
				{actorFeatures.map((feature, idx) => {
					const Icon = feature.icon;
					return (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.05 }}
							className='border-t border-ink/10 py-6'
						>
							<Icon className='mb-2 h-4 w-4 text-olive' />
							<h3 className={`mb-1 ${CARD_TITLE_CLASS}`}>{feature.title}</h3>
							<p className={BODY_CLASS}>{feature.description}</p>
						</motion.div>
					);
				})}
			</div>
		</div>
	</section>
);
