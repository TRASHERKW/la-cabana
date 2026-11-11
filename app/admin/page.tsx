import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Recipe } from "@/models/Recipe";
import { User } from "@/models/User";
import { formatMXN, ORDER_STATUS, serialize } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await connectDB();
  const [productCount, recipeCount, userCount, pending, salesAgg, lowStock, recent] = await Promise.all([
    Product.countDocuments(),
    Recipe.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.countDocuments({ status: "pendiente" }),
    Order.aggregate([{ $match: { status: { $ne: "cancelado" }, $or: [{ paid: true }, { "mp.orderId": null }, { mp: { $exists: false } }] } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5).lean(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name").lean(),
  ]);

  const sales = salesAgg[0]?.total ?? 0;
  const recentOrders = serialize<{ _id: string; total: number; status: string; user?: { name: string } }[]>(recent);
  const low = serialize<{ _id: string; name: string; stock: number }[]>(lowStock);

  const stats = [
    ["Ventas", formatMXN(sales)],
    ["Pedidos pendientes", pending],
    ["Productos", productCount],
    ["Recetas", recipeCount],
    ["Clientes", userCount],
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-madera-oscura">Resumen</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-carbon/50">{k}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-madera">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm text-brasa hover:underline">Ver todos</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-carbon/50">Aún no hay pedidos.</p>
          ) : (
            <ul className="mt-4 divide-y divide-arena">
              {recentOrders.map((o) => (
                <li key={o._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="truncate">{o.user?.name ?? "Usuario eliminado"}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold">{formatMXN(o.total)}</span>
                    <StatusBadge status={o.status} label={ORDER_STATUS[o.status]} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Poco stock</h2>
          {low.length === 0 ? (
            <p className="mt-4 text-sm text-carbon/50">Todo bien surtido 👌</p>
          ) : (
            <ul className="mt-4 divide-y divide-arena">
              {low.map((p) => (
                <li key={p._id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/admin/productos/${p._id}`} className="hover:text-brasa">{p.name}</Link>
                  <span className={`font-semibold ${p.stock === 0 ? "text-red-700" : "text-amber-700"}`}>{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
