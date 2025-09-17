import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export default function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm",
        "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
      {...rest}
    />
  );
}
