# Day 7 Production Manual Testing

Checklist ini khusus verifikasi production untuk Production Order, material check, release, dan interactive tutorial. Default pengujian production adalah **read-only**, kecuali aksi operasional yang memang ditugaskan melalui change ticket / jadwal produksi resmi. Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A`; setiap `FAIL` wajib menyertakan screenshot, waktu kejadian, user, dan `traceId`.

## Safety Gate

Sebelum mulai:

1. Pastikan environment dan tenant yang dipilih benar-benar `PRODUCTION`.
2. Gunakan product, recipe version Approved, warehouse, dan operator yang sudah ada. Jangan membuat master data uji.
3. Jangan klik `Save`, `Check Materials`, `Release`, `Cancel`, atau `Start` saat melakukan verifikasi read-only.
4. Aksi Check/Release/Cancel/Start hanya boleh dilakukan pada production order yang memang dijadwalkan untuk produksi, dengan penanggung jawab yang jelas.
5. Tutorial boleh dijalankan penuh di production karena bersifat panduan baca + aksi form yang tidak menyimpan apa pun — tetapi JANGAN menyelesaikan aksi yang menyimpan data (jangan submit form, jangan klik tombol yang memicu mutasi).
6. Jangan mengubah status product, recipe, warehouse, atau user untuk simulasi.

## Akun dan permission

Catat user yang digunakan. Pengujian permission dilakukan dengan login/logout memakai akun yang telah disetujui, bukan dengan mengubah role user production.

| Akun | Permission yang diharapkan | Tujuan |
| --- | --- | --- |
| Viewer | `production-orders.view` | List, detail, requirement read-only |
| Planner | `production-orders.view`, `production-orders.create`, `production-orders.update`, `production-orders.release`, `production-orders.cancel` | Create/check/release/cancel sesuai jadwal produksi |
| Operator | `production-orders.execute` | Tutorial guided production, antrean operator |
| Approver terkait | sesuai kebutuhan | Hanya jika change ticket membutuhkannya |

## Production Order List dan Detail

| ID | Langkah read-only | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-PO-01 | Buka `Production > Production Orders` | List tampil tanpa error; nomor PO, product, recipe version, warehouse, target output, status terbaca | [ ] |
| D7-PROD-PO-02 | Cari berdasarkan nomor PO / product dan filter status | Hasil pencarian dan filter konsisten; pagination tidak menggandakan/menghilangkan item | [ ] |
| D7-PROD-PO-03 | Buka satu order Draft/Ready milik jadwal produksi | Detail tampil: product, recipe version Approved, warehouse, target output, UOM, scheduled date, operator | [ ] |
| D7-PROD-PO-04 | Buka order Released | Tidak ada tombol `Edit Draft`; hanya aksi yang sesuai status (mis. Cancel bila diizinkan policy) | [ ] |
| D7-PROD-PO-05 | Buka DevTools Network selama verifikasi read-only | Tidak ada lookup request 403 yang tidak perlu; tidak ada POST/PUT/PATCH/DELETE tanpa aksi yang disetujui | [ ] |

## Material Requirement dan Scaling

Gunakan order production yang sudah ada. Jangan mengubah target output hanya untuk pengujian.

| ID | Langkah read-only | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-MAT-01 | Pada detail order, buka Recipe Information | Standard output, target output, dan scaling factor tampil (`target / standard`) | [ ] |
| D7-PROD-MAT-02 | Buka tabel Material Requirements | Setiap baris menampilkan material, recipe qty, required (scaled), available, shortage, status Sufficient/Shortage | [ ] |
| D7-PROD-MAT-03 | Verifikasi hitung manual satu baris | `required = recipe qty × scaling factor`; `shortage = max(0, required − available)` | [ ] |
| D7-PROD-MAT-04 | Refresh halaman | Requirement, status order, dan angka tidak berubah (snapshot tersimpan, bukan hitungan liar) | [ ] |

## Check Materials dan Release

Hanya dilakukan pada order yang memang dijadwalkan produksi. Jika tidak ada jadwal produksi aktif, tandai `D7-PROD-REL-01`–`D7-PROD-REL-06` sebagai `N/A`.

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-REL-01 | Pada order Draft terjadwal, klik `Check Materials` | Status berubah menjadi `Ready` (semua cukup) atau `MaterialShortage` (ada yang kurang); tabel requirement ter-update | [ ] |
| D7-PROD-REL-02 | Jika `MaterialShortage`, pastikan tombol Release tidak tersedia | Release dicegah; ada pesan shortage yang jelas; tidak ada cara me-release dari UI | [ ] |
| D7-PROD-REL-03 | Jika `Ready`, klik `Release` dan konfirmasi dialog | Status menjadi `Released`; `ReleasedBy` dan `ReleasedAt` tercatat | [ ] |
| D7-PROD-REL-04 | Selama proses release, klik tombol Release dua kali cepat | Hanya satu request terkirim (tombol disabled + dialog guard); tidak ada PO ganda / error ganda | [ ] |
| D7-PROD-REL-05 | Refresh halaman setelah release | Status tetap `Released`; tombol edit hilang; data konsisten | [ ] |
| D7-PROD-REL-06 | Jika backend gagal saat release (mis. stok berubah), catat pesan error | Pesan error tampil di halaman (action error), status order sesuai kondisi terakhir dari server setelah refresh | [ ] |

## Cancel dan Edit Draft

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-CN-01 | Pada order Released, pastikan tidak ada `Edit Draft` | Kontrol edit tersembunyi; tidak ada request update yang bisa dipicu | [ ] |
| D7-PROD-CN-02 | Cancel hanya jika memang diperintahkan (dengan reason resmi) | Status menjadi `Cancelled`; cancelled by/at dan reason tercatat | [ ] |

## Interactive Tutorial

Tutorial bersifat panduan dan aman dijalankan; yang dilarang adalah menyelesaikan aksi yang menyimpan data.

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D7-PROD-TUT-01 | Buka halaman Tutorial & Panduan | Daftar tutorial tampil sesuai role dan permission user (mis. warehouse tidak melihat tutorial supervisor produksi) | [ ] |
| D7-PROD-TUT-02 | Jalankan tutorial Production Order | Banner `Mode Tutorial — bukan Live` tampil; step 1 tampil di route yang benar | [ ] |
| D7-PROD-TUT-03 | Klik `Next` pada step INFO | Pindah ke step berikutnya; progress `Step x of y` dan progress bar ter-update | [ ] |
| D7-PROD-TUT-04 | Pada step ACTION (wajib klik/pilih/isi), coba klik `Next` sebelum aksi | Tombol `Next` disabled dengan pesan tindakan diperlukan | [ ] |
| D7-PROD-TUT-05 | Lakukan aksi yang diminta (pilih product/recipe, isi target) tanpa menyimpan | Validasi terpenuhi; `Next` aktif; pindah halaman otomatis mengikuti step (route-aware) | [ ] |
| D7-PROD-TUT-06 | Klik `Back`, lalu `Restart`, lalu `Skip`, lalu `Close` | Back kembali ke step sebelumnya; restart ke step 1; skip menutup dan menandai dilewati; close menutup tutorial | [ ] |
| D7-PROD-TUT-07 | Pada step dengan target yang tidak ada di halaman (ubah filter/role bila perlu) | Aplikasi tidak crash; tooltip fallback tampil di posisi aman + peringatan target tidak ditemukan | [ ] |
| D7-PROD-TUT-08 | Ulangi D7-PROD-TUT-02–D7-PROD-TUT-06 pada viewport 768 px dan 375 px | Tooltip tidak terpotong; tetap terbaca di mobile (posisi bawah layar) | [ ] |

## Non-production Only

Test berikut **tidak boleh dilakukan di production** dan hanya boleh dijalankan di `LOCAL_DISPOSABLE` atau `STAGING` dengan data yang disetujui:

* Create PO dengan product inactive, recipe non-approved, warehouse inactive, target output 0/negatif, operator inactive.
* Update target output lalu verifikasi recalculation requirement dan snapshot immutability terhadap perubahan recipe.
* Availability matrix: blocked/expired/different-warehouse LOT exclusion, multi-LOT summing, stock berubah antara Check dan Release.
* Cancel Draft dan edit Released PO.
* Release order shortage untuk memastikan penolakan backend.
* Simulasi backend failure dan double-clickmasif.
* Pengujian tutorial dengan mengubah role user production.

## Production Prohibited

* Jangan membuat PO dummy atau menjadwalkan produksi fiktif.
* Jangan check/release/cancel/start order yang tidak dijadwalkan.
* Jangan menyelesaikan tutorial dengan menyimpan data (submit form / klik tombol mutasi).
* Jangan menonaktifkan product/recipe/warehouse/material/user untuk simulasi.
* Jangan mengedit database langsung.
* Jangan menyalin token, credential, payload sensitif, atau `VITE_API_BASE_URL` ke tiket.

## Sign-off

| Tester | Tanggal/waktu | User/role | Environment | Browser/device | Hasil | Catatan FAIL / traceId |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  | PRODUCTION |  | [ ] PASS [ ] FAIL |  |
