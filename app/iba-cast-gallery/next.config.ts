import type { NextConfig } from "next";

const allowedOrigins =  (process.env.NODE_ENV === 'development' ? ['localhost:3000','turbo-giggle-x4www9v94v36x5w-3000.app.github.dev'] : ['https://iba-cast-gallery.vercel.app']);

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: true, //エラー調査のため一時的に
  transpilePackages: [
    "@iba-cast-gallery/dao",
    "@iba-cast-gallery/types"
  ],
  experimental: {
    serverActions:{
      allowedOrigins: allowedOrigins
    }
  }
};

export default nextConfig;
