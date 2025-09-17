import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export default function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        // base
        "w-full rounded-md border px-3 py-1.5 text-sm shadow-sm transition-colors duration-200",
        // dark theme background + border
        "bg-[#121212] border-[rgba(255,255,255,0.06)]",
        // text colors
        "text-[#e1e1e1] placeholder-[#a0a0a0]",
        // hover + focus
        "hover:border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]/40 focus:border-[#bb85fb]",
        // disabled
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    />
  );
}
