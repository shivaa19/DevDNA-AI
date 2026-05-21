import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.leetcode.com',
      },
      {
        protocol: 'https',
        hostname: 'leetcode.com',
      },
    ],
  },
};

export default nextConfig;
