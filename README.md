# MOSA Frontend

Frontend foundation untuk project MOSA. Dibangun dengan **React 19 + TypeScript + Vite + Tailwind CSS v4**, sesuai *Tasking 5 — Frontend Project Foundation* (Day 2).

Scope hari ini adalah **arsitektur**, bukan halaman fungsional. Modul Master Data (Supplier, Material, Product, Goods Receiving, Inventory, Recipe, Production, QC) dan Dashboard chart akan dibangun mulai Day 3 di atas foundation ini.

## Menjalankan Project

```bash
npm install
cp .env.example .env   # sesuaikan VITE_API_BASE_URL dengan backend Anda
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Environment Variables

Lihat `.env.example`. **Jangan pernah commit file `.env`** — sudah di-ignore lewat `.gitignore`.

| Variable            | Keterangan                                   |
|---------------------|-----------------------------------------------|
| `VITE_API_BASE_URL` | Base URL backend API MOSA                     |
| `VITE_APP_ENV`      | Nama environment (local/staging/production)   |

Semua pembacaan env terpusat di `src/config/env.ts` — jangan panggil `import.meta.env` langsung dari tempat lain.

## Struktur Folder

```
src/
├── api/           # Axios client tersentralisasi + service per domain (auth.api.ts, dst.)
├── components/
│   └── common/    # Sidebar, Topbar, ErrorBoundary, ToastContainer, dll — dipakai lintas halaman
├── config/        # env.ts — satu-satunya tempat baca import.meta.env
├── features/      # (disiapkan) logic per modul bisnis, mulai diisi Day 3
├── hooks/         # useAuth, useSessionBootstrap, dst.
├── layouts/       # MainLayout (sidebar+topbar+content), AuthLayout (login)
├── pages/         # Komponen halaman, dikelompokkan per area (auth/, dashboard/, errors/)
├── routes/        # AppRoutes.tsx (route tree), ProtectedRoute.tsx, navigation.config.ts
├── stores/        # Zustand: authStore (sesi & permission), uiStore (toast, sidebar mobile)
├── types/         # Tipe bersama (auth.ts, api.ts)
└── utils/         # tokenStorage.ts, dll
```

Struktur tidak wajib diikuti persis, tapi **konsisten**: request API selalu lewat `src/api/*`, state global selalu lewat `src/stores/*`, jangan bangun layout baru per halaman.

## Alur Autentikasi

1. `LoginPage` memanggil `useAuth().login()` → `authApi.login()` → `POST /auth/login`.
2. Token disimpan lewat `tokenStorage` (satu-satunya tempat yang menyentuh `localStorage` untuk token — bukan hardcoded, bukan tersebar).
3. `authStore` menyimpan `user` + status `isAuthenticated`, dipakai oleh `ProtectedRoute` dan `Sidebar`.
4. Saat reload, `useSessionBootstrap` mengecek token tersimpan lalu memanggil `/auth/me` untuk memulihkan sesi.
5. Response `401` dari API manapun otomatis membersihkan sesi dan redirect ke `/login` (lihat interceptor di `src/api/client.ts`).

## Routing & Proteksi

- Route publik: `/login` (dibungkus `AuthLayout`).
- Route terproteksi: dibungkus `<ProtectedRoute>` lalu `<MainLayout>`. Tanpa sesi → redirect `/login`. Dengan sesi tapi tanpa permission yang disyaratkan → redirect `/403`.
- Menambah route baru cukup edit `src/routes/AppRoutes.tsx`; contoh pola permission-gated sudah ada sebagai komentar di file tersebut.

## Sidebar Berbasis Permission

`src/routes/navigation.config.ts` adalah satu-satunya sumber daftar menu. Setiap item punya `permission?: string` opsional; `Sidebar` memfilter otomatis berdasarkan `user.permissions` dari backend. Tidak ada mapping role→menu yang di-hardcode — menambah permission baru di backend otomatis memunculkan menu terkait (setelah page-nya dibuat di route tree).

## API Client & Error Handling

- Semua request **wajib** lewat `src/api/client.ts` (atau service tipis di atasnya seperti `auth.api.ts`) — jangan panggil `axios`/`fetch` langsung dari komponen.
- Header `Authorization` dipasang otomatis dari `tokenStorage`.
- Error dinormalisasi ke bentuk `ApiError` yang konsisten (`status`, `message`, `errors` per-field).
- `401` → clear session + redirect login. `403` → toast permission. `5xx`/network error → toast otomatis lewat `uiStore`.
- Error render-time (crash React) ditangani terpisah oleh `ErrorBoundary` di `App.tsx`.

## Responsive Foundation

- Sidebar: kolom persistent di layar `md` ke atas (tablet/desktop), berubah jadi off-canvas drawer dengan overlay di mobile.
- Layout memakai `flex` + `min-w-0`/`overflow-y-auto` agar konten panjang tidak merusak layout di layar sempit.
- Sudah diuji lolos build; disarankan tetap dicek manual di breakpoint mobile (~375px), tablet (~768px), dan desktop.

## Checklist Sebelum Push

- [ ] `npm run build` lolos tanpa error
- [ ] Tidak ada file `.env` ikut ter-stage (`git status`)
- [ ] Tidak ada token/URL API yang di-hardcode di source
