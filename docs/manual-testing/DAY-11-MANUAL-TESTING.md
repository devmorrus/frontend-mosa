# Day 11 Production Completion, Finished Goods & QC

Checklist ini mencakup production completion nyata, Finished Goods LOT/QR, QC parameter & inspection, QC PASS/HOLD/REJECT, inventory QC integrity, frontend completion & QC, dan tutorial completion & QC simulation. Tulis `PASS`, `FAIL`, `BLOCKED`, atau `N/A`. Untuk `FAIL`, catat timestamp, user, URL, screenshot, request/response status, dan `traceId`.

## Safety Gate

1. Gunakan production hanya untuk Production Order yang benar-benar dijadwalkan dan operator yang benar-benar ditugaskan.
2. Jangan membuat PO, completion, FG LOT, QC inspection/decision, atau inventory movement dummy hanya untuk test production.
3. Negative case, duplicate completion, invalid QR, double PASS/HOLD/REJECT, reject-after-pass, concurrency, dan transaction failure wajib diuji di local/staging atau automated tests.
4. Jangan mengulang completion pada PO yang sudah completed (mis. `PO-20260916-00001`) karena FG LOT kedua tidak boleh terbentuk dari PO yang sama.
5. Untuk production, ambil evidence dari transaksi authorized yang memang terjadi; catat PO number, FG LOT number, QR token, QC decision, inspector, dan stock movement ID.
6. Tutorial completion & QC simulation aman dijalankan karena tidak boleh membuat FG LOT nyata, QC result nyata, mengubah Production Order, atau mengubah inventory; tetap inspect Network bila perlu.

## Accounts and Preconditions

| Account | Required permission | Purpose |
| --- | --- | --- |
| Assigned Operator | `production-orders.execute` | Complete production, input actual output, lihat FG LOT/QR |
| QC Inspector | `qc.view`, `qc.inspect` | Membuka queue, mengisi QC parameters, save inspection |
| QC Decider/Supervisor | `qc.decide` | PASS, HOLD, REJECT |
| Unauthorized User | Tanpa permission QC/completion atau tanpa assignment | Memastikan akses ditolak |
| Admin/Auditor | Read-only production, FG LOT, QC, inventory, audit permission sesuai policy | Verifikasi audit dan stock movement |

Pastikan tersedia PO `IN_PROGRESS` dengan semua step `Completed`, tanpa pending approval/deviation, recipe Approved, dan product memiliki QC parameter aktif bila skenario membutuhkannya.

## A. Production Completion

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-COMP-01 | Complete production dengan semua step Completed authorized | Production selesai; FG LOT terbentuk | [ ] |
| D11-COMP-02 | Complete production dengan step belum selesai di local/staging | Ditolak; FG LOT tidak dibuat | [ ] |
| D11-COMP-03 | Complete production saat ada pending approval di local/staging | Ditolak; pending approval memblokir completion | [ ] |
| D11-COMP-04 | Complete tanpa actual output di local/staging | Ditolak; actual output wajib | [ ] |
| D11-COMP-05 | Complete dengan actual output `0` di local/staging | Ditolak | [ ] |
| D11-COMP-06 | Complete dengan negative actual output di local/staging | Ditolak | [ ] |
| D11-COMP-07 | Complete production yang sama dua kali di local/staging | Duplicate ditolak; FG LOT kedua tidak terbentuk | [ ] |
| D11-COMP-08 | Inspect completed production | `CompletedBy` tercatat | [ ] |
| D11-COMP-09 | Inspect completed production | `CompletedAt` tercatat | [ ] |
| D11-COMP-10 | Force transaction failure saat completion di test environment | Semua perubahan rollback; tidak ada orphan FG LOT/order state setengah | [ ] |

