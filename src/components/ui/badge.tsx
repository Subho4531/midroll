import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50",
  {
    variants: {
      variant: {
        default:
          "border-purple-500/40 bg-purple-950/80 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
        cyan: "border-cyan-500/40 bg-cyan-950/80 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.15)]",
        emerald:
          "border-emerald-500/40 bg-emerald-950/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
        amber:
          "border-amber-500/40 bg-amber-950/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
        rose: "border-rose-500/40 bg-rose-950/80 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
        secondary:
          "border-slate-800 bg-slate-900 text-slate-300",
        outline: "text-slate-200 border-slate-700 bg-slate-900/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
