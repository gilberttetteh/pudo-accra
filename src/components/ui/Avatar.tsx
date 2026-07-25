import { useState } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * User/entity avatar with automatic initials fallback when no image is
 * provided or the image fails to load. Used in the top nav (Phase 3) and
 * anywhere a Planner/Analyst/Admin is attributed to an action.
 *
 * Props
 * -----
 * - src?: image URL
 * - name: string (required) — used to derive initials and as alt text
 * - size: 'sm' | 'md' | 'lg'
 *
 * Example usage
 * -------------
 * <Avatar name="Ama Owusu" src={user.avatarUrl} size="sm" />
 *
 * Accessibility
 * -------------
 * Renders a real <img alt={name}> when a src is available; falls back to
 * a text node of the initials (already accessible, no aria needed).
 *
 * Future extension
 * -----------------
 * Add a `status` prop (online/offline dot) once presence data exists.
 */
const avatarVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  {
    variants: {
      size: {
        sm: 'h-7 w-7 text-caption',
        md: 'h-9 w-9 text-small',
        lg: 'h-12 w-12 text-body',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export interface AvatarProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {
  name: string
  src?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const initials =
    parts.length === 1 ? parts[0]!.slice(0, 2) : `${parts[0]![0]}${parts[parts.length - 1]![0]}`
  return initials.toUpperCase()
}

export function Avatar({ className, size, name, src, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <span className={cn(avatarVariants({ size }), className)} {...props}>
      {src && !imageFailed ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
