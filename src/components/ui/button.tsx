import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/25 border border-purple-500/30",
        cyan: "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 border border-cyan-400/30",
        purple:
          "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-400 hover:to-indigo-500 shadow-lg shadow-purple-500/20 border border-purple-400/30",
        destructive:
          "bg-gradient-to-r from-rose-600 to-red-700 text-white hover:from-rose-500 hover:to-red-600 shadow-lg shadow-rose-600/20 border border-rose-500/30",
        outline:
          "border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:text-white text-slate-300 backdrop-blur-md",
        secondary:
          "bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-800/80",
        ghost: "hover:bg-slate-900 hover:text-white text-slate-400",
        link: "text-purple-400 underline-offset-4 hover:underline p-0 h-auto font-normal",
        glass:
          "bg-slate-900/90 text-slate-200 border border-indigo-900/50 hover:bg-slate-800/90 hover:border-purple-500/40 backdrop-blur-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
