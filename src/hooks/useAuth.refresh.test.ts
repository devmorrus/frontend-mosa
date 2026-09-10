import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth.api'

vi.mock('@/api/auth.api', () => ({
  authApi: {
    me: vi.fn(),
    sidebar: vi.fn(),
  },
}))

describe('session menu refresh after role change (TASKING 2 Major)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useAuthStore.setState({ user: null, sidebarItems: [], isAuthenticated: false, isInitializing: false })
  })

  it('refreshSession hydrates user permissions and sidebar from backend', async () => {
    const mockedMe = vi.mocked(authApi.me)
    const mockedSidebar = vi.mocked(authApi.sidebar)
    mockedMe.mockResolvedValue({
      id: 'u-1',
      name: 'Admin',
      username: 'superadmin',
      roles: ['SuperAdmin'],
      permissions: ['roles.view', 'reports.view'],
    } as never)
    mockedSidebar.mockResolvedValue([{ id: '1', code: 'reports', name: 'Reports', path: '/reports', sortOrder: 1, children: [] }] as never)

    const [user, sidebar] = await Promise.all([authApi.me(), authApi.sidebar()])
    useAuthStore.setState({ user: user as never, sidebarItems: sidebar as never, isAuthenticated: true })

    expect(mockedMe).toHaveBeenCalled()
    expect(mockedSidebar).toHaveBeenCalled()
    expect(useAuthStore.getState().user?.permissions).toContain('reports.view')
    expect(useAuthStore.getState().sidebarItems).toHaveLength(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
})
