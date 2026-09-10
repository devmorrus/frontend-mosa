import { expect, type Page } from '@playwright/test'

export const allPermissions = [
  'suppliers.view', 'materials.view', 'products.view', 'recipes.view', 'recipes.create', 'recipes.approve',
  'production-orders.view', 'production-orders.create', 'production-orders.execute', 'finished-goods-lots.view',
  'traceability.view', 'reports.view', 'qc.view', 'production-deviations.view', 'receiving.view', 'receiving.create',
  'uoms.view', 'warehouses.view', 'users.view', 'roles.view', 'audit.view', 'menus.view',
]

export async function mockAuthenticatedApi(page: Page, permissions = allPermissions) {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-user',
        username: 'e2e.operator',
        fullName: 'E2E Operator',
        isAuthenticated: true,
        roles: ['OPERATOR'],
        permissions,
      }),
    })
  })

  await page.route('**/api/sidebar/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
}

export async function seedSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('mosa.accessToken', 'e2e-access-token')
    localStorage.setItem('mosa.refreshToken', 'e2e-refresh-token')
  })
}

export async function expectAppShell(page: Page) {
  const desktopSidebar = page.locator('aside[data-tour="sidebar"]:visible')
  const mobileMenu = page.locator('button[aria-label="Buka menu"]:visible')
  await expect(desktopSidebar.or(mobileMenu)).toBeVisible()
  await expect(page.locator('[data-tour="user-profile"]')).toBeVisible()
}
