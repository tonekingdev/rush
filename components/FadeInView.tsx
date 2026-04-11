"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"

interface FadeInViewProps {
  children: ReactNode
}

export const FadeInView = ({ children }: FadeInViewProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setIsVisible(entry.isIntersecting))
    })

    const currentElement = domRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])

  return (
    <div
      className={`fade-in ${isVisible ? "active" : ""}`}
      ref={domRef}
      style={{
        transition: "opacity 1s ease-in-out",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}