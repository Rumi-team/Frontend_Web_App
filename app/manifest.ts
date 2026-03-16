import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rumi — Your Personal Transformational Leader",
    short_name: "Rumi",
    description:
      "Meet Rumi, your AI transformational leader. Proven programs deliver lasting change — 24/7, on your phone.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
