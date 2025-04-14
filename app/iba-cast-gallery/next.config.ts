import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@iba-cast-gallery/dao'],
  webpack: (config, { isServer }) => {
    // TypeORMとの互換性のためにnode.jsポリフィルを追加
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
      };
    }
    return config;
  },
};

export default nextConfig;
