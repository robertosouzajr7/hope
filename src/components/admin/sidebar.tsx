"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/login/actions";

const groups = [
  {
    label: "Geral",
    links: [{ href: "/admin", label: "Visão geral", icon: LayoutDashboard }],
  },
  {
    label: "Loja",
    links: [
      { href: "/admin/pedidos", label: "Vendas", icon: ShoppingCart },
      { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
      { href: "/admin/produtos", label: "Produtos", icon: Package },
      { href: "/admin/loja", label: "Configurações da loja", icon: Settings },
    ],
  },
  {
    label: "Site",
    links: [
      { href: "/admin/conteudo", label: "Conteúdo do site", icon: FileText },
      { href: "/admin/agenda", label: "Agenda de shows", icon: CalendarDays },
      { href: "/admin/mensagens", label: "Pedidos de agenda", icon: Inbox },
      { href: "/admin/galeria", label: "Galeria de fotos", icon: Images },
    ],
  },
  {
    label: "Equipe",
    links: [{ href: "/admin/usuarios", label: "Usuários", icon: Users }],
  },
];

export function Sidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-ink px-5 py-3 text-cream md:hidden">
        <span className="font-display text-xl">
          Vocal <em className="text-latte">Hope</em>
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu" className="p-2">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} fixed inset-0 top-[53px] z-20 overflow-y-auto bg-ink text-cream md:sticky md:top-0 md:block md:h-svh md:w-64 md:shrink-0`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <Link href="/admin" className="hidden px-3 font-display text-2xl md:block">
            Vocal <em className="text-latte">Hope</em>
          </Link>
          <p className="hidden px-3 text-xs text-cream/40 md:block">Painel administrativo</p>

          <nav className="mt-8 flex-1 space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.2em] text-cream/35">{group.label}</p>
                <ul className="space-y-0.5">
                  {group.links.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                          isActive(href) ? "bg-cream/10 text-cream" : "text-cream/65 hover:bg-cream/5 hover:text-cream"
                        }`}
                      >
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-8 space-y-1 border-t border-cream/10 pt-4">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/65 hover:text-cream">
              <ExternalLink className="size-4" /> Ver site
            </Link>
            <div className="px-3 pt-2 text-xs text-cream/45">
              <p className="truncate text-cream/80">{user.name}</p>
              <p className="truncate">{user.email}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/65 hover:text-cream">
                <LogOut className="size-4" /> Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
