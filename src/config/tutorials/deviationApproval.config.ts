import type { TutorialDefinition } from '@/types/tutorial'

/**
 * Deviation Approval — review supervisor atas variance material.
 * Approve/Reject kritikal → INFO-only. Total 6 steps (mirror backend catalog).
 */
export const deviationApprovalTutorial: TutorialDefinition = {
  id: 'deviation-approval',
  title: 'Deviation Approval',
  description: 'Menuntun supervisor mereview deviasi: antrean, konteks PO, LOT usage, variance, dan keputusan approve/reject.',
  category: 'production',
  requiredPermissions: ['production-deviations.view'],
  allowedRoles: ['PRODUCTION_SUPERVISOR', 'ADMIN', 'SUPERADMIN'],
  steps: [
    {
      id: 'step-1-queue',
      stepNumber: 1,
      totalSteps: 6,
      title: 'Antrean Deviasi',
      instruction: 'Buka menu Production → Deviations untuk melihat daftar deviasi berstatus Pending Approval.',
      type: 'INFO',
      route: '/production/deviations',
      targetSelector: '[data-tour="deviation-queue"]',
      placement: 'right',
    },
    {
      id: 'step-2-row',
      stepNumber: 2,
      totalSteps: 6,
      title: 'Buka Halaman Review',
      instruction: 'Pilih baris deviasi untuk membuka halaman review berisi konteks produksi dan material.',
      type: 'INFO',
      route: '/production/deviations',
      targetSelector: '[data-tour="deviation-queue-row"]',
      targetFallback: '[data-tour="deviation-queue"]',
    },
    {
      id: 'step-3-context',
      stepNumber: 3,
      totalSteps: 6,
      title: 'Konteks Production Order',
      instruction: 'Panel ini menampilkan PO, produk, recipe, dan step terkait. Gunakan tautan Buka Production Order bila perlu verifikasi.',
      type: 'INFO',
      targetSelector: '[data-tour="deviation-link-po"]',
      targetFallback: '[data-tour="deviation-queue"]',
    },
    {
      id: 'step-4-lots',
      stepNumber: 4,
      totalSteps: 6,
      title: 'LOT Usage & Variance',
      instruction: 'Tabel LOT menampilkan actual per LOT, stok tersedia, dan variance terhadap target beserta tolerance.',
      type: 'INFO',
      targetSelector: '[data-tour="deviation-lot-table"]',
      targetFallback: '[data-tour="deviation-queue"]',
    },
    {
      id: 'step-5-decision',
      stepNumber: 5,
      totalSteps: 6,
      title: 'Keputusan (Panduan Saja)',
      instruction: 'Tombol Approve dan Reject hanya ditunjuk. Tutorial tidak mengambil keputusan — reject wajib diisi reason, approve boleh dengan notes.',
      type: 'INFO',
      targetSelector: '[data-tour="deviation-approve-btn"]',
      targetFallback: '[data-tour="deviation-queue"]',
      critical: true,
    },
    {
      id: 'step-6-done',
      stepNumber: 6,
      totalSteps: 6,
      title: 'Tutorial Deviation Selesai',
      instruction: 'Selamat! Anda memahami alur review deviasi yang aman dan terdokumentasi.',
      type: 'INFO',
      route: '/production/deviations',
      targetSelector: '[data-tour="deviation-queue"]',
    },
  ],
}
