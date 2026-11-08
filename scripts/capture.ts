/* Captures mobile (390 px) et desktop (1440 px) de chaque écran. Usage : bun scripts/capture.ts [baseUrl] [filtre] */
import { chromium, type Page } from '@playwright/test'
import { exampleState } from './example-state'
import { STORAGE_KEY } from '../src/store/state'

const base = process.argv[2] ?? 'http://localhost:5173'
const only = process.argv[3]
const out = 'docs/captures'
const state = JSON.stringify(exampleState())

interface Shot {
  name: string
  path: string
  seeded: boolean
  prepare?: (page: Page, mobile: boolean) => Promise<void>
  fullPage?: boolean
}

const shots: Shot[] = [
  { name: '01-accueil', path: '/', seeded: false },
  { name: '01b-accueil-sections', path: '/', seeded: false, fullPage: true, prepare: revealAll },
  { name: '02-prenom', path: '/prenom', seeded: false },
  { name: '03-intercalaire-famille', path: '/famille/capacites-intellectuelles', seeded: true },
  {
    name: '04-theme-elements-marques',
    path: '/famille/capacites-relationnelles',
    seeded: true,
    prepare: async (page) => {
      await page.evaluate(() => document.getElementById('theme-communication-et-ecoute')?.scrollIntoView())
      await page.waitForTimeout(400)
      await page.locator('#element-3 .more').click()
      await page.waitForTimeout(400)
    },
  },
  { name: '05-recap-famille', path: '/famille/capacites-relationnelles', seeded: true, prepare: async (page) => {
      await page.evaluate(() => document.querySelector('.recap')?.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(900)
    } },
  { name: '06-sommaire-mobile', path: '/famille/qualites-personnelles', seeded: true, prepare: async (page, mobile) => {
      if (!mobile) return
      await page.getByRole('button', { name: 'Ouvrir le sommaire' }).click()
      await page.waitForTimeout(500)
    } },
  { name: '07-recherche', path: '/famille/capacites-relationnelles', seeded: true, prepare: async (page, mobile) => {
      await page.getByRole('button', { name: 'Rechercher' }).first().click()
      await page.keyboard.type('organiser')
      await page.waitForTimeout(400)
      void mobile
    } },
  { name: '08-bilan', path: '/bilan', seeded: true, fullPage: true, prepare: revealAll },
  { name: '09-export-apercu', path: '/export', seeded: true, prepare: async (page) => {
      await page.waitForSelector('.preview[data-status="ready"]', { timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(800)
    } },
]

async function revealAll(page: Page) {
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(600)
  await page.evaluate(() => window.scrollTo(0, 0))
}

const browser = await chromium.launch()
for (const [label, viewport, mobile] of [
  ['mobile', { width: 390, height: 844 }, true],
  ['desktop', { width: 1440, height: 900 }, false],
] as const) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, locale: 'fr-FR' })
  for (const shot of shots) {
    if (only && !shot.name.includes(only)) continue
    const page = await ctx.newPage()
    await page.goto(base + '/')
    await page.evaluate(
      ([key, value, seeded]) => {
        if (seeded) localStorage.setItem(key as string, value as string)
        else localStorage.removeItem(key as string)
      },
      [STORAGE_KEY, state, shot.seeded],
    )
    await page.goto(base + shot.path)
    await page.waitForTimeout(900)
    if (shot.prepare) await shot.prepare(page, mobile)
    await page.screenshot({ path: `${out}/${shot.name}-${label}.png`, fullPage: shot.fullPage ?? false })
    await page.close()
    console.log('✓', shot.name, label)
  }
  await ctx.close()
}
await browser.close()
