import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize Indian mobile numbers and validate.
// Returns a 10-digit normalized number (no country code) or null if invalid.
export function normalizeIndianMobile(input: string): string | null {
  if (!input) return null;
  const cleaned = input.replace(/\s+/g, '').replace(/[-()]/g, '');
  let num = cleaned.replace(/^\+91/, '').replace(/^91/, '').replace(/^0/, '');
  if (!/^\d{10}$/.test(num)) return null;
  if (!/^[6-9]\d{9}$/.test(num)) return null;
  return num;
}

export function isValidIndianMobile(input: string): boolean {
  return normalizeIndianMobile(input) !== null;
}