## B. Finished Goods LOT

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-FG-01 | Inspect FG LOT setelah completion authorized | FG LOT otomatis terbentuk | [ ] |
| D11-FG-02 | Inspect FG LOT number | Unique; tidak duplikat antar completion | [ ] |
| D11-FG-03 | Inspect FG LOT | Product relation benar | [ ] |
| D11-FG-04 | Inspect FG LOT | Production Order relation benar | [ ] |
| D11-FG-05 | Inspect FG LOT | Recipe Version relation benar | [ ] |
| D11-FG-06 | Inspect FG LOT | Target Output tersimpan sesuai PO | [ ] |
| D11-FG-07 | Inspect FG LOT | Actual Output tersimpan sesuai input completion | [ ] |
| D11-FG-08 | Inspect FG LOT | Yield benar sesuai agreed formula (`actual/target*100`, 2 desimal) | [ ] |
| D11-FG-09 | Inspect FG LOT | QC Status awal `WAITING_QC` | [ ] |
| D11-FG-10 | Inspect FG LOT | Inventory Status awal `BLOCKED`/`NOT_AVAILABLE` | [ ] |
| D11-FG-11 | Inspect available stock sebelum QC PASS | FG belum masuk Available Stock | [ ] |

## C. Finished Goods QR

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-QR-01 | Inspect FG LOT | QR Token otomatis terbentuk | [ ] |
| D11-QR-02 | Inspect QR Token | Unique antar FG LOT | [ ] |
| D11-QR-03 | Resolve QR valid | QR valid resolve ke FG LOT yang benar | [ ] |
| D11-QR-04 | Resolve QR invalid di local/staging | Ditolak not found; tidak bocor detail LOT lain | [ ] |
| D11-QR-05 | Resolve QR lowercase dari token uppercase | Tetap resolve ke FG LOT yang benar | [ ] |
| D11-QR-06 | Buka FG label | Label tampil | [ ] |
| D11-QR-07 | Inspect label | Product tampil pada label | [ ] |
| D11-QR-08 | Inspect label | FG LOT tampil | [ ] |
| D11-QR-09 | Inspect label | Production Date tampil | [ ] |
| D11-QR-10 | Inspect label | Actual Output tampil | [ ] |
| D11-QR-11 | Inspect label produk dengan shelf life | Expiry tampil; tanpa shelf life tampil `-` | [ ] |
| D11-QR-12 | Inspect label | QC Status tampil | [ ] |
| D11-QR-13 | Reprint label | Reprint berjalan | [ ] |
| D11-QR-14 | Inspect FG LOT setelah reprint | Reprint tidak membuat FG LOT baru | [ ] |
| D11-QR-15 | Inspect QR Token setelah reprint | QR Token tetap sama | [ ] |

## D. QC Parameter & Inspection

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-QC-01 | Buka QC queue sebagai inspector | Waiting QC tampil di queue | [ ] |
| D11-QC-02 | Buka FG Waiting QC | FG detail dapat dibuka | [ ] |
| D11-QC-03 | Inspect inspection | Product QC Parameter tampil | [ ] |
| D11-QC-04 | Inspect product tanpa parameter aktif | Ditangani jelas (empty state, tetap dapat diputuskan sesuai policy) | [ ] |
| D11-QC-05 | Save inspection tanpa required parameter | Required parameter wajib diisi; ditolak/dicegah | [ ] |
| D11-QC-06 | Save inspection dengan optional parameter kosong | Berhasil; optional boleh kosong | [ ] |
| D11-QC-07 | Inspect inspection tersimpan | Result tersimpan | [ ] |
| D11-QC-08 | Inspect inspection tersimpan | Inspector tersimpan | [ ] |
| D11-QC-09 | Inspect inspection tersimpan | InspectedAt tersimpan | [ ] |
| D11-QC-10 | Inspect inspection tersimpan | Notes tersimpan | [ ] |
| D11-QC-11 | Cari opsi rework pada decision | Rework tidak tersedia (V1) | [ ] |
| D11-QC-12 | Akses QC tanpa permission di local/staging | Permission QC berjalan; akses ditolak | [ ] |

## E. QC PASS

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-PASS-01 | PASS Waiting QC authorized | PASS berjalan | [ ] |
| D11-PASS-02 | Inspect FG LOT setelah PASS | QC Status berubah ke `PASSED` | [ ] |
| D11-PASS-03 | Inspect FG LOT setelah PASS | Inventory Status menjadi `AVAILABLE` | [ ] |
| D11-PASS-04 | Inspect available stock setelah PASS | Quantity FG masuk Available Stock | [ ] |
| D11-PASS-05 | Inspect stock movement setelah PASS | Inventory release movement/history terbentuk | [ ] |
| D11-PASS-06 | Inspect decision | Inspector tercatat | [ ] |
| D11-PASS-07 | Inspect decision | Timestamp tercatat | [ ] |
| D11-PASS-08 | Inspect audit | Audit PASS tercatat | [ ] |
| D11-PASS-09 | PASS FG LOT yang sama dua kali di local/staging | Pass kedua ditolak; tidak ada duplicate movement | [ ] |

