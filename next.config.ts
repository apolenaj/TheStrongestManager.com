import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // camera=(self) required for technique pose capture; block mic/geo by default.
    value: "camera=(self), microphone=(), geolocation=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  // Locale folders can make @next/next/no-html-link-for-pages explode with
  // duplicate reports; keep CI typecheck + tests as the gate for now.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance 2.0 — image pipeline (AVIF/WebP) for future bitmaps / OG assets.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Technique uploads allow up to 100 MiB; keep headroom for multipart overhead.
    serverActions: {
      bodySizeLimit: "110mb",
    },
  },
  // MediaPipe Pose Landmarker is client-only; keep Next from optimizing WASM oddly.
  serverExternalPackages: ["@mediapipe/tasks-vision", "pdfkit"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Long-cache hashed Next static assets (JS/CSS/media).
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Service worker must revalidate; do not long-cache SW script.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
