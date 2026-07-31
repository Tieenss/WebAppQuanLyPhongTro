import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep file tracing inside this repository when parent folders have other lockfiles.
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
};

export default nextConfig;
