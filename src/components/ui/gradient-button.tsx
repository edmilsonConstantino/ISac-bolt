import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "orange" | "navy";
  size?: "sm" | "md" | "lg";
}

const variantMap = {
  orange: "bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md",
  navy: "bg-gradient-to-r from-[#004B87] to-[#0066B3] hover:from-[#003868] hover:to-[#004B87] text-white shadow-md",
};

const sizeMap = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6",
  lg: "h-14 px-8 text-base",
};

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, variant = "orange", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variantMap[variant],
          sizeMap[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GradientButton.displayName = "GradientButton";

export { GradientButton }
