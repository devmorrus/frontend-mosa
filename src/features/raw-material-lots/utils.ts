import type {
  RawMaterialLotDetail,
  RawMaterialLotLabel,
  RawMaterialLotStatusFilter,
} from '@/features/raw-material-lots/types'

const TOKEN_PATTERN = /^[A-Z0-9]{8,100}$/i

export const RAW_MATERIAL_LOT_STATUS_OPTIONS: Array<{
  label: string
  value: RawMaterialLotStatusFilter
}> = [
  { label: 'Semua status', value: 'ALL' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Blocked', value: 'BLOCKED' },
  { label: 'Consumed', value: 'CONSUMED' },
  { label: 'Expired', value: 'EXPIRED' },
]

export function formatLotDateLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatLotDateTimeLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatLotQuantity(value: number, unitOfMeasureCode: string) {
  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(value)} ${unitOfMeasureCode}`
}

export function getLotStatusTone(status: string) {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'BLOCKED':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'CONSUMED':
      return 'border-slate-200 bg-slate-100 text-slate-600'
    case 'EXPIRED':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function parseRawMaterialLotQrToken(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return {
      token: null,
      error: 'QR tidak dikenali sebagai Raw Material LOT.',
    }
  }

  if (TOKEN_PATTERN.test(trimmed)) {
    return { token: trimmed.toUpperCase(), error: null }
  }

  try {
    const url = new URL(trimmed)
    const token = url.pathname.split('/').filter(Boolean).at(-1) ?? ''
    if (TOKEN_PATTERN.test(token)) {
      return { token: token.toUpperCase(), error: null }
    }
  } catch {
    // handled below
  }

  return {
    token: null,
    error: 'QR tidak dikenali sebagai Raw Material LOT.',
  }
}

export function buildRawMaterialLotLabelHtml(label: RawMaterialLotLabel) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LOT Label ${escapeHtml(label.internalLotNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #12302e; background: #f7f7f3; }
      .sheet { width: 420px; margin: 0 auto; }
      .label { background: white; border: 2px solid #12302e; border-radius: 16px; padding: 20px; }
      .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #64748b; }
      h1 { margin: 8px 0 18px; font-size: 24px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
      .field strong { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 4px; }
      .field span { font-size: 14px; line-height: 1.4; }
      .qr { margin-top: 18px; border-top: 1px dashed #cbd5e1; padding-top: 18px; text-align: center; }
      .qr svg { width: 180px; height: 180px; }
      .token { margin-top: 10px; font-size: 13px; letter-spacing: 0.08em; }
      @media print {
        body { background: white; padding: 0; }
        .sheet { width: auto; }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="label">
        <div class="eyebrow">Raw Material LOT Label</div>
        <h1>${escapeHtml(label.materialCode)} - ${escapeHtml(label.materialName)}</h1>
        <div class="grid">
          <div class="field"><strong>Internal LOT</strong><span>${escapeHtml(label.internalLotNumber)}</span></div>
          <div class="field"><strong>Supplier LOT</strong><span>${escapeHtml(label.supplierLot ?? '-')}</span></div>
          <div class="field"><strong>Warehouse</strong><span>${escapeHtml(label.warehouseCode)} - ${escapeHtml(label.warehouseName)}</span></div>
          <div class="field"><strong>Received Date</strong><span>${escapeHtml(formatLotDateLabel(label.receivedDate))}</span></div>
          <div class="field"><strong>Expiry Date</strong><span>${escapeHtml(formatLotDateLabel(label.expiryDate))}</span></div>
          <div class="field"><strong>QR Payload</strong><span>${escapeHtml(label.qrPayload)}</span></div>
        </div>
        <div class="qr">
          ${label.qrCodeSvg}
          <div class="token">${escapeHtml(label.qrToken)}</div>
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function buildQrSvgDataUri(svg: string) {
  const normalizedSvg = svg.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    const hasPreserveAspectRatio = /preserveAspectRatio=/i.test(attrs)
    const nextAttrs = hasPreserveAspectRatio
      ? attrs
      : `${attrs} preserveAspectRatio="xMidYMid meet"`

    return `<svg${nextAttrs}>`
  })

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalizedSvg)}`
}

export function openRawMaterialLotPrintWindow(label: RawMaterialLotLabel) {
  const printWindow = prepareRawMaterialLotPrintWindow()
  if (!printWindow) {
    return {
      ok: false,
      error: 'Popup print diblok browser. Izinkan popup lalu coba lagi.',
    }
  }

  return renderRawMaterialLotPrintWindow(printWindow, label)
}

export function renderRawMaterialLotPrintWindow(
  printWindow: Window,
  label: RawMaterialLotLabel,
) {
  if (printWindow.closed) {
    return {
      ok: false,
      error: 'Popup print ditutup sebelum label selesai disiapkan.',
    }
  }

  printWindow.document.open()
  printWindow.document.write(buildRawMaterialLotLabelHtml(label))
  printWindow.document.close()

  const handlePrint = () => {
    printWindow.focus()
    printWindow.print()
  }

  if (printWindow.document.readyState === 'complete') {
    handlePrint()
  } else {
    printWindow.onload = handlePrint
  }

  return { ok: true, error: null }
}

export function prepareRawMaterialLotPrintWindow() {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=540,height=720')
  if (!printWindow) return null

  printWindow.document.open()
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preparing LOT Label</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        color: #12302e;
        background: #f7f7f3;
      }
      .card {
        border: 1px solid #cbd5e1;
        background: white;
        padding: 24px 28px;
        border-radius: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="card">Menyiapkan label LOT untuk dicetak...</div>
  </body>
</html>`)
  printWindow.document.close()

  return printWindow
}

export function buildLotSearchPlaceholder() {
  return 'Cari internal LOT, supplier LOT, material, atau supplier'
}

export function getLotFilterErrorMessage(errors: string[]) {
  return errors[0] ?? null
}

export function canOpenReceivingReference(detail: RawMaterialLotDetail) {
  return Boolean(detail.goodsReceivingId)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
