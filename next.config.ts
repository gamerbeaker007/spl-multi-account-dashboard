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
    playerCardCollection: {
      stale: 300, // 5 minutes
      revalidate: 600, // 10 minutes
      expire: 3600, // 1 hour - collection doesn't change often
    },
    cardDetails: {
      stale: 3600, // 1 hour
      revalidate: 7200, // 2 hours
      expire: 86400, // 24 hours - card metadata is static
    },
  },
};

export default nextConfig;
