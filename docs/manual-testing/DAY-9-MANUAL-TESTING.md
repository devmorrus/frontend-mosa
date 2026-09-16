# Day 9 Material Consumption, QR Validation, and Multi-LOT

Checklist ini mencakup material consumption nyata, validasi LOT/QR, multi-LOT, stock deduction, target vs actual, frontend material step, dan tutorial material simulation. Tulis `PASS`, `FAIL`, `BLOCKED`, atau `N/A`. Untuk `FAIL`, catat timestamp, user, URL, screenshot, request/response status, dan `traceId`.

## Safety Gate

1. Gunakan production hanya untuk Production Order yang benar-benar dijadwalkan dan operator yang benar-benar ditugaskan.
2. Jangan membuat PO, receiving, LOT, consumption, stock movement, atau inventory adjustment dummy hanya untuk test production.
3. Negative case, invalid QR, wrong LOT, blocked/expired/depleted LOT, duplicate LOT, insufficient stock, concurrency, dan rollback wajib diuji di local/staging atau automated tests.
4. Jangan mengulang consumption pada step/PO yang sudah completed karena stock akan berkurang dua kali jika guard gagal.
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
| D9-CONS-01 | Jalankan migrasi/database startup | Tabel/kolom `MaterialConsumption` tersedia dan migration berhasil | [ ] |
| D9-CONS-02 | Post single LOT consumption authorized | Material consumption tersimpan satu line dengan actual quantity | [ ] |
| D9-CONS-03 | Post multi-LOT consumption authorized di local/staging atau transaksi nyata yang sah | Material consumption tersimpan beberapa line dalam satu step | [ ] |
| D9-CONS-04 | Post quantity `0` di local/staging/API test | Request ditolak; tidak ada consumption/stock movement | [ ] |
| D9-CONS-05 | Post negative quantity di local/staging/API test | Request ditolak; tidak ada consumption/stock movement | [ ] |
| D9-CONS-06 | Inspect saved consumption | Production step relation mengarah ke step execution yang benar | [ ] |
| D9-CONS-07 | Inspect saved consumption | Material relation mengarah ke material recipe/raw material yang benar | [ ] |
| D9-CONS-08 | Inspect saved consumption | LOT relation mengarah ke raw material LOT yang benar | [ ] |

## B. Production LOT Validation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-LOT-01 | Scan/input QR LOT yang benar untuk current material step | LOT diterima; material, warehouse, available quantity tampil | [ ] |
| D9-LOT-02 | Scan/input QR invalid di local/staging | Ditolak dengan error jelas; detail sensitive tidak bocor | [ ] |
| D9-LOT-03 | Scan/input LOT material berbeda di local/staging | Ditolak `wrong material` atau equivalent | [ ] |
| D9-LOT-04 | Scan/input LOT warehouse berbeda di local/staging | Ditolak `wrong warehouse` atau equivalent | [ ] |
| D9-LOT-05 | Scan/input blocked LOT di local/staging | Ditolak; LOT tidak dapat dipakai | [ ] |
| D9-LOT-06 | Scan/input expired LOT di local/staging | Ditolak; LOT tidak dapat dipakai | [ ] |
| D9-LOT-07 | Scan/input depleted LOT di local/staging | Ditolak; available quantity `0` tidak dapat dipakai | [ ] |
| D9-LOT-08 | Validate LOT lalu isi actual `0` di local/staging | Posting consumption ditolak; LOT validation saja tidak mengurangi stock | [ ] |
| D9-LOT-09 | Pilih LOT manual dari daftar available | Manual LOT selection mengisi material, LOT number, dan available quantity yang benar | [ ] |
| D9-LOT-10 | Operator tidak ditugaskan mencoba validasi LOT di local/staging | Ditolak unauthorized/forbidden; PO detail tidak bocor | [ ] |
| D9-LOT-11 | Validate LOT pada locked/future step di local/staging | Ditolak `step_not_current` atau equivalent | [ ] |

## C. Multi-LOT Behavior

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-MLOT-01 | Consumption dengan satu LOT | Berhasil; total actual sama dengan quantity line | [ ] |
| D9-MLOT-02 | Consumption dengan dua LOT di local/staging atau transaksi nyata sah | Berhasil; total actual adalah jumlah kedua line | [ ] |
| D9-MLOT-03 | Consumption dengan tiga LOT di local/staging | Berhasil; total actual adalah jumlah ketiga line | [ ] |
| D9-MLOT-04 | Tambahkan duplicate LOT line | Duplicate dicegah di frontend atau ditolak backend | [ ] |
| D9-MLOT-05 | Tambahkan LOT dari material berbeda di local/staging | Ditolak; tidak ada partial consumption | [ ] |
| D9-MLOT-06 | Post actual melebihi available LOT di local/staging | Ditolak; stock tidak berubah | [ ] |
| D9-MLOT-07 | Inspect response/result setelah posting | Total actual dihitung backend, bukan hanya trust client | [ ] |
| D9-MLOT-08 | Gunakan decimal quantity valid | Decimal calculation, total, before/after, dan variance benar | [ ] |

