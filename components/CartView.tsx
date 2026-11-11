"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "./CartProvider";
import Cover from "./Cover";
import { formatMXN } from "@/lib/utils";
import { createOrderAction } from "@/app/actions/orders";

export default function CartView({ userName, onlinePayment }: { userName: string | null; onlinePayment: boolean }) {
  const { items, total, ready, setQuantity, remove, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!ready) return <div className="container-lc py-20 text-carbon/50">Cargando carrito…</div>;

  if (items.length === 0) {
    return (
      <div className="container-lc grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <p className="text-6xl">🧺</p>
          <h1 className="mt-4 text-3xl font-semibold text-madera-oscura">Tu carrito está vacío</h1>
          <p className="mt-2 text-carbon/60">Date una vuelta por la tienda y llévate algo rico.</p>
          <Link href="/tienda" className="btn-primary mt-6">Ir a la tienda</Link>
        </div>
      </div>
    );
  }

  // onSubmit (y no form action) para que el formulario no se limpie si hay un error
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await createOrderAction({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping: {
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          address: String(formData.get("address") ?? ""),
          notes: String(formData.get("notes") ?? ""),
        },
      });
      if (res.ok) {
        clear();
        if (res.checkoutUrl) window.location.href = res.checkoutUrl; // a la página de pago de Mercado Pago
        else router.push(`/cuenta?pedido=${res.orderId}`);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="container-lc py-14">
      <h1 className="text-4xl font-semibold text-madera-oscura">Tu carrito</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="card flex gap-4 p-4">
              <Link href={`/tienda/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                <Cover src={item.image} alt={item.name} />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/tienda/${item.slug}`} className="font-semibold hover:text-brasa">{item.name}</Link>
                  <span className="font-semibold text-madera">{formatMXN(item.price * item.quantity)}</span>
                </div>
                <p className="text-sm text-carbon/50">{formatMXN(item.price)} c/u</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-arena">
                    <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className="h-8 w-8 text-madera" aria-label="Menos">−</button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => setQuantity(item.productId, item.quantity + 1)} className="h-8 w-8 text-madera" aria-label="Más">+</button>
                  </div>
                  <button onClick={() => remove(item.productId)} className="text-sm text-carbon/50 hover:text-red-700">Quitar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-6">
          <div className="flex items-center justify-between text-lg">
            <span>Total</span>
            <span className="font-display text-2xl font-semibold text-madera">{formatMXN(total)}</span>
          </div>
          <p className="mt-1 text-xs text-carbon/50">
            {onlinePayment ? "Pagas de forma segura en Mercado Pago: tarjeta, OXXO, SPEI o saldo." : "El pago se coordina al confirmar tu pedido."}
          </p>

          {userName ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <h2 className="text-lg font-semibold">Datos de entrega</h2>
              <input name="name" defaultValue={userName} placeholder="Nombre de quien recibe" required className="input" />
              <input name="phone" type="tel" placeholder="Teléfono" required className="input" />
              <textarea name="address" placeholder="Calle, número, colonia, ciudad y C.P." required rows={3} className="input" />
              <textarea name="notes" placeholder="Notas (opcional)" rows={2} className="input" />
              {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
              <button disabled={pending} className="btn-primary w-full !py-3">
                {pending ? (onlinePayment ? "Conectando con Mercado Pago…" : "Enviando pedido…") : onlinePayment ? "Pagar con Mercado Pago" : "Confirmar pedido"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl bg-arena/50 p-4 text-sm">
              <p>Para hacer tu pedido necesitas una cuenta.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/login?next=/carrito" className="btn-dark !py-2">Entrar</Link>
                <Link href="/registro?next=/carrito" className="btn-ghost !py-2">Crear cuenta</Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
