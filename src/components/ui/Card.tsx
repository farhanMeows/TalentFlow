import type { HTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";

export function Card({
  children,
  className,
  ...rest
}: PropsWithChildren<{ className?: string } & HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] bg-[#1e1e1e] border-[rgba(255,255,255,0.04)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={clsx(
        "mb-3 flex items-center justify-between gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx("text-sm text-[#e1e1e1] leading-relaxed", className)}>
      {children}
    </div>
  );
}
