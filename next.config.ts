import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',        // static export → deploy anywhere (Vercel, GitHub Pages)
  trailingSlash: true,
}

export default nextConfig
