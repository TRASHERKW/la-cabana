import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import Cover from "@/components/Cover";
import Avatar from "@/components/Avatar";
import CommentForm from "@/components/CommentForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteCommentAction, deleteMyPostAction } from "@/app/actions/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  return { title: post?.title ?? "Consejo" };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({ params }: Props) {
  const [post, session] = await Promise.all([getPostBySlug((await params).slug), getSession()]);
  if (!post) notFound();
  const canManage = !!session && (post.author?._id === session.id || session.role === "admin");

  return (
    <article className="container-lc max-w-3xl py-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/blog" className="text-sm text-carbon/60 hover:text-brasa">← Blog de consejos</Link>
        {canManage && (
          <div className="flex items-center gap-4">
            <Link href={`/blog/${post.slug}/editar`} className="text-sm font-semibold text-brasa hover:underline">Editar</Link>
            <DeleteButton id={post._id} action={deleteMyPostAction} />
          </div>
        )}
      </div>

      <h1 className="mt-6 text-4xl leading-tight text-madera-oscura md:text-5xl">{post.title}</h1>
      <div className="mt-4 flex items-center gap-2.5 text-sm text-carbon/60">
        <Avatar src={post.author?.avatar} name={post.author?.name ?? "Anónimo"} size="h-9 w-9" />
        <div>
          <p className="font-semibold text-carbon/80">{post.author?.name ?? "Anónimo"}</p>
          <p className="text-xs">{fmt(post.createdAt)}</p>
        </div>
      </div>

      {post.image && (
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-3xl shadow-lg">
          <Cover src={post.image} alt={post.title} />
        </div>
      )}

      <div className="mt-8 space-y-4 text-lg leading-relaxed text-carbon/80">
        {post.content.split(/\n{2,}|\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <section className="mt-14 border-t border-arena pt-10">
        <h2 className="text-2xl text-madera-oscura">Opiniones ({post.comments.length})</h2>
        <div className="mt-6">
          {session ? (
            <CommentForm postId={post._id} />
          ) : (
            <p className="card p-4 text-sm text-carbon/70">
              <Link href={`/login?next=/blog/${post.slug}`} className="font-semibold text-brasa hover:underline">Inicia sesión</Link> para dejar tu opinión.
            </p>
          )}
        </div>
        <ul className="mt-8 space-y-4">
          {[...post.comments].reverse().map((c) => (
            <li key={c._id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm">
                  <span className="font-semibold text-madera-oscura">{c.name}</span>
                  <span className="ml-2 text-xs text-carbon/45">{fmt(c.createdAt)}</span>
                </p>
                {session && (c.user === session.id || session.role === "admin") && (
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="postId" value={post._id} />
                    <input type="hidden" name="id" value={c._id} />
                    <button className="text-xs text-carbon/45 hover:text-red-700">Borrar</button>
                  </form>
                )}
              </div>
              <p className="mt-1.5 whitespace-pre-line text-carbon/80">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
