import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes intelligently */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
