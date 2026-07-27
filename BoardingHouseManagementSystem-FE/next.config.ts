import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep file tracing inside this repository when parent folders have other lockfiles.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
