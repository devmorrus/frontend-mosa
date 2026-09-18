/**
 * Shared status badge — satu status domain = satu label + satu warna (Tasking 4).
 * Mirror dari backend `Mosa.Domain/Enums/DomainStatusLabels.cs`.
 * Normalisasi: terima enum numerik, string UPPER_SNAKE, atau label bebas.
 */

const toneBase = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset'

const tones: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  slate: 'bg-slate-100 text-slate-500 ring-slate-200',
  stone: 'bg-stone-100 text-stone-500 ring-stone-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
}

function normalize(value: string | number): string {
  return String(value).trim().toUpperCase().replace(/[\s-]+/g, '_')
}

interface StatusSpec {
  label: string
  tone: keyof typeof tones
}

/** Numeric enum backend → canonical key per domain (mirror DomainStatusLabels). */
const numericMaps: Record<string, Record<string, string>> = {
  'production-order': {
    '1': 'DRAFT',
    '2': 'MATERIAL_SHORTAGE',
    '3': 'READY',
    '4': 'SCHEDULED',
    '5': 'RELEASED',
    '6': 'IN_PROGRESS',
    '7': 'WAITING_QC',
    '8': 'COMPLETED',
    '9': 'CANCELLED',
  },
  po: {
    '1': 'DRAFT',
    '2': 'MATERIAL_SHORTAGE',
    '3': 'READY',
    '4': 'SCHEDULED',
    '5': 'RELEASED',
    '6': 'IN_PROGRESS',
    '7': 'WAITING_QC',
    '8': 'COMPLETED',
    '9': 'CANCELLED',
  },
  deviation: {
    '1': 'PENDING_APPROVAL',
    '2': 'APPROVED',
    '3': 'REJECTED',
    '4': 'CANCELLED',
  },
  'fg-qc': { '1': 'WAITING_QC', '2': 'PASSED', '3': 'REJECTED', '4': 'HOLD' },
  qc: { '1': 'WAITING_QC', '2': 'PASSED', '3': 'REJECTED', '4': 'HOLD' },
  'fg-inventory': { '1': 'BLOCKED', '2': 'AVAILABLE', '3': 'REJECTED' },
  inventory: { '1': 'BLOCKED', '2': 'AVAILABLE', '3': 'REJECTED' },
  lot: { '1': 'AVAILABLE', '2': 'BLOCKED', '3': 'EXPIRED', '4': 'DEPLETED' },
  recipe: { '1': 'DRAFT', '2': 'PENDING_APPROVAL', '3': 'APPROVED', '4': 'NEEDS_REVISION', '5': 'HISTORICAL' },
  opname: { '1': 'DRAFT', '2': 'INPROGRESS', '3': 'READYTOPOST', '4': 'POSTED', '5': 'CANCELLED' },
  inspection: { '1': 'PENDING', '2': 'IN_PROGRESS', '3': 'PASSED', '4': 'HOLD', '5': 'REJECTED' },
  execution: { '1': 'LOCKED', '2': 'READY', '3': 'IN_PROGRESS', '4': 'COMPLETED', '5': 'WAITING_APPROVAL' },
}

/** Canonical mapping — tambah entri baru di sini, jangan inline di page. */
function resolveSpec(domain: string, value: string | number): StatusSpec {
  const d = domain.toLowerCase()
  let key = normalize(value)
  const numericHit = numericMaps[d]?.[String(value).trim()]
  if (numericHit) key = numericHit

  if (d === 'active') {
    const isActive = key === 'TRUE' || key === 'ACTIVE' || key === '1'
    return { label: isActive ? 'Active' : 'Inactive', tone: isActive ? 'blue' : 'slate' }
  }

  const common: Record<string, StatusSpec> = {
    DRAFT: { label: 'Draft', tone: 'slate' },
    PENDING_APPROVAL: { label: 'Pending Approval', tone: 'amber' },
    PENDING: { label: 'Pending', tone: 'amber' },
    APPROVED: { label: 'Approved', tone: 'blue' },
    PASSED: { label: 'Passed', tone: 'blue' },
    PASS: { label: 'Passed', tone: 'blue' },
    REJECTED: { label: 'Rejected', tone: 'rose' },
    REJECT: { label: 'Rejected', tone: 'rose' },
    CANCELLED: { label: 'Cancelled', tone: 'stone' },
    CANCELED: { label: 'Cancelled', tone: 'stone' },
    POSTED: { label: 'Posted', tone: 'blue' },
    ACTIVE: { label: 'Active', tone: 'blue' },
    INACTIVE: { label: 'Inactive', tone: 'slate' },
    AVAILABLE: { label: 'Available', tone: 'blue' },
    BLOCKED: { label: 'Blocked', tone: 'amber' },
    NOT_AVAILABLE: { label: 'Blocked', tone: 'amber' },
    EXPIRED: { label: 'Expired', tone: 'rose' },
    DEPLETED: { label: 'Depleted', tone: 'slate' },
    CONSUMED: { label: 'Depleted', tone: 'slate' },
    HOLD: { label: 'Hold', tone: 'orange' },
    ON_HOLD: { label: 'Hold', tone: 'orange' },
    WAITING_QC: { label: 'Waiting QC', tone: 'orange' },
    WAITINGQC: { label: 'Waiting QC', tone: 'orange' },
    WAITING: { label: 'Waiting QC', tone: 'orange' },
    IN_PROGRESS: { label: 'In Progress', tone: 'amber' },
    INPROGRESS: { label: 'In Progress', tone: 'amber' },
    READY: { label: 'Ready', tone: 'blue' },
    READYTOPOST: { label: 'Ready to Post', tone: 'amber' },
    READY_TO_POST: { label: 'Ready to Post', tone: 'amber' },
    RELEASED: { label: 'Released', tone: 'violet' },
    COMPLETED: { label: 'Completed', tone: 'blue' },
    SCHEDULED: { label: 'Scheduled', tone: 'sky' },
    MATERIAL_SHORTAGE: { label: 'Material Shortage', tone: 'rose' },
    WAITING_APPROVAL: { label: 'Waiting Approval', tone: 'amber' },
    LOCKED: { label: 'Locked', tone: 'slate' },
    NEEDS_REVISION: { label: 'Needs Revision', tone: 'rose' },
    HISTORICAL: { label: 'Historical', tone: 'stone' },
    IN: { label: 'In', tone: 'blue' },
    OUT: { label: 'Out', tone: 'rose' },
  }

  if (common[key]) return common[key]

  // Fallback: Title Case label + tone netral per domain
  const label = String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return { label, tone: 'slate' }
}

export function StatusBadge({
  domain = 'generic',
  value,
  className = '',
}: {
  domain?: string
  value: string | number | null | undefined
  className?: string
}) {
  if (value === null || value === undefined || value === '') {
    return <span className={`${toneBase} ${tones.slate} ${className}`}>-</span>
  }
  const spec = resolveSpec(domain, value)
  return <span className={`${toneBase} ${tones[spec.tone]} ${className}`}>{spec.label}</span>
}

/** Helper label saja (untuk teks non-badge), tetap konsisten dengan badge. */
export function getStatusLabel(domain: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  return resolveSpec(domain, value).label
}
