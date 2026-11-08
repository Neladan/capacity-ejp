import type { AppState } from '../store/state'
import { buildPdfData, type PdfData } from './data'
import { buildDocDefinition } from './document'
import poppins400 from '@fontsource/poppins/files/poppins-latin-400-normal.woff?url'
import poppins600 from '@fontsource/poppins/files/poppins-latin-600-normal.woff?url'
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff?url'
import lora400i from '@fontsource/lora/files/lora-latin-400-italic.woff?url'

async function toDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob()
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

const abs = (u: string) => new URL(u, location.href).href

export interface GeneratedPdf {
  blob: Blob
  data: PdfData
}

/** Génère le PDF dans le navigateur. pdfmake n'est chargé qu'ici, à la demande. */
export async function generatePdf(state: AppState, date = new Date()): Promise<GeneratedPdf> {
  const [{ default: pdfMake }, logoWhite, logoGreen] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    toDataUrl('/logo-white.png'),
    toDataUrl('/logo-green.png'),
  ])
  const pm = pdfMake as any
  // Polices intégrées au PDF (texte vectoriel, sélectionnable) ; seules les URL du site sont autorisées.
  pm.setUrlAccessPolicy?.((url: string) => url.startsWith(location.origin))
  pm.addFonts({
    Poppins: { normal: abs(poppins400), bold: abs(poppins700), italics: abs(poppins400), bolditalics: abs(poppins700) },
    PoppinsSemi: { normal: abs(poppins600), bold: abs(poppins700), italics: abs(poppins600), bolditalics: abs(poppins700) },
    Lora: { normal: abs(lora400i), bold: abs(lora400i), italics: abs(lora400i), bolditalics: abs(lora400i) },
  })
  const data = buildPdfData(state, date)
  const doc = buildDocDefinition(data, { logoWhite, logoGreen })
  const blob: Blob = await pm.createPdf(doc).getBlob()
  return { blob, data }
}
