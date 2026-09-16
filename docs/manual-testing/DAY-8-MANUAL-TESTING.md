# Day 8 Guided Production and Guided Recipe Tutorial

Checklist ini mencakup eksekusi Production Order oleh operator dan tutorial resep interaktif. Tandai setiap item `PASS`, `FAIL`, `BLOCKED`, atau `N/A`. Untuk `FAIL`, catat timestamp, user, URL, screenshot, response status, dan `traceId`.

## Safety Gate

1. Gunakan production hanya untuk PO yang benar-benar dijadwalkan dan operator yang benar-benar ditugaskan.
2. Jangan membuat PO, receiving, consumption, deviation, atau finished-goods lot dummy hanya untuk test.
3. Jangan menjalankan `Complete Production`, consumption, atau approval tanpa otorisasi operasional.
4. Negative case dan concurrency wajib diuji di local/staging dengan fixture atau test suite, bukan dengan memodifikasi data production.
5. Guided Recipe Tutorial aman dijalankan karena seluruh material, timer, QC, dan final output adalah simulasi lokal; pastikan tidak ada request mutasi ke endpoint produksi/inventory.

## Accounts and Preconditions

| Account | Required permission | Purpose |
| --- | --- | --- |
| Assigned Operator | `production-orders.execute` | Queue dan eksekusi step PO yang ditugaskan |
| Unauthorized Operator | `production-orders.execute` tanpa assignment PO | Memastikan PO operator lain tidak dapat dibuka |
| Supervisor/Admin | `production-orders.view`, `production-orders.start` atau permission sesuai policy | Read-only current step, audit, dan operational support |

Pastikan tersedia PO nyata berstatus `RELEASED`, assigned ke operator yang melakukan test, recipe Approved dengan snapshot step material/process/timer/check, dan stok telah lolos material check.

## A. Operator Queue and Production Start

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-QUEUE-01 | Login sebagai assigned operator, buka `Production > My Production` | Queue hanya menampilkan PO `Released` atau `In Progress` milik operator tersebut | PASS - `PO-20260916-00001` |
| D8-QUEUE-02 | Buka PO milik operator lain melalui URL langsung | Akses ditolak atau tampil `not found`; detail PO tidak bocor | PASS - automated authorization coverage; no production mutation |
| D8-QUEUE-03 | Pada PO `Released`, klik `Start Production` satu kali | PO berubah `IN_PROGRESS`; tidak ada duplikasi execution | PASS - `PO-20260916-00001` |
| D8-QUEUE-04 | Refresh setelah start | `StartedBy` dan `StartedAt` tetap; step snapshot tetap sama | PASS - `PO-20260916-00001` |
| D8-QUEUE-05 | Coba start ulang PO yang sudah `In Progress` | Request ditolak `409`; status dan snapshot tidak berubah | PASS - automated coverage; no production mutation |
| D8-QUEUE-06 | Coba start PO `Draft` atau `MaterialShortage` di local/staging | Request ditolak; PO tidak berubah menjadi `In Progress` | PASS - automated coverage; local/staging only |
| D8-QUEUE-07 | Simulasikan exception saat start di test environment | Transaction rollback; status tidak berubah dan tidak ada partial step execution | PASS - automated coverage; test environment only |

## B. Recipe Step Snapshot and Current Step

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-STEP-01 | Inspect response `POST /api/production-orders/{id}/start` | `StartedBy`, `StartedAtUtc`, dan recipe step execution snapshot tersedia | PASS - `PO-20260916-00001` |
| D8-STEP-02 | Inspect execution list/current-step endpoint | Step 1 `Ready` dan `IsCurrent=true`; step berikutnya `Locked` | PASS - guided production evidence |
| D8-STEP-03 | Start step 1 dari operator UI | Step 1 `InProgress`, actor/time tersimpan | PASS - guided production evidence |
| D8-STEP-04 | Coba start/complete step 3 sebelum step 2 selesai | Request ditolak `409 step_not_current`; step 3 tetap `Locked` | PASS - automated sequential-gate coverage; no production mutation |
| D8-STEP-05 | Complete step 1 | Step 1 `Completed`; step 2 menjadi `Ready` dan current | PASS - guided production evidence |
| D8-STEP-06 | Refresh atau buka current-step URL baru | Current step tetap step 2 dan tidak kembali ke step 1 | PASS - guided production evidence |
| D8-STEP-07 | Complete step yang sudah completed dua kali atau secara bersamaan | Request kedua ditolak; hanya satu completion audit dan satu current step | PASS - automated concurrency/double-completion coverage; no production mutation |
| D8-STEP-08 | Buka audit trail untuk execution | Start, complete, unlock, actor, timestamp, dan notes tersedia | PASS - guided production evidence |

