import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

/**
 * Integración con Mercado Pago — Checkout Pro vía API de Orders.
 * Docs: https://www.mercadopago.com.mx/developers/es/docs/checkout-pro-orders/create-order
 */
const API = "https://api.mercadopago.com/v1/orders";

export const mpEnabled = () => !!process.env.MP_ACCESS_TOKEN;

type MPOrder = {
  id: string;
  status: string; // created | processed | action_required | canceled | expired | refunded | failed ...
  status_detail?: string;
  total_amount?: string;
  total_paid_amount?: string;
  checkout_url?: string;
  external_reference?: string;
};

const money = (n: number) => n.toFixed(2);

async function mpFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}

type CreateInput = {
  orderId: string;
  email: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  baseUrl: string;
};

/** Crea la order de pago en Mercado Pago y regresa su id y la URL a la que mandamos al cliente. */
export async function createMPOrder({ orderId, email, items, total, baseUrl }: CreateInput) {
  const back = `${baseUrl}/pago/resultado?pedido=${orderId}`;
  const isHttps = baseUrl.startsWith("https://");
  const body: Record<string, unknown> = {
    type: "online",
    processing_mode: "manual",
    total_amount: money(total),
    external_reference: orderId,
    expiration_time: "P1D", // el link de pago vence en 1 día
    payer: { email },
    items: items.map((i) => ({
      title: i.name.slice(0, 250),
      unit_price: money(i.price),
      quantity: i.quantity,
    })),
    config: {
      online: {
        success_url: back,
        failure_url: back,
        pending_url: back,
        // El regreso automático solo funciona con https (en tu compu el cliente regresa con un botón)
        ...(isHttps ? { auto_return: "approved" } : {}),
      },
    },
  };

  // La llave de idempotencia evita cobrar doble si la petición se repite
  const send = (b: Record<string, unknown>, key: string) =>
    mpFetch(API, { method: "POST", headers: { "X-Idempotency-Key": key }, body: JSON.stringify(b) }) as Promise<MPOrder>;

  try {
    return await send(body, `la-cabana-${orderId}`);
  } catch (err) {
    // Si MP rechaza las URLs de regreso (pasa con localhost), reintentamos sin ellas
    if (String(err).toLowerCase().includes("url")) {
      const { config: _config, ...rest } = body;
      return send(rest, `la-cabana-${orderId}-sin-urls`);
    }
    throw err;
  }
}

export async function getMPOrder(mpOrderId: string) {
  return mpFetch(`${API}/${encodeURIComponent(mpOrderId)}`) as Promise<MPOrder>;
}

const FINAL_FAILED = ["canceled", "expired", "failed", "refunded"];

/**
 * Pregunta a Mercado Pago cómo va el pago de un pedido y actualiza nuestra base.
 * - processed → pedido pagado (y pasa a "preparando")
 * - canceled / expired → se cancela el pedido y se regresa el stock
 * No consulta más de una vez cada 5 segundos por pedido.
 */
export async function syncOrderPayment(orderId: string) {
  if (!mpEnabled()) return null;
  const order = await Order.findById(orderId);
  if (!order?.mp?.orderId || order.paid || order.status === "cancelado") return order;
  if (order.mp.lastSync && Date.now() - order.mp.lastSync.getTime() < 5000) return order;

  try {
    const mp = await getMPOrder(order.mp.orderId);
    order.mp.status = mp.status;
    order.mp.statusDetail = mp.status_detail ?? null;
    order.mp.lastSync = new Date();

    const paidEnough = Number(mp.total_paid_amount ?? mp.total_amount ?? 0) + 0.001 >= order.total;
    if (mp.status === "processed" && paidEnough) {
      order.paid = true;
      order.paidAt = new Date();
      if (order.status === "pendiente") order.status = "preparando";
    } else if (FINAL_FAILED.includes(mp.status) && mp.status !== "refunded") {
      order.status = "cancelado";
      await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
    }
    await order.save();
  } catch (e) {
    console.error("No se pudo consultar Mercado Pago:", e);
  }
  return order;
}

/** Texto amigable para el estado del pago. */
export function paymentLabel(o: { paid?: boolean; status: string; mp?: { orderId?: string | null; status?: string | null } }) {
  if (o.paid) return { text: "Pagado", tone: "ok" as const };
  if (!o.mp?.orderId) return { text: "Pago al entregar", tone: "neutral" as const };
  if (o.status === "cancelado") return { text: o.mp.status === "expired" ? "Pago vencido" : "Pago cancelado", tone: "bad" as const };
  if (o.mp.status === "action_required") return { text: "Pago pendiente", tone: "warn" as const };
  return { text: "Esperando pago", tone: "warn" as const };
}
