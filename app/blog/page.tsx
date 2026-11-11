import Link from "next/link";
import { getPosts } from "@/lib/queries";
import { PostCard, EmptyState } from "@/components/Cards";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Blog de consejos" };
export const dynamic = "force-dynamic";

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const posts = await getPosts({ q });

  return (
    <>
      <PageHero image="/img/blog-campo.jpg" title="Blog de consejos" subtitle="Tips de alimentación, cocina y vida sana escritos por la comunidad.">
        <Link href="/blog/nuevo" className="btn-primary">+ Crear consejo</Link>
      </PageHero>
      <div className="container-lc py-10">
        <form action="/blog" className="flex max-w-xl gap-2">
          <input name="q" defaultValue={q} placeholder="Buscar consejo…" className="input !rounded-full" />
          <button className="btn-dark shrink-0">Buscar</button>
        </form>
        <div className="mt-8">
          {posts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p._id} post={p} />)}
            </div>
          ) : (
            <EmptyState title={q ? "No encontramos consejos" : "Todavía no hay consejos"}>
              <Link href="/blog/nuevo" className="font-semibold text-brasa hover:underline">Escribe el primero</Link>
            </EmptyState>
          )}
        </div>
      </div>
    </>
  );
}
