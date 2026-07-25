/**
 * Shared prop primitives used across the design system so every
 * component agrees on the same vocabulary for size/variant/tone.
 */

/** Standard size scale used by Button, Input, Badge, Avatar, IconButton, etc. */
export type Size = 'sm' | 'md' | 'lg'

/** Semantic tone, driven by the design tokens in src/styles/index.css. */
export type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

/** Shared shape for anything that can be in a pending network state. */
export interface LoadingProps {
  isLoading?: boolean
}

/** Shared shape for anything that can be disabled. */
export interface DisableableProps {
  disabled?: boolean
}
