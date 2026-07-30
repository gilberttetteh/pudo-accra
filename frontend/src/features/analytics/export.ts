/**
 * Purpose
 * -------
 * "Export chart as image" / "export underlying data as CSV" — the Phase
 * 8 plan §3.3 explicitly scopes this as an Analytics feature distinct
 * from Phase 9's Reports ("generating formatted documents"). These are
 * plain client-side data/image exports with no template, layout, or
 * document generation involved — Reports stays untouched.
 *
 * No dependency added: CSV is built as a plain string, image export
 * reads the canvas Chart.js already renders to (via a chart ref's
 * `.toBase64Image()`), and both trigger a download through a temporary
 * <a> element. Nothing here talks to a backend — Phase 10 territory.
 */

/** Converts an array of flat records into a CSV string. Values are
 *  quoted and internal quotes escaped; undefined/null become an empty
 *  cell rather than the literal string "undefined". */
export function toCsv<T extends Record<string, unknown>>(rows: T[], columns?: (keyof T)[]): string {
  if (rows.length === 0) return ''
  const keys = columns ?? (Object.keys(rows[0]!) as (keyof T)[])

  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
  }

  const header = keys.map((key) => escapeCell(String(key))).join(',')
  const body = rows.map((row) => keys.map((key) => escapeCell(row[key])).join(','))
  return [header, ...body].join('\n')
}

/** Triggers a browser download of a CSV string. */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

/** Triggers a browser download of a Chart.js chart as a PNG, given the
 *  chart instance (react-chartjs-2 exposes this via a ref: pass
 *  `chartRef.current` from `<Bar ref={chartRef} ... />`). */
export function downloadChartAsImage(
  chart: { toBase64Image: (type?: string, quality?: number) => string } | null | undefined,
  filename: string
): void {
  if (!chart) return
  const dataUrl = chart.toBase64Image('image/png', 1)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
