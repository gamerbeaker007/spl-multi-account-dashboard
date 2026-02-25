import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Disable image optimization to stay on free tier
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd36mxiodymuqjm.cloudfront.net',
        pathname: '/**',
      },
    ],
  },
  cacheComponents: true,
};

export default nextConfig;
