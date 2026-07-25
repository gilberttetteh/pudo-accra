import { forwardRef } from 'react'
import { Input, type InputProps } from './Input'
import { Search, X, Icon } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Specialized Input preconfigured for search: leading search icon and an
 * optional clear button. Used for node search, address lookup, and table
 * filtering — not for the map's own geocoding search bar (see MapSearch
 * in components/map, which has different behavior: suggestions + geocoding).
 *
 * Props
 * -----
 * - value: string (controlled)
 * - onChange: (value: string) => void
 * - onClear?: () => void — shown as an 'x' button when value is non-empty
 * - All other Input props except leftIcon/type
 *
 * Example usage
 * -------------
 * <SearchInput value={query} onChange={setQuery} placeholder="Search nodes…" />
 *
 * Accessibility
 * -------------
 * Clear button has an explicit aria-label; input keeps native text-field
 * semantics (`type="search"`).
 *
 * Future extension
 * -----------------
 * Add a debounced `onDebouncedChange` callback once live-filtering tables
 * are built.
 */
export interface SearchInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'leftIcon' | 'type'
> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          leftIcon={Search}
          className={cn(value && 'pr-9', className)}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-3 text-text-tertiary hover:text-text-primary"
          >
            <Icon icon={X} size={14} />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'
