'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedCTATitle } from '../components/AnimatedCTATitle';
import {
  INK_PANEL_GLASS_BUTTON_CLASS,
  INK_PANEL_LIGHT_BUTTON_CLASS,
} from '../typography';

const FOOTER_PAINTING_SRC =
  'https://assets.rivet.dev/website/images/textures/footer-abstract.webp';

export const RedesignedCTA = () => {
  const reducedMotion = useReducedMotion();

  return (
  <section className='border-t border-ink/10 bg-paper px-4 py-14 text-center md:px-6 md:py-24'>
    <div className='selection-paper relative mx-auto flex min-h-[26rem] max-w-screen-2xl items-center justify-center overflow-hidden rounded-xl border border-ink/10 px-6 py-20 text-cream md:min-h-[34rem] md:px-10 lg:aspect-[2563/1440] lg:min-h-0'>
      <img
        aria-hidden='true'
        src={FOOTER_PAINTING_SRC}
        alt=''
        loading='eager'
        decoding='async'
        className='absolute inset-0 h-full w-full scale-[1.02] object-cover object-center'
      />

      <div className='relative z-[1] mx-auto max-w-3xl'>
        <div className='mb-6'>
          <AnimatedCTATitle />
        </div>
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-9 text-base leading-relaxed text-cream/65'
        >
          Build with agents, build for agents, and run it where your data lives.
        </motion.p>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='flex flex-col items-center justify-center gap-3 sm:flex-row'
        >
          <a
            href='/docs'
            className={INK_PANEL_LIGHT_BUTTON_CLASS}
          >
            Start Building
          </a>
          <a
            href='/talk-to-an-engineer'
            className={INK_PANEL_GLASS_BUTTON_CLASS}
          >
            Talk to an Engineer
          </a>
        </motion.div>
      </div>
    </div>
  </section>
  );
};
