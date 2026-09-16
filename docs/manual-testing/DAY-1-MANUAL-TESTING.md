# Day 1 QA Checklist: Foundation, Auth, Role, Validation, Audit

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib sertakan screenshot + `traceId` dari response.

## Klasifikasi environment (wajib diisi sebelum mulai)

| Run ID | Environment | Aturan |
| --- | --- | --- |
| `PRODUCTION` | `frontend-mosa.vercel.app` + API prod | **Satu-satunya environment yang dipakai.** Dilarang reset data, mematikan backend, endpoint diagnostics, dan akun demo. Fokus read-only + akun prod yang disetujui |

> Pengujian Day 1 dilakukan langsung di production. Tidak ada local/staging. Langkah destruktif atau yang membutuhkan data dummy otomatis `N/A` dengan alasan jelas; kasus negatif/destruktif dicakup automated tests (backend unit + frontend unit) sebagai evidence pendukung.
>
> Dokumen ini mempertahankan ID QA-01 s/d QA-23 agar hasil lama tetap terbaca. Kolom **Scope** memberi tahu apakah langkah boleh dijalankan di production.

## Persiapan

### Jalur A — local: `N/A` (tidak ada local/staging; seluruh pengujian production-only)

### Jalur B — production (tanpa reset)

1. Catat URL frontend prod, URL API prod, commit/versi, browser/device, dan akun uji yang disetujui. Jangan lakukan reset apa pun.
2. Buka DevTools → Network, pastikan request frontend mengarah ke API prod yang benar (sesuai `VITE_API_BASE_URL` environment prod, bukan localhost).
3. Siapkan 1 akun uji non-kritis untuk skenario refresh/logout. Jangan pakai superadmin prod bila ada akun berhak lebih rendah yang cukup.
4. Untuk uji token via curl, pakai sesi terisolasi (profil browser incognito / curl saja). Frontend melakukan auto-refresh saat `401` (`src/api/client.ts:121-138`) sehingga token yang sedang Anda uji bisa terotasi di belakang layar.

## Akun uji

* Production (`Seed__DemoData=false`): **jangan asumsikan 7 akun demo ada**. Pakai akun prod yang disetujui dan least-privilege. Jangan tulis password di tiket/screenshot. Untuk skenario kredensial salah, pakai password salah dan user fiktif (`tidak.ada`) terhadap akun prod yang disetujui — tidak ada akun demo yang dibuat.
* Akun seed demo local (`superadmin`/`admin`/`warehouse`/dsb, password `Password123!`): `N/A` — tidak ada environment seed; pengujian peran memakai akun prod yang disetujui.

Catatan perilaku: setelah login user mendarat di home sesuai role (operator → `/operator/production`, QC → `/quality-control`), bukan selalu dashboard. Menu yang pasti 403 disembunyikan dari sidebar. Browser login selalu mengirim `rememberMe: true` (`src/api/auth.api.ts:74-76`), sehingga umur refresh token browser bisa lebih panjang daripada curl tanpa `rememberMe`.

Catatan format error: backend memakai ProblemDetails. Pesan gagal login ada di field `detail` dengan isi persis `Invalid username or password.` (dengan titik), bukan field `message`. Frontend menampilkan teks normalisasi dari `detail/title/message` (`src/api/client.ts:78-84`).

## 1. Infra & Database

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QA-01A | N/A | Tidak ada local/docker di pengujian ini. | — | N/A - production-only, tidak ada docker/local |
| QA-01B | PROD | Preflight non-destruktif: catat versi, cek health via API. Tanpa restart/reset. | Tidak ada restart/reset; health/ready terpantau | [ ] |
| QA-02 | PROD (baca saja) | Tanpa akses DB prod: cek `GET /api/system/ready` + 1 query read-only via API. | `ready: 200 ok` | [ ] |
| QA-03 | PROD | Swagger default mati di prod — pakai `GET /api/system/health` dan `GET /api/system/ready` langsung, jangan paksa aktifkan Swagger di prod. | Health `200`, ready `200` | [ ] |
| QA-04 | SEMUA | `git ls-files .env` di `mosa-backend` DAN `mosa-frontend`; pastikan `.env` tidak ter-track (hanya `.env.example`); cek tidak ada secret prod di Git dan tidak ada token/URL prod hardcoded di source. | Kedua `.env` untracked; tidak ada secret prod ter-commit | [ ] |

## 2. Authentication

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QA-05 | PROD (1 akun disetujui) | `POST /api/auth/login` dengan kredensial benar akun prod yang disetujui. | `200`, ada `accessToken`, `refreshToken`, `expiresAtUtc`, `user.username` | [ ] |
| QA-06 | SEMUA | Login password salah, lalu login user fiktif. Bandingkan `status` + `detail` secara semantik. | Keduanya `401` dengan pesan generik yang SAMA di `detail` (`Invalid username or password.`), tanpa bocoran mana yang salah | [ ] |
| QA-07 | SEMUA | `GET /api/auth/me` pakai token valid, tanpa token, dan dengan token rusak/expired. | Berurutan: `200` (+ `roles`, `permissions`, `fullName`), `401`, `401` | [ ] |
| QA-08 | SEMUA (isolasi token) | `POST /api/auth/refresh` pakai refresh valid, lalu pakai lagi refresh lama yang sama. Lakukan di sesi terisolasi dari browser agar auto-refresh tidak mengacaukan. | Pertama `200` + token baru (rotasi); kedua `401` (lama sudah di-revoke). Bila reuse token yang sudah dirotasi terdeteksi, semua sesi user di-revoke sebagai pengaman. | [ ] |
| QA-09 | SEMUA | Refresh pakai `invalid-token` dan body kosong `{}`. | `401` untuk invalid; `400` validasi untuk kosong dengan `errors` + `traceId` + `timestampUtc` | [ ] |
| QA-10 | PROD (akun uji non-kritis yang disetujui) | Simpan access token lama dahulu. `POST /api/auth/logout` dengan refresh aktif, lalu refresh lagi + `GET /me` pakai access lama. Catatan: logout `204` walau refresh sudah invalid (no-op, sesi tidak di-revoke). Sejak perbaikan ini logout merevoke **semua** refresh aktif user + menaikkan `SessionVersion` sehingga semua access lama mati. | Logout `204`; refresh ulang `401`; `GET /me` dengan access lama `401` | [ ] |

