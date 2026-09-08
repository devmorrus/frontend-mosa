import type { TutorialDefinition } from '@/types/tutorial'

export const dashboardTutorial: TutorialDefinition = {
  id: 'dashboard',
  title: 'Dashboard Operational Monitoring',
  description: 'Panduan membaca filter periode, production status, inventory, QC, yield, dan deviation.',
  category: 'general',
  requiredPermissions: ['dashboard.view'],
  steps: [
    { id: 'dashboard-period', stepNumber: 1, title: 'Period Filter', instruction: 'Gunakan filter periode untuk menentukan rentang data Dashboard.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-period"]' },
    { id: 'dashboard-production', stepNumber: 2, title: 'Production Status', instruction: 'Bagian ini menunjukkan jumlah Production Order berdasarkan status.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-production"]' },
    { id: 'dashboard-shortage', stepNumber: 3, title: 'Material Shortage', instruction: 'Material Shortage menunjukkan Production Order yang belum dapat dilanjutkan karena material tidak mencukupi.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-shortage"]' },
    { id: 'dashboard-inventory', stepNumber: 4, title: 'Inventory', instruction: 'Bagian Inventory menunjukkan kondisi Raw Material, LOT, Low Stock dan Expiring LOT.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-inventory"]' },
    { id: 'dashboard-qc', stepNumber: 5, title: 'QC', instruction: 'Bagian ini menunjukkan Finished Goods yang masih Waiting QC, Hold atau Reject.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-qc"]' },
    { id: 'dashboard-yield', stepNumber: 6, title: 'Yield', instruction: 'Yield membandingkan Actual Output dengan Target Output sesuai perhitungan yang digunakan MOSA.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-yield"]' },
    { id: 'dashboard-deviation', stepNumber: 7, title: 'Deviation', instruction: 'Deviation menunjukkan penyimpangan material yang membutuhkan atau pernah mendapatkan perhatian Supervisor.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-deviation"]' },
    { id: 'dashboard-complete', stepNumber: 8, title: 'Tutorial Dashboard Selesai', instruction: 'Anda sudah memahami bagian utama Dashboard operasional MOSA.', type: 'INFO', route: '/dashboard', targetSelector: '[data-tour="dashboard-period"]' },
  ],
}