## F. QC HOLD

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-HOLD-01 | HOLD Waiting QC authorized dengan notes | HOLD berjalan | [ ] |
| D11-HOLD-02 | Inspect FG LOT setelah HOLD | Inventory tetap `BLOCKED` | [ ] |
| D11-HOLD-03 | Inspect available stock setelah HOLD | HOLD stock tidak masuk Available | [ ] |
| D11-HOLD-04 | Inspect decision | Notes tersimpan | [ ] |
| D11-HOLD-05 | Buka QC history | Historical QC state dapat dilihat | [ ] |

## G. QC REJECT

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-REJ-01 | REJECT Waiting QC authorized dengan reason/notes | REJECT berjalan | [ ] |
| D11-REJ-02 | REJECT tanpa reason/notes di local/staging | Ditolak sesuai rule; state tidak berubah | [ ] |
| D11-REJ-03 | Inspect FG LOT setelah REJECT | Inventory menjadi non-available (`REJECTED`) | [ ] |
| D11-REJ-04 | Inspect available stock setelah REJECT | Rejected FG tidak masuk Available Stock | [ ] |
| D11-REJ-05 | Cari opsi rework setelah REJECT | Rework tidak tersedia | [ ] |
| D11-REJ-06 | REJECT setelah PASS di local/staging | Ditolak; PASS state tidak berubah | [ ] |

## H. Inventory QC Integrity

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-INV-01 | Inspect available FG list | Waiting QC tidak muncul sebagai Available FG | [ ] |
| D11-INV-02 | Inspect available FG list | Hold tidak muncul sebagai Available FG | [ ] |
| D11-INV-03 | Inspect available FG list | Reject tidak muncul sebagai Available FG | [ ] |
| D11-INV-04 | Inspect available FG list | Pass muncul sebagai Available FG | [ ] |
| D11-INV-05 | Force transaction failure saat QC decision di test environment | QC Decision + Inventory Release atomic; status dan inventory rollback | [ ] |

## I. Frontend Production Completion

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-FEC-01 | Selesaikan semua step | All Steps Completed state tampil | [ ] |
| D11-FEC-02 | Lihat completion card | Actual Output field tersedia dengan validasi angka > 0, maks 4 desimal | [ ] |
| D11-FEC-03 | Klik Complete Production | Completion confirmation tampil | [ ] |
| D11-FEC-04 | Konfirmasi completion | Complete Production berjalan | [ ] |
| D11-FEC-05 | Double-click tombol confirm | Double submit dicegah; satu request diproses | [ ] |
| D11-FEC-06 | Simulasikan backend failure di local/staging | Error tampil di dalam dialog; dialog tetap terbuka untuk retry | [ ] |
| D11-FEC-07 | Setelah success | FG LOT tampil | [ ] |
| D11-FEC-08 | Setelah success | Yield tampil dari backend | [ ] |
| D11-FEC-09 | Setelah success | QR Preview tampil (atau pesan jelas bila label gagal dimuat) | [ ] |
| D11-FEC-10 | Klik Print Label | Print Label berjalan dengan PO, warehouse, production/expiry date, QC | [ ] |
| D11-FEC-11 | Setelah success | QC Status tampil dari backend via badge | [ ] |
| D11-FEC-12 | Setelah success | Inventory Status tampil dari backend via badge | [ ] |
| D11-FEC-13 | Refresh halaman setelah completion | State "Production selesai" tetap tampil dengan link QC Queue (tidak blank) | [ ] |

