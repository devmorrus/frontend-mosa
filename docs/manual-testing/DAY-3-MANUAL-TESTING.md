# Day 3 QA: Goods Receiving + Regresi Master Data Frontend

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib screenshot + `traceId` (`ApiError.traceId`, bila kosong lihat Network → `traceId`).

## Klasifikasi environment

| Run | Aturan |
| --- | --- |
| `PRODUCTION` | **Satu-satunya environment yang dipakai.** Verifikasi read-only + receiving nyata (Bagian 6). Posting bersifat final: LOT + stok + movement terbentuk dan tidak bisa dibatalkan. Draft/duplicate/negative/posting coba-coba otomatis `N/A` (dicakup automated tests) |

## Persiapan

1. Selesaikan Day 1 (auth) dan Day 2 Bagian 8 (UOM, Warehouse, Supplier, Raw Material, Product sudah terisi data asli, bukan code `QA-*`).
2. Production: pakai akun prod yang disetujui, least-privilege. Jangan buat akun uji dengan password contoh. Selalu logout/login tiap ganti peran.

### Peran uji (akun prod yang disetujui)

| Akun | Permission inti | Untuk |
| --- | --- | --- |
| A. Warehouse Manager | `receiving.view/create/update/post` + master data view (+create/update sesuai kebutuhan) + `lots.view` + `stock-movements.view` | Receiving nyata Bagian 6 |
| B. Viewer | `receiving.view`, master data view, `lots.view` (tanpa create/update/post) | D3-PERM-01, D3-MD-09 |
| C. No Access | hanya `dashboard.view` | D3-PERM-02 (403) |

Jangan decode JWT dari localStorage untuk keperluan selain verifikasi peran; jangan tulis password di tiket.

## 0. Pra-syarat production (wajib sebelum sentuh Goods Receiving)

Form `Warehouse > Goods Receiving > Create` hanya bisa disimpan bila 3 dropdown terisi: **Supplier + Warehouse + minimal 1 Raw Material aktif**. UOM terisi otomatis dari material. Dari screenshot Anda: Supplier ✓ (`PT Sumber Pangan`), Warehouse ✓ (`Gudang Bahan Baku`), **Raw Material ✗ kosong** — itu sebabnya dropdown `Pilih raw material aktif` tidak ada isinya. Isi dulu data di bawah, berurutan (relasi: UOM → Warehouse → Supplier → Raw Material → Product). Semua via UI prod dengan akun berhak `*.create`, data asli (bukan code `QA-*`/`DAY3-*`).

| # | Cek di UI prod | Cara verifikasi | Bila kosong → isi apa (contoh, ganti data asli) |
| --- | --- | --- | --- |
| P0-1 | `Master Data > Units` | List ada minimal `KG` Active | Add: `KG` / Kilogram / kg; tambah `G`, `PCS` bila dipakai. Code unik, tersimpan `UPPER` |
| P0-2 | `Master Data > Warehouses` | `Gudang Bahan Baku` Active ✓ (sudah ada) | Tambah bila kurang: `WH-FG` Gudang Barang Jadi; `WH-QC` Area Karantina QC |
| P0-3 | `Master Data > Suppliers` | `PT Sumber Pangan` Active ✓ (sudah ada) | Tambah supplier asli lain bila perlu; cek duplicate `409` = sudah ada, jangan buat ganda |
| P0-4 | `Master Data > Raw Materials` | **Wajib ada minimal 1 Active** (ini yang kosong) | Add: `RM-001` / nama asli / category dari dropdown / UOM `KG` (pilih dari list Active only) / HasExpiry sesuai kemasan (`No` → shelf-life kosong; `Yes` → isi hari, mis. 365) / Minimum Stock mis. 10 / Active. Ulangi untuk tiap bahan baku aktual |
| P0-5 | `Master Data > Products` | Minimal 1 Active (untuk Day 2, tidak memblokir receiving) | Add: `PRD-001` / nama asli / UOM aktif / shelf-life / Active |

Aturan mapping (jangan salah isi, kalau salah dropdown receiving ikut salah):

* Dropdown receiving hanya menampilkan yang **Active** (`listOptions('ACTIVE')`). Data Inactive memang hilang dari pilihan — bukan bug.
* UOM item mengikuti material (`UOM` read-only). Jadi bila material salah UOM, betulkan di `Raw Materials > Edit`, bukan di receiving.
* `HasExpiry=false` → Expiry disabled + dipaksa `null`. `HasExpiry=true` → Expiry wajib + `production <= expiry`.
* Setelah P0-4 terisi, kembali ke `Goods Receiving > Create`: dropdown Raw Material harus muncul. Bila masih kosong: pastikan status Active (filter Status=Active), refresh, cek `traceId` bila error.
* Detail alur Day 2 (aturan panjang kode, shelf-life, dsb) ada di `DAY-2-MANUAL-TESTING.md` Bagian 8 — ikuti itu saat mengisi P0-1 s/d P0-5.

