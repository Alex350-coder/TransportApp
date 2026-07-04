/** Scroll-reveal variants that collapse to opacity-only under reduced motion. */
import { useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

import { fadeIn, fadeUp, revealViewport, staggerChildren } from '@/lib/motion'

interface RevealPresets {
  item: Variants
  container: Variants
  viewport: typeof revealViewport
}

export function useReveal(): RevealPresets {
  const shouldReduceMotion = useReducedMotion()
  return {
    item: shouldReduceMotion ? fadeIn : fadeUp,
    container: staggerChildren,
    viewport: revealViewport,
  }
}
