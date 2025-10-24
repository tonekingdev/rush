import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
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
  // Optimize static export
  trailingSlash: true,
  poweredByHeader: false,
}

export default nextConfig