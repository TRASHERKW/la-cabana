import Link from "next/link";
import { Logo } from "./Header";
import { SOCIAL_LINKS } from "@/lib/utils";

const icons: Record<string, React.ReactNode> = {
  Facebook: <path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v7h4v-7h3l1-4h-4V8.6c0-.4.2-.6.6-.6Z" fill="currentColor" />,
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </>
  ),
  X: <path d="M4 4h4.5l4 5.6L17 4h3l-6.1 7.4L20.5 20H16l-4.3-6-5 6H3.6l6.6-7.9L4 4Z" fill="currentColor" />,
};

export default function Footer() {
  return (
    <footer className="mt-24 bg-madera-oscura text-crema/80">
      <div className="container-lc grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-crema p-1"><Logo className="h-9 w-9" /></span>
            <span className="font-display text-2xl text-crema">La Cabaña</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            El arte de una vida buena, sana y saludable. Un recetario hecho entre todos: comparte tus recetas, aprende con el blog y llévate las mejores especias.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="grid h-10 w-10 place-items-center rounded-full bg-crema/10 text-crema transition hover:bg-brasa"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">{icons[s.name]}</svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg text-crema">Explora</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/recetas" className="hover:text-brasa">Recetas</Link></li>
            <li><Link href="/blog" className="hover:text-brasa">Blog de consejos</Link></li>
            <li><Link href="/ia" className="hover:text-brasa">Receta con IA</Link></li>
            <li><Link href="/tienda" className="hover:text-brasa">Tienda</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg text-crema">Tu cuenta</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/tus-recetas" className="hover:text-brasa">Tus recetas</Link></li>
            <li><Link href="/recetas/nueva" className="hover:text-brasa">Crear receta</Link></li>
            <li><Link href="/cuenta" className="hover:text-brasa">Mi perfil y pedidos</Link></li>
            <li><Link href="/carrito" className="hover:text-brasa">Carrito</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-crema/10">
        <p className="container-lc py-5 text-xs text-crema/50">© {new Date().getFullYear()} La Cabaña · Dile sí al antojo, de la manera sana.</p>
      </div>
    </footer>
  );
}
