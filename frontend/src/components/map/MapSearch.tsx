import { useState } from 'react'
import { SearchInput } from '@/components/forms/SearchInput'
import { Icon, MapPin } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Map-specific search bar for geocoding an address/place name and
 * flying the map to it — distinct from the generic SearchInput (which
 * just filters local lists) in that it shows an async suggestion
 * dropdown. Suggestion fetching is a placeholder here; Phase 10 wires
 * it to OpenRouteService/Nominatim geocoding.
 *
 * Props
 * -----
 * - value / onChange: controlled query text
 * - suggestions: { id: string; label: string; sublabel?: string }[]
 * - onSelectSuggestion: (id: string) => void
 * - isLoading?: boolean
 * - placeholder?: string
 *
 * Example usage
 * -------------
 * <MapSearch
 *   value={query}
 *   onChange={setQuery}
 *   suggestions={results}
 *   onSelectSuggestion={(id) => flyToPlace(id)}
 * />
 *
 * Accessibility
 * -------------
 * Suggestion list uses `role="listbox"`/`option` so it reads as a
 * combobox pattern; full arrow-key navigation is a Phase 10 enhancement
 * once real geocoding results exist to navigate.
 *
 * Future extension
 * -----------------
 * Phase 10: debounce input, call geocoding service, add keyboard
 * navigation (ArrowUp/Down/Enter) over suggestions.
 */
export interface MapSearchSuggestion {
  id: string
  label: string
  sublabel?: string
}

export interface MapSearchProps {
  value: string
  onChange: (value: string) => void
  suggestions?: MapSearchSuggestion[]
  onSelectSuggestion?: (id: string) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function MapSearch({
  value,
  onChange,
  suggestions = [],
  onSelectSuggestion,
  placeholder = 'Search an address or place…',
  className,
}: MapSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const showSuggestions = isFocused && suggestions.length > 0

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <SearchInput
        value={value}
        onChange={onChange}
        onClear={() => onChange('')}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        className="bg-surface shadow-floating"
      />

      {showSuggestions && (
        <ul
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => onSelectSuggestion?.(suggestion.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-small hover:bg-surface-secondary"
              >
                <Icon icon={MapPin} size={14} className="shrink-0 text-text-tertiary" />
                <span className="flex flex-col">
                  <span className="text-text-primary">{suggestion.label}</span>
                  {suggestion.sublabel && (
                    <span className="text-caption text-text-tertiary">{suggestion.sublabel}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
