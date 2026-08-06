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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "supports-color": false,
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
