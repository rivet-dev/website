'use client';

import { motion } from 'framer-motion';
import { Icon } from '@rivet-gg/icons';
import { products } from '@/sitemap/products';
import { productLogos } from '@/sitemap/productLogos';
import { CatalogCard } from '../editorial/CatalogCard';
import { SectionHeading } from '../typography';

// The catalog index of the product family, foundation-first: Actors is the
// primitive, everything after it builds on an actor. Sits directly under the
// hero so the map of the stack precedes the deep dives.
const stack = [
	{
		index: '01',
		id: 'actors',
		name: 'Actors',
		body: 'The primitive. A durable, stateful process for every agent, session, and user — living in your existing Node.js or Bun backend.',
		href: '/actors',
		highlight: true,
	},
	{
		index: '02',
		id: 'agentos',
		name: 'agentOS',
		body: 'A computer for every agent: filesystem, networking, bash, Python, and Node — running inside an actor. No sandboxes or VMs.',
		href: '/agentos',
		highlight: false,
	},
	{
		index: '03',
		id: 'workflows',
		name: 'Workflows',
		body: 'Durable automation built on actors: multi-step operations, queues, and scheduling that sleep, retry, and survive restarts.',
		href: '/workflows',
		highlight: false,
	},
	{
		index: '04',
		id: 'dynamic-apps',
		name: 'Dynamic Apps',
		body: 'Deploy what agents build: an AI-generated backend for every user, 22 MB per app, scaling to zero and to millions.',
		href: '/dynamic-apps',
		highlight: false,
	},
];

const glyphs = Object.fromEntries(products.map((product) => [product.id, product.icon]));

// The same mark the product page hero shows, at card scale: the SVG wordmark
// glyphs are white-on-transparent so brightness-0 renders them as ink; the
// remaining products carry a Font Awesome mark (see ProductLockup).
const ProductMark = ({ id }: { id: string }) => {
	const logo = productLogos[id];
	if (logo) {
		return (
			<img src={logo.src} alt='' aria-hidden='true' className='h-5 w-5 shrink-0 brightness-0' />
		);
	}
	const icon = glyphs[id];
	return icon ? (
		<Icon icon={icon} aria-hidden='true' className='shrink-0 text-[1.05rem] leading-none text-ink' />
	) : null;
};

export const StackSection = () => (
	<section className='relative border-t border-ink/10 px-6 py-16 md:py-32'>
		<div className='mx-auto w-full max-w-7xl'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5 }}
			>
				<SectionHeading
					title='Four products, one primitive.'
					subtitle='Actors give long-lived software a durable home; agentOS, Workflows, and Dynamic Apps build on them.'
					className='max-w-3xl'
				/>
			</motion.div>
			<div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
				{stack.map((product, idx) => (
					<motion.div
						key={product.name}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: idx * 0.1 }}
					>
						<CatalogCard
							title={
								<span className='flex items-center gap-2.5'>
									<span className='font-mono text-xs text-ink-faint'>{product.index}</span>
									<ProductMark id={product.id} />
									{product.name}
								</span>
							}
							href={product.href}
							linkLabel={`Explore ${product.name}`}
							highlight={product.highlight}
							className='flex h-full flex-col'
						>
							<p className='mt-2 flex-1 text-sm leading-relaxed text-ink-soft'>{product.body}</p>
						</CatalogCard>
					</motion.div>
				))}
			</div>
		</div>
	</section>
);
