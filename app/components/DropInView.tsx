'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export function DropInView({ children }: { children: React.ReactNode }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{ delay: 0.2, duration: 0.5, ease: 'easeIn' }}
    >
      {children}
    </motion.div>
  )
}