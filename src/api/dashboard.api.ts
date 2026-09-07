import { apiClient } from '@/api/client'

export interface DashboardSummaryQuery {
  dateFrom: string
  dateTo: string
  warehouseId: string
}

export interface DashboardProductionSummary {
  total: number
  draft: number
  materialShortage: number
  ready: number
  released: number
  inProgress: number
  completed: number
  cancelled: number
}

export interface DashboardInventorySummary {
  totalRawMaterialsWithStock: number
  totalActiveLot: number
  lowStockMaterialCount: number
  expiringLotCount: number
}

export interface DashboardQcSummary {
  waitingQc: number
  pass: number
  hold: number
  reject: number
  total: number
}

export interface DashboardPerformanceSummary {
  targetOutput: number
  actualOutput: number
  overallYield: number
  averageYield: number
  deviationCount: number
  pendingDeviationCount: number
}

export interface DashboardSummary {
  production: DashboardProductionSummary
  inventory: DashboardInventorySummary
  qc: DashboardQcSummary
  performance: DashboardPerformanceSummary
  period: {
    dateFrom: string | null
    dateTo: string | null
    warehouseId: string | null
  }
}

export const dashboardApi = {
  getSummary: (query: DashboardSummaryQuery): Promise<DashboardSummary> =>
    apiClient
      .get<DashboardSummary>('/dashboard/summary', {
        params: {
          dateFrom: query.dateFrom || undefined,
          dateTo: query.dateTo || undefined,
          warehouseId: query.warehouseId || undefined,
        },
      })
      .then((response) => response.data),
}
