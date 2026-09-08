import type { TutorialDefinition } from '@/types/tutorial'

/**
 * Stock Opname — perhitungan stok fisik gudang.
 * Post kritikal → INFO-only. Total 6 steps (mirror backend catalog).
 */
export const stockOpnameTutorial: TutorialDefinition = {
  id: 'stock-opname',
  title: 'Stock Opname',
  description: 'Menuntun warehouse melakukan stock opname: daftar, draft, penghitungan fisik, variance, dan posting.',
  category: 'warehouse',
  requiredPermissions: ['stock-opname.view'],
  allowedRoles: ['WAREHOUSE', 'ADMIN', 'SUPERADMIN'],
  steps: [
    {
      id: 'step-1-queue',
      stepNumber: 1,
      totalSteps: 6,
      title: 'Daftar Stock Opname',
      instruction: 'Buka menu Warehouse → Stock Opname untuk melihat dokumen opname dan statusnya (Draft, In Progress, Posted).',
      type: 'INFO',
      route: '/warehouse/stock-opname',
      targetSelector: '[data-tour="opname-queue"]',
      placement: 'right',
    },
    {
      id: 'step-2-create',
      stepNumber: 2,
      totalSteps: 6,
      title: 'Buat Draft (Panduan)',
      instruction: 'Tombol buat draft hanya ditunjuk. Dokumen baru dimulai dari status Draft sebelum penghitungan.',
      type: 'INFO',
      route: '/warehouse/stock-opname',
      targetSelector: '[data-tour="opname-create-btn"]',
    },
    {
      id: 'step-3-count',
      stepNumber: 3,
      totalSteps: 6,
      title: 'Tabel Penghitungan Fisik',
      instruction: 'Tabel ini membandingkan system quantity dengan physical quantity per LOT. Tutorial hanya menjelaskan kolomnya.',
      type: 'INFO',
      targetSelector: '[data-tour="opname-count-table"]',
      targetFallback: '[data-tour="opname-queue"]',
    },
    {
      id: 'step-4-variance',
      stepNumber: 4,
      totalSteps: 6,
      title: 'Variance / Selisih',
      instruction: 'Panel variance menunjukkan selisih fisik vs sistem. Selisih besar perlu diverifikasi ulang sebelum posting.',
      type: 'INFO',
      targetSelector: '[data-tour="opname-variance"]',
      targetFallback: '[data-tour="opname-queue"]',
    },
    {
      id: 'step-5-post',
      stepNumber: 5,
      totalSteps: 6,
      title: 'Posting (Panduan Saja)',
      instruction: 'Tombol Post hanya ditunjuk. Posting mengubah stok sistem — lakukan hanya setelah verifikasi, di luar tutorial.',
      type: 'INFO',
      targetSelector: '[data-tour="opname-post-btn"]',
      targetFallback: '[data-tour="opname-queue"]',
      critical: true,
    },
    {
      id: 'step-6-done',
      stepNumber: 6,
      totalSteps: 6,
      title: 'Tutorial Stock Opname Selesai',
      instruction: 'Selamat! Anda memahami alur stock opname yang aman dan terdokumentasi.',
      type: 'INFO',
      route: '/warehouse/stock-opname',
      targetSelector: '[data-tour="opname-queue"]',
    },
  ],
}
