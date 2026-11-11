import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatMXN, ORDER_STATUS, serialize } from "@/lib/utils";
import { updateOrderStatusAction } from "@/app/actions/admin";
import StatusBadge from "@/components/StatusBadge";
import StatusSelect from "@/components/admin/StatusSelect";
import { paymentLabel } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

type OrderRow = {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: { name: string; quantity: number }[];
  shipping: { name: string; phone: string; address: string; notes?: string };
  paid?: boolean;
  mp?: { orderId?: string | null; status?: string | null };
};

const toneClass = { ok: "bg-emerald-100 text-emerald-800", warn: "bg-amber-100 text-amber-800", bad: "bg-red-100 text-red-700", neutral: "bg-arena text-carbon/70" };

export default async function AdminPedidos({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  await connectDB();
  const filter: Record<string, unknown> = estado && ORDER_STATUS[estado] ? { status: estado } : {};
  const orders = serialize<OrderRow[]>(await Order.find(filter).sort({ createdAt: -1 }).populate("user", "name email").lean());

  return (
    <div>
      <h1 className="text-3xl font-semibold text-madera-oscura">Pedidos</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <FilterLink href="/admin/pedidos" active={!estado}>Todos</FilterLink>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <FilterLink key={k} href={`/admin/pedidos?estado=${k}`} active={estado === k}>{v}</FilterLink>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-carbon/50">No hay pedidos aquí.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-carbon/50">#{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleString("es-MX")}</p>
                  <p className="mt-1 font-semibold">{o.user?.name ?? "Usuario eliminado"} <span className="font-normal text-carbon/50">{o.user?.email}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const p = paymentLabel(o);
                    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass[p.tone]}`}>{p.text}</span>;
                  })()}
                  <StatusBadge status={o.status} label={ORDER_STATUS[o.status]} />
                  <StatusSelect id={o._id} status={o.status} action={updateOrderStatusAction} />
                </div>
              </div>
              <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <ul className="text-carbon/75">
                  {o.items.map((i, idx) => <li key={idx}>{i.quantity} × {i.name}</li>)}
                  <li className="mt-2 font-semibold text-madera">Total: {formatMXN(o.total)}</li>
                </ul>
                <div className="rounded-xl bg-crema p-3 text-carbon/75">
                  <p className="font-medium text-carbon">{o.shipping.name} · {o.shipping.phone}</p>
                  <p>{o.shipping.address}</p>
                  {o.shipping.notes && <p className="mt-1 italic">“{o.shipping.notes}”</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full border px-3.5 py-1 text-sm ${active ? "border-madera bg-madera text-crema" : "border-arena bg-papel text-carbon/70"}`}>
      {children}
    </Link>
  );
}
