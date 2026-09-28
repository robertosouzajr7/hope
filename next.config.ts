import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (see Dockerfile).
  output: "standalone",
  outputFileTracingIncludes: {
    // Migrations are applied at startup; the WASM build is needed when no DATABASE_URL is set.
    "/*": ["./drizzle/**/*", "./node_modules/@electric-sql/pglite/dist/**/*"],
  },
  // PGlite ships a WASM build of Postgres that must be loaded from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [new URL("https://*.public.blob.vercel-storage.com/**")],
  },
  experimental: {
    serverActions: {
      // Photos are optimized in the browser before upload; this leaves headroom.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
