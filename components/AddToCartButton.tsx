"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { ProductDTO } from "@/models/Product";

type Props = {
  product: Pick<ProductDTO, "_id" | "slug" | "name" | "price" | "image" | "stock">;
  compact?: boolean;
};

export default function AddToCartButton({ product, compact }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  const handleAdd = () => {
    add(
      { productId: product._id, slug: product.slug, name: product.name, price: product.price, image: product.image, stock: product.stock },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  if (compact) {
    return (
      <button onClick={handleAdd} disabled={soldOut} className="btn-primary !px-4 !py-2" aria-label={`Agregar ${product.name} al carrito`}>
        {soldOut ? "Agotado" : added ? "✓ Listo" : "Agregar"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-arena bg-papel">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 text-lg text-madera" aria-label="Menos">−</button>
        <span className="w-8 text-center font-semibold">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="h-11 w-11 text-lg text-madera" aria-label="Más">+</button>
      </div>
      <button onClick={handleAdd} disabled={soldOut} className="btn-primary !py-3 px-7">
        {soldOut ? "Agotado" : added ? "✓ Agregado al carrito" : "Agregar al carrito"}
      </button>
    </div>
  );
}
