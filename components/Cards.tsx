import Link from "next/link";
import Cover from "./Cover";
import { formatMXN } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import type { ProductDTO } from "@/models/Product";
import type { RecipeWithAuthor } from "@/models/Recipe";
import type { PostDTO } from "@/models/Post";
import Stars from "./Stars";
import Avatar from "./Avatar";

export function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/tienda/${product.slug}`} className="aspect-[4/3] overflow-hidden">
        <Cover src={product.image} alt={product.name} className="transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-bosque">{product.category}</p>
        <Link href={`/tienda/${product.slug}`}>
          <h3 className="mt-1 text-lg leading-snug text-madera-oscura hover:text-brasa">{product.name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-semibold text-madera">{formatMXN(product.price)}</span>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}

export function RecipeCard({ recipe }: { recipe: RecipeWithAuthor }) {
  return (
    <Link href={`/recetas/${recipe.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Cover src={recipe.image} alt={recipe.title} className="transition duration-500 group-hover:scale-105" />
        {recipe.fromAI && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-madera">✨ Hecha con IA</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-bosque">{recipe.category}</p>
        <h3 className="mt-1 text-xl leading-snug text-madera-oscura group-hover:text-brasa">{recipe.title}</h3>
        {recipe.summary && <p className="mt-1.5 line-clamp-2 text-sm text-carbon/60">{recipe.summary}</p>}
        <div className="mt-auto pt-3">
          <Stars value={recipe.ratingAvg} count={recipe.ratingCount} />
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-carbon/55">
            <span className="flex min-w-0 items-center gap-1.5">
              <Avatar src={recipe.author?.avatar} name={recipe.author?.name ?? "La Cabaña"} size="h-5 w-5" />
              <span className="truncate">{recipe.author?.name ?? "La Cabaña"}</span>
            </span>
            <span className="shrink-0">⏱ {recipe.prepMinutes} min · {recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PostCard({ post }: { post: PostDTO }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-[16/9] overflow-hidden">
        <Cover src={post.image} alt={post.title} className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xl leading-snug text-madera-oscura group-hover:text-brasa">{post.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-carbon/65">{post.content}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-carbon/55">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar src={post.author?.avatar} name={post.author?.name ?? "Anónimo"} size="h-6 w-6" />
            <span className="truncate">{post.author?.name ?? "Anónimo"}</span>
          </span>
          <span className="shrink-0">
            {new Date(post.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })} · 💬 {post.comments.length}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-16 text-center">
      <h3 className="text-2xl text-madera-oscura">{title}</h3>
      {children && <div className="mt-2 text-sm text-carbon/60">{children}</div>}
    </div>
  );
}
