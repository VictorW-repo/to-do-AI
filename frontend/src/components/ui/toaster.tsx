import { useEffect } from "react";

export function Toaster() {
  useEffect(() => {
    // Placeholder: you can hook this into a toast lib like sonner or radix
    console.log("Toaster mounted");
  }, []);

  return null; // or your toast container component
}
