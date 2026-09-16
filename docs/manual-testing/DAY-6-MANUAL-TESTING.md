# Day 6 Production Manual Testing

Checklist ini khusus verifikasi production untuk Recipe Builder, versioning, approval, dan scaling. Pengujian dilakukan langsung di production dan defaultnya adalah **read-only**; tidak ada local/staging. Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A`; setiap `FAIL` wajib menyertakan screenshot, waktu kejadian, user, dan `traceId`.

## Safety Gate

Sebelum mulai:

1. Pastikan environment dan tenant yang dipilih benar-benar `PRODUCTION`.
2. Gunakan recipe, version, product, dan material yang sudah ada. Jangan membuat data uji.
3. Jangan klik `Save`, `Submit`, `Approve`, `Reject`, `Delete`, atau `Reorder` saat melakukan verifikasi read-only.
4. Aksi approval hanya boleh dilakukan jika ada change ticket yang menyebutkan `recipeVersionId`, approver, alasan, dan rollback/mitigasi.
5. Jika tidak ada recipe version berstatus `Pending Approval`, tandai test approval `N/A`, bukan membuat data baru.
6. Jangan mengubah status product, raw material, atau UOM untuk simulasi.

## Akun dan permission

Catat user yang digunakan. Pengujian permission dilakukan dengan login/logout memakai akun yang telah disetujui, bukan dengan mengubah role user production.

| Akun | Permission yang diharapkan | Tujuan |
| --- | --- | --- |
| Viewer | `recipes.view` | List, detail, history, version detail, queue sesuai akses |
| Builder | `recipes.view`, `recipes.create`, `recipes.update`, `recipes.submit` | Verifikasi tombol/editability jika ada change ticket |
| Approver | `recipes.view`, `recipes.approve` | Approval queue dan keputusan approval dengan change ticket |

## Recipe List dan Product Relation

| ID | Langkah read-only | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D6-PROD-REC-01 | Buka `Production > Recipes` | List tampil tanpa error; recipe name, product code/name, status, dan current version terbaca | [ ] |
| D6-PROD-REC-02 | Cari recipe berdasarkan nama dan product code | Hasil pencarian konsisten dengan data yang ada; pagination tidak menggandakan/menghilangkan item | [ ] |
| D6-PROD-REC-03 | Buka satu recipe yang sudah dipakai operasional | Product relation benar; recipe tidak menunjuk product yang salah | [ ] |
| D6-PROD-REC-04 | Buka recipe detail | Current version, standard output, UOM, status, dan metadata tampil | [ ] |

## Version History dan Read-only

| ID | Langkah read-only | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D6-PROD-VER-01 | Buka version history recipe | Semua version yang ada tampil; tidak ada history yang hilang | [ ] |
| D6-PROD-VER-02 | Buka version Approved | Status, `ApprovedBy`, `ApprovedAt`, approval notes, output, UOM, dan steps tampil | [ ] |
| D6-PROD-VER-03 | Buka version Historical | Version tetap bisa dibaca dan seluruh steps historis masih tersedia | [ ] |
| D6-PROD-VER-04 | Buka version Pending Approval atau Needs Revision jika ada | Status dan metadata submission/rejection tampil sesuai data | [ ] |
| D6-PROD-VER-05 | Periksa action pada Approved/Historical/Pending | UI tidak menawarkan edit/delete/reorder yang tidak sesuai status; jangan mengirim request mutasi | [ ] |
| D6-PROD-VER-06 | Refresh halaman dan buka kembali version history | Data version, sequence, status, approver, dan timestamp tetap sama | [ ] |

## Recipe Steps

Gunakan version production yang sudah ada. Jangan menambah atau menghapus step hanya untuk pengujian.

| ID | Langkah read-only | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D6-PROD-STP-01 | Buka builder/detail version Approved | Material step menampilkan material, target quantity, UOM, tolerance; tidak ada data kosong yang tidak diharapkan | [ ] |
| D6-PROD-STP-02 | Periksa Process, Timer, dan Check step yang sudah ada | Instruction, timer duration, check items, dan sequence tampil sesuai recipe | [ ] |
| D6-PROD-STP-03 | Periksa seluruh sequence dari atas ke bawah | Sequence berurutan, unique, dan tidak ada gap yang tidak disengaja | [ ] |
| D6-PROD-STP-04 | Coba membuka URL builder dengan akun Viewer | Halaman tetap aman; kontrol edit/mutasi tersembunyi atau request mutasi ditolak permission | [ ] |

## Approval Queue

Jika production memang memiliki version Pending Approval yang ditugaskan untuk change ticket, gunakan test `D6-PROD-APR-04` sampai `D6-PROD-APR-06`. Jika tidak ada, tandai `N/A`.

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D6-PROD-APR-01 | Dengan akun Viewer, buka approval queue | Akses ditolak/terbatas sesuai policy; tidak ada action approval | [ ] |
| D6-PROD-APR-02 | Dengan akun Approver, buka `Recipe Approval Queue` | Hanya version Pending Approval yang tampil; recipe/product/submitted by/submitted at benar | [ ] |
| D6-PROD-APR-03 | Buka item queue ke version detail | Detail version sama dengan item queue; steps dan output tidak berubah | [ ] |
| D6-PROD-APR-04 | Dengan change ticket aktif, approve version yang memang ditugaskan | Status menjadi Approved; `ApprovedBy` dan `ApprovedAt` tercatat; audit approve ada | [ ] |
| D6-PROD-APR-05 | Jika version sebelumnya Approved, setelah approval refresh history | Version baru Approved; version lama Historical; history dan audit historical tetap ada | [ ] |
| D6-PROD-APR-06 | Dengan change ticket aktif, reject memakai reason yang disetujui | Status menjadi Needs Revision; reason tersimpan; audit reject ada | [ ] |
| D6-PROD-APR-07 | Setelah approve/reject, refresh approval queue | Item hilang dari queue Pending Approval atau statusnya sesuai keputusan | [ ] |

## Scaling Preview

Scaling preview bersifat read-only, tetapi hanya lakukan pada version production yang disetujui dan target output operasional yang memang diperlukan. Jangan memakai target ekstrem atau data dummy.

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D6-PROD-SCL-01 | Buka scaling preview dari version Approved | Preview tersedia tanpa mengubah recipe/version | [ ] |
| D6-PROD-SCL-02 | Masukkan target output operasional yang disetujui | Scaling factor = target output / standard output | [ ] |
| D6-PROD-SCL-03 | Periksa seluruh material | Setiap material ter-scale proporsional; decimal quantity tidak dibulatkan secara tidak semestinya; UOM benar | [ ] |
| D6-PROD-SCL-04 | Refresh version setelah preview | Standard output, steps, status, dan version history tidak berubah | [ ] |

## Frontend dan Responsive

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D6-PROD-UI-01 | Test desktop 1440 px | List, detail, version history, queue, dan step detail terbaca; action tidak terpotong | [ ] |
| D6-PROD-UI-02 | Test tablet 768 px | Filter dan card menumpuk rapi; tabel dapat di-scroll bila diperlukan | [ ] |
| D6-PROD-UI-03 | Test mobile 375 px | Tidak ada horizontal overflow pada halaman; version/step detail tetap terbaca | [ ] |
| D6-PROD-UI-04 | Buka DevTools Network selama read-only test | Tidak ada lookup request 403 yang tidak perlu; tidak ada POST/PUT/PATCH/DELETE tanpa aksi yang disetujui | [ ] |

## Non-production Only → `N/A` (production-only testing)

Test berikut **tidak dilakukan** karena tidak ada local/staging dan dilarang di production. Kasus-kasus ini dicakup automated tests (backend unit + frontend unit) sebagai evidence pendukung:

* Create Recipe dan Create Version.
* Duplicate version number.
* Add/update/delete/reorder step.
* Submit Draft, reject tanpa reason, resubmit Needs Revision.
* Material inactive, target quantity 0/negatif, tolerance negatif, Timer 0, dan instruction kosong.
* Scaling 1x, 2.5x, 5x dengan material dummy atau target ekstrem.
* Pengujian permission dengan mengubah role user production.

## Production Prohibited

* Jangan membuat recipe/version dummy.
* Jangan mengubah recipe Approved/Historical/Pending tanpa change ticket.
* Jangan melakukan submit, approve, reject, delete, reorder, atau save untuk sekadar mencoba UI.
* Jangan menonaktifkan product, raw material, atau UOM untuk simulasi.
* Jangan mengedit database langsung.
* Jangan menyalin token, credential, payload sensitif, atau `VITE_API_BASE_URL` ke tiket.

## Sign-off

| Tester | Tanggal/waktu | User/role | Environment | Browser/device | Hasil | Catatan FAIL / traceId |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  | PRODUCTION |  | [ ] PASS [ ] FAIL |  |
