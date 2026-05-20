import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names safely utilizing clsx and tailwind-merge.
 * Useful for building dynamic conditional styling in components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
