import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@iba-cast-gallery/dao",
    "@iba-cast-gallery/types"
  ]
};

export default nextConfig;
