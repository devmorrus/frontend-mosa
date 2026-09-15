# Day 2 QA Checklist: Master Data End-to-End + Fondasi Frontend

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib sertakan screenshot + `traceId` dari response (kini tersedia di `ApiError.traceId`, bila kosong lihat tab Network → response `traceId`).

## Klasifikasi environment

| Run | Aturan |
| --- | --- |
| `LOCAL_DISPOSABLE` | Docker dev, data boleh hilang. Satu-satunya tempat untuk code `SUP-QA-01` dkk, duplicate-test, dan flip active/inactive coba-coba |
| `SHARED_QA` / `STAGING` | Data tidak boleh hilang. Pakai prefix `QA-TEST-` + cleanup |
| `PRODUCTION` | Data kosong = wajar. **Jangan** isi code `QA-*`. Isi data asli sekali saja ikut Bagian 8, lalu uji read-only |

## Persiapan

1. Selesaikan Day 1 Jalur A (local) atau Jalur B (prod).
2. Local/staging: login `admin`/`superadmin` (`Password123!`) untuk tulis; siapkan 1 user read-only (tanpa `*.create`/`*.update`) untuk uji 403.
3. Production: pakai akun prod yang disetujui, least-privilege. Jangan asumsikan akun demo ada (`Seed__DemoData=false`).
4. Pola API: list `GET /api/<modul>?search=&status=&page=1&pageSize=20` (+ `category`, `unitOfMeasureId`, `hasExpiry` di raw-material; + `unitOfMeasureId` di product), detail `GET /{id}`, create `POST` → `201`, duplicate → `409` (`duplicate_*`), update `PUT` → `200`, status `PATCH /{id}/status` → `200`, tanpa izin → `403`, tanpa token → `401`.
5. Search kini **case-insensitive** (diperbaiki di backend): `sup-qa-01` harus ketemu `SUP-QA-01`. Category raw-material kini exact case-insensitive (bukan `Contains`).

## 1. Supplier (`/suppliers`, API `/api/suppliers`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-01 | LOCAL/STAGING tulis; PROD baca | UI: tambah supplier valid → simpan; cek via API `GET /api/suppliers?search=<code>` | Notifikasi sukses, muncul di tabel dan API (`201` saat create) | [ ] |
| QB-02 | LOCAL/STAGING | UI + API: buat lagi code sama | Form/API menolak duplicate (`409` `duplicate_supplier_code`), tidak ada baris ganda. Race konkuren juga `409` (`duplicate_resource_code`), bukan 500 | [ ] |
| QB-03 | LOCAL/STAGING tulis; PROD baca | UI: edit + ubah active→inactive→active lagi; filter status; search lowercase; pindah halaman | Tabel/detail ter-update, badge + filter sesuai, search case-insensitive, pagination benar | [ ] |
| QB-04 | SEMUA | Login read-only: buka `/suppliers`, coba create/edit (atau via API langsung) | List terbaca; tombol aksi hilang; forced API → `403` jelas | [ ] |

## 2. Unit of Measure (`/units`, API `/api/unit-of-measures`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-05 | LOCAL/STAGING tulis; PROD baca | UI: buat UOM valid → duplikat code → edit + ubah status | Sukses lalu duplicate `409` `duplicate_unit_of_measure_code`; badge ikut berubah | [ ] |
| QB-06 | SEMUA | Search code/nama/symbol lowercase + pagination | Hasil dan halaman sesuai (case-insensitive) | [ ] |

## 3. Raw Material (`/raw-materials`, API `/api/raw-materials`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-07 | LOCAL/STAGING tulis; PROD baca | UI: buat material pakai UOM aktif + category dari dropdown → cek detail | Tersimpan (`201`); UOM dan category tampil di tabel/detail | [ ] |
| QB-08 | LOCAL/STAGING | Coba: code sama; minimum stock negatif; UOM nonaktif; `Has Expiry` Yes tanpa shelf-life; `Has Expiry` No (shelf-life otomatis dikosongkan form, backend tetap validasi `400`) | Semua ditolak jelas (`409` duplicate; `400` stock negatif, `inactive_unit_of_measure`, aturan shelf-life) | [ ] |
| QB-09 | LOCAL/STAGING tulis; PROD baca | Buat 1 expiry Yes + 1 expiry No; edit nama saja pada material yang UOM-nya sudah nonaktif (harus tetap bisa, diperbaiki); mainkan search, filter category/UOM/status/hasExpiry, pagination | Kedua varian tersimpan; filter category exact (ex: `Spices` tidak ketemu `Spice`); pagination benar | [ ] |

Catatan: category dikirim `null` bila `Tanpa kategori`. Validator hanya izinkan katalog resmi; daftar resmi lihat dropdown UI.

## 4. Product (`/products`, API `/api/products`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-10 | LOCAL/STAGING tulis; PROD baca | UI: buat product UOM aktif → duplikat code → edit + ubah status | Sukses, duplicate `409` `duplicate_product_code`, badge sesuai | [ ] |
| QB-11 | SEMUA | Search + filter status/**UOM** + pagination; pastikan UOM nonaktif tidak bisa dipilih di form (tapi edit produk lama yang UOM-nya nonaktif tetap bisa simpan) | Filter UOM dropdown ada dan hasilnya sesuai; UOM nonaktif tidak muncul di pilihan create | [ ] |

## 5. Warehouse (`/warehouses`, API `/api/warehouses`)

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-12 | LOCAL/STAGING tulis; PROD baca | UI: buat warehouse → duplikat code → edit + ubah status | Sukses, duplicate `409` `duplicate_warehouse_code`, tabel ter-update | [ ] |
| QB-13 | SEMUA | Search lowercase + filter status + pagination | Hasil dan halaman sesuai | [ ] |

## 6. Standardisasi

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-14 | SEMUA | Bandingkan response list + error di 5 modul | Format konsisten: `items` + `pagination` (`page`, `pageSize`, `totalItems`, `totalPages`); error ProblemDetails + `traceId` | [ ] |
| QB-15 | SEMUA | Search `sup-qa-01` vs `SUP-QA-01` | Keduanya ketemu (case-insensitive, sudah diperbaiki). Bila tidak ketemu = FAIL | [ ] |
| QB-16 | SEMUA (prod: baca) | Setelah create/update/status (non-prod) atau setelah event login (prod), cek `GET /api/admin/audit-logs` | Ada log `*.created`/`*.updated`/`*.status.updated` + `auth.*` dengan user + entity + waktu UTC. Entity+audit kini tersimpan atomik (satu `SaveChanges`) | [ ] |
| QB-17 | LOCAL/STAGING | Buka Swagger, cek 5 controller master data | Semua endpoint terdaftar 200/201/400/401/403/404/409 yang benar, termasuk `GET {id}` → 400 dan `GET products/{id}/qc-parameters` → 401/403/404 | [ ] |

## 7. Fondasi Frontend

| ID | Scope | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| QB-18 | LOCAL | `npm run dev` tanpa `.env`, lalu dengan `.env` benar dan `VITE_API_BASE_URL` salah | Tanpa `.env` tampil halaman `Konfigurasi belum lengkap` (bukan blank); URL salah = pesan koneksi + tombol retry | [ ] |
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

| Tester | Tanggal | Env (LOCAL/SHARED/PROD) | Browser/Device | Catatan + traceId bila FAIL |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

Day 2 selesai bila QB-01 s/d QB-22 semua `PASS`/`N/A` sesuai scope + Bagian 8 terisi data asli di prod (bukan code QA).
