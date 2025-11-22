import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd36mxiodymuqjm.cloudfront.net',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 95],
    minimumCacheTTL: 31536000, // 1 year - card images don't change
  },
  cacheComponents: true,
  cacheLife: {
    default: {
      stale: 30, // 30 seconds
      revalidate: 60, // 1 minute
      expire: 3600, // 1 hour
    },
    status: {
      stale: 30, // 30 seconds
      revalidate: 60, // 1 minute
      expire: 900, // 15 minutes - daily quests change often
    },
    cardDetails: {
      stale: 3600, // 1 hour
      revalidate: 7200, // 2 hours
      expire: 86400, // 24 hours - card metadata is static
    },
  },
};

export default nextConfig;
