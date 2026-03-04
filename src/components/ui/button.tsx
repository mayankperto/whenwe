"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-orange-500 text-white shadow-sm hover:bg-orange-600",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200",
        ghost:
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link:
          "text-orange-500 underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700",
        glass:
          "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-base font-bold",
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
