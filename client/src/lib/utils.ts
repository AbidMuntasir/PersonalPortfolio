import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a string
 * @param text The input text to convert to a slug
 * @returns A lowercase URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word characters (except hyphens)
    .replace(/\-\-+/g, '-')   // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, '')       // Trim hyphens from start
    .replace(/-+$/, '');      // Trim hyphens from end
}
