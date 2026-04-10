import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutWrapper } from "./components/layout-wrapper"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "RUSH Healthcare - On-Demand Home Healthcare Services",
    template: "%s | RUSH Healthcare",
  },
  description:
    "Connect with certified healthcare professionals for in-home care. RUSH Healthcare provides fast, safe, and convenient on-demand medical services including nursing, physical therapy, and more. HIPAA compliant.",
  keywords: [
    "home healthcare",
    "in-home nursing",
    "medical care at home",
    "on-demand healthcare",
    "HIPAA compliant healthcare",
    "home health aide",
    "physical therapy at home",
    "certified nursing assistant",
    "healthcare professionals",
    "mobile healthcare",
  ],
  authors: [{ name: "RUSH Healthcare" }],
  creator: "RUSH Healthcare",
  publisher: "RUSH Healthcare",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rushhealthcare.com",
    siteName: "RUSH Healthcare",
    title: "RUSH Healthcare - On-Demand Home Healthcare Services",
    description:
      "Connect with certified healthcare professionals for in-home care. Fast, safe, and convenient on-demand healthcare services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RUSH Healthcare - Professional Home Healthcare Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RUSH Healthcare - On-Demand Home Healthcare Services",
    description:
      "Connect with certified healthcare professionals for in-home care. Fast, safe, and convenient on-demand healthcare services.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://rushhealthcare.com",
  },
  category: "Healthcare",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
