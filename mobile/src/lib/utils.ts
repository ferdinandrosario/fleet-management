import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind class strings, resolving conflicts (later class wins). Used by
// the owned UI primitives to combine base + variant + caller classes.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
