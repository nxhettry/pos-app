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
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.86:3000", "http://192.168.1.86:8080"],
};

export default nextConfig;
