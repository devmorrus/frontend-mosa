# Day 3 QA: Goods Receiving + Regresi Master Data Frontend

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib screenshot + `traceId` (`ApiError.traceId`, bila kosong lihat Network → `traceId`).

## Klasifikasi environment

| Run | Aturan |
| --- | --- |
| `LOCAL_DISPOSABLE` | Docker dev, data boleh hilang. Satu-satunya tempat untuk code `*-DAY3-*`, duplicate-test, flip status, posting coba-coba, post 2-tab, offline-saat-POST |
| `SHARED_QA` / `STAGING` | Data tidak boleh hilang. Prefix `QA-TEST-` + cleanup draft (cancel), tidak ada posting tanpa persetujuan |
| `PRODUCTION` | **Tidak ada pengujian tulis.** Verifikasi read-only + 1 receiving nyata pertama (Bagian 8). Posting bersifat final: LOT + stok + movement terbentuk dan tidak bisa dibatalkan |

## Persiapan

1. Selesaikan Day 1 (auth) dan Day 2 Bagian 8 (UOM, Warehouse, Supplier, Raw Material, Product sudah terisi — prod wajib data asli, bukan code `QA-*`).
2. Local/staging: buat 3 akun sesuai tabel peran di bawah (atau via seed + `Administration > Users`). Selalu logout/login tiap ganti peran.
3. Production: pakai akun prod yang disetujui, least-privilege. Jangan buat akun `warehouse.manager/viewer/no.access` dengan password contoh.

### Peran uji (local/staging saja)

| Akun | Permission inti | Untuk |
| --- | --- | --- |
| A. Warehouse Manager | `receiving.view/create/update/post` + `suppliers/warehouses/uoms/materials/products.view/create/update` + `lots.view` + `stock-movements.view` | Semua CREATE/EDIT/POST |
| B. Viewer | `receiving.view`, `suppliers/warehouses/uoms/materials/products.view`, `lots.view` (tanpa create/update/post) | D3-PERM-01, D3-MD-09 |
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

## 1. Regresi Master Data Frontend (sebagai A, local/staging tulis; prod baca)

| ID | Scope | Langkah + data | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-MD-01 | SEMUA | Buka tiap master data, cek header total + loading | Angka = tabel; loading sebentar lalu tabel | [ ] |
| D3-MD-02 | SEMUA | Search code unik, ubah pageSize, next page | Debounce 350ms, pagination update | [ ] |
| D3-MD-03 | LOCAL/STAGING | Create 1 data valid per modul (code unik, mis. `SUP-DAY3-MANUAL-01`) | Toast sukses + row baru (`201`) | [ ] |
| D3-MD-04 | LOCAL/STAGING | Buat lagi code sama persis | Ditolak `409` kode duplicate per modul (`duplicate_supplier_code`, `duplicate_unit_of_measure_code`, `duplicate_warehouse_code`, `duplicate_raw_material_code`, `duplicate_product_code` — bukan `duplicate_receiving_number`); tanpa baris ganda | [ ] |
| D3-MD-05 | LOCAL/STAGING | Edit nama + simpan | Badge `Edit`, toast diperbarui, tabel refresh | [ ] |
| D3-MD-06 | LOCAL/STAGING | Toggle Active→Inactive→Active lagi; filter status | Badge + filter sesuai (count hero hanya sehalaman, bukan total backend) | [ ] |
| D3-MD-07 | LOCAL/STAGING | Ulangi create/edit/status untuk UOM, Warehouse, Raw Material (UOM aktif, `minimumStock >= 0`), Product | Semua jalan; viewer tidak lihat tombol Add | [ ] |
| D3-MD-08 | LOCAL/STAGING | Validasi: supplier tanpa code; material `minimumStock=-5` dan `0` (keduanya ditolak); product tanpa UOM; item GR `productionDate > expiryDate` | Field merah + banner `formError`; tanggal terbalik ditolak frontend dan backend (`400 invalid_date_range`) | [ ] |
| D3-MD-09 | SEMUA | Sebagai B buka tiap master data | Tombol Add/edit/status hidden; list utama tanpa izin → 403 (lookup dropdown yang gagal diam-diam jadi kosong — itu by-design, bukan FAIL) | [ ] |
| D3-MD-10 | SEMUA | 1440 / 768 / 375 satu halaman master | Toolbar wrap, tabel scroll-x / kartu, dialog scroll, tanpa aksi terpotong | [ ] |

