"use client"

import type React from "react"
import "./globals.css"
import { Inter, Poppins } from "next/font/google"
import { usePathname } from "next/navigation"
import Header from "./components/header"
import BackToTop from "./components/BackToTop"
import Footer from "./components/footer"
import LaunchNotification from "./components/LaunchNotification"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`} suppressHydrationWarning={true}>
        <LaunchNotification />
        <div className="flex flex-col min-h-screen">
          {!isAdminRoute && <Header />}
          <main className={`${poppins.className} flex-grow`}>{children}</main>
          <BackToTop />
          {!isAdminRoute && <Footer />}
        </div>
      </body>
    </html>
  )
}