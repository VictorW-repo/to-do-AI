import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", className = "", ...props }, ref) => {
    const baseClasses = "rounded focus:outline-none focus:ring-2 focus:ring-zinc-500";

    const sizeClasses = (() => {
      switch (size) {
        case "sm":
          return "px-2 py-1 text-sm";
        case "lg":
          return "px-6 py-3 text-lg";
        case "icon":
          return "p-2";
        default:
          return "px-4 py-2 text-base";
      }
    })();

    const variantClasses = (() => {
      switch (variant) {
        case "ghost":
          return "bg-transparent hover:bg-gray-100";
        case "outline":
          return "border border-gray-300 bg-white hover:bg-gray-50";
        default:
          return "bg-zinc-800 text-white hover:bg-zinc-700";
      }
    })();

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
