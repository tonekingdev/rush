'use client'

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function FadeInView({ children }: { children: React.ReactNode }) {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    })
  
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeIn" }}
      >
        {children}
      </motion.div>
    )
  }