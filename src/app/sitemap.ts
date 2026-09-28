import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";
import { getActiveProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, base] = await Promise.all([getActiveProducts(), getBaseUrl()]);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/agenda`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/loja`, changeFrequency: "weekly", priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}/loja/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
