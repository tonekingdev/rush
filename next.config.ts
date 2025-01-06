const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*.php',
      },
    ]
  },
}

module.exports = nextConfig