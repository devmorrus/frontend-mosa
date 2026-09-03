# Manual Testing Frontend Day 1: Login, Session, and Access

## Tujuan

Panduan ini menguji pengalaman pengguna pada login, session, logout, halaman yang dilindungi, error 401/403, serta menu berdasarkan permission.

## Sebelum Mulai

1. Pastikan backend sudah berjalan dan Swagger dapat dibuka.
2. Di folder `mosa-frontend`, buat `.env` dari `.env.example`.
3. Set `VITE_API_BASE_URL` ke endpoint backend yang aktif. Untuk backend lokal saat ini gunakan format `http://localhost:<PORT>/api`, tanpa `/v1`.
4. Jalankan `npm install` bila diperlukan, kemudian `npm run dev`.
5. Buka URL yang ditampilkan Vite di browser.
6. Siapkan akun berikut dari backend/admin:
   - User aktif dengan permission penuh.
   - User aktif dengan permission terbatas.
   - User aktif tanpa permission pada salah satu menu master data.
   - Username atau password yang tidak valid.

Catat hasil setiap case sebagai `PASS`, `FAIL`, atau `BLOCKED`, dan ambil screenshot bila hasilnya tidak sesuai.

## Login and Session

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D1-FE-01 | Buka aplikasi saat belum login. | Halaman login tampil; tidak langsung masuk ke dashboard. | [ ] |
| D1-FE-02 | Isi username/email dan password valid, lalu klik **Masuk ke dashboard**. | User masuk ke dashboard; sidebar dan nama/profil user tampil. | [ ] |
| D1-FE-03 | Kembali ke login, isi password salah, lalu submit. | Pesan error aman tampil; user tetap di halaman login; password tidak terlihat pada pesan error. | [ ] |
| D1-FE-04 | Login memakai username/email yang tidak terdaftar. | Pesan error aman tampil dan tidak memberi informasi sensitif tentang akun. | [ ] |
| D1-FE-05 | Setelah login valid, refresh browser. | User tetap login setelah loading singkat; dashboard/sidebar kembali tampil. | [ ] |
| D1-FE-06 | Tutup tab, buka kembali URL aplikasi. | Session dipulihkan jika token masih valid. | [ ] |
| D1-FE-07 | Klik logout dari topbar/menu user. | User kembali ke login. Buka `/dashboard` secara langsung dan pastikan tetap dialihkan ke login. | [ ] |

## Protected Page and Permission

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D1-FE-08 | Dalam keadaan logout, ketik URL protected seperti `/suppliers` di address bar. | Browser diarahkan ke `/login`. | [ ] |
| D1-FE-09 | Login setelah menjalankan D1-FE-08 menggunakan user yang punya permission supplier. | Setelah login, user kembali ke halaman `/suppliers`. | [ ] |
| D1-FE-10 | Login menggunakan user tanpa `suppliers.view`, lalu coba buka `/suppliers`. | Halaman **403** tampil atau user ditolak dengan pesan izin. | [ ] |
| D1-FE-11 | Dengan user terbatas, periksa sidebar. | Hanya menu yang dikirim sesuai permission tampil; menu tanpa permission tidak terlihat. | [ ] |
| D1-FE-12 | Login sebagai user dengan permission penuh dan buka beberapa menu. | Menu yang sesuai permission tampil dan dapat dibuka. | [ ] |

## Error Handling

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D1-FE-13 | Saat sudah login, gunakan DevTools untuk menghapus `mosa.accessToken` dan `mosa.refreshToken` dari Local Storage, lalu refresh. | User kembali ke login, tidak ada halaman protected yang tetap terbuka. | [ ] |
| D1-FE-14 | Saat sudah login, matikan backend sementara lalu refresh atau buka halaman lain. | UI menampilkan pesan koneksi/server yang mudah dipahami dan tidak crash. | [ ] |
| D1-FE-15 | Buat backend mengembalikan `403` untuk user yang sedang login, lalu buka halaman terkait. | Toast/pesan izin tampil dan user diarahkan ke halaman 403. | [ ] |

## Responsive Check

| ID | Langkah yang dilakukan di frontend | Hasil yang harus terlihat | Hasil |
| --- | --- | --- | --- |
| D1-FE-16 | Uji halaman login pada lebar 1440 px, 768 px, dan 375 px melalui browser responsive mode. | Form login terbaca, input dan tombol dapat diklik, tanpa horizontal scroll. | [ ] |
| D1-FE-17 | Login lalu uji dashboard pada 768 px dan 375 px. | Sidebar dapat dibuka/tutup sebagai drawer pada mobile; konten tidak tertutup sidebar. | [ ] |

## Sign-off

| Tester | Tanggal | Browser/Device | Catatan |
| --- | --- | --- | --- |
|  |  |  |  |

