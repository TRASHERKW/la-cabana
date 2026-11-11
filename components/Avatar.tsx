/* eslint-disable @next/next/no-img-element */

export default function Avatar({ src, name, size = "h-8 w-8" }: { src?: string; name: string; size?: string }) {
  return (
    <img
      src={src || "/img/avatar.png"}
      alt={name}
      className={`${size} shrink-0 rounded-full border border-arena bg-papel object-cover`}
    />
  );
}
