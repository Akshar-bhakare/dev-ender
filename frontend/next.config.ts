import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This is for Next.js 15+
  },
  allowedDevOrigins: ['172.20.10.3']
};

export default nextConfig;
