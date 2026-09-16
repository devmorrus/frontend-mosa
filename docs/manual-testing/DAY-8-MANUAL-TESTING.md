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
| D8-QUEUE-01 | Login sebagai assigned operator, buka `Production > My Production` | Queue hanya menampilkan PO `Released` atau `In Progress` milik operator tersebut | [ ] |
| D8-QUEUE-02 | Buka PO milik operator lain melalui URL langsung | Akses ditolak atau tampil `not found`; detail PO tidak bocor | [ ] |
| D8-QUEUE-03 | Pada PO `Released`, klik `Start Production` satu kali | PO berubah `IN_PROGRESS`; tidak ada duplikasi execution | [ ] |
| D8-QUEUE-04 | Refresh setelah start | `StartedBy` dan `StartedAt` tetap; step snapshot tetap sama | [ ] |
| D8-QUEUE-05 | Coba start ulang PO yang sudah `In Progress` | Request ditolak `409`; status dan snapshot tidak berubah | [ ] |
| D8-QUEUE-06 | Coba start PO `Draft` atau `MaterialShortage` di local/staging | Request ditolak; PO tidak berubah menjadi `In Progress` | [ ] |
| D8-QUEUE-07 | Simulasikan exception saat start di test environment | Transaction rollback; status tidak berubah dan tidak ada partial step execution | [ ] |

## B. Recipe Step Snapshot and Current Step

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-STEP-01 | Inspect response `POST /api/production-orders/{id}/start` | `StartedBy`, `StartedAtUtc`, dan recipe step execution snapshot tersedia | [ ] |
| D8-STEP-02 | Inspect execution list/current-step endpoint | Step 1 `Ready` dan `IsCurrent=true`; step berikutnya `Locked` | [ ] |
| D8-STEP-03 | Start step 1 dari operator UI | Step 1 `InProgress`, actor/time tersimpan | [ ] |
| D8-STEP-04 | Coba start/complete step 3 sebelum step 2 selesai | Request ditolak `409 step_not_current`; step 3 tetap `Locked` | [ ] |
| D8-STEP-05 | Complete step 1 | Step 1 `Completed`; step 2 menjadi `Ready` dan current | [ ] |
| D8-STEP-06 | Refresh atau buka current-step URL baru | Current step tetap step 2 dan tidak kembali ke step 1 | [ ] |
| D8-STEP-07 | Complete step yang sudah completed dua kali atau secara bersamaan | Request kedua ditolak; hanya satu completion audit dan satu current step | [ ] |
| D8-STEP-08 | Buka audit trail untuk execution | Start, complete, unlock, actor, timestamp, dan notes tersedia | [ ] |

## C. Process, Timer, Check, and Material Foundation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-TYPE-01 | Start process step lalu complete | Berhasil; next step terbuka | [ ] |
| D8-TYPE-02 | Complete process step tanpa start | Ditolak; step tetap `Ready` | [ ] |
| D8-TIMER-01 | Start timer step | `TimerStartedAtUtc` dan `TimerEndsAtUtc = start + TimerSeconds` tersimpan di server | [ ] |
| D8-TIMER-02 | Refresh saat timer berjalan | Countdown dihitung dari `TimerEndsAtUtc`; refresh tidak mereset timer | [ ] |
| D8-TIMER-03 | Complete sebelum timer selesai | Tombol disabled atau API menolak `timer_not_elapsed`; step tetap `InProgress` | [ ] |
| D8-TIMER-04 | Complete setelah timer selesai | Berhasil; next step menjadi `Ready` | [ ] |
| D8-CHECK-01 | Start check step | Instruction dan check item tampil | [ ] |
| D8-CHECK-02 | Coba complete tanpa confirmation | Ditolak atau tombol disabled; step tetap `InProgress` | [ ] |
| D8-CHECK-03 | Confirm check, isi notes, complete | Berhasil; `IsConfirmed`, confirmer, timestamp, dan notes tersimpan | [ ] |
| D8-MAT-01 | Buka material step | Material name, scaled target, UOM, tolerance, dan instruction tampil | [ ] |
| D8-MAT-02 | Start material step tanpa consumption | Step tetap `InProgress`; completion ditolak dengan `material_step_completion_pending` | [ ] |
| D8-MAT-03 | Verify inventory after Day 8 material attempt | Tidak ada inventory/stock movement mutation; consumption dilakukan dan diverifikasi pada Day 9 | [ ] |

## D. Interactive Guided Recipe Tutorial

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D8-TUT-01 | Buka Recipe detail pada Approved Recipe Version | Tombol `Mulai Tutorial Resep` tersedia | [ ] |
| D8-TUT-02 | Start tutorial | Recipe name/version dibaca dari guided preview API; tidak ada nama recipe hard-coded | [ ] |
| D8-TUT-03 | Jalankan recipe Soto | Step tampil satu per satu dengan current step dan progress | [ ] |
| D8-TUT-04 | Jalankan recipe lain dengan engine yang sama | Step, material, process, timer, check, dan scaling mengikuti recipe lain | [ ] |
| D8-TUT-05 | Pastikan future step tidak menjadi primary content | Hanya current/unlocked step yang aktif; future step tidak dapat dilompati | [ ] |
| D8-TUT-06 | Material step | Material name, scaled target, UOM, tolerance, instruction, LOT simulation, dan actual simulation tampil | [ ] |
| D8-TUT-07 | Process step | Instruction tampil dan `Selesai, Lanjut` membuka step berikutnya | [ ] |
| D8-TUT-08 | Timer step | Start, pause, resume, restart, countdown, dan `Lewati tutorial` bekerja; skip hanya ada pada tutorial timer | [ ] |
| D8-TUT-09 | Check step | Semua confirmation item wajib dipilih sebelum lanjut | [ ] |
| D8-TUT-10 | Klik `Kembali`, lalu coba selesaikan ulang step yang sudah selesai | Tidak ada unlock/progress tambahan; Back hanya untuk review | [ ] |
| D8-TUT-11 | Klik `Keluar`, reload, dan masuk kembali | Progress tersimpan per user + recipe version + target output; dapat dilanjutkan | [ ] |
| D8-TUT-12 | Restart tutorial | Progress, timer, material simulation, deviation simulation, dan final simulation reset | [ ] |
| D8-TUT-13 | Selesaikan semua step dan final summary | Summary menampilkan target/actual simulasi, yield, simulated LOT, QC, dan safety note | [ ] |
| D8-TUT-14 | Inspect browser Network selama tutorial | Tidak ada POST/PUT/DELETE ke production order, inventory, stock movement, consumption, atau QC | [ ] |

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
