import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = {
  title: { default: "Painel · Vocal Hope", template: "%s · Painel Vocal Hope" },
  robots: { index: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();

  return (
    <div className="min-h-svh bg-[#f7f3ec] text-ink md:flex">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
