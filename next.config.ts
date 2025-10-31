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
};

export default nextConfig;
