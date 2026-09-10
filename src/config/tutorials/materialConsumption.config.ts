import type { TutorialDefinition } from '@/types/tutorial'

/**
 * Material Consumption — pencatatan LOT dan actual quantity.
 * ACTION hanya untuk memilih LOT dan mengisi qty (non-destruktif, belum submit).
 * Submit tetap INFO-only. Total 6 steps (mirror backend catalog).
 */
export const materialConsumptionTutorial: TutorialDefinition = {
  id: 'material-consumption',
  title: 'Material Consumption',
  description: 'Menuntun pencatatan konsumsi material: pilih LOT FEFO, isi actual quantity, pahami tolerance, dan ketahui tombol submit. Buka via Help → Tutorial & Panduan (berlaku untuk halaman Operator Production).',
  category: 'production',
  requiredPermissions: ['production-orders.execute'],
  allowedRoles: ['OPERATOR', 'PRODUCTION_SUPERVISOR', 'ADMIN', 'SUPERADMIN'],
  steps: [
    {
      id: 'step-1-open-order',
      stepNumber: 1,
      totalSteps: 6,
      title: 'Buka Order Aktif',
      instruction: 'Buka salah satu Production Order dari antrean untuk melihat panel konsumsi material pada step aktif bertipe Material.',
      type: 'INFO',
      route: '/operator/production',
      targetSelector: '[data-tour="operator-queue"]',
    },
    {
      id: 'step-2-actual-qty',
      stepNumber: 2,
      totalSteps: 6,
      title: 'Isi Actual Quantity',
      instruction: 'Isi actual quantity sesuai timbangan. Nilai harus lebih dari 0 dan tidak melebihi stok tersedia.',
      type: 'ACTION',
      targetSelector: '[data-tour="consume-actual-qty"]',
      targetFallback: '[data-tour="guided-consume-form"]',
      requiredAction: { type: 'input', elementSelector: '[data-tour="consume-actual-qty"]' },
    },
    {
      id: 'step-3-tolerance',
      stepNumber: 3,
      totalSteps: 6,
      title: 'Target vs Actual & Tolerance',
      instruction: 'Panel ini menjelaskan target recipe, actual Anda, variance, dan batas tolerance yang diizinkan.',
      type: 'INFO',
      targetSelector: '[data-tour="consume-tolerance-hint"]',
      targetFallback: '[data-tour="guided-consume-form"]',
    },
    {
      id: 'step-4-submit-info',
      stepNumber: 4,
      totalSteps: 6,
      title: 'Tombol Submit (Panduan Saja)',
      instruction: 'Tombol submit hanya ditunjuk. Tutorial tidak mengirim konsumsi — lakukan submit nyata di luar tutorial bila sudah yakin.',
      type: 'INFO',
      targetSelector: '[data-tour="consume-submit-btn"]',
      targetFallback: '[data-tour="guided-consume-form"]',
      critical: true,
    },
    {
      id: 'step-5-deviation-info',
      stepNumber: 5,
      totalSteps: 6,
      title: 'Jika di Luar Tolerance',
      instruction: 'Jika variance melebihi tolerance, sistem meminta deviation approval. Lihat tutorial Deviation Approval untuk alurnya.',
      type: 'INFO',
      targetSelector: '[data-tour="consume-tolerance-hint"]',
      targetFallback: '[data-tour="guided-consume-form"]',
    },
    {
      id: 'step-6-done',
      stepNumber: 6,
      totalSteps: 6,
      title: 'Tutorial Material Consumption Selesai',
      instruction: 'Selamat! Anda memahami pencatatan konsumsi yang benar dan aman.',
      type: 'INFO',
      targetSelector: '[data-tour="consume-lot-select"]',
      targetFallback: '[data-tour="guided-step-card"]',
    },
  ],
}