```bash
curl -s <API_PROD>/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"<akun-uji-disetujui>","password":"<password>","rememberMe":true}'
curl -s <API_PROD>/api/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 3. Role & Permission

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QA-11 | PROD (akun disetujui saja) | Login tiap akun prod yang disetujui, cek `GET /api/auth/me` masing-masing. | Role benar sesuai akun yang ada (bandingkan case-insensitive) | [ ] |
| QA-12 | SEMUA | Sebagai `operator`, `GET /api/users?page=1&pageSize=5` via curl dengan bearer operator (tanpa frontend). | `403`, `type=/problems/forbidden`, `errorCode=forbidden` | [ ] |
| QA-13 | SEMUA | Bandingkan `permissions` di `/me` untuk 2 role berbeda melawan sumber `ApplicationDataSeeder.cs:238-393`. | Isinya beda sesuai seed. Catatan: management BUKAN read-only murni (punya `reports.export`). | [ ] |

## 4. Validation & Error

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QA-14 | SEMUA | `POST /api/auth/login` body `{}`; kirim JSON rusak `{"username":` sebagai kasus terpisah. | `400` ProblemDetails validasi dengan field `errors`; ada `traceId` + `timestampUtc`. Bentuk JSON rusak dicatat terpisah karena bisa beda dari `{}`. | [ ] |
| QA-15 | N/A | Endpoint diagnostics dilarang di production-only testing. | — | N/A - diagnostics dilarang di prod; dicakup automated tests |

## 5. Audit

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QA-16 | PROD (baca saja) | Jangan mutasi data; verifikasi viewer dengan entri yang sudah ada (termasuk event `auth.login`, `auth.refresh`, `auth.logout`). | Ada log dengan `userId` pelaku, `action`, `entityType`, `entityId`, `occurredAtUtc` UTC, `ipAddress` terisi. | [ ] |

```bash
curl -s '<API_PROD>/api/admin/audit-logs?page=1&pageSize=5' \
  -H "Authorization: Bearer <TOKEN_AKUN_BERHAK>"
```

## 6. Frontend login, session & akses

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QA-17 | SEMUA | Buka app tanpa login; login valid; login password salah; login user fiktif. | Login tampil dulu; login valid masuk home role-nya tanpa 403 di console; 2 login gagal tampilkan error aman, tetap di login | [ ] |
| QA-18 | SEMUA | Refresh browser + tutup/buka tab setelah login valid. Cek `mosa.accessToken` + `mosa.refreshToken` di localStorage. Batasan: bootstrap butuh access token; bila hanya access yang dihapus, sesi tidak pulih walau refresh masih ada. | Session pulih, tidak balik ke login | [ ] |
| QA-19 | SEMUA | Logout, tunggu sampai benar-benar di halaman login, lalu buka `/dashboard` langsung. Login ulang sebagai operator. | Kembali ke login; login ulang sebagai operator mendarat di `/operator/production` | [ ] |
| QA-20 | SEMUA | Logout, buka `/suppliers` langsung, lalu login user prod ber-permission supplier. | Dialihkan ke login, lalu kembali ke `/suppliers` | [ ] |
| QA-21 | SEMUA | Sebagai operator, ketik `/dashboard` langsung; cek sidebar + Network. | Redirect ke `/403` (bukan render dashboard di URL sama); Network: TIDAK ada request `dashboard/summary`/`warehouses`; menu Dashboard tidak tampil di sidebar | [ ] |
| QA-22 | PROD (DevTools saja) | Hapus `mosa.accessToken` + `mosa.refreshToken` di DevTools → refresh. Untuk gangguan jaringan: JANGAN matikan backend prod — pakai DevTools request blocking / offline. | Kembali ke login; pesan koneksi mudah dipahami (`Tidak dapat menghubungi server...`), app tidak crash | [ ] |
| QA-23 | SEMUA | Cek login + dashboard di 1440 px, 768 px, 375 px. Dashboard wajib pakai role ber-`dashboard.view`, bukan operator/QC. | Form terbaca, sidebar jadi drawer di mobile, tanpa scroll horizontal menghalangi aksi | [ ] |

## Sign-off

| Tester | Tanggal | Env (PROD) | Browser/Device | Catatan + traceId bila FAIL |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

Day 1 selesai bila QA-01B, QA-02 s/d QA-14, QA-16 s/d QA-23 semua `PASS`; QA-01A dan QA-15 `N/A` (tidak ada local/diagnostics di production-only testing).
