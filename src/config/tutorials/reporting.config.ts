import type { TutorialDefinition } from '@/types/tutorial'

export const reportingTutorial: TutorialDefinition = {
  id: 'reporting',
  title: 'Reporting Center',
  description: 'Panduan memilih report, menggunakan filter, membaca tabel, dan export Excel/CSV.',
  category: 'reports',
  requiredPermissions: ['reports.view'],
  steps: [
    { id: 'reports-open', stepNumber: 1, title: 'Reports', instruction: 'Buka Reporting Center untuk melihat data operasional dalam bentuk laporan.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-menu"]' },
    { id: 'reports-category', stepNumber: 2, title: 'Report Category', instruction: 'Report dikelompokkan berdasarkan Inventory, Production, QC, Traceability dan Stock Control.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-category"]' },
    { id: 'reports-example', stepNumber: 3, title: 'RPT-04 Material Consumption', instruction: 'Contoh tutorial ini memakai RPT-04 Material Consumption sebagai laporan produksi.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-menu"]' },
    { id: 'reports-date-filter', stepNumber: 4, title: 'Date Filter', instruction: 'Gunakan Date Filter untuk menentukan periode laporan.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-date-filter"]', targetFallback: '[data-tour="reports-filter"]' },
    { id: 'reports-relevant-filter', stepNumber: 5, title: 'Relevant Filter', instruction: 'Gunakan filter tambahan untuk mempersempit report berdasarkan Product, Material, Warehouse atau parameter terkait.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-relevant-filter"]', targetFallback: '[data-tour="reports-filter"]' },
    { id: 'reports-result', stepNumber: 6, title: 'Result Table', instruction: 'Data report berasal dari transaksi aktual MOSA.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-result"]' },
    { id: 'reports-export', stepNumber: 7, title: 'Export Excel/CSV', instruction: 'Export menggunakan filter yang sedang aktif sehingga file hanya berisi data sesuai kebutuhan.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-export"]' },
    { id: 'reports-complete', stepNumber: 8, title: 'Tutorial Reporting Selesai', instruction: 'Anda sudah memahami alur dasar membuka, memfilter, membaca, dan export report.', type: 'INFO', route: '/reports', targetSelector: '[data-tour="reports-menu"]' },
  ],
}
