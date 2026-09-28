import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a WASM build of Postgres that must be loaded from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [new URL("https://*.public.blob.vercel-storage.com/**")],
  },
  experimental: {
    serverActions: {
      // Image uploads from the admin panel.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
