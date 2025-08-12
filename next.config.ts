import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://192.168.1.95:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
