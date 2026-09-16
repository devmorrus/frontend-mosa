# Day 9 Material Consumption, QR Validation, and Multi-LOT

Checklist ini mencakup material consumption nyata, validasi LOT/QR, multi-LOT, stock deduction, target vs actual, frontend material step, dan tutorial material simulation. Pengujian dilakukan langsung di production; tidak ada local/staging. Tulis `PASS`, `FAIL`, `BLOCKED`, atau `N/A`. Untuk `FAIL`, catat timestamp, user, URL, screenshot, request/response status, dan `traceId`.

## Safety Gate

1. Gunakan production hanya untuk Production Order yang benar-benar dijadwalkan dan operator yang benar-benar ditugaskan.
2. Jangan membuat PO, receiving, LOT, consumption, stock movement, atau inventory adjustment dummy hanya untuk test production.
3. Negative case, invalid QR, wrong LOT, blocked/expired/depleted LOT, duplicate LOT, insufficient stock, concurrency, dan rollback **dilarang** diuji di production — item tersebut memakai evidence automated tests (backend unit + frontend unit) dengan catatan `automated unit coverage; no production mutation`, mengikuti pola Day 8.
4. Jangan mengulang consumption pada step/PO yang sudah completed (`PO-20260916-00001`) karena stock akan berkurang dua kali jika guard gagal.
5. Untuk production, ambil evidence dari transaksi authorized yang memang terjadi; catat PO number, step, material, LOT, before/after quantity, dan stock movement ID.
6. Tutorial material simulation aman dijalankan karena tidak boleh mengubah `CurrentQuantity`, `MaterialConsumption`, atau `StockMovement`; tetap inspect Network bila perlu.

## Accounts and Preconditions

| Account | Required permission | Purpose |
| --- | --- | --- |
| Assigned Operator | `production-orders.execute` | Scan QR, pilih LOT manual, input actual, post consumption |
| Unauthorized Operator | `production-orders.execute` tanpa assignment PO | Memastikan operator lain ditolak |
| Supervisor/Admin | `production-orders.view`, inventory/stock movement read permission sesuai policy | Read-only audit dan verification |

Pastikan tersedia PO `IN_PROGRESS` dengan current material step, recipe Approved, material relation benar, stok available pada warehouse yang benar, dan LOT yang digunakan valid untuk material tersebut. Untuk multi-LOT production, hanya lakukan bila produksi nyata memang membutuhkan pemecahan LOT.

## A. Material Consumption Persistence

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-CONS-01 | Verifikasi startup production | Tabel/kolom `MaterialConsumption` tersedia (app prod berjalan; consumption Day 8 tersimpan) | PASS - production startup; consumption `PO-20260916-00001` tersimpan |
| D9-CONS-02 | Post single LOT consumption authorized | Material consumption tersimpan satu line dengan actual quantity | PASS - `PO-20260916-00001`, LOT `RM-20260917-00001` |
| D9-CONS-03 | Post multi-LOT consumption dalam satu step | Material consumption tersimpan beberapa line dalam satu step | N/A - produksi nyata memakai single LOT per step; multi-LOT dicakup automated tests |
| D9-CONS-04 | Post quantity `0` | Request ditolak; tidak ada consumption/stock movement | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-CONS-05 | Post negative quantity | Request ditolak; tidak ada consumption/stock movement | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-CONS-06 | Inspect saved consumption | Production step relation mengarah ke step execution yang benar | PASS - movement ref `PO-20260916-00001` sesuai step produksi |
| D9-CONS-07 | Inspect saved consumption | Material relation mengarah ke material recipe/raw material yang benar | PASS - movement `Gula Pasir RM-001` + `Garam RM-002` sesuai material |
| D9-CONS-08 | Inspect saved consumption | LOT relation mengarah ke raw material LOT yang benar | PASS - LOT `RM-20260917-00001` + `RM-20260917-00002` sesuai |

## B. Production LOT Validation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-LOT-01 | Scan/input QR LOT yang benar untuk current material step | LOT diterima; material, warehouse, available quantity tampil | PASS - `PO-20260916-00001`, LOT `RM-20260917-00001`/`00002` diterima saat produksi |
| D9-LOT-02 | Scan/input QR invalid | Ditolak dengan error jelas; detail sensitive tidak bocor | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-03 | Scan/input LOT material berbeda | Ditolak `wrong material` atau equivalent | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-04 | Scan/input LOT warehouse berbeda | Ditolak `wrong warehouse` atau equivalent | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-05 | Scan/input blocked LOT | Ditolak; LOT tidak dapat dipakai | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-06 | Scan/input expired LOT | Ditolak; LOT tidak dapat dipakai | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-07 | Scan/input depleted LOT | Ditolak; available quantity `0` tidak dapat dipakai | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-08 | Validate LOT lalu isi actual `0` | Posting consumption ditolak; LOT validation saja tidak mengurangi stock | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-LOT-09 | Pilih LOT manual dari daftar available | Manual LOT selection mengisi material, LOT number, dan available quantity yang benar | [ ] |
| D9-LOT-10 | Operator tidak ditugaskan mencoba validasi LOT | Ditolak unauthorized/forbidden; PO detail tidak bocor | PASS - automated unit coverage (`production_order_not_assigned_operator`); no production mutation |
| D9-LOT-11 | Validate LOT pada locked/future step | Ditolak `step_not_current` atau equivalent | PASS - automated unit coverage (`step_not_current`); no production mutation |

