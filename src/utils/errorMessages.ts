const codeMessages: Record<string, string> = {
  raw_material_lot_validation_failed:
    'LOT tidak valid untuk langkah ini. Periksa kembali QR atau nomor LOT.',
  lot_material_mismatch:
    'LOT salah: material LOT tidak sesuai dengan kebutuhan langkah ini.',
  lot_warehouse_mismatch:
    'LOT salah: warehouse LOT tidak sesuai dengan production order ini.',
  material_consumption_exceeds_available:
    'Stok LOT tidak mencukupi untuk quantity yang diminta.',
  material_consumption_duplicate_lot:
    'LOT ini sudah dikonsumsi pada langkah ini.',
  material_consumption_pending_approval:
    'Konsumsi menunggu persetujuan supervisor. Langkah berikutnya tetap terkunci.',
  material_consumption_target_allocation_invalid:
    'Alokasi quantity harus sama dengan target langkah material.',
  deviation_reason_required:
    'Actual di luar tolerance. Alasan deviasi wajib diisi sebelum meminta persetujuan.',
  deviation_already_exists:
    'Deviasi untuk posting ini sudah ada dan menunggu keputusan.',
  deviation_not_pending_approval:
    'Deviasi ini sudah diputuskan dan tidak dapat diubah lagi.',
  timer_not_elapsed:
    'Timer belum selesai. Tunggu hingga hitungan mencapai nol.',
  timer_requires_timer_start:
    'Mulai timer terlebih dahulu sebelum menyelesaikan langkah ini.',
  check_confirmation_required:
    'Centang konfirmasi bahwa pemeriksaan sudah dilakukan.',
  step_not_current:
    'Langkah ini belum giliran. Selesaikan langkah berjalan terlebih dahulu.',
  step_not_ready:
    'Langkah ini belum siap dimulai.',
  step_not_in_progress:
    'Langkah ini belum dimulai atau sudah selesai.',
  step_already_completed:
    'Langkah ini sudah selesai dan tidak dapat diulang.',
  step_waiting_approval:
    'Langkah menunggu persetujuan supervisor.',
  step_waiting_approval_blocks_completion:
    'Masih ada langkah menunggu persetujuan. Produksi belum dapat diselesaikan.',
  steps_not_all_completed:
    'Masih ada langkah yang belum selesai.',
  material_step_not_started:
    'Mulai material step terlebih dahulu sebelum mencatat konsumsi.',
  material_step_completion_pending:
    'Selesaikan konsumsi material terlebih dahulu.',
  production_order_not_releasable:
    'Production order belum memenuhi syarat release (cek status dan ketersediaan material).',
  production_order_not_startable:
    'Production order belum dapat dimulai (harus Released terlebih dahulu).',
  production_order_not_in_progress:
    'Production order tidak sedang berjalan.',
  recipe_version_not_approved:
    'Gunakan recipe versi Approved untuk membuat production order.',
  already_decided:
    'Keputusan ini sudah tercatat dan tidak dapat diulang.',
  inspection_already_decided:
    'Inspeksi ini sudah diputuskan.',
  qc_required_parameter_missing:
    'Lengkapi seluruh parameter QC yang wajib sebelum mengambil keputusan.',
  qc_parameter_duplicate:
    'Setiap parameter QC hanya boleh diisi satu kali.',
  qc_parameter_invalid_for_product:
    'Parameter QC tidak sesuai dengan produk ini.',
  fg_not_waiting_qc:
    'Hanya LOT berstatus Waiting QC yang dapat diproses.',
  fg_not_hold:
    'Hanya LOT berstatus Hold yang dapat dinilai ulang.',
  idempotency_key_payload_mismatch:
    'Permintaan ini sudah pernah dikirim dengan data berbeda. Muat ulang lalu coba lagi.',
  wrong_warehouse:
    'Warehouse tidak sesuai dengan transaksi ini.',
  invalid_lot:
    'LOT tidak valid.',
}

const lotMessagePatterns: Array<[RegExp, string]> = [
  [/lot not found/i, 'LOT tidak ditemukan. Periksa kembali QR atau nomor LOT.'],
  [/blocked/i, 'LOT ini diblokir dan tidak dapat digunakan.'],
  [/expired/i, 'LOT ini sudah kedaluwarsa.'],
  [/depleted/i, 'LOT ini sudah habis (depleted).'],
  [/mismatch/i, 'LOT tidak sesuai dengan kebutuhan langkah ini.'],
  [/insufficient/i, 'Stok LOT tidak mencukupi untuk quantity yang diminta.'],
]

export function resolveBusinessErrorMessage(code: string | undefined, fallbackMessage: string): string {
  // LOT validation messages arrive as English free text under a generic code;
  // prefer the specific translation. Guarded to LOT-related text/code only.
  if (code === 'raw_material_lot_validation_failed' || code === 'invalid_lot' || /lot/i.test(fallbackMessage)) {
    for (const [pattern, message] of lotMessagePatterns) {
      if (pattern.test(fallbackMessage)) return message
    }
  }
  if (code && codeMessages[code]) return codeMessages[code]
  return fallbackMessage
}
