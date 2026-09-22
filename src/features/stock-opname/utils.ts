import type { StockOpnameItem, StockOpnameStatus } from '@/features/stock-opname/types'

export function getStockOpnameStatusLabel(status: StockOpnameStatus) {
  switch (status) {
    case 'DRAFT': return 'Draft'
    case 'INPROGRESS': return 'In Progress'
    case 'READYTOPOST': return 'Ready to Post'
    case 'POSTED': return 'Posted'
    case 'CANCELLED': return 'Cancelled'
  }
}

export function getStockOpnameStatusTone(status: StockOpnameStatus) {
  switch (status) {
    case 'DRAFT': return 'border-slate-200 bg-slate-100 text-slate-600'
    case 'INPROGRESS': return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'READYTOPOST': return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'POSTED': return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'CANCELLED': return 'border-slate-200 bg-slate-100 text-slate-500'
  }
}

export function getStockOpnameVarianceTone(value: number | null) {
  if (value === null) return 'border-slate-200 bg-slate-50 text-slate-500'
  if (value === 0) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (value > 0) return 'border-blue-200 bg-blue-50 text-blue-700'
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

export function getStockOpnameVarianceLabel(value: number | null) {
  if (value === null) return 'Not counted'
  if (value === 0) return 'Match'
  return value > 0 ? 'Surplus' : 'Shortage'
}

export function getStockOpnameProgress(items: StockOpnameItem[]) {
  if (items.length === 0) return 0
  return Math.round((items.filter((item) => item.physicalQuantity !== null).length / items.length) * 100)
}