## 1. Regresi Master Data Frontend (sebagai A; tulis hanya data asli, prod baca)

| ID | Scope | Langkah + data | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-MD-01 | SEMUA | Buka tiap master data, cek header total + loading | Angka = tabel; loading sebentar lalu tabel | [ ] |
| D3-MD-02 | SEMUA | Search code unik, ubah pageSize, next page | Debounce 350ms, pagination update | [ ] |
| D3-MD-03 | N/A | Create data uji coba-coba dilarang di prod (data asli hanya via Day 2 Bagian 8). | — | N/A - production-only; create valid dicakup Day 2 Bagian 8 |
| D3-MD-04 | N/A | Duplicate-test sengaja dilarang di prod. | — | N/A - production-only; duplicate guard dicakup automated tests |
| D3-MD-05 | N/A | Edit coba-coba dilarang di prod (edit hanya kebutuhan operasional nyata). | — | N/A - production-only |
| D3-MD-06 | N/A | Flip Active→Inactive→Active coba-coba dilarang di prod. Filter status tetap diuji read-only | Filter status sesuai | N/A - flip dilarang di prod; filter diuji read-only |
| D3-MD-07 | N/A | Create/edit/status coba-coba per modul dilarang di prod. | — | N/A - production-only; viewer check lihat D3-MD-09 |
| D3-MD-08 | N/A | Negative validation case dilarang diuji di prod. | — | N/A - production-only; validasi dicakup automated tests |
| D3-MD-09 | SEMUA | Sebagai B buka tiap master data | Tombol Add/edit/status hidden; list utama tanpa izin → 403 (lookup dropdown yang gagal diam-diam jadi kosong — itu by-design, bukan FAIL) | [ ] |
| D3-MD-10 | SEMUA | 1440 / 768 / 375 satu halaman master | Toolbar wrap, tabel scroll-x / kartu, dialog scroll, tanpa aksi terpotong | [ ] |

## 2. Goods Receiving Draft (sebagai A; tulis hanya receiving nyata Bagian 6)

Tidak ada penyiapan data inactive/active coba-coba di prod. Seluruh baris tulis di bawah hanya lewat receiving nyata Bagian 6.

| ID | Scope | Langkah + data | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-GR-01 | SEMUA | Buka `Warehouse > Goods Receiving`, cek card total | Header + toolbar filter siap | [ ] |
| D3-GR-02 | SEMUA | pageSize, next page, filter Status=Draft | Pagination update | [ ] |
| D3-GR-03 | SEMUA | Search nomor/supplier lowercase + kosongkan | Debounce 350ms; kosong → empty-state (search kini case-insensitive) | [ ] |
| D3-GR-04 | SEMUA | Filter supplier + warehouse + `dateFrom <= dateTo` | Hasil sesuai; `dateFrom > dateTo` ditolak `400` | [ ] |
| D3-GR-05 | SEMUA | Klik Create: cek dropdown supplier/warehouse/material (wajib lolos P0 dulu) | Hanya yang Active (inactive disembunyikan by-design) | [ ] |
| D3-GR-06 | PROD (nyata, Bagian 6) | Create draft valid dari PO supplier nyata: supplier+warehouse aktif, tanggal terima aktual, item material aktif qty sesuai timbangan, supplier LOT dari label, production/expiry dari kemasan → Save Draft | Toast draft dibuat → redirect detail → nomor `GR-yyyyMMdd-NNNN` otomatis; LOT masih `-` | [ ] |
| D3-GR-07 | N/A | Draft kedua coba-coba dilarang di prod. | — | N/A - production-only; penomoran unik dicakup automated tests |
| D3-GR-08 | N/A | Save tanpa supplier dilarang diuji di prod. | — | N/A - production-only; validasi dicakup automated tests |
| D3-GR-09 | N/A | Supplier inactive coba-coba dilarang di prod. | — | N/A - production-only |
| D3-GR-10 | N/A | Warehouse inactive coba-coba dilarang di prod. | — | N/A - production-only |
| D3-GR-11 | N/A | POST items kosong via API dilarang di prod. Catatan UI menjaga minimal 1 baris (tombol Remove baris terakhir disembunyikan by-design — bukan FAIL) | — | N/A - production-only |
| D3-GR-12 | N/A | Material inactive coba-coba dilarang di prod. | — | N/A - production-only |
| D3-GR-13/14 | N/A | Qty `0` dan `-5` dilarang diuji di prod. | — | N/A - production-only; guard dicakup automated tests |
| D3-GR-15 | PROD (nyata, bila terjadi) | Supplier LOT kosong pada receiving nyata | Tersimpan sebagai `null`, sukses | [ ] |
| D3-GR-16 | PROD (nyata, bila terjadi) | Production Date kosong pada receiving nyata (material non-expiry) | Sukses (nullable) | [ ] |
| D3-GR-17a | N/A | Material non-expiry + isi expiry dilarang diuji di prod (UI mencegah by-design). | — | N/A - production-only |
| D3-GR-17b | N/A | Kosongkan expiry material expiry dilarang diuji di prod. | — | N/A - production-only |
| D3-GR-17c | N/A | `productionDate > expiryDate` dilarang diuji di prod. | — | N/A - production-only; `400 invalid_date_range` dicakup automated tests |
| D3-GR-18 | SEMUA | Buka detail draft nyata | Nomor/tanggal/supplier/warehouse/created-by tampil; LOT `-` | [ ] |
| D3-GR-19 | PROD (nyata, bila terjadi) | Edit draft nyata: ubah notes, tambah/hapus item → Save | Toast diperbarui | [ ] |
| D3-GR-20 | SEMUA | Buka dokumen POSTED (jangan coba edit via API) | Banner kuning read-only, form disabled, Save hidden | [ ] |

