import { expect, test } from '@playwright/test'

const PASSWORD = 'Password123!'

async function loginAs(page: import('@playwright/test').Page, username: string) {
  await page.goto('/login')
  await page.getByLabel('Email atau username').fill(username)
  await page.getByLabel('Kata sandi', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Masuk ke dashboard' }).click()
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15000 })
}

async function expectNoPageOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(
    overflow.scrollWidth,
    `horizontal overflow: scrollWidth ${overflow.scrollWidth} > viewport ${overflow.clientWidth} at ${page.url()}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

// Priority UAT routes per role (TASKING 5 scope).
const flows: Array<{ name: string; user: string; path: string; ready: string }> = [
  { name: 'receiving', user: 'warehouse', path: '/goods-receiving', ready: 'main' },
  { name: 'inventory', user: 'warehouse', path: '/inventory', ready: 'main' },
  { name: 'qr-scan', user: 'warehouse', path: '/lots/scan', ready: 'main' },
  { name: 'opname', user: 'warehouse', path: '/warehouse/stock-opname', ready: 'main' },
  { name: 'operator-queue', user: 'operator', path: '/operator/production', ready: 'main' },
  { name: 'qc-queue', user: 'qc', path: '/quality-control', ready: '[data-tour="qc-queue"]' },
  { name: 'traceability', user: 'management', path: '/traceability', ready: '[data-tour="traceability-search"]' },
  { name: 'reports', user: 'management', path: '/reports/material-consumption', ready: '[data-tour="reports-result"]' },
  { name: 'deviation', user: 'supervisor', path: '/production/deviations', ready: '[data-tour="deviation-queue"]' },
]

for (const flow of flows) {
  test(`UX overflow ${flow.name} has no page-level horizontal scroll`, async ({ page }) => {
    await loginAs(page, flow.user)
    await page.goto(flow.path)
    await expect(page.locator(flow.ready).first()).toBeVisible({ timeout: 15000 })
    await expectNoPageOverflow(page)
  })
}

test('UX release dialog requires explicit confirmation', async ({ page }) => {
  await loginAs(page, 'supervisor')
  const readyId = await page.evaluate(async () => {
    const token = localStorage.getItem('mosa.accessToken') ?? ''
    const res = await fetch('http://localhost:5104/api/production-orders?status=Ready&page=1&pageSize=5', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const body = await res.json()
    return (body.items?.[0]?.id ?? null) as string | null
  })
  test.skip(!readyId, 'no Ready PO available for release-dialog proof')
  await page.goto(`/production/orders/${readyId}`)
  await expect(page.getByRole('button', { name: /^Release$/ })).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: /^Release$/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('button', { name: /Ya, Release/ })).toBeVisible()
  await page.getByRole('button', { name: 'Batal' }).click()
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 })
  await expect(page.getByRole('button', { name: /^Release$/ })).toBeVisible()
})

test('UX invalid LOT shows Indonesian guidance (no bare 409)', async ({ page }) => {
  await loginAs(page, 'warehouse')
  await page.goto('/lots/scan')
  const input = page.getByPlaceholder(/token mentah|TESTTOKEN/i)
  await expect(input).toBeVisible({ timeout: 15000 })
  await input.fill('NOT-A-REAL-LOT-XYZ')
  await page.getByRole('button', { name: /resolve token/i }).click()
  await expect(page.getByText(/QR tidak dikenali/i).first()).toBeVisible({ timeout: 15000 })
  await input.fill('ZZZZ9999XXXX0000')
  await page.getByRole('button', { name: /resolve token/i }).click()
  await expect(page.getByText(/LOT tidak ditemukan/i).first()).toBeVisible({ timeout: 15000 })
})
