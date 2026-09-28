"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { createSession, destroySession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

type LoginState = { error?: string; email?: string };

// Basic brute-force protection: 5 failed attempts per e-mail locks it for 10 minutes.
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const record = attempts.get(email);
  if (record && record.until > Date.now()) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente.", email };
  }

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    const count = (record?.count ?? 0) + 1;
    attempts.set(email, { count, until: count >= 5 ? Date.now() + 10 * 60 * 1000 : 0 });
    return { error: "E-mail ou senha incorretos.", email };
  }

  attempts.delete(email);
  await createSession(user.id);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
