import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🧾" },
  { href: "/admin/productos", label: "Productos", icon: "🧺" },
  { href: "/admin/recetas", label: "Recetas", icon: "📖" },
  { href: "/admin/blog", label: "Blog", icon: "📝" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-lc grid gap-8 py-10 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-24 md:h-fit">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-carbon/40">Panel admin</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-madera/10">
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
