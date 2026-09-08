import type { TutorialDefinition } from '@/types/tutorial'

/**
 * Stock Adjustment — penyesuaian stok IN/OUT.
 * Submit kritikal → INFO-only. Total 6 steps (mirror backend catalog).
 */
export const stockAdjustmentTutorial: TutorialDefinition = {
  id: 'stock-adjustment',
  title: 'Stock Adjustment',
  description: 'Menuntun warehouse melakukan penyesuaian stok: riwayat, pembuatan, pemilihan LOT, reason, dan submit.',
  category: 'warehouse',
  requiredPermissions: ['stock-adjustments.view'],
  allowedRoles: ['WAREHOUSE', 'ADMIN', 'SUPERADMIN'],
  steps: [
    {
      id: 'step-1-queue',
      stepNumber: 1,
      totalSteps: 6,
      title: 'Riwayat Adjustment',
      instruction: 'Buka menu Warehouse → Stock Adjustments untuk melihat riwayat penyesuaian IN dan OUT per LOT.',
      type: 'INFO',
      route: '/warehouse/stock-adjustments',
      targetSelector: '[data-tour="adjustment-queue"]',
      placement: 'right',
    },
    {
      id: 'step-2-create',
      stepNumber: 2,
      totalSteps: 6,
      title: 'Buat Adjustment (Panduan)',
      instruction: 'Tombol buat adjustment hanya ditunjuk. Dokumen baru memerlukan warehouse, material, dan LOT.',
      type: 'INFO',
      route: '/warehouse/stock-adjustments',
      targetSelector: '[data-tour="adjustment-create-btn"]',
    },
    {
      id: 'step-3-lot',
      stepNumber: 3,
      totalSteps: 6,
      title: 'Pilih LOT & Preview',
      instruction: 'Pilih LOT untuk melihat stok saat ini dan preview quantity setelah penyesuaian sebelum menyimpan.',
      type: 'INFO',
      targetSelector: '[data-tour="adjustment-lot-select"]',
      targetFallback: '[data-tour="adjustment-queue"]',
    },
    {
      id: 'step-4-reason',
      stepNumber: 4,
      totalSteps: 6,
      title: 'Reason Wajib',
      instruction: 'Reason wajib diisi dengan jelas untuk audit. Sistem memakai idempotency key agar submit ganda aman.',
      type: 'INFO',
      targetSelector: '[data-tour="adjustment-reason"]',
      targetFallback: '[data-tour="adjustment-queue"]',
    },
    {
      id: 'step-5-submit',
      stepNumber: 5,
      totalSteps: 6,
      title: 'Submit (Panduan Saja)',
      instruction: 'Tombol submit hanya ditunjuk. Tutorial tidak membuat adjustment nyata — lakukan di luar tutorial bila sudah yakin.',
      type: 'INFO',
      targetSelector: '[data-tour="adjustment-submit-btn"]',
      targetFallback: '[data-tour="adjustment-queue"]',
      critical: true,
    },
    {
      id: 'step-6-done',
      stepNumber: 6,
      totalSteps: 6,
      title: 'Tutorial Stock Adjustment Selesai',
      instruction: 'Selamat! Anda memahami penyesuaian stok yang aman dan terjejak audit.',
      type: 'INFO',
      route: '/warehouse/stock-adjustments',
      targetSelector: '[data-tour="adjustment-queue"]',
    },
  ],
}
