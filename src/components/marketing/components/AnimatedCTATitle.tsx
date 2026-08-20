'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SECTION_H2_BASE_CLASS } from '../typography';

// Renders inside the dark colophon band, so the title is cream.
export function AnimatedCTATitle() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.h2
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`${SECTION_H2_BASE_CLASS} text-cream`}
    >
      Infrastructure for <br />
      the agentic era.
    </motion.h2>
  );
}