## 2. Goods Receiving Draft (sebagai A)

Siapkan (local/staging): supplier aktif + supplier yang lalu di-inactive-kan; warehouse aktif + inactive; material aktif + inactive + 1 HasExpiry=true (shelf-life 30). Prod: lewati semua baris tulis.

| ID | Scope | Langkah + data | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-GR-01 | SEMUA | Buka `Warehouse > Goods Receiving`, cek card total | Header + toolbar filter siap | [ ] |
| D3-GR-02 | SEMUA | pageSize, next page, filter Status=Draft | Pagination update | [ ] |
| D3-GR-03 | SEMUA | Search nomor/supplier lowercase + kosongkan | Debounce 350ms; kosong → empty-state (search kini case-insensitive) | [ ] |
| D3-GR-04 | SEMUA | Filter supplier + warehouse + `dateFrom <= dateTo` | Hasil sesuai; `dateFrom > dateTo` ditolak `400` | [ ] |
| D3-GR-05 | SEMUA | Klik Create: cek dropdown supplier/warehouse/material (prod: wajib lolos P0 dulu) | Hanya yang Active (inactive disembunyikan by-design). Prod: supplier + warehouse ada, material muncul setelah P0-4 diisi | [ ] |
| D3-GR-06 | LOCAL/STAGING | Create draft valid: supplier+warehouse aktif, tanggal hari ini, 1 item material aktif qty 10 UOM cocok, supplier LOT kosong, production/expiry kosong (material non-expiry) → Save Draft | Toast draft dibuat → redirect detail → nomor `GR-yyyyMMdd-NNNN` otomatis; LOT masih `-` | [ ] |
| D3-GR-07 | LOCAL/STAGING | Draft kedua hari sama | Nomor sekuens +1, unik (race nomor otomatis di-retry sekali, konflik boks `409 duplicate_receiving_number`) | [ ] |
| D3-GR-08 | LOCAL/STAGING | Supplier kosong → Save | Error field `supplierId` (frontend) / `400` (API langsung) | [ ] |
| D3-GR-09 | LOCAL/STAGING | Supplier inactive (buat aktif lalu inactive-kan) | `400 Supplier is inactive`, banner form | [ ] |
| D3-GR-10 | LOCAL/STAGING | Warehouse inactive | `400 Warehouse is inactive` | [ ] |
| D3-GR-11 | LOCAL/STAGING | Validasi tanpa item: Catatan UI menjaga minimal 1 baris (tombol Remove baris terakhir disembunyikan by-design) — uji via API langsung `POST` items kosong | API `400` minimal satu item; UI tidak bisa menghapus baris terakhir (bukan FAIL) | [ ] |
| D3-GR-12 | LOCAL/STAGING | Material inactive | `400 Raw material ... is inactive` | [ ] |
| D3-GR-13/14 | LOCAL/STAGING | Qty `0` dan `-5` | Keduanya `400` (frontend `>0` + domain guard) | [ ] |
| D3-GR-15 | LOCAL/STAGING | Supplier LOT `""` | Tersimpan sebagai `null`, sukses | [ ] |
| D3-GR-16 | LOCAL/STAGING | Production Date kosong | Sukses (nullable) | [ ] |
| D3-GR-17a | LOCAL/STAGING via API | Material non-expiry + isi expiry (UI mencegah by-design: input disabled + dipaksa `null`) | API `400`; via UI tidak bisa direpro (bukan FAIL) | [ ] |
| D3-GR-17b | LOCAL/STAGING | Material expiry + kosongkan expiry | Error wajib isi (frontend + `400` backend) | [ ] |
| D3-GR-17c | LOCAL/STAGING | `productionDate > expiryDate` | Ditolak frontend + `400 invalid_date_range` backend | [ ] |
| D3-GR-18 | SEMUA | Buka detail draft | Nomor/tanggal/supplier/warehouse/created-by tampil; LOT `-` | [ ] |
| D3-GR-19 | LOCAL/STAGING | Edit draft: ubah notes, tambah/hapus item → Save | Toast diperbarui; bila LOT sudah ada → `400` harus buat dokumen baru | [ ] |
| D3-GR-20 | LOCAL/STAGING | Buka dokumen POSTED → coba edit | Banner kuning read-only, form disabled, Save hidden; API `PUT` → `400 Only draft...` | [ ] |

