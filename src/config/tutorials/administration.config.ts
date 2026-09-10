import type { TutorialDefinition } from '@/types/tutorial'

export const adminUserManagementTutorial: TutorialDefinition = {
  id: 'admin-user-management',
  title: 'Administration - User Management',
  description: 'Panduan mengelola user, role, status, dan session user.',
  category: 'administration',
  requiredPermissions: ['users.view'],
  steps: [
    { id: 'aum-1', stepNumber: 1, totalSteps: 7, title: 'Administration', instruction: 'Menu Administration digunakan untuk mengelola user, role, permission dan Audit Trail.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="admin-menu"]', placement: 'right' },
    { id: 'aum-2', stepNumber: 2, totalSteps: 7, title: 'Users', instruction: 'Buka menu Users untuk melihat daftar pengguna.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="users-menu"]', placement: 'right' },
    { id: 'aum-3', stepNumber: 3, totalSteps: 7, title: 'Create User', instruction: 'Gunakan fitur ini untuk membuat account pengguna MOSA.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="user-create"]', targetFallback: '[data-tour="users-menu"]', placement: 'bottom' },
    { id: 'aum-4', stepNumber: 4, totalSteps: 7, title: 'Role', instruction: 'Role menentukan kumpulan permission yang dimiliki user.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="user-role"]', targetFallback: '[data-tour="users-menu"]', placement: 'bottom' },
    { id: 'aum-5', stepNumber: 5, totalSteps: 7, title: 'Status', instruction: 'User yang dinonaktifkan tidak dapat menggunakan account untuk mengakses aplikasi.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="user-status"]', targetFallback: '[data-tour="users-menu"]', placement: 'bottom' },
    { id: 'aum-6', stepNumber: 6, totalSteps: 7, title: 'Revoke Sessions', instruction: 'Gunakan Revoke Sessions untuk mengakhiri session user yang masih aktif.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="user-revoke-session"]', targetFallback: '[data-tour="users-menu"]', placement: 'bottom' },
    { id: 'aum-7', stepNumber: 7, totalSteps: 7, title: 'Selesai', instruction: 'Tutorial User Management selesai.', type: 'INFO', route: '/admin/users', targetSelector: '[data-tour="users-menu"]', placement: 'right' },
  ],
}

export const adminRolesPermissionsTutorial: TutorialDefinition = {
  id: 'admin-roles-permissions',
  title: 'Administration - Roles & Permissions',
  description: 'Panduan memahami role dan permission tanpa mengubah akses user.',
  category: 'administration',
  requiredPermissions: ['roles.view'],
  steps: [
    { id: 'arp-1', stepNumber: 1, totalSteps: 6, title: 'Roles & Permissions', instruction: 'Buka menu Roles & Permissions untuk mengelola otorisasi sistem.', type: 'INFO', route: '/admin/roles', targetSelector: '[data-tour="roles-menu"]', placement: 'right' },
    { id: 'arp-2', stepNumber: 2, totalSteps: 6, title: 'Pilih Role', instruction: 'Pilih role dari daftar untuk melihat detail permission.', type: 'INFO', route: '/admin/roles', targetSelector: '[data-tour="role-select"]', targetFallback: '[data-tour="roles-menu"]', placement: 'bottom' },
    { id: 'arp-3', stepNumber: 3, totalSteps: 6, title: 'Permission Groups', instruction: 'Permission dikelompokkan berdasarkan module.', type: 'INFO', route: '/admin/roles', targetSelector: '[data-tour="permission-group"]', targetFallback: '[data-tour="roles-menu"]', placement: 'right' },
    { id: 'arp-4', stepNumber: 4, totalSteps: 6, title: 'Simpan Permission', instruction: 'Simpan perubahan permission dengan tombol ini. Panduan saja — jangan ubah permission nyata saat tutorial.', type: 'INFO', route: '/admin/roles', targetSelector: '[data-tour="permission-save"]', targetFallback: '[data-tour="roles-menu"]', placement: 'bottom' },
    { id: 'arp-5', stepNumber: 5, totalSteps: 6, title: 'Dampak Perubahan', instruction: 'Perubahan permission akan memengaruhi akses user dalam role tersebut. Verifikasi ulang sebelum menyimpan di luar tutorial.', type: 'INFO', route: '/admin/roles', targetSelector: '[data-tour="permission-save"]', targetFallback: '[data-tour="roles-menu"]', placement: 'bottom' },
    { id: 'arp-6', stepNumber: 6, totalSteps: 6, title: 'Selesai', instruction: 'Tutorial Roles & Permissions selesai.', type: 'INFO', route: '/admin/roles', targetSelector: '[data-tour="roles-menu"]', placement: 'right' },
  ],
}

export const adminAuditTrailTutorial: TutorialDefinition = {
  id: 'admin-audit-trail',
  title: 'Administration - Audit Trail',
  description: 'Panduan membaca audit trail untuk review dan troubleshooting.',
  category: 'administration',
  requiredPermissions: ['audit.view'],
  steps: [
    { id: 'aat-1', stepNumber: 1, totalSteps: 8, title: 'Audit Trail', instruction: 'Audit Trail digunakan untuk melihat siapa melakukan tindakan tertentu dan kapan tindakan dilakukan.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-menu"]', placement: 'right' },
    { id: 'aat-2', stepNumber: 2, totalSteps: 8, title: 'Date Filter', instruction: 'Gunakan date filter untuk membatasi periode audit.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-date-filter"]', placement: 'bottom' },
    { id: 'aat-3', stepNumber: 3, totalSteps: 8, title: 'User Filter', instruction: 'Gunakan user filter untuk melihat aktivitas user tertentu.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-user-filter"]', placement: 'bottom' },
    { id: 'aat-4', stepNumber: 4, totalSteps: 8, title: 'Action Filter', instruction: 'Filter action membantu menemukan aktivitas tertentu.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-action-filter"]', placement: 'bottom' },
    { id: 'aat-5', stepNumber: 5, totalSteps: 8, title: 'Detail', instruction: 'Buka Audit Detail untuk melihat perubahan secara rinci.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-detail"]', targetFallback: '[data-tour="audit-menu"]', placement: 'left' },
    { id: 'aat-6', stepNumber: 6, totalSteps: 8, title: 'Before / After', instruction: 'Bagian ini menunjukkan perubahan data yang direkam oleh MOSA.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-change"]', targetFallback: '[data-tour="audit-menu"]', placement: 'top' },
    { id: 'aat-7', stepNumber: 7, totalSteps: 8, title: 'Read Only', instruction: 'Audit Trail bersifat read-only dan tidak dapat diedit melalui aplikasi.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-change"]', targetFallback: '[data-tour="audit-menu"]', placement: 'top' },
    { id: 'aat-8', stepNumber: 8, totalSteps: 8, title: 'Selesai', instruction: 'Tutorial Audit Trail selesai.', type: 'INFO', route: '/admin/audit-trail', targetSelector: '[data-tour="audit-menu"]', placement: 'right' },
  ],
}
