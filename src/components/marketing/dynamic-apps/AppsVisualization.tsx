'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Code2, Rocket } from 'lucide-react';

/**
 * The generated-files → deployApp() → running-app visualization, with a toggle
 * to the equivalent code. Lifted out of the retired AppsHero so the page owns
 * its hero markup and this stays the only island in it.
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
			<div className='absolute top-1 right-6 left-0 z-10 h-24 -rotate-6 rounded-lg border border-ink/10 bg-white p-2'>
				<div className='flex items-center gap-1.5'>
					<span className='flex h-5 w-5 items-end justify-end rounded bg-[#f7df1e] p-0.5 text-[7px] font-bold leading-none text-black'>JS</span>
					<span className='font-mono text-[8px] text-ink-soft'>server.js</span>
				</div>
				<div className='mt-3 space-y-1.5'>
					<div className='h-1 w-4/5 rounded-full bg-ink/10' />
					<div className='h-1 w-3/5 rounded-full bg-ink/[0.07]' />
				</div>
			</div>

			<div className='absolute top-4 right-0 left-6 z-20 h-24 rotate-6 rounded-lg border border-ink/10 bg-white p-2'>
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

			<div className='absolute top-7 right-3 left-3 z-30 h-24 rounded-lg border border-ink/10 bg-white p-2'>
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

export const AppsVisualization = ({ highlightedCode }: { highlightedCode: string }) => {
	const [showCode, setShowCode] = useState(false);

	return (
		<div className='overflow-hidden rounded-xl border border-ink/10 bg-white/55'>
			<div className='flex items-center gap-2 border-b border-ink/10 px-4 py-3'>
				<div className='h-3 w-3 rounded-full bg-ink/10' />
				<div className='h-3 w-3 rounded-full bg-ink/10' />
				<div className='h-3 w-3 rounded-full bg-ink/10' />
				<span className={`ml-2 hidden text-xs text-ink-soft sm:inline ${showCode ? 'font-code' : 'font-medium'}`}>{showCode ? 'server.ts' : 'Deploy an AI-generated app'}</span>
				<button
					type='button'
					onClick={() => setShowCode((visible) => !visible)}
					aria-pressed={showCode}
					className='apps-visual-controls ml-auto inline-flex h-7 items-center gap-1.5 rounded-md border border-ink/20 bg-ink/[0.06] px-2.5 text-[11px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-ink/[0.1]'
				>
					<Code2 className='h-3.5 w-3.5' />
					{showCode ? 'Show diagram' : 'Show me the code'}
				</button>
			</div>

			<AnimatePresence mode='wait' initial={false}>
				{showCode ? (
					<motion.div key='apps-code' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className='h-[302px] overflow-auto p-6 font-code text-sm leading-relaxed text-ink-soft sm:h-[318px] [&_.line]:break-all [&_.shiki]:!m-0 [&_.shiki]:!bg-transparent [&_.shiki]:!p-0 [&_.shiki]:font-code [&_.shiki]:text-sm [&_.shiki]:leading-relaxed [&_pre]:whitespace-pre-wrap'>
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

							<div className='min-w-28 rounded-xl border border-pine/20 bg-white px-4 py-4 text-center ring-1 ring-pine/[0.04]'>
								<Rocket className='mx-auto h-5 w-5 text-pine' />
								<p className='mt-2 text-[9px] font-medium uppercase tracking-[0.1em] text-ink-soft'>Deploy app</p>
								<p className='mt-1 font-mono text-[11px] font-medium text-ink'>deployApp()</p>
							</div>

							<div className='flex items-center justify-center text-pine/55'>
								<ArrowRight className='h-6 w-8 rotate-90 md:rotate-0' />
							</div>

							<div className='mx-auto w-full max-w-[12rem] overflow-hidden rounded-lg border border-ink/10 bg-white'>
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
