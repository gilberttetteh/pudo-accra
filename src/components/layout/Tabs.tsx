import type { ComponentPropsWithoutRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Switches between related views without navigation (e.g. a node detail
 * panel's "Overview / Coverage / History" tabs). For top-level app
 * navigation, use the Sidebar/TopNav (Phase 3), not Tabs.
 *
 * Props
 * -----
 * TabsRoot: value / onValueChange, defaultValue
 * TabsList: contains TabsTrigger children
 * TabsTrigger: value (required)
 * TabsContent: value (required)
 *
 * Example usage
 * -------------
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="coverage">Coverage</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">...</TabsContent>
 *   <TabsContent value="coverage">...</TabsContent>
 * </Tabs>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-tabs — arrow-key navigation and
 * `role="tablist"`/`tab`/`tabpanel` handled automatically.
 *
 * Future extension
 * -----------------
 * Add a `variant="pills"` visual style if the sidebar needs it.
 */
export const Tabs = TabsPrimitive.Root

export function TabsList({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-1 border-b border-border', className)}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'border-b-2 border-transparent px-3 py-2.5 text-small font-medium text-text-secondary',
        'transition-colors duration-(--duration-fast) hover:text-text-primary',
        'data-[state=active]:border-primary-600 data-[state=active]:text-text-primary',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('pt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
}
