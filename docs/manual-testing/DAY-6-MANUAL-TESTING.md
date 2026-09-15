# Day 6 QA: Recipe Builder, Versioning & Approval

Gunakan checklist ini di `LOCAL_DISPOSABLE`, `SHARED_QA/STAGING`, atau `PRODUCTION`. Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A`. Setiap `FAIL` wajib menyertakan screenshot dan `traceId`.

## Aturan environment

| Environment | Aturan |
| --- | --- |
| `LOCAL_DISPOSABLE` | Boleh membuat product/material/recipe dummy dan menguji semua invalid case, scaling, reorder, reject, serta resubmit. |
| `SHARED_QA` / `STAGING` | Gunakan master data yang disetujui. Cleanup hanya melalui alur resmi. Jangan mengubah recipe yang sedang dipakai produksi. |
| `PRODUCTION` | Read-only untuk recipe/version yang ada. Jangan membuat recipe/version, submit, approve, reject, delete step, atau mengubah recipe aktif tanpa change ticket dan approval. |

## Persiapan QA/local

1. Siapkan satu product aktif, satu material aktif, satu material inactive, dan UOM aktif.
2. Siapkan akun dengan `recipes.view`, `recipes.create`, `recipes.update`, `recipes.submit`, dan `recipes.approve` secara terpisah untuk pengujian permission.
3. Untuk production cukup buka list/detail/version/approval queue secara read-only.

## Recipe & versioning

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D6-REC-01 | LOCAL/STAGING | Create Recipe dengan product aktif dan output valid | Recipe dibuat, product relation dan UOM benar, V1 Draft muncul | [ ] |
| D6-REC-02 | LOCAL/STAGING | Buat V2 dari recipe lama | V2 dibuat, V1 tetap ada, history tidak hilang | [ ] |
| D6-REC-03 | LOCAL/STAGING | Coba duplicate version number melalui API/test tool | Ditolak `duplicate_recipe_version`; tidak ada version parsial | [ ] |
| D6-REC-04 | SEMUA | Buka recipe detail dan version history | Semua version tampil dengan status, approver, timestamp, dan step count | [ ] |
| D6-REC-05 | SEMUA | Buka Approved/Historical/Pending version | Builder read-only; tidak ada edit/delete/reorder yang efektif | [ ] |
| D6-REC-06 | LOCAL/STAGING | Create New Version dari recipe approved | Version baru Draft; version approved lama tetap immutable | [ ] |

## Recipe steps

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D6-STP-01 | LOCAL/STAGING | Tambah Material, Process, Timer, dan Check step | Semua tersimpan dengan field yang sesuai step type | [ ] |
| D6-STP-02 | LOCAL/STAGING | Material inactive, target 0/negatif, tolerance negatif | Ditolak client dan backend; tidak ada perubahan tersimpan | [ ] |
| D6-STP-03 | LOCAL/STAGING | Timer 0 atau instruction kosong | Ditolak dengan validation error yang jelas | [ ] |
| D6-STP-04 | LOCAL/STAGING | Sequence duplicate atau reorder | Ditolak bila invalid; reorder valid menghasilkan sequence 1..N tanpa duplicate | [ ] |
| D6-STP-05 | LOCAL/STAGING | Delete step pada Draft | Step terhapus dan sequence setelahnya compact | [ ] |
| D6-STP-06 | SEMUA | Update/delete/reorder Pending atau Approved | Ditolak dan data tidak berubah | [ ] |

## Approval

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D6-APR-01 | LOCAL/STAGING | Submit Draft | Status Pending Approval, SubmittedBy/SubmittedAt terisi, audit tercatat | [ ] |
| D6-APR-02 | LOCAL/STAGING | Submit Pending/Approved | Ditolak; status tetap | [ ] |
| D6-APR-03 | LOCAL/STAGING | Approve sebagai akun tanpa `recipes.approve` | HTTP 403; status tetap Pending Approval | [ ] |
| D6-APR-04 | LOCAL/STAGING | Approve sebagai approver | Status Approved, ApprovedBy dan ApprovedAt terisi | [ ] |
| D6-APR-05 | LOCAL/STAGING | Reject tanpa reason | Ditolak; status tetap Pending Approval | [ ] |
| D6-APR-06 | LOCAL/STAGING | Reject dengan reason lalu edit/resubmit | Status Needs Revision, reason tersimpan, dapat diedit, resubmit kembali Pending | [ ] |
| D6-APR-07 | LOCAL/STAGING | Approve V2 saat V1 Approved | V2 Approved, V1 Historical, seluruh version history tetap ada, audit approve + historical tercatat | [ ] |

## Scaling

| ID | Scope | Langkah | Lolos jika |
| --- | --- | --- | --- |
| D6-SCL-01 | LOCAL/STAGING | Preview output 1x, 2.5x, 5x | Scaling factor dan seluruh material mengikuti rasio output | [ ] |
| D6-SCL-02 | LOCAL/STAGING | Gunakan dua material dengan decimal quantity | Masing-masing material diskalakan independen dengan precision yang sesuai | [ ] |
| D6-SCL-03 | LOCAL/STAGING | Target output 0 / negatif atau standard output invalid | Ditolak, tidak ada mutasi recipe | [ ] |

## Frontend & responsive

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D6-UI-01 | SEMUA | Buka Recipe List, Create, Detail, Version Builder | Semua halaman load tanpa lookup 403 yang tidak perlu | [ ] |
| D6-UI-02 | LOCAL/STAGING | Gunakan Material/Process/Timer/Check editor dan reorder | Form error inline, save, delete, reorder, submit berjalan | [ ] |
| D6-UI-03 | LOCAL/STAGING | Buka Approval Queue dan approve/reject | Queue hanya pending; decision dialog dan refresh benar | [ ] |
| D6-UI-04 | SEMUA | Test viewport 1440, 768, dan 375 px | Builder menumpuk rapi, tabel scroll horizontal, action tidak terpotong | [ ] |

## Larangan production

* Jangan membuat atau mengubah recipe/version tanpa change ticket.
* Jangan submit, approve, reject, reorder, delete step, atau preview dengan data buatan di production.
* Jangan menonaktifkan material/product/UOM untuk simulasi.
* Jangan menyalin token, credential, atau `VITE_API_BASE_URL` ke tiket.

## Sign-off

| Tester | Tanggal | Environment | Browser/device | Hasil | Catatan FAIL |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | [ ] PASS [ ] FAIL |  |
