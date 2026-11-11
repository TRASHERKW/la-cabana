import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatMXN, ORDER_STATUS, serialize } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import ProfileForm from "@/components/ProfileForm";
import Avatar from "@/components/Avatar";
import { User } from "@/models/User";
import { paymentLabel, syncOrderPayment } from "@/lib/mercadopago";

export const metadata = { title: "Mi cuenta" };

type OrderDTO = {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  paid?: boolean;
  mp?: { orderId?: string | null; status?: string | null; checkoutUrl?: string | null };
  items: { name: string; quantity: number; price: number }[];
};

const toneClass = { ok: "bg-emerald-100 text-emerald-800", warn: "bg-amber-100 text-amber-800", bad: "bg-red-100 text-red-700", neutral: "bg-arena text-carbon/70" };

export default async function CuentaPage({ searchParams }: { searchParams: Promise<{ pedido?: string; clave?: string }> }) {
  const session = await requireUser();
  const { pedido, clave } = await searchParams;
  await connectDB();
  // Revisamos con Mercado Pago los pedidos que siguen sin pagar (los más recientes)
  const unpaid = await Order.find({ user: session.id, paid: { $ne: true }, status: { $ne: "cancelado" }, "mp.orderId": { $ne: null } }, "_id")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  await Promise.all(unpaid.map((o) => syncOrderPayment(o._id.toString())));

  const [orderDocs, user] = await Promise.all([
    Order.find({ user: session.id }).sort({ createdAt: -1 }).lean(),
    User.findById(session.id, "name email avatar").lean(),
  ]);
  const orders = serialize<OrderDTO[]>(orderDocs);

  return (
    <div className="container-lc py-14">
      <div className="flex items-center gap-4">
        <Avatar src={user?.avatar} name={session.name} size="h-16 w-16" />
        <div>
          <h1 className="text-4xl text-madera-oscura">Hola, {user?.name ?? session.name}</h1>
          <p className="mt-1 text-carbon/60">{session.email}</p>
        </div>
      </div>

      {clave && (
        <div className="mt-8 rounded-2xl border border-bosque/30 bg-bosque/10 p-5 text-bosque">
          <p className="font-semibold">Contraseña actualizada ✅</p>
          <p className="text-sm">Ya iniciaste sesión con tu nueva contraseña.</p>
        </div>
      )}

      {pedido && (
        <div className="mt-8 rounded-2xl border border-bosque/30 bg-bosque/10 p-5 text-bosque">
          <p className="font-semibold">¡Pedido recibido! 🎉</p>
          <p className="text-sm">Te avisaremos cuando salga. Aquí abajo puedes ver si ya está pagado.</p>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
      <section>
      <h2 className="mb-4 text-2xl text-madera-oscura">Mi perfil</h2>
      <ProfileForm name={user?.name ?? session.name} email={session.email} avatar={user?.avatar ?? ""} />
      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/tus-recetas" className="font-semibold text-brasa hover:underline">Tus recetas →</Link>
        <Link href="/tus-recetas?tab=mias" className="font-semibold text-brasa hover:underline">Mis recetas publicadas →</Link>
      </div>
      </section>
      <section>
      <h2 className="text-2xl text-madera-oscura">Mis pedidos</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-carbon/60">
          Todavía no tienes pedidos. <Link href="/tienda" className="text-brasa hover:underline">Ir a la tienda</Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o._id} className={`card p-5 ${o._id === pedido ? "ring-2 ring-bosque/40" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-carbon/50">#{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-carbon/60">{new Date(o.createdAt).toLocaleDateString("es-MX", { dateStyle: "long" })}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const p = paymentLabel(o);
                    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass[p.tone]}`}>{p.text}</span>;
                  })()}
                  <StatusBadge status={o.status} label={ORDER_STATUS[o.status]} />
                </div>
              </div>
              <ul className="mt-3 text-sm text-carbon/75">
                {o.items.map((i, idx) => (
                  <li key={idx}>{i.quantity} × {i.name}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between gap-3">
                {!o.paid && o.status !== "cancelado" && o.mp?.checkoutUrl ? (
                  <a href={o.mp.checkoutUrl} className="btn-primary !px-4 !py-1.5">Pagar ahora</a>
                ) : (
                  <span />
                )}
                <p className="font-semibold text-madera">{formatMXN(o.total)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      </section>
      </div>
    </div>
  );
}
