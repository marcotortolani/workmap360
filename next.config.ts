import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.module.exprContextCritical = false
    return config
  },
  images: {
    // minimumCacheTTL: 60,
    // formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
