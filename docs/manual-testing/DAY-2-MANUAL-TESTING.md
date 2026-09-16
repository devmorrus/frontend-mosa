# Day 2 QA Checklist: Master Data End-to-End + Fondasi Frontend

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib sertakan screenshot + `traceId` dari response (kini tersedia di `ApiError.traceId`, bila kosong lihat tab Network → response `traceId`).

## Klasifikasi environment

| Run | Aturan |
| --- | --- |
| `PRODUCTION` | **Satu-satunya environment yang dipakai.** **Jangan** isi code `QA-*`. Isi data asli sekali saja ikut Bagian 8, lalu uji read-only. Duplicate-test sengaja, flip status coba-coba, dan data dummy otomatis `N/A` (dicakup automated tests) |

## Persiapan

1. Selesaikan Day 1 Jalur B (prod).
2. Production: pakai akun prod yang disetujui, least-privilege untuk tulis (data asli Bagian 8); siapkan 1 user read-only (tanpa `*.create`/`*.update`) untuk uji 403. Jangan asumsikan akun demo ada (`Seed__DemoData=false`).
4. Pola API: list `GET /api/<modul>?search=&status=&page=1&pageSize=20` (+ `category`, `unitOfMeasureId`, `hasExpiry` di raw-material; + `unitOfMeasureId` di product), detail `GET /{id}`, create `POST` → `201`, duplicate → `409` (`duplicate_*`), update `PUT` → `200`, status `PATCH /{id}/status` → `200`, tanpa izin → `403`, tanpa token → `401`.
5. Search kini **case-insensitive** (diperbaiki di backend): `sup-qa-01` harus ketemu `SUP-QA-01`. Category raw-material kini exact case-insensitive (bukan `Contains`).

## 1. Supplier (`/suppliers`, API `/api/suppliers`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-01 | PROD (data asli Bagian 8) | UI: tambah supplier valid → simpan; cek via API `GET /api/suppliers?search=<code>` | Notifikasi sukses, muncul di tabel dan API (`201` saat create) | [ ] |
| QB-02 | N/A | Duplicate-test sengaja dilarang di prod (tidak boleh buat code ganda coba-coba). | — | N/A - production-only; duplicate guard dicakup automated tests |
| QB-03 | PROD (baca + filter) | UI: filter status; search lowercase; pindah halaman. Edit dan flip active/inactive hanya bila memang kebutuhan operasional (bukan coba-coba) | Tabel/detail ter-update, badge + filter sesuai, search case-insensitive, pagination benar | [ ] |
| QB-04 | SEMUA | Login read-only: buka `/suppliers`, coba create/edit (atau via API langsung) | List terbaca; tombol aksi hilang; forced API → `403` jelas | [ ] |

## 2. Unit of Measure (`/units`, API `/api/unit-of-measures`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-05 | PROD (data asli Bagian 8) | UI: buat UOM valid (bagian 8.1). Duplikat code dan flip status coba-coba dilarang | Sukses tersimpan; badge sesuai | [ ] |
| QB-06 | SEMUA | Search code/nama/symbol lowercase + pagination | Hasil dan halaman sesuai (case-insensitive) | [ ] |

## 3. Raw Material (`/raw-materials`, API `/api/raw-materials`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-07 | PROD (data asli Bagian 8) | UI: buat material pakai UOM aktif + category dari dropdown → cek detail | Tersimpan (`201`); UOM dan category tampil di tabel/detail | [ ] |
| QB-08 | N/A | Negative/duplicate case (code sama, stock negatif, UOM nonaktif, aturan shelf-life) dilarang diuji di prod. | — | N/A - production-only; validasi dicakup automated tests |
| QB-09 | PROD (data asli Bagian 8 + baca) | Buat 1 expiry Yes + 1 expiry No sesuai kebutuhan nyata; mainkan search, filter category/UOM/status/hasExpiry, pagination | Kedua varian tersimpan; filter category exact (ex: `Spices` tidak ketemu `Spice`); pagination benar | [ ] |

Catatan: category dikirim `null` bila `Tanpa kategori`. Validator hanya izinkan katalog resmi; daftar resmi lihat dropdown UI.

