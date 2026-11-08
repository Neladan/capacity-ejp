import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = ['/', '/prenom', '/famille/capacites-relationnelles', '/bilan', '/export']

for (const path of pages) {
  test(`accessibilité WCAG 2.1 AA : ${path}`, async ({ page }) => {
    await page.goto('/famille/capacites-relationnelles')
    // Quelques réponses pour que les états marqués soient audités aussi.
    for (const name of [/^Écouter sans interrompre/, /^Reformuler ce que l.autre a dit/]) {
      await page.getByRole('checkbox', { name }).click()
    }
    await page.goto(path)
    await page.waitForTimeout(900)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
    expect(summary).toEqual([])
  })
}