## J. Frontend QC

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-FEQ-01 | Buka QC Queue | QC Queue tampil dengan auto-refresh | [ ] |
| D11-FEQ-02 | Filter product | Product filter berjalan | [ ] |
| D11-FEQ-03 | Filter status Waiting/Hold/Passed/Rejected | Status filter berjalan | [ ] |
| D11-FEQ-04 | Filter tanggal | Date filter berjalan | [ ] |
| D11-FEQ-05 | Buka FG dari queue | FG Detail tampil | [ ] |
| D11-FEQ-06 | Lihat parameters | QC Parameters tampil dengan penanda required | [ ] |
| D11-FEQ-07 | Coba decide tanpa required lengkap | Required field validation berjalan; tombol decide disabled | [ ] |
| D11-FEQ-08 | Klik Pass | PASS confirmation berjalan | [ ] |
| D11-FEQ-09 | Klik Hold | HOLD confirmation berjalan | [ ] |
| D11-FEQ-10 | Klik Reject | REJECT confirmation berjalan | [ ] |
| D11-FEQ-11 | Setelah save/decide | Inventory Status ter-refresh dari backend | [ ] |
| D11-FEQ-12 | Lihat history | QC History tampil dengan pagination | [ ] |
| D11-FEQ-13 | Inspect history/decision | Inspector tampil | [ ] |
| D11-FEQ-14 | Inspect history/decision | Timestamp tampil | [ ] |
| D11-FEQ-15 | Akses tanpa `qc.view`/`qc.inspect`/`qc.decide` | Permission berjalan; aksi disembunyikan/ditolak | [ ] |
| D11-FEQ-16 | Simulasikan save/decide failure di local/staging | Error inline tampil; form tidak hilang | [ ] |

## K. Interactive Guided Recipe Tutorial — Completion & QC

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D11-TUT-01 | Jalankan tutorial sampai akhir | Tutorial mencapai final Recipe Step | [ ] |
| D11-TUT-02 | Isi actual output simulation | Actual Output simulation tersedia | [ ] |
| D11-TUT-03 | Lihat yield simulation | Yield simulation tampil | [ ] |
| D11-TUT-04 | Simulasikan complete production | Simulated FG LOT tampil | [ ] |
| D11-TUT-05 | Lihat QC section | Waiting QC dijelaskan (WAITING QC = belum available) | [ ] |
| D11-TUT-06 | Klik simulate PASS | QC PASS simulation berjalan; inventory simulasi AVAILABLE | [ ] |
| D11-TUT-07 | Klik simulate HOLD | QC HOLD simulation berjalan; inventory simulasi BLOCKED | [ ] |
| D11-TUT-08 | Klik simulate REJECT | QC REJECT simulation berjalan; inventory simulasi non-available | [ ] |
| D11-TUT-09 | Selesaikan tutorial | Final Production Summary tampil | [ ] |
| D11-TUT-10 | Klik restart | Restart Tutorial berjalan | [ ] |
| D11-TUT-11 | Navigasi back | Back berjalan tanpa merusak progress tersimpan | [ ] |
| D11-TUT-12 | Inspect network/database setelah tutorial | Tutorial tidak membuat FG LOT nyata | [ ] |
| D11-TUT-13 | Inspect network/database setelah tutorial | Tutorial tidak membuat QC Result nyata | [ ] |
| D11-TUT-14 | Inspect PO setelah tutorial | Tutorial tidak mengubah Production Order | [ ] |
| D11-TUT-15 | Inspect inventory setelah tutorial | Tutorial tidak mengubah inventory | [ ] |

## Automated Evidence

- Backend unit/integration tests should cover completion gates (steps, pending approval, actual output, duplicate), FG LOT creation (unique number, relations, yield, initial statuses), QR token (unique, resolve valid/invalid/case-insensitive), QC required params, PASS/HOLD/REJECT transitions, double decision rejection, release movement, and transaction rollback.
- Frontend tests should cover completion validation, double-submit guard, dialog error state, label loading/error state, QC filters, required validation, confirmations, inline error preservation, and tutorial completion/QC simulation.
- Production evidence should include only authorized operational completions and QC decisions, with PO number, FG LOT number, QR token, inspector, stock movement ID, and audit timestamps.

## Current Automated Status

- Backend unit: `233/233 PASS` (termasuk `FinishedGoodsLot_ShouldNormalizeQrTokenToUppercase`).
- Frontend tests: `47/47 PASS`.
- Frontend `npm run build`: PASS (chunk size warning lama).
- Integration tests terfilter Day 11 tidak dijalankan (butuh DB/docker, timeout di environment ini).
