import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('parcours complet : cocher, changer de niveau, remplir le bilan, télécharger le PDF', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'

  // Accueil → prénom
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Mon catalogue des possibles' })).toBeVisible()
  await page.getByRole('button', { name: 'Commencer' }).first().click()
  await page.getByLabel(/Comment t.appelles-tu/).fill('Test')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await expect(page).toHaveURL(/\/famille\/capacites-relationnelles/)

  // Un toucher : « Je sais déjà »
  const item1 = page.getByRole('checkbox', { name: /^Écouter sans interrompre/ })
  await item1.click()
  await expect(item1).toHaveAttribute('aria-checked', 'true')
  await expect(item1).toHaveAccessibleName(/Je sais déjà/)

  // Deuxième élément, puis changement de niveau via le sélecteur
  const item2 = page.getByRole('checkbox', { name: /^Reformuler ce que l.autre a dit/ })
  await item2.click()
  await page.getByRole('button', { name: /Choisir le niveau pour « Reformuler ce que l.autre a dit »/ }).click()
  await page.getByRole('radio', { name: /Envie d.essayer/ }).click()
  await expect(item2).toHaveAccessibleName(/Envie d.essayer/)

  // Un toucher sur un élément marqué retire la marque
  const item3 = page.getByRole('checkbox', { name: /^Poser des questions ouvertes/ })
  await item3.click()
  await item3.click()
  await expect(item3).toHaveAttribute('aria-checked', 'false')

  // Compteur du thème
  await expect(page.locator('#theme-communication-et-ecoute .counter')).toContainText('2')

  // La sauvegarde survit au rechargement
  await page.reload()
  await expect(page.getByRole('checkbox', { name: /^Écouter sans interrompre/ })).toHaveAttribute('aria-checked', 'true')

  // Recherche dans tout le catalogue
  if (mobile) await page.getByRole('button', { name: 'Rechercher' }).click()
  else await page.locator('.side').getByRole('button', { name: 'Rechercher' }).click()
  await page.getByRole('searchbox').fill('cuisiner un repas')
  await page.getByRole('button', { name: /Cuisiner un repas simple/ }).click()
  await expect(page).toHaveURL(/competences-techniques-et-organisationnelles/)

  // Bilan : forces et rubriques
  await page.goto('/bilan')
  // Une seule famille contient des « Je sais déjà » : son volet est ouvert d'emblée.
  await page.getByRole('button', { name: 'Écouter sans interrompre', exact: true }).click()
  await expect(page.locator('.forces-count')).toContainText('1')
  await page.getByLabel('Ce que les autres voient de bien en moi').fill('On me dit que j’écoute bien.')
  await page.getByLabel('Mon premier petit pas cette semaine').fill('Proposer mon aide samedi.')
  await page.reload()
  await expect(page.getByLabel('Ce que les autres voient de bien en moi')).toHaveValue('On me dit que j’écoute bien.')

  // Export PDF
  await page.goto('/export')
  await expect(page.locator('.preview')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 })
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Télécharger le PDF' }).click()])
  expect(download.suggestedFilename()).toMatch(/^mon-catalogue-des-possibles-test-\d{4}-\d{2}-\d{2}\.pdf$/)
  const pdf = readFileSync((await download.path())!)
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  expect(pdf.length).toBeGreaterThan(20_000)
})

test('recommencer demande une confirmation dans la page', async ({ page }) => {
  await page.goto('/famille/capacites-relationnelles')
  await page.getByRole('checkbox', { name: /^Écouter sans interrompre/ }).click()
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Reprendre là où je me suis arrêté/ })).toBeVisible()
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await page.getByRole('button', { name: 'Garder mes réponses' }).click()
  await expect(page.getByRole('link', { name: /Reprendre/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await expect(page.getByRole('button', { name: 'Commencer' }).first()).toBeVisible()
})
