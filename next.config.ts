import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the Next.js dev indicator logo from the bottom-left corner
  devIndicators: false,
  // Allow preview proxy and other local dev tools to connect
  allowedDevOrigins: ["*"],
};

export default nextConfig;
