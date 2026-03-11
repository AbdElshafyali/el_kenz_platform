import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'images.pexels.com', 'plus.unsplash.com'],
  },
};

export default nextConfig;
