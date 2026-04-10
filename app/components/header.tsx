"use client"

import Link from "next/link"
import { SlMenu } from "react-icons/sl"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { Container } from "@/components/ui/container"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault()
    const href = e.currentTarget.href
    const targetId = href.replace(/.*\#/, "")
    const elem = document.getElementById(targetId)
    if (elem) {
      const offsetTop =
        elem.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container size="xl">
        <div className="flex items-center justify-between py-4 md:justify-start md:gap-10">
          {/* Logo */}
          <div className="flex items-center gap-2 lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="sr-only">RUSH Healthcare</span>
              <Image
                src="/img/logo.png"
                alt="RUSH Logo"
                width={32}
                height={40}
                className="h-8 w-auto sm:h-10"
              />
              <span className="hidden font-heading text-xl font-bold text-foreground sm:inline-block">
                RUSH
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-my-2 -mr-2 flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              <SlMenu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden gap-8 md:flex" role="navigation">
            <Link
              href="#how-it-works"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleScroll}
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleScroll}
            >
              Benefits
            </Link>
            <Link
              href="#for-professionals"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleScroll}
            >
              For Professionals
            </Link>
            <Link
              href="#compliance"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleScroll}
            >
              Compliance
            </Link>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center justify-end gap-4 md:flex md:flex-1 lg:w-0">
            <ThemeToggle />
            <Link
              href="/survey"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-[#1586D6] px-4 py-2 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`${isMobileMenuOpen ? "block" : "hidden"} border-t border-border md:hidden`}
      >
        <nav className="space-y-1 px-4 pb-3 pt-2" role="navigation">
          <Link
            href="#how-it-works"
            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
            onClick={handleScroll}
          >
            How It Works
          </Link>
          <Link
            href="#benefits"
            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
            onClick={handleScroll}
          >
            Benefits
          </Link>
          <Link
            href="#for-professionals"
            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
            onClick={handleScroll}
          >
            For Professionals
          </Link>
          <Link
            href="#compliance"
            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
            onClick={handleScroll}
          >
            Compliance
          </Link>
          <Link
            href="/survey"
            className="mt-2 block w-full rounded-md bg-[#1586D6] px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  )
}