## 3. Posting & Internal LOT

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-POST-01 | PROD (nyata, Bagian 6) | Draft nyata → Post → confirm | Spinner → toast posted → badge POSTED + PostedBy/At terisi | [ ] |
| D3-POST-02 | N/A | POST ulang via API dilarang di prod. | — | N/A - production-only; guard dicakup automated tests |
| D3-POST-03 | N/A | Double-click/2-tab coba-coba dilarang di prod. | — | N/A - production-only; guard dicakup automated tests |
| D3-POST-04 s/d 13 | PROD (nyata, Bagian 6) | Buka `Raw Material Lots` search nomor GR nyata; buka detail LOT | Tiap item → 1 LOT `RM-yyyyMMdd-DDDDD` unik; supplier LOT terpisah; initial=current=qty; warehouse/material/GR ref benar; PostedBy/At tampil | [ ] |

## 4. Atomic, Movement, Audit

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-ATOM-01 | PROD (nyata, Bagian 6) | Posting receiving nyata (seluruh item) | Semua LOT item muncul setelah commit | [ ] |
| D3-ATOM-02/03 | PROD (nyata, Bagian 6) | `Stock Movements` filter RECEIVING + ref GR nyata | 1 movement/LOT, `Before 0 After qty` | [ ] |
| D3-ATOM-04 | PROD (nyata, Bagian 6) | Status POSTED | Terlihat hanya setelah commit | [ ] |
| D3-ATOM-05 | SEMUA | `Administration > Audit Trail` | `goodsreceiving.created/posted` (+`updated/cancelled` bila ada) dengan user + entity + UTC | [ ] |
| D3-ATOM-06 s/d 08 | N/A | Gagalkan posting sengaja dilarang di prod. | — | N/A - production-only; rollback dicakup automated tests |
| D3-ATOM-09 | N/A | Posting konkuren sengaja dilarang di prod. | — | N/A - production-only; concurrency dicakup automated tests |

## 5. Permission & Responsive

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-PERM-01 | SEMUA | Sebagai B buka receiving + form | List/detail bisa; Create/Save/Post hidden + banner view-only | [ ] |
| D3-PERM-02 | SEMUA | Sebagai C buka `/goods-receiving` | Menu hilang; URL langsung → 403 | [ ] |
| D3-RWD-01 s/d 03 | SEMUA | 1440 / 768 / 375 list + form + dialog Post | Rapi; dialog Post scroll (`max-h-85dvh`); sticky Save/Post terlihat; tanpa scroll horizontal | [ ] |

Catatan: tidak ada aksi `receiving.cancel` di UI. Cancel hanya via API (`POST /{id}/cancel`, Draft saja) dan tercakup audit `goodsreceiving.cancelled`.

## 6. Receiving nyata pertama di production (prod kosong)

Hanya setelah Day 2 Bagian 8 terisi. Siapkan PO supplier nyata, lalu tepat 1 dokumen per penerimaan nyata:

1. Supplier + warehouse + material + UOM sudah Active dan benar (cek dropdown).
2. Create draft dari PO: tanggal terima aktual, qty sesuai timbangan, supplier LOT dari label supplier, production/expiry dari kemasan (wajib bila material expiry; `production <= expiry`).
3. Review detail draft bersama warehouse (nomor GR, item, qty, LOT supplier).
4. Post sekali. Verifikasi: badge POSTED, LOT `RM-...` per item, movement `0 → qty`, audit `goodsreceiving.posted`.
5. Jangan uji D3-GR-07 s/d 17, D3-POST-02/03, D3-ATOM-06 s/d 09 di prod. Salah input setelah post tidak bisa diedit — tangani via proses operasional (retur/penyesuaian), bukan edit dokumen.

## Sign-off

| Tester (login sebagai) | Tanggal | Env (PROD) | Browser / Viewport | Hasil | Catatan FAIL (ID + traceId + screenshot) |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | ☐ PASS ☐ FAIL |  |

Day 3 selesai bila D3-MD, D3-GR, D3-POST, D3-ATOM, D3-PERM, D3-RWD `PASS`/`N/A` sesuai scope + Bagian 6 tuntas untuk receiving nyata. Item `N/A` adalah tulis/negatif/konkuren coba-coba yang dilarang di prod dan dicakup automated tests.
