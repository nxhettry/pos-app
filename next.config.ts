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
  allowedDevOrigins: ["http://localhost:3000", "http://nishans-macbook-air-1.tail4a0a4d.ts.net:3000", "nishans-macbook-air-1.tail4a0a4d.ts.net"],
};

export default nextConfig;
