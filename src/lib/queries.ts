import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  defaultShopSettings,
  defaultSiteSettings,
  type ShopSettings,
  type SiteSettings,
} from "./settings-schema";

const { products, events, photos, settings } = schema;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const db = await getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "site"));
  return { ...defaultSiteSettings, ...(row?.value as Partial<SiteSettings> | undefined) };
});

export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  const db = await getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, "shop"));
  return { ...defaultShopSettings, ...(row?.value as Partial<ShopSettings> | undefined) };
});

export const getActiveProducts = cache(async () => {
  const db = await getDb();
  return db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.position), asc(products.id));
});

export const getProductBySlug = cache(async (slug: string) => {
  const db = await getDb();
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)));
  return product;
});

export function today() {
  // Dates are compared in Salvador's time zone, where the events happen.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(new Date());
}

export const getUpcomingEvents = cache(async () => {
  const db = await getDb();
  return db
    .select()
    .from(events)
    .where(and(eq(events.published, true), gte(events.date, today())))
    .orderBy(asc(events.date));
});

export const getPastEvents = cache(async () => {
  const db = await getDb();
  return db
    .select()
    .from(events)
    .where(and(eq(events.published, true), lt(events.date, today())))
    .orderBy(desc(events.date))
    .limit(20);
});

export const getPhotos = cache(async () => {
  const db = await getDb();
  return db.select().from(photos).orderBy(asc(photos.position), asc(photos.id));
});
