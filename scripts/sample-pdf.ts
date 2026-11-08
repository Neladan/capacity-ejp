/* Génère docs/exemple/…pdf à partir des réponses FICTIVES. Usage : bun scripts/sample-pdf.ts [baseUrl] */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { exampleState } from './example-state'
import { STORAGE_KEY } from '../src/store/state'

const base = process.argv[2] ?? 'http://localhost:5173'
mkdirSync('docs/exemple', { recursive: true })
const browser = await chromium.launch()
const page = await (await browser.newContext({ acceptDownloads: true, locale: 'fr-FR' })).newPage()
await page.goto(base + '/')
await page.evaluate(([k, v]) => localStorage.setItem(k, v), [STORAGE_KEY, JSON.stringify(exampleState())])
await page.goto(base + '/export')
const button = page.getByRole('button', { name: 'Télécharger le PDF' })
await button.waitFor()
await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('.dl')?.disabled, null, { timeout: 30000 })
const [download] = await Promise.all([page.waitForEvent('download'), button.click()])
const path = `docs/exemple/${download.suggestedFilename()}`
await download.saveAs(path)
console.log(path)
await browser.close()
