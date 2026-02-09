import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-foreground rounded-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        // Luxury variants with shine effect
        gold: "relative overflow-hidden bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold hover:shadow-lg hover:scale-[1.02] rounded-sm uppercase tracking-[0.2em] btn-shine",
        goldOutline: "relative overflow-hidden border-2 border-gold text-gold hover:bg-gold hover:text-gold-foreground hover:scale-[1.02] rounded-sm uppercase tracking-[0.2em] btn-shine",
        luxury: "relative overflow-hidden bg-transparent border border-foreground/30 text-foreground hover:bg-foreground hover:text-background hover:scale-[1.02] rounded-sm uppercase tracking-[0.2em] btn-shine",
        hero: "relative overflow-hidden bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold hover:shadow-lg hover:scale-[1.02] text-base rounded-sm uppercase tracking-[0.2em] btn-shine",
        subtle: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground rounded-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 rounded-sm",
        lg: "h-12 px-8 text-base rounded-sm",
        xl: "h-14 px-10 text-lg rounded-sm",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
