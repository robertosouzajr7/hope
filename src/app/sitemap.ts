import type { MetadataRoute } from "next";
import { products } from "@/content/products";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/agenda`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/loja`, changeFrequency: "weekly", priority: 0.8 },
    ...products.map((p) => ({
      url: `${site.url}/loja/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
