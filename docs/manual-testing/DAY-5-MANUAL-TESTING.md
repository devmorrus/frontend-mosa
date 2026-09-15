# Day 5 QA: Inventory + Stock Movement + FEFO

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib screenshot + `traceId`.

## Klasifikasi environment

| Run | Aturan |
| --- | --- |
| `LOCAL_DISPOSABLE` | Docker dev, data boleh hilang. Satu-satunya tempat untuk uji batas (qty 0, expired, blocked, spillover multi-LOT, required > total) dengan data dummy |
| `SHARED_QA` / `STAGING` | Data tidak boleh hilang. Boleh tambah LOT dummy via receiving yang disetujui + cleanup via alur resmi |
| `PRODUCTION` | **Read-only.** Tidak ada adjustment/opname/consumption coba-coba. LOT `RM-20260916-00001` (10 KG, expiry 31 Okt 2026) adalah bahan uji yang cukup |

## Persiapan

1. Day 4 selesai: minimal 1 LOT POSTED + movement RECEIVING + audit.
2. Prod: akun dengan `inventory.view` + `stock-movements.view` + `lots.view`.

## 1. Inventory (semua: baca)

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D5-INV-01 | SEMUA | `Warehouse > Inventory`: cari `gula` | Total 10, Available 10, 1 LOT | [ ] |
| D5-INV-02 | SEMUA | Expand breakdown material | 1 LOT `RM-20260916-00001`, qty, expiry, status AVAILABLE | [ ] |
| D5-INV-03 | SEMUA | Filter warehouse `Gudang Bahan Baku` + Status=Available | Tetap muncul (belum expired). Catatan: filter Available kini mengecualikan LOT yang tanggal expirynya lewat walau status DB masih Available | [ ] |
| D5-INV-04 | LOCAL/STAGING | Buat LOT qty-0 / blocked / expired / depleted via alur resmi, cek inventory | Qty-0 tak terlihat; blocked/depleted/expired di luar angka Available | [ ] |
| D5-INV-05 | SEMUA | Pastikan tidak ada tombol edit stok | Mutasi hanya via receiving/adjustment/opname/consumption | [ ] |

## 2. Stock Movement (semua: baca)

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D5-MOV-01 | SEMUA | `Stock Movements`: 1 baris RECEIVING | `Gula Pasir`, LOT, `WH-RM`, `In +10`, `Before 0 After 10`, ref `GR-20260916-0001`, user, timestamp | [ ] |
| D5-MOV-02 | SEMUA | Filter LOT/material/warehouse/type/date | Hasil menyempit benar; movement read-only (tidak bisa edit/hapus) | [ ] |
| D5-MOV-03 | SEMUA | Klik ref receiving | Membuka detail `GR-20260916-0001` | [ ] |

Catatan: ref konsumsi produksi kini tampil nomor order (`PO-...`), bukan GUID. Route legacy `api/stock-movements` kini juga punya detail `{id}`.

## 3. FEFO & Availability (semua: baca; batas: local)

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D5-FEFO-01 | SEMUA | Expand LOT `Gula Pasir` (single warehouse) | Kartu `Recommended LOT (FEFO)` menunjuk `RM-20260916-00001` sebagai Recommended First | [ ] |
| D5-FEFO-02 | LOCAL/STAGING | Tambah LOT kedua expiry lebih dekat + required melebihi LOT pertama | Urutan expiry terdekat dulu; spillover ke LOT berikut; total = min(required, available) | [ ] |
| D5-FEFO-03 | SEMUA | Catat: kartu menulis rekomendasi tidak mengurangi stok | Tidak ada perubahan qty setelah lihat rekomendasi | [ ] |
| D5-AVL-01 | LOCAL/STAGING | Cek availability required di bawah/sama/atas total | `>=` sufficient, `<` insufficient | [ ] |

Catatan: tanpa filter warehouse + multi-warehouse, rekomendasi disembunyikan (`Pilih warehouse...`) — itu pengaman, bukan FAIL.

## 4. Responsif (semua)

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D5-RWD-01 | 1440 / 768 / 375 inventory + movements | Filter grid rapi; tabel scroll-x di mobile; breakdown menumpuk vertikal | [ ] |

## Yang DILARANG di prod

* Adjustment/opname/consumption dummy, edit DB langsung,-coBA batas qty-0/expired/blocked, ubah `QR_BASE_URL`, copy token/`VITE_API_BASE_URL` ke tiket.

## Sign-off

| Tester | Tanggal | Env | Browser/Device | Hasil | Catatan FAIL |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | ☐ PASS ☐ FAIL |  |
