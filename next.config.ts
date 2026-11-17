import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep Next.js anchored to this folder (there is another package-lock.json higher up).
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
