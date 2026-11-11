import Link from "next/link";

type Props = {
  basePath: string;
  categories: string[];
  current?: string;
  q?: string;
  placeholder: string;
  /** Parámetros extra que se conservan al filtrar (p. ej. orden). */
  extra?: Record<string, string>;
};

/** Barra de búsqueda + chips de categoría. Funciona sin JavaScript (GET form). */
export default function Filters({ basePath, categories, current, q, placeholder, extra }: Props) {
  const href = (cat?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("categoria", cat);
    Object.entries(extra ?? {}).forEach(([k, v]) => params.set(k, v));
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="space-y-4">
      <form action={basePath} className="flex gap-2">
        {current && <input type="hidden" name="categoria" value={current} />}
        {Object.entries(extra ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <input name="q" defaultValue={q} placeholder={placeholder} className="input !rounded-full" />
        <button className="btn-dark shrink-0">Buscar</button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Chip href={href()} active={!current}>Todas</Chip>
        {categories.map((c) => (
          <Chip key={c} href={href(c)} active={current === c}>
            {c}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active ? "border-madera bg-madera text-crema" : "border-arena bg-papel text-carbon/70 hover:border-madera/40"
      }`}
    >
      {children}
    </Link>
  );
}
