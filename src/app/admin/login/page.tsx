import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar · Painel Vocal Hope",
  robots: { index: false },
};

export default async function LoginPage(props: PageProps<"/admin/login">) {
  if (await getCurrentUser()) redirect("/admin");
  const { next } = await props.searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-5 text-ink">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-3xl">
          Vocal <em className="text-cocoa">Hope</em>
        </p>
        <p className="mt-1 text-center text-sm text-ink/55">Painel administrativo</p>
        <LoginForm next={typeof next === "string" ? next : ""} />
      </div>
    </div>
  );
}
