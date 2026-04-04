import type { MetadataRoute } from "next"
import { useCases } from "./for/[slug]/use-cases"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rumiagent.com"

  const useCaseEntries: MetadataRoute.Sitemap = useCases.map((uc) => ({
    url: `${baseUrl}/for/${uc.slug}`,
    lastModified: new Date("2026-04-02"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...useCaseEntries,
  ]
}
