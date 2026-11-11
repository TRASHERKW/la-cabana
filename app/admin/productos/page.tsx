import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Product, type ProductDTO } from "@/models/Product";
import { formatMXN, serialize } from "@/lib/utils";
import { deleteProductAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import Cover from "@/components/Cover";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  await connectDB();
  const products = serialize<ProductDTO[]>(await Product.find().sort({ createdAt: -1 }).lean());

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-madera-oscura">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">+ Nuevo producto</Link>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-arena text-left text-xs uppercase tracking-wider text-carbon/50">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Stock</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {products.map((p) => (
              <tr key={p._id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg"><Cover src={p.image} alt={p.name} /></div>
                    <span className="font-medium">{p.name}{p.featured && <span className="ml-2 text-brasa">★</span>}</span>
                  </div>
                </td>
                <td className="p-4 text-carbon/70">{p.category}</td>
                <td className="p-4">{formatMXN(p.price)}</td>
                <td className={`p-4 font-semibold ${p.stock === 0 ? "text-red-700" : p.stock <= 5 ? "text-amber-700" : ""}`}>{p.stock}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-4">
                    <Link href={`/admin/productos/${p._id}`} className="text-sm font-medium text-brasa hover:underline">Editar</Link>
                    <DeleteButton id={p._id} action={deleteProductAction} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-carbon/50">Todavía no hay productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
