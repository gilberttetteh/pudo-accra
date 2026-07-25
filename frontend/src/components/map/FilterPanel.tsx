import type { ReactNode } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/layout/Accordion'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Reusable, collapsible filter panel shell for the map sidebar (e.g.
 * "Node status", "Coverage score range", "Layer visibility") and, later,
 * the Node/Analytics list pages. This component owns only the section
 * layout — each section's actual controls (Checkbox groups, Select,
 * range inputs) are passed as children so FilterPanel stays decoupled
 * from any specific filter's business logic.
 *
 * Props
 * -----
 * - sections: { id: string; title: string; content: ReactNode }[]
 * - defaultOpenSections?: string[]
 * - className?: string
 *
 * Example usage
 * -------------
 * <FilterPanel
 *   sections={[
 *     { id: 'status', title: 'Node Status', content: <StatusCheckboxes /> },
 *     { id: 'coverage', title: 'Coverage Score', content: <CoverageRangeSlider /> },
 *   ]}
 *   defaultOpenSections={['status']}
 * />
 *
 * Accessibility
 * -------------
 * Built on the Accordion component (Radix-backed), so section
 * expand/collapse is fully keyboard accessible.
 *
 * Future extension
 * -----------------
 * Add an "Active filter count" badge per section and a top-level
 * "Clear all filters" action once real filter state (Phase 7/10) exists.
 */
export interface FilterPanelSection {
  id: string
  title: string
  content: ReactNode
}

export interface FilterPanelProps {
  sections: FilterPanelSection[]
  defaultOpenSections?: string[]
  className?: string
}

export function FilterPanel({ sections, defaultOpenSections, className }: FilterPanelProps) {
  return (
    <div
      className={cn(
        'w-72 rounded-lg border border-border bg-surface p-2 shadow-floating',
        className
      )}
    >
      <Accordion type="multiple" defaultValue={defaultOpenSections}>
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="px-2">
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>{section.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
