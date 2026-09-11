# Day 2 QA Checklist: Master Data End-to-End + Fondasi Frontend

Tulis `PASS` / `FAIL` / `BLOCKED` di kolom Hasil. Setiap `FAIL` wajib sertakan screenshot + `traceId` dari response.

## Persiapan (lakukan sekali)

1. Selesaikan persiapan Day 1 (backend `http://localhost:5104` + frontend jalan, DB ter-seed).
2. Login sebagai `admin` / `superadmin` (password `Password123!`) untuk semua uji create/update. Siapkan satu user read-only (tanpa `*.create`/`*.update`) untuk uji 403.
3. Gunakan code unik tiap data baru: `SUP-QA-01`, `UOM-QA-01`, `RM-QA-01`, `PRD-QA-01`, `WH-QA-01`, agar tidak tercampur data lama.
4. Pola API (spot-check via Swagger/curl): list `GET /api/<modul>?search=&status=&page=1&pageSize=20`, detail `GET /api/<modul>/{id}`, create `POST` → `201`, duplicate → `409` (`duplicate_*`), update `PUT` → `200`, status `PATCH /{id}/status` → `200`, tanpa izin → `403`.

## 1. Supplier (`/suppliers`, API `/api/suppliers`)

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-01 | UI: tambah supplier valid → simpan; cek via API `GET /api/suppliers?search=SUP-QA-01` | Notifikasi sukses, muncul di tabel dan di API (`201` saat create) | [ ] |
| QB-02 | UI + API: buat lagi dengan code yang sama | Form/API menolak duplicate (`409` `duplicate_supplier_code`), tidak ada baris ganda | [ ] |
| QB-03 | UI: edit nama/kontak/alamat + ubah active→inactive; filter status; search sebagian code/nama; pindah halaman | Tabel/detail ter-update, badge + filter status sesuai, search dan pagination benar | [ ] |
| QB-04 | Login read-only: buka `/suppliers`, coba create/edit | List terbaca; tombol aksi tidak ada / ditolak 403 yang jelas | [ ] |

## 2. Unit of Measure (`/units`, API `/api/unit-of-measures`)

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-05 | UI: buat UOM valid → duplikat code sama → edit + ubah active/inactive | Sukses lalu duplicate ditolak (`409` `duplicate_unit_of_measure_code`); badge status ikut berubah | [ ] |
| QB-06 | Search code/nama + pagination | Hasil dan halaman sesuai | [ ] |

## 3. Raw Material (`/raw-materials`, API `/api/raw-materials`)

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-07 | UI: buat material pakai UOM aktif + pilih category dari dropdown → cek detail | Tersimpan (`201`); UOM dan category tampil di tabel/detail | [ ] |
| QB-08 | Coba: code sama; minimum stock negatif; UOM nonaktif; `Has Expiry` Yes tanpa shelf-life; `Has Expiry` No dengan shelf-life terisi | Semua ditolak dengan pesan jelas (`409` duplicate; `400` untuk stock negatif, UOM nonaktif `inactive_unit_of_measure`, dan aturan shelf-life) | [ ] |
| QB-09 | Buat 1 material expiry Yes + 1 expiry No (category wajib pilih dari dropdown, ketik bebas tidak bisa); edit + ubah status; mainkan search, filter category/UOM/status, pagination | Kedua varian tersimpan sesuai rule; filter category berupa dropdown dan hasilnya sesuai; pagination benar | [ ] |

## 4. Product (`/products`, API `/api/products`)

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-10 | UI: buat product pakai UOM aktif → duplikat code → edit + ubah status | Sukses, duplicate ditolak (`409` `duplicate_product_code`), badge status sesuai | [ ] |
| QB-11 | Search + filter status/UOM + pagination; pastikan UOM nonaktif tidak bisa dipilih di form | Filter benar; UOM nonaktif tidak muncul di pilihan | [ ] |

## 5. Warehouse (`/warehouses`, API `/api/warehouses`)

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-12 | UI: buat warehouse → duplikat code → edit + ubah status | Sukses, duplicate ditolak (`409` `duplicate_warehouse_code`), tabel ter-update | [ ] |
| QB-13 | Search + filter status + pagination | Hasil dan halaman sesuai | [ ] |

## 6. Standardisasi (cek di tiap modul di atas)

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-14 | Bandingkan response list + error di 5 modul | Format konsisten: `items` + `pagination` (`page`, `pageSize`, `totalItems`, `totalPages`); error selalu ProblemDetails + `traceId` | [ ] |
| QB-15 | Search `sup-qa-01` (lowercase) vs `SUP-QA-01` (uppercase) | CATAT hasilnya: search master data saat ini case-sensitive di PostgreSQL — pastikan sesuai kesepakatan, bukan bug | [ ] |
| QB-16 | Setelah create/update/status satu data, cek `GET /api/admin/audit-logs` sebagai superadmin | Ada log `*.created`/`*.updated`/status dengan user + entity + waktu UTC | [ ] |
| QB-17 | Buka Swagger, cek 5 controller master data | Semua endpoint terdaftar dengan response 200/201/400/401/403/404/409 yang benar | [ ] |

## 7. Fondasi Frontend

| ID | Yang QA lakukan | Lolos jika | Hasil |
| --- | --- | --- | --- |
| QB-18 | `npm run dev` tanpa `.env`, lalu dengan `.env` benar dan `VITE_API_BASE_URL` salah | Tanpa `.env` error jelas (bukan crash misterius); URL salah = pesan koneksi, bukan halaman blank | [ ] |
| QB-19 | Login → refresh → tutup/buka tab → `GET /api/auth/me` → logout | Session pulih; `/me` kembalikan user + roles + permissions; logout bersihkan session dan kunci halaman protected | [ ] |
| QB-20 | Tanpa login buka `/suppliers`; user tanpa permission buka `/suppliers` dan `/dashboard`; hapus token lalu refresh | Berurutan: ke `/login`; halaman 403 bersih tanpa request data bocor; kembali ke login | [ ] |
| QB-21 | Cek Main Layout + sidebar sebagai admin vs user terbatas | Sidebar, topbar, nama user tampil; hanya menu sesuai permission; menu lain hilang (bukan sekadar disabled) | [ ] |
| QB-22 | Cek satu halaman master di 1440 px, 768 px, 375 px | Tabel/filter/dialog/pagination rapi; mobile pakai drawer, tanpa aksi terpotong | [ ] |

## Sign-off

| Tester | Tanggal | Browser/Device | Catatan + traceId bila FAIL |
| --- | --- | --- | --- |
|  |  |  |  |

Day 2 selesai bila QB-01 s/d QB-22 semua `PASS` (atau `BLOCKED` yang disepakati, misal QB-15 menunggu keputusan case-insensitive).