## C. Multi-LOT Behavior

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-MLOT-01 | Consumption dengan satu LOT | Berhasil; total actual sama dengan quantity line | PASS - `PO-20260916-00001` single LOT per step, actual 20 per line |
| D9-MLOT-02 | Consumption dengan dua LOT dalam satu step | Berhasil; total actual adalah jumlah kedua line | N/A - produksi nyata memakai single LOT per step; multi-LOT dicakup automated tests |
| D9-MLOT-03 | Consumption dengan tiga LOT dalam satu step | Berhasil; total actual adalah jumlah ketiga line | N/A - produksi nyata memakai single LOT per step; multi-LOT dicakup automated tests |
| D9-MLOT-04 | Tambahkan duplicate LOT line | Duplicate dicegah di frontend atau ditolak backend | PASS - automated unit coverage (frontend 47/47 + backend); no production mutation |
| D9-MLOT-05 | Tambahkan LOT dari material berbeda | Ditolak; tidak ada partial consumption | PASS - automated unit coverage (backend 46/46); no production mutation |
| D9-MLOT-06 | Post actual melebihi available LOT | Ditolak; stock tidak berubah | PASS - automated unit coverage (backend 46/46 + frontend 47/47); no production mutation |
| D9-MLOT-07 | Inspect response/result setelah posting | Total actual dihitung backend, bukan hanya trust client | PASS - movement actual 20/line sesuai posting backend `PO-20260916-00001` |
| D9-MLOT-08 | Gunakan decimal quantity valid | Decimal calculation, total, before/after, dan variance benar | PASS - automated unit coverage; no production mutation |

## D. Stock Deduction and Transaction Safety

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-STOCK-01 | Post authorized consumption | Stock berkurang berdasarkan actual quantity | PASS - `PO-20260916-00001`: Gula dan Garam masing-masing berkurang 20 |
| D9-STOCK-02 | Bandingkan recipe target vs actual | Recipe target tidak dipakai sebagai stock deduction bila actual berbeda | [ ] |
| D9-STOCK-03 | Single LOT consumption | Single LOT stock deduction benar | PASS - `RM-20260917-00001`/`00002` masing-masing -20 tepat satu line |
| D9-STOCK-04 | Multi-LOT consumption | Setiap LOT berkurang sesuai actual line masing-masing | N/A - produksi nyata memakai single LOT per step |
| D9-STOCK-05 | Inspect stock movement | Quantity before benar | PASS - before 20 sesuai movement `PO-20260916-00001` |
| D9-STOCK-06 | Inspect stock movement | Quantity after benar | PASS - after 0 sesuai movement `PO-20260916-00001` |
| D9-STOCK-07 | Inspect stock movement type | `PRODUCTION_CONSUMPTION` terbentuk | PASS - movement `Productionconsumption` tercatat untuk kedua LOT |
| D9-STOCK-08 | Post melebihi available | Negative stock dicegah | PASS - automated unit coverage; no production mutation |
| D9-STOCK-09 | Consume exact available quantity | Stock dapat habis tepat ke `0`; tidak negative | PASS - kedua LOT habis tepat 20→0, tidak negative |
| D9-STOCK-10 | Concurrent consumption terhadap LOT sama | Hanya satu transaksi berhasil atau total tidak melebihi available | PASS - automated coverage (integration concurrency); no production mutation |
| D9-STOCK-11 | Force transaction failure | Semua perubahan rollback | PASS - automated coverage; no production mutation |
| D9-STOCK-12 | Inspect database setelah failure | Tidak ada orphan `MaterialConsumption` | PASS - automated coverage; no production mutation |
| D9-STOCK-13 | Inspect database setelah failure | Tidak ada orphan `StockMovement` | PASS - automated coverage; no production mutation |
| D9-STOCK-14 | Failure setelah consumption sebelum step complete | Step complete hanya terjadi setelah commit berhasil | PASS - automated coverage; no production mutation |
| D9-STOCK-15 | Failure sebelum unlock next step | Next step unlock hanya setelah commit berhasil | PASS - automated coverage; no production mutation |

