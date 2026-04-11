"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Header from "../app/components/header"
import Footer from "../app/components/footer"
import BackToTop from "./BackToTop"
import LaunchNotification from "../app/components/LaunchNotification"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <>
      <LaunchNotification />
      <div className="flex min-h-screen flex-col">
        {!isAdminRoute && <Header />}
        <main className="flex-grow">{children}</main>
        <BackToTop />
        {!isAdminRoute && <Footer />}
      </div>
    </>
  )
}
