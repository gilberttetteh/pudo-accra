import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Purpose
 * -------
 * Client-side PDF export of the on-screen report preview — screenshots
 * the rendered DOM node (via html2canvas) and lays the image across as
 * many A4 pages as it needs (via jsPDF). No backend involved, matching
 * every other phase's mock-data-only scope until Phase 10.
 *
 * Why this approach over @react-pdf/renderer
 * -------------------------------------------
 * Trade-off noted explicitly (see PHASE_9_REPORTS_PLAN.md §5): this
 * produces a PDF that looks exactly like the live preview — including
 * the same Chart.js charts, StatCards, and Tailwind styling — with very
 * little extra code, at the cost of slightly softer text (it's a
 * rasterized image, not real PDF text) and simple top-to-bottom page
 * breaks rather than smart pagination. If print/text-quality becomes a
 * real requirement later, this function is the single seam to swap for
 * a `@react-pdf/renderer` document tree — every caller only depends on
 * this function's signature (an element + a filename in, a downloaded
 * file as the side effect), not on how the PDF gets built.
 */
export async function exportReportAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  })

  const imageData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imageWidth = pageWidth
  const imageHeight = (canvas.height * imageWidth) / canvas.width

  let heightRemaining = imageHeight
  let position = 0

  pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
  heightRemaining -= pageHeight

  while (heightRemaining > 0) {
    position = heightRemaining - imageHeight
    pdf.addPage()
    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
    heightRemaining -= pageHeight
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
