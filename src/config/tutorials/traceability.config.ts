import type { TutorialDefinition } from '@/types/tutorial'

const traceabilityPermission = ['traceability.view']

export const backwardTraceabilityTutorial: TutorialDefinition = {
  id: 'traceability-backward',
  title: 'Backward Traceability: Finished Goods ke Material',
  description: 'Menuntun pencarian Finished Goods LOT sampai asal material, supplier, receiving, dan hasil QC.',
  category: 'traceability',
  requiredPermissions: traceabilityPermission,
  steps: [
    { id: 'backward-menu', stepNumber: 1, title: 'Buka Traceability', instruction: 'Buka menu Traceability untuk menelusuri hubungan antara Finished Goods dan Raw Material LOT.', type: 'INFO', route: '/traceability', targetSelector: '[data-tour="traceability-menu"]', targetFallback: '[data-tour="traceability-search"]' },
    { id: 'backward-type', stepNumber: 2, title: 'Pilih Finished Goods LOT', instruction: 'Pilih Finished Goods LOT sebagai tipe pencarian untuk memulai backward traceability.', type: 'ACTION', route: '/traceability', targetSelector: '[data-tour="traceability-fg-search-type"]', requiredAction: { type: 'click', elementSelector: '[data-tour="traceability-fg-search-type"]', validate: () => document.querySelector('[data-tour="traceability-fg-search-type"]')?.getAttribute('aria-pressed') === 'true' } },
    { id: 'backward-search', stepNumber: 3, title: 'Cari Finished Goods LOT', instruction: 'Masukkan Finished Goods LOT yang ingin ditelusuri, lalu pilih Cari LOT. Pencarian ini hanya membaca data traceability.', type: 'ACTION', route: '/traceability', targetSelector: '[data-tour="traceability-lot-search"]', requiredAction: { type: 'api_success', elementSelector: '[data-tour="traceability-search-form"]', validate: () => Boolean(document.querySelector('[data-tour="traceability-fg-summary"]')) } },
    { id: 'backward-overview', stepNumber: 4, title: 'Finished Goods Information', instruction: 'Bagian ini menunjukkan Product, Actual Output, QC Status, dan kondisi inventory Finished Goods.', type: 'INFO', targetSelector: '[data-tour="traceability-fg-summary"]' },
    { id: 'backward-production', stepNumber: 5, title: 'Production Order', instruction: 'Finished Goods ini dihasilkan melalui Production Order berikut.', type: 'INFO', targetSelector: '[data-tour="traceability-production"]' },
    { id: 'backward-recipe', stepNumber: 6, title: 'Recipe Version', instruction: 'Recipe Version menunjukkan formula dan urutan proses yang digunakan ketika batch diproduksi.', type: 'INFO', targetSelector: '[data-tour="traceability-recipe"]' },
    { id: 'backward-materials', stepNumber: 7, title: 'Materials Used', instruction: 'Bagian ini menampilkan seluruh Raw Material LOT yang benar-benar digunakan.', type: 'INFO', targetSelector: '[data-tour="traceability-materials"]' },
    { id: 'backward-actual', stepNumber: 8, title: 'Actual Quantity', instruction: 'Quantity ini berasal dari Actual Consumption Operator, bukan target Recipe.', type: 'INFO', targetSelector: '[data-tour="traceability-actual-quantity"]' },
    { id: 'backward-supplier', stepNumber: 9, title: 'Supplier dan Receiving', instruction: 'Dari Internal LOT, material dapat ditelusuri kembali ke Supplier LOT dan Goods Receiving.', type: 'INFO', targetSelector: '[data-tour="traceability-supplier"]' },
    { id: 'backward-qc', stepNumber: 10, title: 'Quality Control', instruction: 'Bagian ini menunjukkan hasil QC Finished Goods.', type: 'INFO', targetSelector: '[data-tour="traceability-qc"]' },
    { id: 'backward-complete', stepNumber: 11, title: 'Backward Traceability Selesai', instruction: 'Anda telah menelusuri Finished Goods LOT kembali ke material, supplier, receiving, dan QC tanpa mengubah data.', type: 'INFO', targetSelector: '[data-tour="traceability-fg-summary"]' },
  ],
}

export const forwardTraceabilityTutorial: TutorialDefinition = {
  id: 'traceability-forward',
  title: 'Forward Traceability: Material ke Batch Terdampak',
  description: 'Menuntun investigasi Raw Material LOT ke seluruh Finished Goods yang terdampak.',
  category: 'traceability',
  requiredPermissions: traceabilityPermission,
  steps: [
    { id: 'forward-type', stepNumber: 1, title: 'Pilih Raw Material LOT', instruction: 'Pilih Raw Material LOT untuk mencari produk jadi yang terdampak.', type: 'ACTION', route: '/traceability', targetSelector: '[data-tour="traceability-rm-search-type"]', requiredAction: { type: 'click', elementSelector: '[data-tour="traceability-rm-search-type"]', validate: () => document.querySelector('[data-tour="traceability-rm-search-type"]')?.getAttribute('aria-pressed') === 'true' } },
    { id: 'forward-search', stepNumber: 2, title: 'Cari Raw Material LOT', instruction: 'Masukkan Raw Material LOT dan pilih Cari LOT. Hasil akan membuka halaman batch terdampak tanpa mengubah data.', type: 'ACTION', targetSelector: '[data-tour="traceability-lot-search"]', targetFallback: '[data-tour="traceability-rm-header"]', requiredAction: { type: 'api_success', elementSelector: '[data-tour="traceability-search-form"]', validate: () => Boolean(document.querySelector('[data-tour="traceability-rm-header"]')) } },
    { id: 'forward-header', stepNumber: 3, title: 'Raw Material Header', instruction: 'Pastikan Material, Internal LOT, dan Supplier LOT sudah benar sebelum menilai dampaknya.', type: 'INFO', targetSelector: '[data-tour="traceability-rm-header"]' },
    { id: 'forward-production', stepNumber: 4, title: 'Affected Production', instruction: 'Bagian ini menunjukkan Production Order yang benar-benar menggunakan LOT ini.', type: 'INFO', targetSelector: '[data-tour="traceability-affected-production"]' },
    { id: 'forward-batches', stepNumber: 5, title: 'Affected Finished Goods', instruction: 'Finished Goods LOT berikut merupakan batch yang mempunyai actual consumption terhadap Raw Material LOT ini.', type: 'INFO', targetSelector: '[data-tour="traceability-affected-batches"]' },
    { id: 'forward-qc', stepNumber: 6, title: 'QC Status', instruction: 'Perhatikan kondisi setiap batch, misalnya Pass, Hold, atau Reject, beserta status inventory-nya.', type: 'INFO', targetSelector: '[data-tour="traceability-affected-qc"]', targetFallback: '[data-tour="traceability-affected-batches"]' },
    { id: 'forward-backward', stepNumber: 7, title: 'View Traceability', instruction: 'Buka salah satu Finished Goods untuk melihat Backward Genealogy lengkap.', type: 'INFO', targetSelector: '[data-tour="traceability-view-fg"]', targetFallback: '[data-tour="traceability-affected-batches"]' },
    { id: 'forward-complete', stepNumber: 8, title: 'Forward Traceability Selesai', instruction: 'Anda telah mengidentifikasi batch terdampak. Tutorial ini tidak melakukan recall, quarantine, atau perubahan data.', type: 'INFO', targetSelector: '[data-tour="traceability-affected-batches"]' },
  ],
}
