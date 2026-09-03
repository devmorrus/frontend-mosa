# Manual Testing Frontend Day 2: Master Data and Layout

## Tujuan

Panduan ini menguji UI master data: Supplier, Unit of Measure, Raw Material, Product, dan Warehouse. Semua langkah dilakukan dari browser, bukan langsung dari database atau Swagger.

## Sebelum Mulai

1. Selesaikan semua persiapan di `DAY-1-MANUAL-TESTING.md`.
2. Login menggunakan user yang memiliki permission view, create, dan update untuk master data.
3. Siapkan satu UOM aktif dan satu UOM nonaktif.
4. Gunakan code unik pada setiap data baru, contohnya `SUP-MT-001`, agar hasil test tidak bercampur dengan data lama.
5. Untuk test permission, siapkan user read-only atau user tanpa permission pada modul yang diuji.

Catat hasil setiap case sebagai `PASS`, `FAIL`, atau `BLOCKED`. Sertakan screenshot untuk error UI, layout terpotong, atau data yang tidak sinkron.

## Supplier

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-SUP-01 | Buka **Master Data > Suppliers**, klik tombol tambah, isi seluruh field wajib dengan data valid, lalu simpan. | Notifikasi sukses tampil; supplier baru muncul di tabel. | [ ] |
| D2-SUP-02 | Buat supplier baru dengan code yang sama seperti D2-SUP-01. | Form menampilkan pesan duplicate yang jelas; tidak ada baris duplicate di tabel. | [ ] |
| D2-SUP-03 | Buka aksi edit supplier, ubah nama/kontak/alamat, lalu simpan. | Dialog tertutup setelah sukses; tabel/detail menampilkan data terbaru. | [ ] |
| D2-SUP-04 | Ubah status supplier menjadi inactive, lalu gunakan filter status. | Badge status dan hasil filter sesuai; supplier inactive dapat ditemukan pada filter yang tepat. | [ ] |
| D2-SUP-05 | Gunakan pencarian dengan sebagian code/nama supplier dan pindah halaman jika data cukup banyak. | Tabel menampilkan hasil yang benar dan pagination bekerja. | [ ] |

## Unit of Measure

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-UOM-01 | Buka **Master Data > Units**, buat UOM valid dengan code, nama, dan simbol. | Notifikasi sukses dan baris UOM tampil. | [ ] |
| D2-UOM-02 | Coba buat UOM dengan code yang sama. | Pesan duplicate tampil pada form; tidak ada duplicate row. | [ ] |
| D2-UOM-03 | Edit UOM, kemudian ubah active/inactive. | Data dan badge status di tabel berubah sesuai aksi. | [ ] |
| D2-UOM-04 | Cari UOM berdasarkan code/nama dan uji pagination. | Search, reset filter, dan pagination menampilkan hasil yang tepat. | [ ] |

## Raw Material

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-RM-01 | Buka **Master Data > Raw Materials**, klik tambah, pilih UOM aktif, isi data valid, lalu simpan. | Material berhasil dibuat dan UOM terlihat pada tabel/detail. | [ ] |
| D2-RM-02 | Coba memakai code material yang sama. | Pesan duplicate terlihat; data tidak tersimpan dua kali. | [ ] |
| D2-RM-03 | Coba isi minimum stock negatif. | Validasi field tampil dan tombol simpan tidak membuat data baru. | [ ] |
| D2-RM-04 | Buat satu material dengan **Has Expiry** aktif, lalu satu material dengan opsi tersebut nonaktif. | Field terkait expiry muncul/hilang sesuai pilihan dan kedua data valid dapat disimpan sesuai business rule. | [ ] |
| D2-RM-05 | Buka edit material lalu ganti category/status. | Perubahan tersimpan dan tabel memperbarui data. | [ ] |
| D2-RM-06 | Gunakan search, filter category, filter UOM, filter status, dan pagination. | Masing-masing filter membatasi hasil dengan benar; reset filter mengembalikan data. | [ ] |
| D2-RM-07 | Buka form material dan periksa pilihan UOM nonaktif. | UOM nonaktif tidak dapat dipilih untuk membuat/mengubah material. | [ ] |

## Product

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-PROD-01 | Buka **Master Data > Products**, buat product valid menggunakan UOM aktif. | Product tersimpan dan UOM tampil pada list/detail. | [ ] |
| D2-PROD-02 | Coba membuat product dengan code yang sama. | Pesan duplicate jelas dan data tidak tersimpan. | [ ] |
| D2-PROD-03 | Edit product lalu ubah status active/inactive. | Perubahan terlihat di tabel dan badge status sesuai. | [ ] |
| D2-PROD-04 | Gunakan search, filter status, filter UOM, dan pagination. | Hasil tabel dan count/pagination sesuai filter. | [ ] |
| D2-PROD-05 | Periksa pilihan UOM pada form product. | UOM nonaktif tidak dapat dipilih. | [ ] |

## Warehouse

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-WH-01 | Buka **Master Data > Warehouses**, buat warehouse valid. | Notifikasi sukses dan warehouse tampil pada tabel. | [ ] |
| D2-WH-02 | Ulangi pembuatan dengan code warehouse yang sama. | Pesan duplicate tampil; tidak ada data ganda. | [ ] |
| D2-WH-03 | Edit warehouse, lalu ubah status active/inactive. | Tabel menampilkan nilai dan badge status terbaru. | [ ] |
| D2-WH-04 | Gunakan search, filter status, dan pagination. | Hasil search/filter dan navigasi halaman benar. | [ ] |

## Permission and UI States

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-UI-01 | Login sebagai user read-only, lalu buka setiap master data yang diizinkan. | List dapat dibaca; tombol create/edit/status tidak tersedia atau menghasilkan penolakan izin yang jelas. | [ ] |
| D2-UI-02 | Login sebagai user tanpa permission salah satu master data. | Menu tidak tampil. Jika URL diketik langsung, user melihat halaman 403. | [ ] |
| D2-UI-03 | Pada setiap halaman master, buat input tidak valid atau matikan backend sementara. | Error field/server terlihat jelas; dialog tidak stuck; halaman tidak crash. | [ ] |
| D2-UI-04 | Uji tabel master yang kosong menggunakan search yang tidak menemukan data. | Empty state tampil dengan pesan yang jelas, tanpa tabel rusak. | [ ] |

## Responsive Check

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D2-RSP-01 | Uji semua halaman master pada desktop 1440 px. | Toolbar, tabel, dialog, dan pagination rapi. | [ ] |
| D2-RSP-02 | Uji pada tablet 768 px. | Filter dapat digunakan, tabel masih dibaca/di-scroll bila perlu, tanpa tombol aksi terpotong. | [ ] |
| D2-RSP-03 | Uji pada mobile 375-430 px. Buka sidebar, search/filter, tambah/edit dialog, dan pagination. | Drawer sidebar berfungsi; form dan tombol simpan dapat diakses; tidak ada horizontal scroll yang menghalangi aksi penting. | [ ] |

## Sign-off

| Tester | Tanggal | Browser/Device | Catatan |
| --- | --- | --- | --- |
|  |  |  |  |

