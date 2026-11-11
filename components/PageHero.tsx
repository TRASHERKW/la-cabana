/* eslint-disable @next/next/no-img-element */

/** Encabezado de sección con foto de fondo (como en las páginas originales). */
export default function PageHero({ image, title, subtitle, children }: { image: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-madera-oscura/65" />
      <div className="container-lc py-14 md:py-20">
        <h1 className="text-4xl text-white md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-white/80">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
