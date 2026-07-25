import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/utils/cn'
import { Icon, ChevronDown, Check } from '@/components/icons'

/**
 * Purpose
 * -------
 * Accessible dropdown select for choosing one value from a fixed list
 * (role filters, node type, layer selection).
 *
 * Props
 * -----
 * - value / onValueChange: controlled selection
 * - placeholder?: string
 * - options: { value: string; label: string; disabled?: boolean }[]
 * - size: 'sm' | 'md' | 'lg'
 * - disabled?: boolean
 *
 * Example usage
 * -------------
 * <Select
 *   value={role}
 *   onValueChange={setRole}
 *   placeholder="Select role"
 *   options={[{ value: 'admin', label: 'Administrator' }, ...]}
 * />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-select — full keyboard navigation, typeahead,
 * and correct `role="listbox"`/`option` semantics out of the box.
 *
 * Future extension
 * -----------------
 * Add an option-group variant (`SelectGroup`) once forms need categorized
 * options (e.g. layers grouped by GIS source).
 */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

const sizeClass = {
  sm: 'h-8 text-small px-2.5',
  md: 'h-9 text-body px-3',
  lg: 'h-11 text-body-lg px-4',
}

export function Select({
  value,
  onValueChange,
  placeholder = 'Select…',
  options,
  size = 'md',
  disabled,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface text-text-primary',
          'transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-text-tertiary',
          sizeClass[size],
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <Icon icon={ChevronDown} size={14} className="text-text-tertiary" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm px-7 py-2 text-body text-text-primary outline-none',
                  'data-[highlighted]:bg-surface-secondary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center">
                  <Icon icon={Check} size={14} className="text-primary-600" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
