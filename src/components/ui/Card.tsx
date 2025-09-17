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
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
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
    <div className={clsx("mb-2 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx("text-sm text-slate-700", className)}>{children}</div>
  );
}
