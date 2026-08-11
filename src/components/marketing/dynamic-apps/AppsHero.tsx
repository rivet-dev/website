'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
	PRODUCT_HERO_CTA_ROW_CLASS,
	PRODUCT_HERO_PRIMARY_BUTTON_CLASS,
	PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
} from '@/components/marketing/typography';
import { ProductLockup } from '@/components/marketing/ProductLockup';
import { getProduct } from '@/sitemap/products';
import {
	AppWindow,
	ArrowRight,
	CalendarClock,
	Code2,
	Database,
	Rocket,
	Users,
	Workflow,
} from 'lucide-react';

/**
 * The Apps section, lifted out of the agentOS overview.
 *
 * Deploying a generated app per user is the Dynamic Apps product, not an
 * agentOS feature, so the section lives with the product it describes. agentOS
 * remains what it runs on.
 */
export const APPS_CODE = `import { anthropic } from "@ai-sdk/anthropic";
import { appsRouter, deployApp } from "@rivet-dev/agentos-apps";
import { generateText, Output } from "ai";
import { Hono } from "hono";
import { z } from "zod";

// Part A: Use the AI SDK to generate and deploy an app.
const { output } = await generateText({
  model: anthropic("claude-sonnet-4-5"),
  output: Output.object({
    schema: z.object({
      files: z.record(z.string(), z.string()),
    }),
  }),
  prompt: "Build a team board as a complete web app.",
});

await deployApp({
  appId: "team-board",
  files: output.files,
});

// Part B: Route requests to every deployed app with Hono.
const server = new Hono();
server.route("/apps", appsRouter);

export default server;`;

const AppsSourceStack = () => (
	<div className='flex flex-col items-center justify-center'>
		<p className='mb-2 text-[10px] font-medium text-ink'>Generated files</p>
		<div className='relative h-36 w-full max-w-[9.5rem]'>
			<div className='absolute top-1 right-6 left-0 z-10 h-24 -rotate-6 rounded-lg border border-ink/10 bg-white p-2 shadow-[0_8px_20px_-14px_rgba(20,20,22,0.4)]'>
				<div className='flex items-center gap-1.5'>
					<span className='flex h-5 w-5 items-end justify-end rounded bg-[#f7df1e] p-0.5 text-[7px] font-bold leading-none text-black'>JS</span>
					<span className='font-mono text-[8px] text-ink-soft'>server.js</span>
				</div>
				<div className='mt-3 space-y-1.5'>
					<div className='h-1 w-4/5 rounded-full bg-ink/10' />
					<div className='h-1 w-3/5 rounded-full bg-ink/[0.07]' />
				</div>
			</div>

			<div className='absolute top-4 right-0 left-6 z-20 h-24 rotate-6 rounded-lg border border-ink/10 bg-white p-2 shadow-[0_8px_20px_-14px_rgba(20,20,22,0.4)]'>
				<div className='flex items-center gap-1.5'>
					<span className='flex h-5 w-5 items-center justify-center rounded bg-[#eef7ed]'>
						<img src='/images/registry/nodejs.svg' alt='' aria-hidden='true' className='h-3.5 w-3.5 object-contain' />
					</span>
					<span className='font-mono text-[8px] text-ink-soft'>api.ts</span>
				</div>
				<div className='mt-3 space-y-1.5'>
					<div className='h-1 w-3/4 rounded-full bg-ink/10' />
					<div className='h-1 w-1/2 rounded-full bg-ink/[0.07]' />
				</div>
			</div>

			<div className='absolute top-7 right-3 left-3 z-30 h-24 rounded-lg border border-ink/10 bg-white p-2 shadow-[0_10px_24px_-15px_rgba(20,20,22,0.48)]'>
				<div className='flex items-center gap-1.5'>
					<span className='flex h-5 w-5 items-center justify-center rounded bg-[#eaf8fc] text-sm leading-none text-[#149eca]'>⚛</span>
					<span className='font-mono text-[8px] text-ink-soft'>App.tsx</span>
				</div>
				<div className='mt-3 space-y-1.5'>
					<div className='h-1 w-5/6 rounded-full bg-ink/10' />
					<div className='h-1 w-2/3 rounded-full bg-ink/[0.07]' />
					<div className='h-1 w-3/4 rounded-full bg-ink/[0.07]' />
				</div>
			</div>
		</div>
	</div>
);

