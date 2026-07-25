import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and resolve Tailwind class conflicts.
 *
 * Use this everywhere instead of template-string class concatenation —
 * it lets consumers override a component's default classes (e.g.
 * `<Button className="w-full" />`) without specificity fights.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