## 3. Posting & Internal LOT

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-POST-01 | LOCAL/STAGING (+1x prod nyata, Bag. 8) | Draft → Post → confirm | Spinner → toast posted → badge POSTED + PostedBy/At terisi | [ ] |
| D3-POST-02 | LOCAL/STAGING | POST ulang via API langsung | `400 Only draft...`; tombol Post hilang di UI | [ ] |
| D3-POST-03 | LOCAL/STAGING | Double-click cepat (single tab diblokir UI); 2-tab bersamaan bila disetujui | Tepat 1 sukses; tidak ada LOT ganda (transaksi + row-lock) | [ ] |
| D3-POST-04 s/d 13 | LOCAL/STAGING | Buka `Raw Material Lots` search nomor GR; buka detail LOT | Tiap item → 1 LOT `RM-yyyyMMdd-DDDDD` unik; supplier LOT terpisah; initial=current=qty; warehouse/material/GR ref benar; PostedBy/At tampil | [ ] |

## 4. Atomic, Movement, Audit

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-ATOM-01 | LOCAL/STAGING | Posting 3 item (10, 5, 2) | 3 LOT muncul semua setelah commit | [ ] |
| D3-ATOM-02/03 | LOCAL/STAGING | `Stock Movements` filter RECEIVING + ref GR | 1 movement/LOT, `Before 0 After qty` | [ ] |
| D3-ATOM-04 | LOCAL/STAGING | Status POSTED | Terlihat hanya setelah commit | [ ] |
| D3-ATOM-05 | SEMUA (prod: baca) | `Administration > Audit Trail` | `goodsreceiving.created/posted` (+`updated/cancelled` bila ada) dengan user + entity + UTC. Create/update/cancel kini satu transaksi dengan audit | [ ] |
| D3-ATOM-06 s/d 08 | LOCAL/STAGING | Gagalkan posting (nonaktifkan material di tab lain lalu post) | Rollback: tanpa LOT/movement yatim | [ ] |
| D3-ATOM-09 | LOCAL/STAGING | Posting konkuren draft sama | Satu 200 satu 400; movement tidak ganda | [ ] |

## 5. Permission & Responsive

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D3-PERM-01 | SEMUA | Sebagai B buka receiving + form | List/detail bisa; Create/Save/Post hidden + banner view-only | [ ] |
| D3-PERM-02 | SEMUA | Sebagai C buka `/goods-receiving` | Menu hilang; URL langsung → 403 | [ ] |
| D3-RWD-01 s/d 03 | SEMUA | 1440 / 768 / 375 list + form + dialog Post | Rapi; dialog Post scroll (`max-h-85dvh`); sticky Save/Post terlihat; tanpa scroll horizontal | [ ] |

Catatan: tidak ada aksi `receiving.cancel` di UI. Cancel hanya via API (`POST /{id}/cancel`, Draft saja) dan tercakup audit `goodsreceiving.cancelled`.

## 6. Receiving nyata pertama di production (prod kosong)

Hanya setelah Day 2 Bagian 8 terisi dan Bagian 1–5 lolos di staging. Siapkan PO supplier nyata, lalu tepat 1 dokumen:

1. Supplier + warehouse + material + UOM sudah Active dan benar (cek dropdown).
2. Create draft dari PO: tanggal terima aktual, qty sesuai timbangan, supplier LOT dari label supplier, production/expiry dari kemasan (wajib bila material expiry; `production <= expiry`).
3. Review detail draft bersama warehouse (nomor GR, item, qty, LOT supplier).
4. Post sekali. Verifikasi: badge POSTED, LOT `RM-...` per item, movement `0 → qty`, audit `goodsreceiving.posted`.
5. Jangan uji D3-GR-07 s/d 17, D3-POST-02/03, D3-ATOM-06 s/d 09 di prod. Salah input setelah post tidak bisa diedit — tangani via proses operasional (retur/penyesuaian), bukan edit dokumen.

## Sign-off

| Tester (login sebagai) | Tanggal | Env (LOCAL/SHARED/PROD) | Browser / Viewport | Hasil | Catatan FAIL (ID + traceId + screenshot) |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | ☐ PASS ☐ FAIL |  |

Day 3 selesai bila D3-MD, D3-GR, D3-POST, D3-ATOM, D3-PERM, D3-RWD `PASS`/`N/A` sesuai scope + Bagian 6 (prod) atau seluruh tulis (local) tuntas.
