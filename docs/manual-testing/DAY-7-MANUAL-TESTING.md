# Day 7 Production Manual Testing

Panduan langkah demi langkah dari **pembuatan production order pertama** sampai release, plus verifikasi tutorial interaktif. Ditulis untuk kondisi production yang datanya masih kosong. Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A`; setiap `FAIL` wajib menyertakan screenshot, waktu kejadian, user, dan `traceId`.

## Safety Gate

Sebelum mulai:

1. Pastikan environment dan tenant yang dipilih benar-benar `PRODUCTION`.
2. Order yang dibuat harus kebutuhan produksi nyata (ada jadwal/produk yang memang mau diproduksi), bukan order dummy untuk coba-coba.
3. Siapkan data prasyarat (lihat Bagian 0). Jangan membuat master data uji.
4. Tutorial boleh dijalankan penuh karena bersifat panduan — tetapi JANGAN menyelesaikan aksi yang menyimpan data (jangan submit form, jangan klik tombol mutasi) kecuali itu memang langkah pembuatan order nyata di bawah ini.
5. Jangan mengubah status product, recipe, warehouse, atau user untuk simulasi.

## Akun dan permission

Catat user yang digunakan. Pengujian permission dilakukan dengan login/logout memakai akun yang telah disetujui, bukan dengan mengubah role user production.

| Akun | Permission yang diharapkan | Tujuan |
| --- | --- | --- |
| Planner | `production-orders.view`, `production-orders.create`, `production-orders.update`, `production-orders.release`, `production-orders.cancel` | Membuat, memeriksa, dan merilis order produksi |
| Viewer | `production-orders.view` | Verifikasi list/detail read-only |
| Operator | `production-orders.execute` | Tutorial guided production, antrean operator |

## Bagian 0 — Prasyarat (wajib lolos sebelum buat order)

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-PRE-01 | Buka `Production > Recipes`, pastikan recipe `Sambal Botol 250ml Standard` memiliki version Approved (V3) | Ada current version Approved; product relation `PRD-001` benar | [ ] |
| D7-PROD-PRE-02 | Buka V3 Approved, catat standard output dan 2 steps + quantity tiap material | Standard output `100 pcs`; quantity gula dan garam diketahui | [ ] |
| D7-PROD-PRE-03 | Buka `Warehouse > Inventory`, cari `gula` dan `garam` di `WH-RM - Gudang Bahan Baku` | Stok tersedia tercatat (mis. gula 10 KG); cukup untuk target output yang direncanakan | [ ] |
| D7-PROD-PRE-04 | Tentukan target output nyata (bukan angka contoh) | Target output berasal dari jadwal produksi; hitung kebutuhan: `required = recipe qty × (target / 100)` dan pastikan stok mencukupi | [ ] |

Jika stok tidak mencukupi target yang direncanakan: kecilkan target, lakukan receiving dulu (Day 3), atau tandai test release sebagai `BLOCKED` — jangan memaksakan release.

## Bagian 1 — Buat Production Order pertama (step by step)

Posisi Anda sekarang: halaman `Production > Production Orders > Create` (seperti screenshot).

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-CRT-01 | Field `Product`: pilih `PRD-001 - Sambal Botol 250ml` | Product terpilih; dropdown recipe mulai memuat | [ ] |
| D7-PROD-CRT-02 | Field `Approved Recipe`: pilih recipe Approved V3 (`Sambal Botol 250ml Standard V3`) | Recipe & version terpilih. Jika dropdown kosong → STOP, tandai `BLOCKED` (tidak ada Approved recipe) dan jangan lanjut | [ ] |
| D7-PROD-CRT-03 | Field `Target Output`: isi sesuai jadwal produksi nyata (mis. `100`) | Angka > 0. Jangan isi 0/negatif (harus ditolak validasi) | [ ] |
| D7-PROD-CRT-04 | Field `Unit of Measure`: pastikan terisi otomatis dari recipe (`Pieces (pcs)`) | UOM terkunci mengikuti recipe; tidak bisa diganti sembarang | [ ] |
| D7-PROD-CRT-05 | Field `Warehouse`: pilih `WH-RM - Gudang Bahan Baku` | Warehouse sumber bahan sesuai tempat stok berada | [ ] |
| D7-PROD-CRT-06 | Field `Scheduled Date`: isi tanggal produksi nyata (mis. `17/09/2026`) | Tanggal tersimpan dan tampil di detail | [ ] |
| D7-PROD-CRT-07 | Field `Operator (Optional)`: pilih operator yang ditugaskan (atau kosongkan bila belum ada) | Operator valid dan aktif; user inactive harus ditolak | [ ] |
| D7-PROD-CRT-08 | Klik `Simpan Draft` SATU kali, tunggu sampai selesai | Order tersimpan; halaman pindah ke detail; nomor PO otomatis terbit (format `PO-YYYYMMDD-XXXXX`) dan unique | [ ] |

Catatan untuk D7-PROD-CRT-08: jangan double-click. Tombol disabled saat menyimpan. Jika backend gagal, pesan error tampil dan tidak ada PO ganda — catat sebagai temuan, bukan diklik ulang berkali-kali.

Contoh pengisian yang benar pada kondisi Anda sekarang:

```text
Product:          PRD-001 - Sambal Botol 250ml
Approved Recipe:  Sambal Botol 250ml Standard V3 (Approved)
Target Output:    100            ← ganti dengan kebutuhan nyata
Unit of Measure:  Pieces (pcs)   ← otomatis dari recipe
Warehouse:        WH-RM - Gudang Bahan Baku
Scheduled Date:   17/09/2026     ← tanggal produksi nyata
Operator:         operator yang ditugaskan (opsional)
```

## Bagian 2 — Verifikasi detail order + requirement + scaling

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-PO-01 | Setelah save, pastikan detail order tampil | Nomor PO, product, recipe V3, warehouse, target output, UOM, scheduled date, operator, status `Draft` | [ ] |
| D7-PROD-PO-02 | Buka `Production > Production Orders`, cari nomor PO tersebut | Order muncul di list; search + filter status + pagination konsisten | [ ] |
| D7-PROD-MAT-01 | Pada detail order, buka Recipe Information | Standard output `100 pcs`, target output, scaling factor tampil (`target / 100`) | [ ] |
| D7-PROD-MAT-02 | Buka tabel Material Requirements | Setiap baris menampilkan material, recipe qty, required (scaled), available, shortage, status Sufficient/Shortage | [ ] |
| D7-PROD-MAT-03 | Verifikasi hitung manual satu baris | `required = recipe qty × scaling factor`; `shortage = max(0, required − available)` | [ ] |
| D7-PROD-MAT-04 | Refresh halaman | Requirement, status order, dan angka tidak berubah (snapshot tersimpan) | [ ] |

## Bagian 3 — Check Materials

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-REL-01 | Pada order Draft tersebut, klik `Check Materials`, tunggu selesai | Status berubah menjadi `Ready` (semua cukup) atau `MaterialShortage` (ada yang kurang); tabel requirement ter-update | [ ] |
| D7-PROD-REL-02 | Jika `MaterialShortage`: pastikan tombol Release tidak tersedia, lalu cukupkan stok via receiving dan klik `Check Materials` ulang | Release dicegah; setelah restock + re-check status menjadi `Ready` | [ ] |

## Bagian 4 — Release

Hanya dilakukan jika order ini memang akan diproduksi. Jika hanya verifikasi fitur, berhenti di status `Ready` dan tandai bagian ini `N/A`.

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-REL-03 | Pada order `Ready`, klik `Release` dan konfirmasi dialog | Status menjadi `Released`; `ReleasedBy` dan `ReleasedAt` tercatat | [ ] |
| D7-PROD-REL-04 | Selama proses release, klik tombol Release dua kali cepat | Hanya satu request terkirim (tombol + dialog disabled saat memproses); tidak ada PO ganda | [ ] |
| D7-PROD-REL-05 | Refresh halaman setelah release | Status tetap `Released`; tombol `Edit Draft` hilang; data konsisten | [ ] |
| D7-PROD-REL-06 | Jika backend gagal saat release (mis. stok berubah), catat pesan error | Pesan error tampil di halaman; status order sesuai kondisi terakhir dari server setelah refresh | [ ] |

## Bagian 5 — Cancel dan Edit Draft

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-CN-01 | Pada order Released, pastikan tidak ada `Edit Draft` | Kontrol edit tersembunyi; status non-Draft tidak bisa diedit seperti Draft | [ ] |
| D7-PROD-CN-02 | Cancel hanya jika memang diperintahkan (dengan reason resmi) | Status menjadi `Cancelled`; cancelled by/at dan reason tercatat | [ ] |

## Bagian 6 — Interactive Tutorial

Tutorial bersifat panduan dan aman dijalankan; yang dilarang adalah menyelesaikan aksi yang menyimpan data di luar Bagian 1–5 di atas.

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-TUT-01 | Buka halaman Tutorial & Panduan | Daftar tutorial tampil sesuai role dan permission user | [ ] |
| D7-PROD-TUT-02 | Jalankan tutorial Production Order | Banner `Mode Tutorial — bukan Live` tampil; step 1 tampil di route yang benar | [ ] |
| D7-PROD-TUT-03 | Klik `Next` pada step INFO | Pindah ke step berikutnya; progress `Step x of y` dan progress bar ter-update | [ ] |
| D7-PROD-TUT-04 | Pada step ACTION, coba klik `Next` sebelum aksi | Tombol `Next` disabled dengan pesan tindakan diperlukan | [ ] |
| D7-PROD-TUT-05 | Lakukan aksi yang diminta (pilih product/recipe, isi target) tanpa menyimpan | Validasi terpenuhi; `Next` aktif; pindah halaman otomatis mengikuti step (route-aware) | [ ] |
| D7-PROD-TUT-06 | Klik `Back`, lalu `Restart`, lalu `Skip`, lalu `Close` | Back kembali ke step sebelumnya; restart ke step 1; skip menutup dan menandai dilewati; close menutup tutorial | [ ] |
| D7-PROD-TUT-07 | Pada step dengan target yang tidak ada di halaman | Aplikasi tidak crash; tooltip fallback tampil di posisi aman + peringatan target tidak ditemukan | [ ] |
| D7-PROD-TUT-08 | Ulangi D7-PROD-TUT-02–D7-PROD-TUT-06 pada viewport 768 px dan 375 px | Tooltip tidak terpotong; tetap terbaca di mobile (posisi bawah layar) | [ ] |

## Bagian 7 — Responsive halaman Production Order

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-UI-01 | Buka halaman Create dan Detail pada 1440 px | Form dan tabel requirement terbaca; tombol tidak terpotong | [ ] |
| D7-PROD-UI-02 | Ulangi pada 768 px dan 375 px | Layout menumpuk rapi; tabel scroll horizontal; tidak ada overflow halaman | [ ] |
| D7-PROD-UI-03 | Buka DevTools Network selama verifikasi read-only | Tidak ada lookup request 403 yang tidak perlu; tidak ada POST/PUT/PATCH/DELETE tanpa aksi yang disetujui | [ ] |

## Non-production Only

Test berikut **tidak boleh dilakukan di production** dan hanya boleh dijalankan di `LOCAL_DISPOSABLE` atau `STAGING` dengan data yang disetujui:

* Create PO dengan product inactive, recipe non-approved, warehouse inactive, target output 0/negatif, operator inactive.
* Update target output lalu verifikasi recalculation requirement dan snapshot immutability terhadap perubahan recipe.
* Availability matrix: blocked/expired/different-warehouse LOT exclusion, multi-LOT summing, stok berubah antara Check dan Release.
* Cancel Draft dan edit Released PO.
* Release order shortage untuk memastikan penolakan backend.
* Pengujian tutorial dengan mengubah role user production.

## Production Prohibited

* Jangan membuat PO dummy atau menjadwalkan produksi fiktif.
* Jangan check/release/cancel/start order yang tidak dijadwalkan.
* Jangan menyelesaikan tutorial dengan menyimpan data di luar Bagian 1–5.
* Jangan menonaktifkan product/recipe/warehouse/material/user untuk simulasi.
* Jangan mengedit database langsung.
* Jangan menyalin token, credential, payload sensitif, atau `VITE_API_BASE_URL` ke tiket.

## Sign-off

| Tester | Tanggal/waktu | User/role | Environment | Browser/device | Hasil | Catatan FAIL / traceId |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  | PRODUCTION |  | [ ] PASS [ ] FAIL |  |
