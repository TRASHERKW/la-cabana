"use server";

import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { createMPOrder, mpEnabled } from "@/lib/mercadopago";
import { getBaseUrl } from "@/lib/url";

const orderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Tu carrito está vacío"),
  shipping: z.object({
    name: z.string().trim().min(2, "Escribe el nombre de quien recibe"),
    phone: z.string().trim().min(8, "Escribe un teléfono válido"),
    address: z.string().trim().min(10, "Escribe la dirección completa"),
    notes: z.string().trim().max(500).optional().default(""),
  }),
});

export type OrderResult = { ok: true; orderId: string; checkoutUrl?: string } | { ok: false; error: string; needsLogin?: boolean };

export async function createOrderAction(input: unknown): Promise<OrderResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Inicia sesión para hacer tu pedido", needsLogin: true };

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { items, shipping } = parsed.data;

  if (items.some((i) => !Types.ObjectId.isValid(i.productId))) return { ok: false, error: "Producto inválido en el carrito" };

  await connectDB();

  // Precios y nombres siempre salen de la base de datos, nunca del cliente
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const reserved: { id: string; qty: number }[] = [];
  const rollback = () => Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      await rollback();
      return { ok: false, error: "Uno de los productos ya no existe. Quítalo del carrito." };
    }
    // Descuento atómico de stock: solo pasa si hay suficiente
    const res = await Product.updateOne({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
    if (res.modifiedCount === 0) {
      await rollback();
      return { ok: false, error: `No hay suficiente stock de "${product.name}"` };
    }
    reserved.push({ id: item.productId, qty: item.quantity });
  }

  const orderItems = items.map((i) => {
    const p = byId.get(i.productId)!;
    return { product: p._id, name: p.name, price: p.price, quantity: i.quantity };
  });
  const total = orderItems.reduce((n, i) => n + i.price * i.quantity, 0);

  let order;
  try {
    order = await Order.create({ user: session.id, items: orderItems, total, shipping });
  } catch {
    await rollback();
    return { ok: false, error: "No pudimos guardar tu pedido. Intenta de nuevo." };
  }
  const orderId = order._id.toString();

  // Sin Mercado Pago configurado, el pedido queda como "pago al entregar"
  if (!mpEnabled()) return { ok: true, orderId };

  try {
    const mp = await createMPOrder({ orderId, email: session.email, items: orderItems, total, baseUrl: await getBaseUrl() });
    if (!mp.checkout_url) throw new Error("Mercado Pago no regresó checkout_url");
    order.mp = { orderId: mp.id, status: mp.status, statusDetail: mp.status_detail ?? null, checkoutUrl: mp.checkout_url, lastSync: new Date() };
    await order.save();
    return { ok: true, orderId, checkoutUrl: mp.checkout_url };
  } catch (e) {
    console.error(e);
    // No dejamos un pedido "fantasma": se cancela y el stock regresa
    await Order.deleteOne({ _id: order._id });
    await rollback();
    return { ok: false, error: "No pudimos conectar con Mercado Pago. Intenta de nuevo en un momento." };
  }
}
