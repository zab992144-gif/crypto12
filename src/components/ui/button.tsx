import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className, variant = "secondary", type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-3.5 text-sm font-medium transition-colors duration-150 disabled:opacity-50",
        variant === "primary" && "bg-accent text-accent-fg hover:opacity-90",
        variant === "secondary" && "border border-border bg-bg-subtle text-fg hover:bg-bg-elevated",
        variant === "ghost" && "text-muted hover:bg-bg-subtle hover:text-fg",
        className,
      )}
      {...props}
    />
  );
});
