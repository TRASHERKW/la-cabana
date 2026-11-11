import Link from "next/link";
import { getPosts } from "@/lib/queries";
import { deletePostAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const posts = await getPosts();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl text-madera-oscura">Blog de consejos</h1>
        <Link href="/blog/nuevo" className="btn-primary">+ Nuevo consejo</Link>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-arena text-left text-xs uppercase tracking-wider text-carbon/50">
            <tr>
              <th className="p-4">Consejo</th>
              <th className="p-4">Autor</th>
              <th className="p-4">Opiniones</th>
              <th className="p-4">Fecha</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {posts.map((p) => (
              <tr key={p._id}>
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-carbon/70">{p.author?.name ?? "—"}</td>
                <td className="p-4 text-carbon/70">{p.comments.length}</td>
                <td className="p-4 text-carbon/70">{new Date(p.createdAt).toLocaleDateString("es-MX")}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-4">
                    <Link href={`/blog/${p.slug}`} className="text-sm text-carbon/60 hover:underline">Ver</Link>
                    <Link href={`/blog/${p.slug}/editar`} className="text-sm font-medium text-brasa hover:underline">Editar</Link>
                    <DeleteButton id={p._id} action={deletePostAction} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-carbon/50">Todavía no hay consejos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
