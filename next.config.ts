import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add environment variable configuration
  env: {
    NEXT_PUBLIC_API_URL: "https://rushhealthc.com/api",
  },
  // Optimize deployment
  poweredByHeader: false,
}

export default nextConfig
