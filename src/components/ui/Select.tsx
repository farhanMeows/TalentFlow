import type { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export default function Select({
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        // compact sizing
        " rounded-md border px-2 py-1.5 text-sm shadow-sm transition-colors duration-200",
        // dark theme background + border
        "bg-[#121212] border-[rgba(255,255,255,0.06)]",
        // text colors
        "text-[#e1e1e1] placeholder-[#a0a0a0]",
        // hover + focus styles
        "hover:border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]/40 focus:border-[#bb85fb]",
        // disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    />
  );
}
