import type { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export default function Select({
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm",
        "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
      {...rest}
    />
  );
}
