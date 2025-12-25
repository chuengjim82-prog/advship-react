import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayValue(val: any) {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    (typeof val === "object" && Object.keys(val).length === 0)
  ) {
    return "-";
  }
  return String(val);
}
