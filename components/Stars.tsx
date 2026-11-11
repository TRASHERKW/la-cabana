/** Estrellas de solo lectura (promedio). */
export default function Stars({ value, count, size = "text-sm" }: { value: number; count?: number; size?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1 ${size}`} aria-label={`${value} de 5 estrellas`}>
      <span className="tracking-tight">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= rounded ? "text-amber-500" : i - 0.5 === rounded ? "text-amber-500/60" : "text-carbon/20"}>
            ★
          </span>
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-carbon/50">{count > 0 ? `${value.toFixed(1)} (${count})` : "Sin calificar"}</span>}
    </span>
  );
}
