import type { MetadataRoute } from "next";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

/**
 * Web app manifest — installable PWA (Prompt 184).
 * Empty when flag off so we do not advertise install without SW support.
 */
export default function manifest(): MetadataRoute.Manifest {
  if (!featureFlags.pwaReadiness) {
    return {
      name: siteConfig.name,
      short_name: "TSM",
      start_url: "/",
      display: "browser",
    };
  }

  return {
    name: siteConfig.name,
    short_name: "TSM",
    description: siteConfig.description,
    start_url: "/app/today",
    scope: "/",
    display: "standalone",
    background_color: "#0f1412",
    theme_color: "#1a3a2e",
    orientation: "portrait-primary",
    categories: ["fitness", "health", "sports"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
