import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/pedido"] },
    sitemap: `${await getBaseUrl()}/sitemap.xml`,
  };
}
