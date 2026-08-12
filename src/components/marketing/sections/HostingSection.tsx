'use client';

import { Package, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { deployOptionsForRole } from '@rivetkit/shared-data';
import imgLogo from '@/images/rivet-logos/icon-white.svg';
import { EYEBROW_CLASS, SECTION_H2_CLASS, SUBTITLE_CLASS } from '../typography';
import { GLOW_PILL_SURFACE_CLASS, handleGlowPillMouseMove } from '../glowPill';
import {
  DEPLOY_CARD_CLASS,
  DEPLOY_CARD_TITLE_CLASS,
  DEPLOY_GHOST_BUTTON_CLASS,
  DEPLOY_WHITE_BUTTON_CLASS,
  TerminalCommand,
} from '../deployKit';

export const HostingSection = () => (
  <section className='border-t border-ink/10 py-16 md:py-32'>
    <div className='mx-auto max-w-7xl px-6'>
      <div className='mb-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`mb-2 ${SECTION_H2_CLASS}`}>Start local. Scale to millions.</h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`max-w-xl ${SUBTITLE_CLASS}`}
        >
          A library in development, a platform in production. Your backend keeps deploying wherever it already does — Rivet connects to it.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch'
      >
        {/* Card 1: Just a Library */}
        <div className={DEPLOY_CARD_CLASS}>
          <div className='mb-3 flex h-6 items-center gap-2.5'>
            <Package className='h-4 w-4 text-olive' />
            <h3 className={DEPLOY_CARD_TITLE_CLASS}>Just a Library</h3>
          </div>
          <p className='text-sm leading-relaxed text-ink-soft'>
            Install a package and run locally. No servers, no infrastructure. Actors run in your process during development.
          </p>
          <div className='flex-1' />
          <div className='mt-6 border-t border-ink/10' />
          <div className='flex flex-col gap-4 pt-6'>
            <TerminalCommand command='npm install rivetkit' />
            <a href='/actors/docs' className={DEPLOY_GHOST_BUTTON_CLASS}>
              Get Started
            </a>
          </div>
        </div>

        {/* Card 2: Rivet Cloud (primary) */}
        <div className={`${DEPLOY_CARD_CLASS} border-ink/20`}>
          <div className='mb-3 flex h-6 items-center gap-2.5'>
            <span className='flex h-4 w-4 items-center justify-center'>
              <img className='h-4 w-4' src={imgLogo.src} alt='Rivet' />
            </span>
            <h3 className={DEPLOY_CARD_TITLE_CLASS}>Rivet Cloud</h3>
          </div>
          <p className='text-sm leading-relaxed text-ink-soft'>
            Fully managed Actors and agentOS on a global edge network. Connects to your existing cloud — Vercel, Railway, AWS, wherever you deploy.
          </p>
          <div className='flex-1' />
          <a
            href='https://dashboard.rivet.dev'
            target='_blank'
            rel='noopener noreferrer'
            className={DEPLOY_WHITE_BUTTON_CLASS}
          >
            Sign Up
          </a>
        </div>

        {/* Card 3: Self-Host */}
        <div className={DEPLOY_CARD_CLASS}>
          <div className='mb-3 flex h-6 items-center gap-2.5'>
            <Server className='h-4 w-4 text-olive' />
            <h3 className={DEPLOY_CARD_TITLE_CLASS}>Self-Host</h3>
          </div>
          <p className='text-sm leading-relaxed text-ink-soft'>
            Single Rust binary or Docker container. Works with Postgres, file system, or FoundationDB (enterprise). Full dashboard included.
          </p>
          <div className='flex-1' />
          <div className='mt-6 border-t border-ink/10' />
          <div className='flex flex-col gap-4 pt-6'>
            <TerminalCommand command='docker run -p 6420:6420 rivetdev/engine' />
            <a href='/actors/self-host/control-plane' className={DEPLOY_GHOST_BUTTON_CLASS}>
              Self-Hosting Docs
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-ink/10 pt-6'
      >
        <span className={`mr-3 ${EYEBROW_CLASS}`}>Your backend deploys to</span>
        {deployOptionsForRole('worker').map(({ displayName, shortTitle, slug }) => (
          <a key={displayName} href={`/actors/self-host/workers/${slug}`} onMouseMove={handleGlowPillMouseMove} className={GLOW_PILL_SURFACE_CLASS}>
            {shortTitle || displayName}
          </a>
        ))}
      </motion.div>
    </div>
  </section>
);
