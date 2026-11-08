import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

/** Dessine la première page du PDF dans un canvas (pdf.js, chargé à la demande). */
export async function renderFirstPage(blob: Blob, canvas: HTMLCanvasElement, cssWidth: number): Promise<number> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise
  const page = await doc.getPage(1)
  const base = page.getViewport({ scale: 1 })
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  canvas.style.aspectRatio = `${base.width} / ${base.height}`
  await page.render({ canvas, viewport }).promise
  const pages = doc.numPages
  await doc.cleanup?.()
  return pages
}
