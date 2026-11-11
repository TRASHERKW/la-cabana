"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProductAction } from "@/app/actions/admin";
import { PRODUCT_CATEGORIES } from "@/lib/utils";
import type { ProductDTO } from "@/models/Product";

export default function ProductForm({ product }: { product?: ProductDTO }) {
  const [state, action, pending] = useActionState(saveProductAction, undefined);

  return (
    <form action={action} className="card max-w-2xl space-y-5 p-6">
      {product && <input type="hidden" name="id" value={product._id} />}
      <div>
        <label className="label" htmlFor="name">Nombre</label>
        <input id="name" name="name" required defaultValue={product?.name} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="description">Descripción</label>
        <textarea id="description" name="description" rows={4} defaultValue={product?.description} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="price">Precio (MXN)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product?.price} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="category">Categoría</label>
          <select id="category" name="category" defaultValue={product?.category ?? PRODUCT_CATEGORIES[0]} className="input">
            {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="image">URL de imagen (opcional)</label>
        <input id="image" name="image" type="url" placeholder="https://…" defaultValue={product?.image} className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4 accent-brasa" />
        Destacar en la página principal
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-3">
        <button disabled={pending} className="btn-primary">{pending ? "Guardando…" : "Guardar producto"}</button>
        <Link href="/admin/productos" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
