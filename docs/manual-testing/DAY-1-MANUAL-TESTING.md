# Day 1 QA Checklist: Foundation, Auth, Role, Validation, Audit

Tulis `PASS` / `FAIL` / `BLOCKED` di kolom Hasil. Setiap `FAIL` wajib sertakan screenshot + `traceId` dari response.

## Persiapan (lakukan sekali)

1. Di `mosa-backend`: copy `.env.example` → `.env` (jangan commit `.env`), lalu `docker compose --profile dev up --build`. Tunggu `migrator-dev` sukses dan `api-dev` running.
2. Cek `GET http://localhost:5104/api/system/health` → `200 {"status":"ok",...}` dan Swagger terbuka di `http://localhost:5104/swagger`.
3. Di `mosa-frontend`: copy `.env.example` → `.env`, set `VITE_API_BASE_URL=http://localhost:5104/api`, lalu `npm install` + `npm run dev`.
4. Untuk API pakai Swagger atau curl dengan base `http://localhost:5104`.

## Akun uji (semua password `Password123!`)

`superadmin` (SUPERADMIN) · `admin` · `warehouse` · `supervisor` (PRODUCTION_SUPERVISOR) · `operator` (OPERATOR) · `qc` (QC) · `management` (MANAGEMENT). Siapkan juga password salah (`Wrong123!`) dan user fiktif (`tidak.ada`).

Catatan perilaku: setelah login user mendarat di home sesuai role (operator → `/operator/production`, QC → `/quality-control`), bukan selalu dashboard. Menu yang pasti 403 disembunyikan dari sidebar.

## 1. Infra & Database

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QA-01 | Clean run: `docker compose down -v` lalu `up --build` (profile dev) | `db` healthy, `api-dev` running, tanpa error koneksi di log | [ ] |
| QA-02 | Cek tabel `users`, `roles`, `permissions`, `refresh_tokens`, `audit_logs`, `menus` ada | Semua tabel ada, migrator exit 0 | [ ] |
| QA-03 | Buka Swagger, Execute `GET /api/System/health` dan cek `POST /api/Auth/login` terdaftar | Health `200`, kontrak auth lengkap (200/400/401/500) | [ ] |
| QA-04 | `git ls-files .env` di repo backend | `.env` tidak ter-track (hanya `.env.example`); tanpa secret production di Git | [ ] |

## 2. Authentication

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QA-05 | `POST /api/auth/login` dengan `superadmin` + password benar | `200`, ada `accessToken`, `refreshToken`, `expiresAtUtc`, `user.username` | [ ] |
| QA-06 | Login password salah, lalu login user fiktif | Keduanya `401` dengan pesan generik yang SAMA (`Invalid username or password`), tanpa bocoran mana yang salah | [ ] |
| QA-07 | `GET /api/auth/me` pakai token, tanpa token, dan dengan token rusak/expired | Berurutan: `200` (+ `roles`, `permissions`), `401`, `401` | [ ] |
| QA-08 | `POST /api/auth/refresh` pakai refresh valid, lalu pakai lagi refresh lama yang sama | Pertama `200` + token baru (rotasi); kedua `401` (lama sudah di-revoke) | [ ] |
| QA-09 | Refresh pakai `invalid-token` dan body kosong `{}` | `401` untuk invalid; `400` validasi untuk kosong | [ ] |
| QA-10 | `POST /api/auth/logout` dengan refresh aktif, lalu refresh lagi + `GET /me` pakai access lama | Logout `204`; refresh ulang `401`; access lama ikut `401` | [ ] |

```bash
curl -s http://localhost:5104/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"Password123!"}'
curl -s http://localhost:5104/api/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 3. Role & Permission

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QA-11 | Login 7 akun demo, cek `GET /api/auth/me` masing-masing | Role benar: SUPERADMIN, ADMIN, WAREHOUSE, PRODUCTION_SUPERVISOR, OPERATOR, QC, MANAGEMENT | [ ] |
| QA-12 | Sebagai `operator`, `GET /api/users?page=1&pageSize=5` via curl (tanpa frontend) | `403`, `type=/problems/forbidden`, `errorCode=forbidden` | [ ] |
| QA-13 | Bandingkan `permissions` di `/me` untuk 2 role berbeda | Isinya beda sesuai matriks (misal management read-only) | [ ] |

## 4. Validation & Error

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QA-14 | `POST /api/auth/login` body `{}`; kirim JSON rusak `{"username":` | `400` ProblemDetails validasi dengan field `errors`; ada `traceId` + `timestampUtc` | [ ] |
| QA-15 | Non-prod: `GET /api/diagnostics/unhandled` dan `GET /api/diagnostics/not-found` | `500` generik tanpa teks `Unhandled diagnostic exception`; `404` ProblemDetails | [ ] |

## 5. Audit

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QA-16 | Buat/ubah satu master data, lalu `GET /api/admin/audit-logs?page=1&pageSize=5` sebagai superadmin | Ada log baru dengan `userId` pelaku, `action`, `entityType`, `entityId`, `occurredAtUtc` UTC, `ipAddress` terisi | [ ] |

```bash
curl -s 'http://localhost:5104/api/admin/audit-logs?page=1&pageSize=5' \
  -H "Authorization: Bearer <SUPERADMIN_TOKEN>"
```

## 6. Frontend login, session & akses

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QA-17 | Buka app tanpa login; login valid; login password salah; login user fiktif | Login tampil dulu; login valid masuk home role-nya tanpa 403 di console; 2 login gagal tampilkan error aman, tetap di login | [ ] |
| QA-18 | Refresh browser + tutup/buka tab setelah login valid | Session pulih, tidak balik ke login | [ ] |
| QA-19 | Logout, lalu buka `/dashboard` langsung | Kembali ke login; login ulang sebagai operator mendarat di `/operator/production` | [ ] |
| QA-20 | Logout, buka `/suppliers` langsung, lalu login user ber-permission supplier | Dialihkan ke login, lalu kembali ke `/suppliers` | [ ] |
| QA-21 | Sebagai operator, ketik `/dashboard` langsung; cek sidebar | Halaman 403 bersih (Network: TIDAK ada request `dashboard/summary`/`warehouses`); menu Dashboard tidak tampil di sidebar | [ ] |
| QA-22 | Hapus `mosa.accessToken` + `mosa.refreshToken` di DevTools → refresh; matikan backend sementara → refresh | Kembali ke login; pesan koneksi mudah dipahami, app tidak crash | [ ] |
| QA-23 | Cek login + dashboard di 1440 px, 768 px, 375 px | Form terbaca, sidebar jadi drawer di mobile, tanpa scroll horizontal menghalangi aksi | [ ] |

## Sign-off

| Tester | Tanggal | Browser/Device | Catatan + traceId bila FAIL |
| --- | --- | --- | --- |
|  |  |  |  |

Day 1 selesai bila QA-01 s/d QA-23 semua `PASS`.
