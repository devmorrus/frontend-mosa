import { expect, test } from '@playwright/test'
import { expectAppShell, mockAuthenticatedApi, seedSession } from './fixtures'

test('unauthenticated direct URL redirects to login on every viewport', async ({ page }) => {
  await page.goto('/production/recipes')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Masuk ke akun Anda' })).toBeVisible()
})

test('login screen exposes required controls and remains usable on small screens', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByLabel('Email atau username')).toBeVisible()
  await expect(page.getByLabel('Kata sandi', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Masuk ke dashboard' })).toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'hidden')
})

test('authenticated shell renders responsive navigation and tutorial entry point', async ({ page }) => {
  await mockAuthenticatedApi(page)
  await seedSession(page)
  await page.goto('/help/tutorials')
  await expectAppShell(page)
  await expect(page.getByText('Tutorial & Panduan Operasional MOSA')).toBeVisible()

  if (await page.locator('button[aria-label="Buka menu"]:visible').count()) {
    await page.getByRole('button', { name: 'Buka menu' }).click()
    await expect(page.locator('[data-tour="sidebar"]').last()).toBeVisible()
  }
})

test('authenticated user without route permission is redirected to 403', async ({ page }) => {
  await mockAuthenticatedApi(page, ['dashboard.view'])
  await seedSession(page)
  await page.goto('/production/recipes')
  await expect(page).toHaveURL(/\/403$/)
  await expect(page.getByText('Akses ditolak')).toBeVisible()
})
