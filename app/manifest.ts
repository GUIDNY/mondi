import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchMate — ניחושי כדורגל 2026",
    short_name: "MatchMate",
    description: "אפליקציית ניחושי כדורגל 2026",
    start_url: "/",
    display: "standalone",
    background_color: "#061209",
    theme_color: "#061209",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
