"use client";

import { useRef } from "react";
import { ORDER_STATUS } from "@/lib/utils";

export default function StatusSelect({ id, status, action }: { id: string; status: string; action: (fd: FormData) => Promise<void> }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => ref.current?.requestSubmit()}
        className="rounded-full border border-arena bg-papel px-3 py-1.5 text-sm"
        aria-label="Cambiar estado"
      >
        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </form>
  );
}
