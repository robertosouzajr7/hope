"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { BookingStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { bookingStatusLabels } from "@/lib/catalog";

export async function setBookingStatus(id: number, formData: FormData) {
  await requireUser();
  const status = String(formData.get("status")) as BookingStatus;
  if (!(status in bookingStatusLabels)) return;
  const db = await getDb();
  await db.update(schema.bookingRequests).set({ status }).where(eq(schema.bookingRequests.id, id));
  revalidatePath("/admin/mensagens");
}

export async function deleteBooking(id: number) {
  await requireUser();
  const db = await getDb();
  await db.delete(schema.bookingRequests).where(eq(schema.bookingRequests.id, id));
  revalidatePath("/admin/mensagens");
}
