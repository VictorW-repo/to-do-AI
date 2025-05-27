import React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-zinc-500"
    {...props}
  />
));

Input.displayName = "Input";
