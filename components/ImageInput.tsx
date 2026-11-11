"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

type Props = { name: string; defaultValue?: string; label?: string; round?: boolean };

/** Reduce la foto en el navegador (máx. 1400 px, JPG) para que suba rápido y pese poco. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", 0.85)
  );
}

/** Campo de imagen: sube una foto desde tu compu/celular o pega una URL. Guarda la URL en un input oculto. */
export default function ImageInput({ name, defaultValue = "", label = "Foto", round }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setStatus("uploading");
    setError("");
    try {
      const blob = await shrink(file);
      const fd = new FormData();
      fd.append("file", new File([blob], "foto.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir");
      setUrl(data.url);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
      setStatus("error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`grid shrink-0 place-items-center overflow-hidden border-2 border-dashed border-arena bg-papel text-carbon/40 transition hover:border-brasa ${
            round ? "h-24 w-24 rounded-full" : "h-28 w-40 rounded-xl"
          }`}
          aria-label="Elegir foto"
        >
          {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-3xl">📷</span>}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost !px-4 !py-1.5" disabled={status === "uploading"}>
              {status === "uploading" ? "Subiendo…" : url ? "Cambiar foto" : "Subir foto"}
            </button>
            {url && (
              <button type="button" onClick={() => setUrl("")} className="text-sm text-carbon/50 hover:text-red-700">
                Quitar
              </button>
            )}
          </div>
          <input
            type="url"
            placeholder="…o pega la URL de una imagen"
            value={url.startsWith("/") ? "" : url}
            onChange={(e) => setUrl(e.target.value)}
            className="input !py-1.5"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
