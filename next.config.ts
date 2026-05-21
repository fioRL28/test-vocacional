import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "unprecious-ling-transfusive.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
      allowedOrigins: [
        "unprecious-ling-transfusive.ngrok-free.dev",
        "*.ngrok-free.app",
        "*.ngrok-free.dev",
        "*.ngrok.app",
      ],
    },
  },
};

export default nextConfig;
