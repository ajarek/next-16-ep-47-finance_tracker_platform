import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Łączy klasy Tailwind z obsługą warunkowości i deduplikacją.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formatuje kwotę numeryczną do formatu polskiego złotego (PLN).
 */
export function formatCurrency(amount: number, currency = "PLN"): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency === "zł" ? "PLN" : currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
