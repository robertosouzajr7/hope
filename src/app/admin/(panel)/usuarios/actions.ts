"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ActionResult } from "@/components/admin/form";
import { requireUser, revokeOtherSessions } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

const { users } = schema;

export async function createUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: "Informe nome e e-mail válidos." };
  if (password.length < 8) return { ok: false, message: "A senha precisa ter pelo menos 8 caracteres." };

  const db = await getDb();
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (exists) return { ok: false, message: "Já existe um usuário com esse e-mail." };

  await db.insert(users).values({ name, email, passwordHash: await hashPassword(password) });
  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Acesso criado para ${email}.` };
}

export async function deleteUser(id: number) {
  const me = await requireUser();
  if (me.id === id) return;
  const db = await getDb();
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/usuarios");
}

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const me = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { ok: false, message: "A nova senha precisa ter pelo menos 8 caracteres." };

  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, me.id));
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { ok: false, message: "Senha atual incorreta." };
  }
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, me.id));
  await revokeOtherSessions(me.id);
  return { ok: true, message: "Senha alterada. Entre novamente nos outros dispositivos." };
}
