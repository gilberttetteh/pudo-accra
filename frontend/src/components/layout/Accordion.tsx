import type { ComponentPropsWithoutRef } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '@/utils/cn'
import { Icon, ChevronDown } from '@/components/icons'

/**
 * Purpose
 * -------
 * Collapsible content sections — FAQ-style help panels, grouped filter
 * sections (e.g. FilterPanel's "Road Network / Flood Zones / Isochrones"
 * groups).
 *
 * Props
 * -----
 * AccordionRoot: type: 'single' | 'multiple', collapsible, value/onValueChange
 * AccordionItem: value (required)
 * AccordionTrigger / AccordionContent: children
 *
 * Example usage
 * -------------
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="layers">
 *     <AccordionTrigger>Map Layers</AccordionTrigger>
 *     <AccordionContent>...</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-accordion — correct `aria-expanded` and
 * heading-button semantics automatically.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export const Accordion = AccordionPrimitive.Root
export const AccordionItem = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item className={cn('border-b border-border', className)} {...props} />
)

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-center justify-between py-3 text-body font-medium text-text-primary',
          'focus-visible:outline-2 focus-visible:outline-offset-2',
          className
        )}
        {...props}
      >
        {children}
        <Icon
          icon={ChevronDown}
          size={16}
          className="text-text-tertiary transition-transform duration-(--duration-fast) group-data-[state=open]:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn('overflow-hidden pb-3 text-small text-text-secondary', className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Content>
  )
}