## C. Process, Timer, Check, and Material Foundation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-TYPE-01 | Start process step lalu complete | Berhasil; next step terbuka | N/A - tested recipe has no process step |
| D8-TYPE-02 | Complete process step tanpa start | Ditolak; step tetap `Ready` | N/A - tested recipe has no process step |
| D8-TIMER-01 | Start timer step | `TimerStartedAtUtc` dan `TimerEndsAtUtc = start + TimerSeconds` tersimpan di server | N/A - tested recipe has no timer step |
| D8-TIMER-02 | Refresh saat timer berjalan | Countdown dihitung dari `TimerEndsAtUtc`; refresh tidak mereset timer | N/A - tested recipe has no timer step |
| D8-TIMER-03 | Complete sebelum timer selesai | Tombol disabled atau API menolak `timer_not_elapsed`; step tetap `InProgress` | N/A - tested recipe has no timer step |
| D8-TIMER-04 | Complete setelah timer selesai | Berhasil; next step menjadi `Ready` | N/A - tested recipe has no timer step |
| D8-CHECK-01 | Start check step | Instruction dan check item tampil | N/A - tested recipe has no check step |
| D8-CHECK-02 | Coba complete tanpa confirmation | Ditolak atau tombol disabled; step tetap `InProgress` | N/A - tested recipe has no check step |
| D8-CHECK-03 | Confirm check, isi notes, complete | Berhasil; `IsConfirmed`, confirmer, timestamp, dan notes tersimpan | N/A - tested recipe has no check step |
| D8-MAT-01 | Buka material step | Material name, scaled target, UOM, tolerance, dan instruction tampil | PASS - guided production evidence |
| D8-MAT-02 | Start material step tanpa consumption | Step tetap `InProgress`; completion ditolak dengan `material_step_completion_pending` | PASS - automated coverage; no production mutation |
| D8-MAT-03 | Verify inventory after Day 8 material attempt | Authorized production consumed the material and created the expected stock movement; do not repeat the transaction | PASS - `PO-20260916-00001`, LOT `RM-20260917-00001` |

## D. Interactive Guided Recipe Tutorial

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-TUT-01 | Buka Recipe detail pada Approved Recipe Version | Tombol `Mulai Tutorial Resep` tersedia | PASS - `Sambal Botol 250ml Standard V3` |
| D8-TUT-02 | Start tutorial | Recipe name/version dibaca dari guided preview API; tidak ada nama recipe hard-coded | PASS - `Sambal Botol 250ml Standard V3` |
| D8-TUT-03 | Jalankan recipe Soto | Step tampil satu per satu dengan current step dan progress | N/A - evidence is for `Sambal Botol 250ml Standard V3`, not Soto |
| D8-TUT-04 | Jalankan recipe lain dengan engine yang sama | Step, material, process, timer, check, dan scaling mengikuti recipe lain | N/A - no second recipe was run in this production-safe session |
| D8-TUT-05 | Pastikan future step tidak menjadi primary content | Hanya current/unlocked step yang aktif; future step tidak dapat dilompati | PASS - tutorial completion evidence |
| D8-TUT-06 | Material step | Material name, scaled target, UOM, tolerance, instruction, LOT simulation, dan actual simulation tampil | PASS - tutorial completion evidence |
| D8-TUT-07 | Process step | Instruction tampil dan `Selesai, Lanjut` membuka step berikutnya | N/A - tested recipe has no process step |
| D8-TUT-08 | Timer step | Start, pause, resume, restart, countdown, dan `Lewati tutorial` bekerja; skip hanya ada pada tutorial timer | N/A - tested recipe has no timer step |
| D8-TUT-09 | Check step | Semua confirmation item wajib dipilih sebelum lanjut | N/A - tested recipe has no check step |
| D8-TUT-10 | Klik `Kembali`, lalu coba selesaikan ulang step yang sudah selesai | Tidak ada unlock/progress tambahan; Back hanya untuk review | PASS - regression test and tutorial flow |
| D8-TUT-11 | Klik `Keluar`, reload, dan masuk kembali | Progress tersimpan per user + recipe version + target output; dapat dilanjutkan | PASS - implementation/test evidence |
| D8-TUT-12 | Restart tutorial | Progress, timer, material simulation, deviation simulation, dan final simulation reset | PASS - implementation/test evidence |
| D8-TUT-13 | Selesaikan semua step dan final summary | Summary menampilkan target/actual simulasi, yield, simulated LOT, QC, dan safety note | PASS - final summary screenshot |
| D8-TUT-14 | Inspect browser Network selama tutorial | Tidak ada POST/PUT/DELETE ke production order, inventory, stock movement, consumption, atau QC | PASS - local simulation flow; attach Network screenshot if available |

## E. Responsive and Accessibility Smoke Test

| ID | Viewport | Expected result | Result |
| --- | --- | --- | --- |
| D8-UI-01 | Desktop 1440px | Queue, current step, timer, material fields, and summary readable | [ ] |
| D8-UI-02 | Tablet 768px | Action buttons reachable; no horizontal overflow; sticky action remains usable | [ ] |
| D8-UI-03 | Mobile 375px | Current step is primary; timer and confirmation controls fit viewport; no clipped buttons | [ ] |
| D8-UI-04 | Keyboard navigation | Start/complete/confirmation controls have visible focus and usable labels | [ ] |

## Automated Evidence

- Backend unit tests cover step domain rules, timer timestamps, check confirmation, sequential gate, double completion, and concurrency gate.
- Backend integration tests cover real PostgreSQL transaction/concurrency behavior.
- Frontend unit tests cover recipe tutorial progress isolation and Back/re-completion guard.
- Frontend build must pass; a chunk-size warning alone is non-blocking unless performance budget requires remediation.
