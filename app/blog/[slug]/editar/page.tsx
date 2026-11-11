import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPostBySlug } from "@/lib/queries";
import PostForm from "@/components/PostForm";

export const metadata = { title: "Editar consejo" };
export const dynamic = "force-dynamic";

export default async function EditarConsejo({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireUser();
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  if (post.author?._id !== session.id && session.role !== "admin") notFound();
  return (
    <div className="container-lc py-12">
      <h1 className="mb-8 text-4xl text-madera-oscura">Editar consejo</h1>
      <PostForm post={post} />
    </div>
  );
}
