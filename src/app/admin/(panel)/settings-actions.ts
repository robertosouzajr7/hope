"use server";

import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";
import type { ActionResult } from "@/components/admin/form";
import { requireUser } from "@/lib/auth";
import { parseMoney, splitList } from "@/lib/money";
import { getShopSettings, getSiteSettings } from "@/lib/queries";
import type { ShopSettings, SiteSettings } from "@/lib/settings-schema";
import { hasFile, saveImage, UploadError } from "@/lib/storage";

async function save(key: "site" | "shop", value: SiteSettings | ShopSettings) {
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

async function imageField(formData: FormData, key: string, current: string | null) {
  if (formData.get(`${key}Remove`) === "on") return null;
  const file = formData.get(`${key}File`);
  return hasFile(file) ? saveImage(file, "site") : current;
}

export async function saveSiteSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const current = await getSiteSettings();

  const pillars = [0, 1, 2, 3, 4, 5]
    .map((i) => ({ title: str(formData, `pillarTitle${i}`), text: str(formData, `pillarText${i}`) }))
    .filter((p) => p.title);

  try {
    const next: SiteSettings = {
      ...current,
      name: str(formData, "name") || current.name,
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      city: str(formData, "city"),
      foundedYear: Number(str(formData, "foundedYear")) || current.foundedYear,
      email: str(formData, "email"),
      whatsapp: str(formData, "whatsapp").replace(/\D/g, ""),
      instagram: str(formData, "instagram"),
      youtube: str(formData, "youtube"),
      spotify: str(formData, "spotify"),
      aboutTitle: str(formData, "aboutTitle"),
      aboutLead: str(formData, "aboutLead"),
      aboutText: str(formData, "aboutText"),
      singleTitle: str(formData, "singleTitle"),
      singleYear: Number(str(formData, "singleYear")) || current.singleYear,
      singleDescription: str(formData, "singleDescription"),
      singleYoutubeId: extractYoutubeId(str(formData, "singleYoutubeId")),
      singleSpotifyTrackId: extractSpotifyId(str(formData, "singleSpotifyTrackId")),
      pillars,
      influences: splitList(str(formData, "influences")),
      heroImage: await imageField(formData, "heroImage", current.heroImage),
      aboutImage: await imageField(formData, "aboutImage", current.aboutImage),
    };
    await save("site", next);
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, message: error.message };
    throw error;
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Conteúdo salvo e publicado no site." };
}

// Accepts a full YouTube URL or just the video id.
function extractYoutubeId(value: string) {
  const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return match?.[1] ?? value;
}

// Accepts a Spotify track URL or just the track id.
function extractSpotifyId(value: string) {
  const match = value.match(/track\/([A-Za-z0-9]+)/);
  return match?.[1] ?? value;
}

export async function saveShopSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const current = await getShopSettings();
  const fee = parseMoney(str(formData, "shippingFee"));
  if (fee === null) return { ok: false, message: "Informe um valor de frete válido (use 0 para frete grátis)." };

  const next: ShopSettings = {
    ...current,
    shippingEnabled: formData.get("shippingEnabled") === "on",
    shippingFee: fee,
    pickupEnabled: formData.get("pickupEnabled") === "on",
    pickupInfo: str(formData, "pickupInfo"),
    notice: str(formData, "notice"),
  };
  if (!next.shippingEnabled && !next.pickupEnabled) {
    return { ok: false, message: "Ative pelo menos uma forma de entrega." };
  }
  await save("shop", next);
  revalidatePath("/", "layout");
  return { ok: true, message: "Configurações da loja salvas." };
}
