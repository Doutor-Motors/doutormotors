import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Tier badges - high contrast for legibility
        basic: "bg-sky-600 text-white border-sky-500",
        pro: "bg-emerald-600 text-white border-emerald-500",
        admin: "bg-violet-600 text-white border-violet-500",
        // Status badges
        success: "bg-green-600 text-white border-green-500",
        warning: "bg-amber-500 text-white border-amber-400",
        info: "bg-blue-600 text-white border-blue-500",
        // Priority badges
        critical: "bg-red-600 text-white border-red-500",
        attention: "bg-orange-500 text-white border-orange-400",
        preventive: "bg-yellow-500 text-slate-900 border-yellow-400",
        ok: "bg-green-600 text-white border-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
