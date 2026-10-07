import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography on /about is hotlinked from Unsplash.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
