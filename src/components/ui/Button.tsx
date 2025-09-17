import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  children,
  className,
  variant = "primary",
  ...rest
}: PropsWithChildren<ButtonProps>) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<Variant, string> = {
    primary:
      "bg-[#bb85fb] text-white hover:bg-[#a86de9] focus:ring-[#bb85fb]/50 shadow-md shadow-[#bb85fb]/20",
    secondary:
      "border border-[rgba(255,255,255,0.08)] bg-[#1e1e1e] text-[#e1e1e1] hover:bg-[#121212] focus:ring-[#00dac5]/40",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/50 shadow-md shadow-rose-900/20",
    ghost:
      "text-[#a0a0a0] hover:text-white hover:bg-[#121212] focus:ring-[#00dac5]/30",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
