import type { TutorialDefinition } from '@/types/tutorial'

export const masterDataTutorial: TutorialDefinition = {
  id: 'master-data',
  title: 'Master Data — Supplier',
  description: 'Menuntun user membuat data dasar Master Data Supplier.',
  category: 'master-data',
  requiredPermissions: ['suppliers.view', 'suppliers.create'],
  steps: [
    {
      id: 'step-1-open-menu',
      stepNumber: 1,
      totalSteps: 7,
      title: 'Buka Master Data',
      instruction: 'Buka menu Master Data untuk mengelola data dasar operasional MOSA.',
      type: 'INFO',
      route: '/suppliers',
      targetSelector: '[data-tour="master-suppliers-menu"]',
      placement: 'right',
    },
    {
      id: 'step-2-supplier-intro',
      stepNumber: 2,
      totalSteps: 7,
      title: 'Master Supplier',
      instruction: 'Data Supplier digunakan sebagai sumber bahan baku pada proses Goods Receiving.',
      type: 'INFO',
      route: '/suppliers',
      targetSelector: '[data-tour="suppliers-header"]',
      placement: 'bottom',
    },
    {
      id: 'step-3-add-supplier',
      stepNumber: 3,
      totalSteps: 7,
      title: 'Tambah Supplier Baru',
      instruction: 'Klik Add Supplier untuk membuat master data supplier baru.',
      type: 'ACTION',
      route: '/suppliers',
      targetSelector: '[data-tour="supplier-add-btn"]',
      requiredAction: {
        type: 'click',
        elementSelector: '[data-tour="supplier-add-btn"]',
      },
    },
    {
      id: 'step-4-supplier-code',
      stepNumber: 4,
      totalSteps: 7,
      title: 'Masukkan Kode Supplier',
      instruction: 'Masukkan kode unik supplier (misal: SUP-001).',
      type: 'ACTION',
      route: '/suppliers',
      targetSelector: '[data-tour="supplier-code-input"]',
      requiredAction: {
        type: 'input',
        elementSelector: '[data-tour="supplier-code-input"]',
        validate: () => {
          const el = document.querySelector<HTMLInputElement>('[data-tour="supplier-code-input"]')
          return Boolean(el && el.value.trim().length > 0)
        },
      },
    },
    {
      id: 'step-5-supplier-name',
      stepNumber: 5,
      totalSteps: 7,
      title: 'Masukkan Nama Supplier',
      instruction: 'Masukkan nama resmi perusahaan supplier.',
      type: 'ACTION',
      route: '/suppliers',
      targetSelector: '[data-tour="supplier-name-input"]',
      requiredAction: {
        type: 'input',
        elementSelector: '[data-tour="supplier-name-input"]',
        validate: () => {
          const el = document.querySelector<HTMLInputElement>('[data-tour="supplier-name-input"]')
          return Boolean(el && el.value.trim().length > 0)
        },
      },
    },
    {
      id: 'step-6-save-supplier',
      stepNumber: 6,
      totalSteps: 7,
      title: 'Simpan Supplier',
      instruction: 'Klik Save untuk menyimpan data Supplier ke sistem.',
      type: 'ACTION',
      route: '/suppliers',
      targetSelector: '[data-tour="supplier-save-btn"]',
      requiredAction: {
        type: 'click',
        elementSelector: '[data-tour="supplier-save-btn"]',
      },
    },
    {
      id: 'step-7-complete',
      stepNumber: 7,
      totalSteps: 7,
      title: 'Supplier Berhasil Dibuat',
      instruction:
        'Supplier baru telah berhasil dibuat dan siap digunakan pada penerimaan barang (Goods Receiving).',
      type: 'INFO',
      route: '/suppliers',
      targetSelector: '[data-tour="suppliers-header"]',
    },
  ],
}
