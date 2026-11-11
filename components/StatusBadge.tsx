const styles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  preparando: "bg-sky-100 text-sky-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregado: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? "bg-arena"}`}>{label ?? status}</span>;
}
