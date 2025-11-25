import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MICROCMS_SERVICE_DOMAIN: process.env.MICROCMS_SERVICE_DOMAIN,
    MICROCMS_API_KEY: process.env.MICROCMS_API_KEY,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
        pathname: '/assets/**',
      },
    ],
  },
    experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;