import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { syncOrderPayment } from "@/lib/mercadopago";
import { formatMXN } from "@/lib/utils";

export const metadata = { title: "Estado de tu pago" };
export const dynamic = "force-dynamic";

/** Página a la que Mercado Pago regresa al cliente (pagó, falló o quedó pendiente). */
export default async function PagoResultado({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
  const session = await requireUser();
  const { pedido } = await searchParams;
  if (!pedido || !isValidObjectId(pedido)) notFound();

  await connectDB();
  const order = await syncOrderPayment(pedido);
  if (!order || order.user.toString() !== session.id) notFound();

  const code = `#${order._id.toString().slice(-6).toUpperCase()}`;
  const view = order.paid
    ? { icon: "🎉", title: "¡Pago recibido!", text: `Tu pedido ${code} ya está pagado y lo estamos preparando.`, tone: "bg-emerald-50 text-emerald-900" }
    : order.status === "cancelado"
      ? { icon: "😕", title: "El pago no se completó", text: `El pedido ${code} se canceló y los productos regresaron a la tienda. Puedes volver a intentarlo cuando quieras.`, tone: "bg-red-50 text-red-900" }
      : { icon: "⏳", title: "Estamos esperando tu pago", text: `Si pagaste con OXXO o SPEI puede tardar un rato en reflejarse. Tu pedido ${code} queda apartado por 24 horas.`, tone: "bg-amber-50 text-amber-900" };

  return (
    <div className="container-lc grid min-h-[60vh] place-items-center py-16">
      <div className="card w-full max-w-lg overflow-hidden text-center animate-rise">
        <div className={`px-8 py-10 ${view.tone}`}>
          <p className="text-6xl">{view.icon}</p>
          <h1 className="mt-4 text-3xl">{view.title}</h1>
          <p className="mt-2 text-sm opacity-80">{view.text}</p>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm text-carbon/60">
            Total: <span className="font-semibold text-madera">{formatMXN(order.total)}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {!order.paid && order.status !== "cancelado" && order.mp?.checkoutUrl && (
              <a href={order.mp.checkoutUrl} className="btn-primary">Ir a pagar</a>
            )}
            {!order.paid && order.status !== "cancelado" && (
              <Link href={`/pago/resultado?pedido=${pedido}`} className="btn-ghost">Ya pagué, revisar de nuevo</Link>
            )}
            {order.status === "cancelado" && <Link href="/tienda" className="btn-primary">Volver a la tienda</Link>}
            <Link href={`/cuenta?pedido=${pedido}`} className={order.paid ? "btn-primary" : "btn text-carbon/60 hover:text-madera"}>
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