## D. Stock Deduction and Transaction Safety

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-STOCK-01 | Post authorized consumption | Stock berkurang berdasarkan actual quantity | [ ] |
| D9-STOCK-02 | Bandingkan recipe target vs actual | Recipe target tidak dipakai sebagai stock deduction bila actual berbeda | [ ] |
| D9-STOCK-03 | Single LOT consumption | Single LOT stock deduction benar | [ ] |
| D9-STOCK-04 | Multi-LOT consumption | Setiap LOT berkurang sesuai actual line masing-masing | [ ] |
| D9-STOCK-05 | Inspect stock movement | Quantity before benar | [ ] |
| D9-STOCK-06 | Inspect stock movement | Quantity after benar | [ ] |
| D9-STOCK-07 | Inspect stock movement type | `PRODUCTION_CONSUMPTION` terbentuk | [ ] |
| D9-STOCK-08 | Post melebihi available di local/staging | Negative stock dicegah | [ ] |
| D9-STOCK-09 | Consume exact available quantity di local/staging | Stock dapat habis tepat ke `0`; tidak negative | [ ] |
| D9-STOCK-10 | Concurrent consumption terhadap LOT sama di test/integration | Hanya satu transaksi berhasil atau total tidak melebihi available | [ ] |
| D9-STOCK-11 | Force transaction failure di test environment | Semua perubahan rollback | [ ] |
| D9-STOCK-12 | Inspect database setelah failure | Tidak ada orphan `MaterialConsumption` | [ ] |
| D9-STOCK-13 | Inspect database setelah failure | Tidak ada orphan `StockMovement` | [ ] |
| D9-STOCK-14 | Simulasikan failure setelah consumption sebelum step complete | Step complete hanya terjadi setelah commit berhasil | [ ] |
| D9-STOCK-15 | Simulasikan failure sebelum unlock next step | Next step unlock hanya setelah commit berhasil | [ ] |

## E. Target vs Actual and Tolerance

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-VAR-01 | Input actual sama dengan target | Within tolerance; variance quantity `0` | [ ] |
| D9-VAR-02 | Input actual sedikit di bawah target dan masih within tolerance | Within tolerance; dapat complete tanpa approval | [ ] |
| D9-VAR-03 | Input actual sedikit di atas target dan masih within tolerance | Within tolerance; dapat complete tanpa approval | [ ] |
| D9-VAR-04 | Input actual tepat di minimum tolerance boundary | Diterima | [ ] |
| D9-VAR-05 | Input actual tepat di maximum tolerance boundary | Diterima | [ ] |
| D9-VAR-06 | Input actual di bawah minimum tolerance | Mendeteksi `Requires Approval`; stock belum dipost bila approval required | [ ] |
| D9-VAR-07 | Input actual di atas maximum tolerance | Mendeteksi `Requires Approval`; stock belum dipost bila approval required | [ ] |
| D9-VAR-08 | Inspect variance | Variance quantity benar | [ ] |
| D9-VAR-09 | Inspect variance percentage bila digunakan | Variance percentage benar dan rounding konsisten | [ ] |
| D9-VAR-10 | Refresh saat pending deviation | Pending deviation state tetap tampil | [ ] |

## F. Frontend Material Step

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-FE-01 | Scan QR pada material step | QR scan berjalan dan mengisi LOT yang benar | [ ] |
| D9-FE-02 | Pilih LOT manual | Manual LOT selection berjalan | [ ] |
| D9-FE-03 | Validasi correct LOT | Correct LOT tampil dengan metadata benar | [ ] |
| D9-FE-04 | Validasi wrong LOT di local/staging | Error tampil jelas dan line tidak ditambahkan | [ ] |
| D9-FE-05 | Lihat LOT line | Available quantity tampil | [ ] |
| D9-FE-06 | Isi actual quantity | Input menerima quantity valid dan menolak invalid | [ ] |
| D9-FE-07 | Klik add LOT | LOT line bertambah sesuai validasi | [ ] |
| D9-FE-08 | Klik remove LOT | LOT line dihapus dan total recalculated | [ ] |
| D9-FE-09 | Tambahkan beberapa LOT | Multi-LOT tampil jelas | [ ] |
| D9-FE-10 | Ubah quantity beberapa LOT | Total actual tampil benar | [ ] |
| D9-FE-11 | Bandingkan target dan actual | Variance tampil benar | [ ] |
| D9-FE-12 | Bandingkan tolerance | Tolerance status tampil | [ ] |
| D9-FE-13 | Complete within tolerance | Dapat complete dan next step hanya terbuka setelah backend success | [ ] |
| D9-FE-14 | Simulasikan backend failure di local/staging | Backend failure tidak membuka next step | [ ] |
| D9-FE-15 | Test mobile camera | Mobile camera scan usable; permission/error state jelas | [ ] |
| D9-FE-16 | Test tablet viewport | Layout tablet usable tanpa horizontal overflow | [ ] |

## G. Tutorial Material Simulation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D9-TUT-01 | Buka tutorial recipe dengan material step | Material step tutorial tetap dynamic dari recipe preview | [ ] |
| D9-TUT-02 | Simulate LOT | Simulated LOT dapat ditambahkan tanpa validasi backend production | [ ] |
| D9-TUT-03 | Isi actual quantity simulation | Actual quantity simulation berjalan dan total/variance terhitung | [ ] |
| D9-TUT-04 | Tambahkan multi-LOT simulation | Multi-LOT simulation berjalan lokal | [ ] |
| D9-TUT-05 | Inspect inventory setelah tutorial | Tutorial tidak mengubah `CurrentQuantity` | [ ] |
| D9-TUT-06 | Inspect database/network setelah tutorial | Tutorial tidak membuat `MaterialConsumption` | [ ] |
| D9-TUT-07 | Inspect database/network setelah tutorial | Tutorial tidak membuat `StockMovement` | [ ] |

## Automated Evidence

- Backend unit/integration tests should cover LOT validation, quantity validation, material/warehouse/blocked/expired/depleted checks, stock deduction, transaction rollback, and concurrency.
- Frontend tests should cover material step UI state, total actual, duplicate prevention, backend failure gating, and tutorial material simulation.
- Production evidence should include only authorized operational consumption, with before/after quantities and stock movement IDs.