## 4. Product (`/products`, API `/api/products`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-10 | PROD (data asli Bagian 8) | UI: buat product UOM aktif. Duplikat code dan flip status coba-coba dilarang | Sukses tersimpan, badge sesuai | [ ] |
| QB-11 | SEMUA | Search + filter status/**UOM** + pagination; pastikan UOM nonaktif tidak bisa dipilih di form (tapi edit produk lama yang UOM-nya nonaktif tetap bisa simpan) | Filter UOM dropdown ada dan hasilnya sesuai; UOM nonaktif tidak muncul di pilihan create | [ ] |

## 5. Warehouse (`/warehouses`, API `/api/warehouses`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-12 | PROD (data asli Bagian 8) | UI: buat warehouse. Duplikat code dan flip status coba-coba dilarang | Sukses tersimpan, tabel ter-update | [ ] |
| QB-13 | SEMUA | Search lowercase + filter status + pagination | Hasil dan halaman sesuai | [ ] |

## 6. Standardisasi

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-14 | SEMUA | Bandingkan response list + error di 5 modul | Format konsisten: `items` + `pagination` (`page`, `pageSize`, `totalItems`, `totalPages`); error ProblemDetails + `traceId` | [ ] |
| QB-15 | SEMUA | Search `sup-qa-01` vs `SUP-QA-01` | Keduanya ketemu (case-insensitive, sudah diperbaiki). Bila tidak ketemu = FAIL | [ ] |
| QB-16 | PROD (baca) | Setelah create data asli Bagian 8 atau setelah event login, cek `GET /api/admin/audit-logs` | Ada log `*.created`/`*.updated`/`*.status.updated` + `auth.*` dengan user + entity + waktu UTC | [ ] |
| QB-17 | N/A | Swagger default mati di prod dan tidak boleh dipaksa aktif. | — | N/A - production-only; kontrak endpoint dicakup automated tests |

## 7. Fondasi Frontend

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-18 | N/A | Tidak ada run frontend local di production-only testing. | — | N/A - production-only (app diakses via URL prod) |
| QB-19 | SEMUA | Login → refresh → tutup/buka tab → `GET /api/auth/me` → logout | Session pulih; `/me` kembalikan user + roles + permissions; logout bersihkan session dan kunci halaman protected | [ ] |
| QB-20 | SEMUA | Tanpa login buka `/suppliers`; user tanpa permission buka `/suppliers` dan `/dashboard`; hapus token lalu refresh | Berurutan: ke `/login`; `/403` bersih tanpa request data bocor; kembali ke login | [ ] |
| QB-21 | SEMUA | Cek Main Layout + sidebar sebagai admin vs user terbatas | Sidebar, topbar, nama user tampil; hanya menu sesuai permission yang hilang (Tutorial & Panduan dan placeholder `Soon` memang selalu tampil by-design) | [ ] |
| QB-22 | SEMUA | Cek satu halaman master di 1440 px, 768 px, 375 px | Tabel/filter/dialog/pagination rapi; mobile pakai drawer, tanpa aksi terpotong | [ ] |

## 8. Isi data awal production (prod kosong — isi sekali, data asli)

Urutan wajib karena relasi: **UOM → Warehouse → Supplier → Raw Material → Product**. Jangan pakai code `QA-*`/`SUP-QA-01` di prod. Siapkan daftar dari operasional dahulu, baru input berurutan. Setiap create langsung verifikasi di tabel + `GET` API + 1 baris audit (QB-16).

### 8.1 UOM (contoh, sesuaikan satuan pabrik Anda)

| Code | Name | Symbol | Status |
| --- | --- | --- | --- |
| `KG` | Kilogram | kg | Active |
| `G` | Gram | g | Active |
| `L` | Liter | L | Active |
| `PCS` | Pieces | pcs | Active |
| `PACK` | Pack | pack | Active |

Aturan: code unik, `1-20` karakter, tersimpan `UPPER`. Nonaktifkan (jangan hapus) bila salah — data lama yang memakai UOM nonaktif tetap bisa diedit namanya, tapi UOM nonaktif tidak muncul di dropdown create baru.

### 8.2 Warehouse (contoh)

| Code | Name | Status |
| --- | --- | --- |
| `WH-RM` | Gudang Bahan Baku | Active |
| `WH-FG` | Gudang Barang Jadi | Active |
| `WH-QC` | Area Karantina QC | Active |

### 8.3 Supplier (contoh format — ganti data asli)

| Code | Name | Phone | Email | Address | Status |
| --- | --- | --- | --- | --- | --- |
| `SUP-001` | PT Sumber Pangan | 021-xxxxxxx | purchasing@sumberpangan.co.id | Bekasi | Active |

Isi supplier yang benar-benar dipakai. Duplicate code `409` berarti data sudah ada — cek search dulu sebelum create.

### 8.4 Raw Material (contoh)

| Code | Name | Category (dropdown) | UOM | Has Expiry | Shelf Life | Min Stock |
| --- | --- | --- | --- | --- | --- | --- |
| `RM-001` | Gula Pasir | Dry Goods | KG | Yes | 365 | 50 |
| `RM-002` | Garam | Spices | KG | No | — | 25 |

Aturan: UOM harus aktif; `MinimumStock >= 0`; `Has Expiry Yes` wajib `ShelfLife > 0`; `No` wajib kosong (form mengosongkan otomatis). Category pakai dropdown, jangan ketik bebas.

### 8.5 Product (contoh)

| Code | Name | UOM | Shelf Life | Status |
| --- | --- | --- | --- | --- |
| `PRD-001` | Sambal Botol 250ml | PCS | 180 | Active |

Pastikan UOM produk aktif. Setelah semua terisi: cek tiap list `totalItems > 0`, search lowercase ketemu, filter UOM product berfungsi, dan audit-log berisi `uoms.created`, `warehouses.created`, `suppliers.created`, `materials.created`, `products.created` berurutan.

### Yang TIDAK boleh dilakukan di prod

* Create code `QA-*`, duplicate-test sengaja, flip active/inactive coba-coba.
* Pakai akun demo/`Password123!`.
* Hapus/nonaktifkan data yang baru diisi hanya untuk “bersih-bersih” tanpa persetujuan operasional.

## Sign-off

| Tester | Tanggal | Env (PROD) | Browser/Device | Catatan + traceId bila FAIL |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

Day 2 selesai bila QB-01 s/d QB-22 semua `PASS`/`N/A` sesuai scope + Bagian 8 terisi data asli di prod (bukan code QA). Item `N/A` (QB-02, QB-08, QB-17, QB-18) adalah negative/infra case yang dilarang di prod dan dicakup automated tests.
