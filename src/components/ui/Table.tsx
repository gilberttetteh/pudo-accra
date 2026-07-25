import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Icon, ChevronDown } from '@/components/icons'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'

/**
 * Purpose
 * -------
 * Generic, typed data table for node lists, candidate rankings, and
 * activity logs. Column definitions drive both rendering and (optional)
 * sorting — pages compose this rather than hand-rolling <table> markup.
 *
 * Props
 * -----
 * - columns: Column<T>[] — each with a header, accessor/render fn, and
 *   optional `sortable` flag
 * - data: T[]
 * - keyField: keyof T — unique row key
 * - isLoading?: boolean — renders skeleton rows
 * - emptyMessage?: string — shown via EmptyState when data is []
 * - sortState / onSortChange — optional controlled sorting
 * - onRowClick?: (row: T) => void
 *
 * Example usage
 * -------------
 * <Table
 *   keyField="id"
 *   columns={[
 *     { id: 'name', header: 'Node', accessor: (row) => row.name, sortable: true },
 *     { id: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
 *   ]}
 *   data={nodes}
 * />
 *
 * Accessibility
 * -------------
 * Uses semantic <table>/<thead>/<tbody> markup. Sortable headers are
 * real <button>s with `aria-sort` on the parent <th>.
 *
 * Future extension
 * -----------------
 * Add row selection (checkbox column) and sticky header support once
 * Node/Analytics tables (Phase 6+) need them.
 */
export interface Column<T> {
  id: string
  header: string
  accessor?: (row: T) => ReactNode
  render?: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  widthClassName?: string
}

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  columnId: string
  direction: SortDirection
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  isLoading?: boolean
  loadingRowCount?: number
  emptyMessage?: string
  sortState?: SortState
  onSortChange?: (state: SortState) => void
  onRowClick?: (row: T) => void
  className?: string
}

const alignClass: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

export function Table<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  loadingRowCount = 5,
  emptyMessage = 'No records found.',
  sortState,
  onSortChange,
  onRowClick,
  className,
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return
    const nextDirection: SortDirection =
      sortState?.columnId === column.id && sortState.direction === 'asc' ? 'desc' : 'asc'
    onSortChange({ columnId: column.id, direction: nextDirection })
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-border bg-surface-secondary">
            {columns.map((column) => {
              const isSorted = sortState?.columnId === column.id
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? sortState!.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    'px-4 py-3 text-caption font-semibold uppercase tracking-wide text-text-secondary',
                    alignClass[column.align ?? 'left'],
                    column.widthClassName
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                    >
                      {column.header}
                      <Icon
                        icon={ChevronDown}
                        size={12}
                        className={cn(
                          'transition-transform duration-(--duration-fast)',
                          isSorted && sortState!.direction === 'desc' && 'rotate-180',
                          !isSorted && 'opacity-30'
                        )}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-0">
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-surface-secondary'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'px-4 py-3 text-text-primary',
                      alignClass[column.align ?? 'left']
                    )}
                  >
                    {column.render ? column.render(row) : column.accessor?.(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