const AppsVisualization = ({ highlightedCode }: { highlightedCode: string }) => {
	const [showCode, setShowCode] = useState(false);

	return (
		<div className='overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50'>
			<div className='flex items-center gap-2 border-b border-zinc-200 px-4 py-3'>
				<div className='h-3 w-3 rounded-full bg-zinc-200' />
				<div className='h-3 w-3 rounded-full bg-zinc-200' />
				<div className='h-3 w-3 rounded-full bg-zinc-200' />
				<span className={`ml-2 hidden text-xs text-zinc-700 sm:inline ${showCode ? 'font-code' : 'font-medium'}`}>{showCode ? 'server.ts' : 'Deploy an AI-generated app'}</span>
				<button
					type='button'
					onClick={() => setShowCode((visible) => !visible)}
					aria-pressed={showCode}
					className='ml-auto inline-flex h-7 items-center gap-1.5 rounded-md border border-ink/20 bg-ink/[0.06] px-2.5 text-[11px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-ink/[0.1]'
				>
					<Code2 className='h-3.5 w-3.5' />
					{showCode ? 'Show diagram' : 'Show me the code'}
				</button>
			</div>

			<AnimatePresence mode='wait' initial={false}>
				{showCode ? (
					<motion.div key='apps-code' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className='h-[302px] overflow-auto p-6 font-code text-sm leading-relaxed text-zinc-600 sm:h-[318px] [&_.line]:break-all [&_.shiki]:!m-0 [&_.shiki]:!bg-transparent [&_.shiki]:!p-0 [&_.shiki]:font-code [&_.shiki]:text-sm [&_.shiki]:leading-relaxed [&_pre]:whitespace-pre-wrap'>
						<span
							className='not-prose code'
							// biome-ignore lint/security/noDangerouslySetInnerHtml: generated at Astro render time
							dangerouslySetInnerHTML={{ __html: highlightedCode }}
						/>
					</motion.div>
				) : (
					<motion.div key='apps-visual' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className='p-4 sm:p-6'>
			<div className='grid min-h-[270px] gap-3 md:grid-cols-[9.5rem_2rem_7rem_2rem_12rem] md:items-center md:justify-center'>
				<AppsSourceStack />

				<div className='flex items-center justify-center text-pine/55'>
					<ArrowRight className='h-6 w-8 rotate-90 md:rotate-0' />
				</div>

				<div className='min-w-28 rounded-xl border border-pine/20 bg-white px-4 py-4 text-center ring-1 ring-pine/[0.04] shadow-[0_12px_28px_-18px_rgba(20,20,22,0.5)]'>
					<Rocket className='mx-auto h-5 w-5 text-pine' />
					<p className='mt-2 text-[9px] font-medium uppercase tracking-[0.1em] text-ink-soft'>Deploy app</p>
					<p className='mt-1 font-mono text-[11px] font-medium text-ink'>deployApp()</p>
				</div>

				<div className='flex items-center justify-center text-pine/55'>
					<ArrowRight className='h-6 w-8 rotate-90 md:rotate-0' />
				</div>

				<div className='mx-auto w-full max-w-[12rem] overflow-hidden rounded-lg border border-ink/10 bg-white shadow-[0_10px_26px_-18px_rgba(20,20,22,0.45)]'>
					<div className='flex items-center gap-1.5 border-b border-ink/10 bg-ink/[0.025] px-2 py-1.5'>
						<div className='flex shrink-0 items-center gap-1' aria-hidden='true'>
							<span className='h-1.5 w-1.5 rounded-full bg-ink/15' />
							<span className='h-1.5 w-1.5 rounded-full bg-ink/15' />
							<span className='h-1.5 w-1.5 rounded-full bg-ink/15' />
						</div>
						<div className='min-w-0 flex-1 truncate rounded border border-ink/10 bg-white px-1.5 py-0.5 font-mono text-[7px] text-ink-faint'>apps.acme.dev/board</div>
					</div>
					<div className='h-36 p-2.5'>
						<div className='flex items-center justify-between'>
							<span className='text-[9px] font-semibold tracking-[-0.01em] text-ink'>Your app</span>
							<span className='rounded-full bg-pine/[0.08] px-1.5 py-0.5 text-[6px] font-medium text-pine'>3 tasks</span>
						</div>
						<div className='mt-2.5 grid grid-cols-3 gap-1.5'>
							{['To do', 'Doing', 'Done'].map((label, columnIndex) => (
								<div key={label} className='rounded border border-ink/[0.07] bg-paper p-1.5'>
									<p className='text-[6px] font-medium text-ink-faint'>{label}</p>
									<div className='mt-1.5 space-y-1'>
										{Array.from({ length: columnIndex === 0 ? 2 : 1 }).map((_, taskIndex) => (
											<div key={taskIndex} className='rounded border border-ink/[0.07] bg-white p-1'>
												<div className={`h-1 rounded-full ${columnIndex === 1 ? 'w-4/5 bg-pine/20' : 'w-full bg-ink/10'}`} />
												<div className='mt-1 h-1 w-3/5 rounded-full bg-ink/[0.06]' />
														</div>
													))}
												</div>
											</div>
										))}
									</div>
									</div>
									</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

const appsFeatures = [
	{ icon: AppWindow, title: 'REST APIs & frontends', description: 'Serve APIs and generated interfaces from the same application.' },
	{ icon: Database, title: 'SQLite', description: 'Store durable application data in an actor-owned SQLite database.' },
	{ icon: Workflow, title: 'Workflows & queues', description: 'Run durable jobs that can sleep, retry, resume, and process queued work.' },
	{ icon: CalendarClock, title: 'Crons & schedules', description: 'Schedule recurring application work while idle instances sleep.' },
	{ icon: Users, title: 'Multiplayer', description: 'Share realtime state between every user connected to an application.' },
];

export const AppsHero = ({
	highlightedCode,
	docsHref,
}: {
	highlightedCode: string;
	docsHref: string;
}) => {
	const product = getProduct('dynamic-apps');

	return (
	<>
	<section className='relative flex min-h-[68svh] flex-col items-center justify-center overflow-hidden bg-paper px-6 py-16 md:py-20'>
		<div className='mx-auto w-full max-w-5xl'>
			<div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
				{product && (
					<div className='mb-7 flex'>
						<ProductLockup product={product} />
					</div>
				)}
				<h1 className='mb-4 max-w-4xl text-balance text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-ink md:text-5xl'>
					{product?.description}
				</h1>
				<p className='mb-7 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg'>
					Scales to 0, scales to millions. Dirt cheap, just 22 MB per app. Deploy on any cloud.
				</p>
				<div className={PRODUCT_HERO_CTA_ROW_CLASS}>
					<a href={docsHref} className={PRODUCT_HERO_PRIMARY_BUTTON_CLASS}>
						Documentation
						<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
					</a>
					<a
						href="/talk-to-an-engineer"
						className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
					>
						Talk to an engineer
					</a>
				</div>
			</div>
		</div>
	</section>

	<section className='border-t border-ink/10 bg-paper px-6 py-20 md:py-28'>
		<div className='mx-auto w-full max-w-7xl'>
			<div className='grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16'>
				<div>
					<ul className='space-y-4'>
						{appsFeatures.map((feature) => {
							const Icon = feature.icon;
							return (
								<li key={feature.title} className='flex items-start gap-3'>
									<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-white/55 text-pine'>
										<Icon className='h-4 w-4' />
									</span>
									<div>
										<h2 className='text-sm font-medium text-ink'>{feature.title}</h2>
										<p className='mt-0.5 text-xs leading-relaxed text-ink-soft'>{feature.description}</p>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
				<div className='min-w-0'>
					<AppsVisualization highlightedCode={highlightedCode} />
				</div>
			</div>
		</div>
	</section>
	</>
	);
};

