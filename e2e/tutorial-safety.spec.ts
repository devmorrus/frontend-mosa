import { expect, test } from '@playwright/test'
import { mockAuthenticatedApi, seedSession } from './fixtures'

test('tutorial launcher filters by permission and starts without mutating an API transaction', async ({ page }) => {
  await mockAuthenticatedApi(page, ['production-orders.execute', 'recipes.view'])
  await seedSession(page)

  const mutationRequests: string[] = []
  await page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutationRequests.push(request.url())
  })

  await page.goto('/help/tutorials')
  await expect(page.getByText('Guided Production (Operator)')).toBeVisible()
  await page.getByText('Guided Production (Operator)').locator('xpath=ancestor::div[.//button][1]').getByRole('button', { name: 'Mulai Tutorial' }).click()
  await expect(page.getByText(/Antrean Kerja Operator|Pilih Production Order/)).toBeVisible()
  expect(mutationRequests.filter((url) => !url.includes('/auth/refresh') && !url.includes('/tutorials/progress/'))).toEqual([])
})

test('critical tutorial step remains informational and cannot submit a transaction', async ({ page }) => {
  await mockAuthenticatedApi(page, ['production-orders.execute'])
  await seedSession(page)
  await page.goto('/help/tutorials')
  await page.getByText('Guided Production (Operator)').locator('xpath=ancestor::div[.//button][1]').getByRole('button', { name: 'Mulai Tutorial' }).click()

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: /Next/ }).click()
  }

  await expect(page.getByText('Form Konsumsi LOT')).toBeVisible()
  await expect(page.getByText('Tindakan Diperlukan')).toHaveCount(0)
})
