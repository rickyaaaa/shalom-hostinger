import type { NextConfig } from "next";
import { vercelPreviewOrigins } from "./scripts/vercel-preview-origin";
import { wordpressEnvironment } from "./scripts/wordpress-environment";

const wordpress = new URL(wordpressEnvironment(process.env).site);

const config: NextConfig = {
  poweredByHeader: false,
  // These two origins are public configuration; never include secrets in Next env.
  ...(process.env.VERCEL_ENV === "preview" ? { env: vercelPreviewOrigins(process.env) } : {}),
  experimental: {
    // The stylesheet is small (~7 KiB gzip); inlining removes the render-blocking request on mobile.
    inlineCss: true,
  },
  images: {
    qualities: [60, 75],
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(wordpress.hostname),
    remotePatterns: [{
      protocol: wordpress.protocol === "http:" ? "http" : "https",
      hostname: wordpress.hostname,
      port: wordpress.port,
      pathname: "/wp-content/uploads/**",
      search: "",
    }],
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
};
export default config;
