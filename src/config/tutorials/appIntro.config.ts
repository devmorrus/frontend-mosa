import type { TutorialDefinition } from '@/types/tutorial'

export const appIntroTutorial: TutorialDefinition = {
  id: 'app-intro',
  title: 'Pengenalan Aplikasi MOSA',
  description: 'Mengenalkan struktur navigasi dasar, profil pengguna, dan menu bantuan aplikasi MOSA.',
  category: 'general',
  requiredPermissions: [], // Accessible to all logged-in users
  steps: [
    {
      id: 'step-1-sidebar',
      stepNumber: 1,
      totalSteps: 5,
      title: 'Menu Utama MOSA',
      instruction:
        'Menu utama MOSA tersedia pada bagian ini. Menu yang tampil mengikuti akses dan role Anda.',
      type: 'INFO',
      targetSelector: '[data-tour="sidebar"]',
      placement: 'right',
    },
    {
      id: 'step-2-profile',
      stepNumber: 2,
      totalSteps: 5,
      title: 'Profil Pengguna',
      instruction: 'Bagian ini menampilkan informasi user dan role yang sedang login.',
      type: 'INFO',
      targetSelector: '[data-tour="user-profile"]',
      placement: 'bottom',
    },
    {
      id: 'step-3-navigation',
      stepNumber: 3,
      totalSteps: 5,
      title: 'Navigasi Modul',
      instruction:
        'Gunakan menu ini untuk berpindah ke proses Warehouse, Production, QC, Traceability, dan modul lainnya sesuai akses Anda.',
      type: 'INFO',
      targetSelector: '[data-tour="module-nav"]',
      placement: 'right',
    },
    {
      id: 'step-4-help',
      stepNumber: 4,
      totalSteps: 5,
      title: 'Menu Panduan & Tutorial',
      instruction: 'Tutorial setiap proses operasional dapat dijalankan kembali kapan saja dari menu ini.',
      type: 'INFO',
      targetSelector: '[data-tour="help-menu"]',
      placement: 'right',
    },
    {
      id: 'step-5-complete',
      stepNumber: 5,
      totalSteps: 5,
      title: 'Tutorial Dasar Selesai',
      instruction:
        'Selamat! Anda telah menyelesaikan pengenalan dasar struktur aplikasi MOSA. Anda siap melanjutkan ke panduan modul berikutnya.',
      type: 'INFO',
      targetSelector: '[data-tour="sidebar"]',
      placement: 'right',
    },
  ],
}
