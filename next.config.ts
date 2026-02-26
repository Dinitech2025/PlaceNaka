import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '100.70.249.11',
        port: '9000',
        pathname: '/placenaka/**',
      },
      {
        protocol: 'http',
        hostname: '100.70.249.11',
        port: '9002',
        pathname: '/placenaka/**',
      },
    ],
  },
};

export default nextConfig;
