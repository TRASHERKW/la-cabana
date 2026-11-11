/* eslint-disable @next/next/no-img-element */

const palettes = [
  ["#c8642b", "#6b4226"],
  ["#2f4a35", "#6b8f5e"],
  ["#6b4226", "#d9a066"],
  ["#8a3b2a", "#e0895a"],
  ["#3e2616", "#a8754a"],
];

/** Imagen de portada. Si no hay URL, dibuja un placeholder cálido con la inicial. */
export default function Cover({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  }
  const idx = [...alt].reduce((n, c) => n + c.charCodeAt(0), 0) % palettes.length;
  const [a, b] = palettes[idx];
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <div className="grain absolute inset-0 opacity-40" />
      <span className="font-display text-5xl font-semibold text-white/85">{alt.charAt(0).toUpperCase()}</span>
    </div>
  );
}