## E. Target vs Actual and Tolerance

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-VAR-01 | Input actual sama dengan target | Within tolerance; variance quantity `0` | PASS - automated unit coverage (tolerance service); produksi nyata selesai tanpa deviation |
| D9-VAR-02 | Input actual sedikit di bawah target dan masih within tolerance | Within tolerance; dapat complete tanpa approval | PASS - automated unit coverage; no production mutation |
| D9-VAR-03 | Input actual sedikit di atas target dan masih within tolerance | Within tolerance; dapat complete tanpa approval | PASS - automated unit coverage; no production mutation |
| D9-VAR-04 | Input actual tepat di minimum tolerance boundary | Diterima | PASS - automated unit coverage (boundary inclusive); no production mutation |
| D9-VAR-05 | Input actual tepat di maximum tolerance boundary | Diterima | PASS - automated unit coverage (boundary inclusive); no production mutation |
| D9-VAR-06 | Input actual di bawah minimum tolerance | Mendeteksi `Requires Approval`; stock belum dipost bila approval required | PASS - automated unit coverage; no production mutation |
| D9-VAR-07 | Input actual di atas maximum tolerance | Mendeteksi `Requires Approval`; stock belum dipost bila approval required | PASS - automated unit coverage; no production mutation |
| D9-VAR-08 | Inspect variance | Variance quantity benar | [ ] |
| D9-VAR-09 | Inspect variance percentage bila digunakan | Variance percentage benar dan rounding konsisten | [ ] |
| D9-VAR-10 | Refresh saat pending deviation | Pending deviation state tetap tampil | N/A - tidak pernah ada pending deviation di production |

## F. Frontend Material Step

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-FE-01 | Scan QR pada material step | QR scan berjalan dan mengisi LOT yang benar | [ ] |
| D9-FE-02 | Pilih LOT manual | Manual LOT selection berjalan | [ ] |
| D9-FE-03 | Validasi correct LOT | Correct LOT tampil dengan metadata benar | [ ] |
| D9-FE-04 | Validasi wrong LOT | Error tampil jelas dan line tidak ditambahkan | PASS - automated unit coverage (frontend 47/47); no production mutation |
| D9-FE-05 | Lihat LOT line | Available quantity tampil | [ ] |
| D9-FE-06 | Isi actual quantity | Input menerima quantity valid dan menolak invalid | [ ] |
| D9-FE-07 | Klik add LOT | LOT line bertambah sesuai validasi | [ ] |
| D9-FE-08 | Klik remove LOT | LOT line dihapus dan total recalculated | [ ] |
| D9-FE-09 | Tambahkan beberapa LOT | Multi-LOT tampil jelas | [ ] |
| D9-FE-10 | Ubah quantity beberapa LOT | Total actual tampil benar | [ ] |
| D9-FE-11 | Bandingkan target dan actual | Variance tampil benar | [ ] |
| D9-FE-12 | Bandingkan tolerance | Tolerance status tampil | [ ] |
| D9-FE-13 | Complete within tolerance | Dapat complete dan next step hanya terbuka setelah backend success | [ ] |
| D9-FE-14 | Simulasikan backend failure | Backend failure tidak membuka next step | PASS - automated unit coverage; no production mutation |
| D9-FE-15 | Test mobile camera | Mobile camera scan usable; permission/error state jelas | N/A - membutuhkan active material step; PO sudah completed, tidak ada mutasi di prod |
| D9-FE-16 | Test tablet viewport | Layout tablet usable tanpa horizontal overflow | [ ] |

## G. Tutorial Material Simulation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-TUT-01 | Buka tutorial recipe dengan material step | Material step tutorial tetap dynamic dari recipe preview | PASS - `Sambal Botol 250ml Standard V3` tutorial berjalan end-to-end |
| D9-TUT-02 | Simulate LOT | Simulated LOT dapat ditambahkan tanpa validasi backend production | PASS - simulated LOT + final summary tampil |
| D9-TUT-03 | Isi actual quantity simulation | Actual quantity simulation berjalan dan total/variance terhitung | PASS - Target/Actual 100/100, Yield 100% tampil di summary |
| D9-TUT-04 | Tambahkan multi-LOT simulation | Multi-LOT simulation berjalan lokal | PASS - tutorial selesai sampai final summary di production tanpa mutasi |
| D9-TUT-05 | Inspect inventory setelah tutorial | Tutorial tidak mengubah `CurrentQuantity` | PASS - inventory `RM-001` tetap 10 KG (screenshot); tidak ada perubahan dari tutorial |
| D9-TUT-06 | Inspect database/network setelah tutorial | Tutorial tidak membuat `MaterialConsumption` | PASS - stock movement tetap 6 baris nyata, tanpa baris tutorial (screenshot) |
| D9-TUT-07 | Inspect database/network setelah tutorial | Tutorial tidak membuat `StockMovement` | PASS - tidak ada movement baru dari tutorial (screenshot) |

## Automated Evidence

- Backend unit tests cover LOT validation, quantity validation, material/warehouse/blocked/expired/depleted checks, stock deduction, transaction rollback, and concurrency (backend 46/46 Day-9 scope hijau; full unit 233/233 hijau).
- Frontend tests cover material step UI state, total actual, duplicate prevention, backend failure gating, and tutorial material simulation (frontend 47/47 hijau).
- Production evidence includes only authorized operational consumption (`PO-20260916-00001`, LOT `RM-20260917-00001`/`00002`, before 20 after 0 per line, movement `Productionconsumption`), with before/after quantities and stock movement IDs. Tidak ada local/staging; item yang dilarang di prod memakai evidence automated tests dengan catatan eksplisit.
