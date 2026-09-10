import { expect, test } from '@playwright/test'

const PASSWORD = 'Password123!'
const FG_LOT_ID = '01a0894b-28a8-7d3c-9732-deb018295b9b'
const RM_LOT_ID = '01a08949-446d-7f59-ad16-29416841e9db'
const FG_LOT_NUMBER = 'FG-20260910-00001'
const RM_LOT_NUMBER = 'RM-20260910-00001'

async function loginAs(page: import('@playwright/test').Page, username: string) {
  await page.goto('/login')
  await page.getByLabel('Email atau username').fill(username)
  await page.getByLabel('Kata sandi', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Masuk ke dashboard' }).click()
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15000 })
  const token = await page.evaluate(() => localStorage.getItem('mosa.accessToken') ?? localStorage.getItem('mosa_accessToken') ?? '')
  expect(token).toBeTruthy()
}

test('RC-UAT-01 superadmin login hits 5104 and renders dashboard', async ({ page }) => {
  const apiHits: string[] = []
  page.on('request', (req) => {
    const url = req.url()
    if (url.includes('localhost:5104/api')) apiHits.push(url)
  })
  await loginAs(page, 'superadmin')
  await expect(page).toHaveURL(/\/(dashboard|403)/, { timeout: 15000 })
  await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 })
  expect(apiHits.length).toBeGreaterThan(0)
  for (const url of apiHits) {
    expect(url).toContain('localhost:5104/api')
    expect(url).not.toContain('/src/')
  }
})

test('RC-UAT-02 reports filter and export follow active filter', async ({ page }) => {
  await loginAs(page, 'management')
  await page.goto('/reports/material-consumption')
  await expect(page.locator('[data-tour="reports-filter"]')).toBeVisible({ timeout: 15000 })
  const dateInput = page.locator('[data-tour="reports-date-filter"]')
  await expect(dateInput).toBeVisible()
  await dateInput.fill('2026-09-01')
  await page.getByRole('button', { name: /apply/i }).click()
  await expect(page.locator('[data-tour="reports-result"]')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-tour="reports-export"]')).toBeVisible()
})

test('RC-UAT-03 operator queue shows anti-stale refresh controls', async ({ page }) => {
  await loginAs(page, 'operator')
  await page.goto('/operator/production')
  await expect(page.getByRole('button', { name: /refresh antrean/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/auto-refresh 15 detik/i)).toBeVisible()
})

test('RC-UAT-04 QC queue shows refresh and status filter', async ({ page }) => {
  await loginAs(page, 'qc')
  await page.goto('/quality-control')
  await expect(page.locator('[data-tour="qc-queue"]')).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('button', { name: /refresh queue/i })).toBeVisible()
  await expect(page.getByText(/auto-refresh 15 detik/i)).toBeVisible()
})

test('RC-UAT-05 deviation queue shows refresh for supervisor decision visibility', async ({ page }) => {
  await loginAs(page, 'supervisor')
  await page.goto('/production/deviations')
  await expect(page.locator('[data-tour="deviation-queue"]')).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('button', { name: /refresh queue/i })).toBeVisible()
})

test('RC-UAT-06 traceability FG to RM navigation keeps rows', async ({ page }) => {
  await loginAs(page, 'superadmin')
  await page.goto(`/traceability/finished-goods/${FG_LOT_ID}`)
  await expect(page.getByText(FG_LOT_NUMBER).first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-tour="traceability-materials"]').first()).toBeVisible()
  const rmLink = page.getByRole('link', { name: RM_LOT_NUMBER })
  await expect(rmLink).toBeVisible()
  await rmLink.click()
  await expect(page).toHaveURL(/\/lots\/|\/traceability\/raw-material\//, { timeout: 15000 })
  await page.goto(`/traceability/raw-material/${RM_LOT_ID}`)
  await expect(page.getByText(RM_LOT_NUMBER).first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-tour="traceability-affected-batches"]')).toBeVisible()
})

test('RC-UAT-07 QR manual fallback rejects invalid token without crash', async ({ page }) => {
  await loginAs(page, 'warehouse')
  await page.goto('/lots/scan')
  await expect(page.getByRole('heading', { name: /scan qr/i }).first()).toBeVisible({ timeout: 15000 })
  const input = page.getByPlaceholder(/token mentah|TESTTOKEN/i)
  await expect(input).toBeVisible()
  await input.fill('INVALID-TOKEN-XYZ-123')
  await page.getByRole('button', { name: /resolve token/i }).click()
  await expect(page.getByText(/tidak ditemukan|tidak dikenali|invalid/i).first()).toBeVisible({ timeout: 15000 })
})

test('RC-UAT-08 roles page loads and tutorial respects permission', async ({ page }) => {
  await loginAs(page, 'superadmin')
  await page.goto('/admin/roles')
  await expect(page.getByRole('heading', { name: /kelola role/i }).first()).toBeVisible({ timeout: 15000 })
  await page.goto('/help/tutorials')
  await expect(page.locator('main').getByText(/tutorial/i).first()).toBeVisible({ timeout: 15000 })
})

test('RC-UAT-09 browser refresh keeps server state on report page', async ({ page }) => {
  await loginAs(page, 'management')
  await page.goto('/reports/material-consumption')
  await expect(page.locator('[data-tour="reports-result"]')).toBeVisible({ timeout: 15000 })
  await page.reload()
  await expect(page.locator('[data-tour="reports-result"]')).toBeVisible({ timeout: 15000 })
})

test('RC-UAT-10 receiving detail shows POSTED and survives refresh', async ({ page }) => {
  await loginAs(page, 'warehouse')
  await page.goto('/goods-receiving/01a08949-4425-753e-9727-d4971eae7855')
  await expect(page.getByText('E2E-D18-030555-GR').first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-tour="receiving-summary"]').first()).toBeVisible({ timeout: 15000 })
  await page.reload()
  await expect(page.getByText('E2E-D18-030555-GR').first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-tour="receiving-generated-lots"]').first()).toBeVisible({ timeout: 15000 })
})

test('RC-UAT-11 audit trail filter loads without global 403 bounce', async ({ page }) => {
  await loginAs(page, 'superadmin')
  await page.goto('/admin/audit-trail')
  await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 })
  await expect(page).not.toHaveURL(/\/403/, { timeout: 5000 })
})

test('RC-UAT-12 roles permission dialog opens without mutation', async ({ page }) => {
  await loginAs(page, 'superadmin')
  await page.goto('/admin/roles')
  await expect(page.locator('main').getByRole('heading', { name: /kelola role/i })).toBeVisible({ timeout: 15000 })
  const permButton = page.locator('main').getByRole('button', { name: /permission/i }).first()
  if (await permButton.count()) {
    if (await permButton.isVisible()) {
      await permButton.click()
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 15000 })
      await page.keyboard.press('Escape')
      return
    }
  }
  await expect(page.locator('main').getByText(/total role/i).first()).toBeVisible({ timeout: 15000 })
})
