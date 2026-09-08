import type { TutorialDefinition } from '@/types/tutorial'

export const goodsReceivingTutorial: TutorialDefinition = {
  id: 'goods-receiving',
  title: 'Goods Receiving — Penerimaan Bahan Baku',
  description: 'Menuntun petugas Warehouse melakukan penerimaan barang dari supplier sampai POST dan terbit Internal LOT.',
  category: 'warehouse',
  requiredPermissions: ['receiving.view', 'receiving.create'],
  allowedRoles: ['Warehouse', 'Admin', 'SuperAdmin'],
  steps: [
    {
      id: 'step-1-open-receiving',
      stepNumber: 1,
      totalSteps: 12,
      title: 'Buka Goods Receiving',
      instruction: 'Buka menu Warehouse → Goods Receiving untuk mencatat bahan baku yang datang dari supplier.',
      type: 'INFO',
      route: '/goods-receiving',
      targetSelector: '[data-tour="receiving-menu"]',
      placement: 'right',
    },
    {
      id: 'step-2-add-receiving',
      stepNumber: 2,
      totalSteps: 12,
      title: 'Buat Transaksi Barub',
      instruction: 'Klik Add Receiving untuk mencatat penerimaan baru.',
      type: 'ACTION',
      route: '/goods-receiving',
      targetSelector: '[data-tour="receiving-add-btn"]',
      requiredAction: {
        type: 'click',
        elementSelector: '[data-tour="receiving-add-btn"]',
      },
    },
    {
      id: 'step-3-select-supplier',
      stepNumber: 3,
      totalSteps: 12,
      title: 'Pilih Supplier',
      instruction: 'Pilih supplier yang mengirimkan bahan baku pada penerimaan ini.',
      type: 'ACTION',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-supplier-select"]',
      requiredAction: {
        type: 'select',
        elementSelector: '[data-tour="receiving-supplier-select"]',
        validate: () => {
          const el = document.querySelector<HTMLSelectElement>('[data-tour="receiving-supplier-select"]')
          return Boolean(el && el.value.trim().length > 0)
        },
      },
    },
    {
      id: 'step-4-select-warehouse',
      stepNumber: 4,
      totalSteps: 12,
      title: 'Pilih Warehouse Destination',
      instruction: 'Pilih warehouse tempat bahan baku akan disimpan.',
      type: 'ACTION',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-warehouse-select"]',
      requiredAction: {
        type: 'select',
        elementSelector: '[data-tour="receiving-warehouse-select"]',
        validate: () => {
          const el = document.querySelector<HTMLSelectElement>('[data-tour="receiving-warehouse-select"]')
          return Boolean(el && el.value.trim().length > 0)
        },
      },
    },
    {
      id: 'step-5-receiving-date',
      stepNumber: 5,
      totalSteps: 12,
      title: 'Tentukan Tanggal Penerimaan',
      instruction: 'Tentukan tanggal kedatangan barang di fasilitas.',
      type: 'INFO',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-date-input"]',
    },
    {
      id: 'step-6-add-material',
      stepNumber: 6,
      totalSteps: 12,
      title: 'Tambah Item Bahan Baku',
      instruction: 'Klik Tambah Item untuk memilih bahan baku yang diterima.',
      type: 'ACTION',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-add-item-btn"]',
      requiredAction: {
        type: 'click',
        elementSelector: '[data-tour="receiving-add-item-btn"]',
      },
    },
    {
      id: 'step-7-material-detail',
      stepNumber: 7,
      totalSteps: 12,
      title: 'Rincian Material, Quantity & LOT Supplier',
      instruction:
        'Lengkapi item bahan baku, jumlah fisik yang diterima (Quantity), LOT number dari supplier, Tanggal Produksi, dan Tanggal Expiry.',
      type: 'INFO',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-item-row"]',
    },
    {
      id: 'step-8-save-draft',
      stepNumber: 8,
      totalSteps: 12,
      title: 'Simpan Draft',
      instruction: 'Simpan Receiving sebagai Draft terlebih dahulu agar data dapat diperiksa kembali sebelum diposting.',
      type: 'INFO',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-save-draft-btn"]',
    },
    {
      id: 'step-9-review-summary',
      stepNumber: 9,
      totalSteps: 12,
      title: 'Periksa Ringkasan Transaksi',
      instruction:
        'Periksa kembali Supplier, Warehouse, Material, LOT, dan Quantity sebelum transaksi diposting resmi.',
      type: 'INFO',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-summary"]',
    },
    {
      id: 'step-10-post-receiving',
      stepNumber: 10,
      totalSteps: 12,
      title: 'Posting Goods Receiving',
      instruction:
        'Posting akan menerbitkan Internal LOT resmi, menghasilkan Kode QR, dan menambahkan stok fisik ke Warehouse. Klik Post jika data sudah valid.',
      type: 'INFO',
      route: '/goods-receiving/create',
      targetSelector: '[data-tour="receiving-post-btn"]',
    },
    {
      id: 'step-11-result-lot',
      stepNumber: 11,
      totalSteps: 12,
      title: 'Internal LOT Berhasil Diterbitkan',
      instruction:
        'Setelah posting, MOSA otomatis membuat Internal LOT unik untuk keterlacakan bahan baku. Lihat panel Generated LOTs di halaman detail receiving.',
      type: 'INFO',
      route: '/goods-receiving',
      targetSelector: '[data-tour="receiving-internal-lot-badge"]',
      targetFallback: '[data-tour="receiving-generated-lots"]',
    },
    {
      id: 'step-12-complete',
      stepNumber: 12,
      totalSteps: 12,
      title: 'Tutorial Goods Receiving Selesai',
      instruction:
        'Selamat! Anda telah memahami seluruh alur pendaftaran penerimaan barang hingga penerbitan stok Internal LOT.',
      type: 'INFO',
      route: '/goods-receiving',
      targetSelector: '[data-tour="receiving-menu"]',
    },
  ],
}
