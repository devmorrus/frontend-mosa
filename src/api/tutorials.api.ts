import { apiClient } from '@/api/client'
import type { ApiPaginatedResponse } from '@/types/api'

export interface TutorialCatalogItem {
  tutorialId: string
  title: string
  description: string
  category: string
  requiredPermissions: string[]
  allowedRoles: string[]
  totalSteps: number
  entryRoute: string
}

export type TutorialProgressStatus = 'InProgress' | 'Completed' | 'Skipped'

export interface TutorialProgress {
  id: string
  userId: string
  tutorialId: string
  status: TutorialProgressStatus
  statusLabel: string
  currentStepIndex: number
  totalSteps: number
  completedAtUtc: string | null
  createdAtUtc: string
  updatedAtUtc: string | null
}

/**
 * Backend tutorial progress API (Tasking 5).
 * Semua panggilan best-effort: engine tetap jalan dengan localStorage bila API gagal.
 */
export const tutorialsApi = {
  catalog(): Promise<TutorialCatalogItem[]> {
    return apiClient.get<TutorialCatalogItem[]>('/tutorials/catalog').then((r) => r.data)
  },

  progress(query: { search?: string; status?: string; page: number; pageSize: number }): Promise<ApiPaginatedResponse<TutorialProgress>> {
    return apiClient
      .get<ApiPaginatedResponse<TutorialProgress>>('/tutorials/progress', {
        params: {
          search: query.search || undefined,
          status: query.status || undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((r) => r.data)
  },

  getProgress(tutorialId: string): Promise<TutorialProgress> {
    return apiClient.get<TutorialProgress>(`/tutorials/progress/${tutorialId}`).then((r) => r.data)
  },

  start(tutorialId: string, totalSteps: number): Promise<TutorialProgress> {
    return apiClient
      .post<TutorialProgress>(`/tutorials/progress/${tutorialId}/start`, { totalSteps })
      .then((r) => r.data)
  },

  advance(tutorialId: string, nextStepIndex: number): Promise<TutorialProgress> {
    return apiClient
      .post<TutorialProgress>(`/tutorials/progress/${tutorialId}/advance`, { nextStepIndex })
      .then((r) => r.data)
  },

  complete(tutorialId: string): Promise<TutorialProgress> {
    return apiClient.post<TutorialProgress>(`/tutorials/progress/${tutorialId}/complete`).then((r) => r.data)
  },

  skip(tutorialId: string): Promise<TutorialProgress> {
    return apiClient.post<TutorialProgress>(`/tutorials/progress/${tutorialId}/skip`).then((r) => r.data)
  },
}

/** Fire-and-forget sync: jangan pernah crash tutorial bila backend tidak tersedia. */
export function syncTutorialProgressBestEffort(promise: Promise<unknown>): void {
  promise.catch(() => {
    // localStorage store tetap sumber kebenaran lokal; backend sync menyusul.
  })
}
