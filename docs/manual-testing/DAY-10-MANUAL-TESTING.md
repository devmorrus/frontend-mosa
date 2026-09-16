# Day 10 Deviation and Supervisor Approval

Checklist ini mencakup deviation request untuk consumption di luar tolerance, supervisor queue, approve/reject, guided production hardening, frontend operator flow, dan tutorial deviation simulation. Tulis `PASS`, `FAIL`, `BLOCKED`, atau `N/A`. Untuk `FAIL`, catat timestamp, user, URL, screenshot, request/response status, dan `traceId`.

## Safety Gate

1. Gunakan production hanya untuk deviation yang memang terjadi pada operasi nyata dan sudah diotorisasi.
2. Jangan membuat deviation, approval, rejection, consumption, stock movement, atau correction dummy di production.
3. Negative case, unauthorized access, double approve/reject, insufficient stock, concurrency, dan transaction failure wajib diuji di local/staging atau automated tests.
4. Approval production akan memposting consumption dan mengurangi stock; lakukan hanya oleh supervisor yang berwenang dan sesuai prosedur operasional.
5. Rejection production akan menahan step dan meminta correction; lakukan hanya jika memang keputusan operasional yang benar.
6. Tutorial deviation simulation aman dijalankan karena tidak boleh membuat deviation nyata, mengubah inventory, atau mengubah Production Order.

## Accounts and Preconditions

| Account | Required permission | Purpose |
| --- | --- | --- |
| Assigned Operator | `production-orders.execute` | Membuat request approval saat actual di luar tolerance |
| Supervisor/Approver | deviation approval permission sesuai policy | Melihat queue, approve, reject |
| Unauthorized User | Tanpa permission approval atau tanpa assignment | Memastikan akses ditolak |
| Admin/Auditor | Read-only production, inventory, audit permission sesuai policy | Verifikasi audit dan stock movement |

Pastikan tersedia PO `IN_PROGRESS` dengan current material step, tolerance recipe tersimpan, LOT valid, dan stok cukup. Untuk production, hanya lanjutkan deviation jika actual usage benar-benar berada di luar tolerance dan membutuhkan approval operasional.

## A. Deviation Request

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-DEV-01 | Input actual outside tolerance dengan reason lalu request approval | Deviation request berhasil dibuat | [ ] |
| D10-DEV-02 | Input actual outside tolerance tanpa reason di local/staging | Request ditolak; no deviation created | [ ] |
| D10-DEV-03 | Input actual within tolerance lalu complete | Tidak membuat deviation; flow normal | [ ] |
| D10-DEV-04 | Inspect deviation | Target tersimpan | [ ] |
| D10-DEV-05 | Inspect deviation | Actual tersimpan | [ ] |
| D10-DEV-06 | Inspect deviation | Variance tersimpan | [ ] |
| D10-DEV-07 | Inspect deviation | Tolerance snapshot tersimpan | [ ] |
| D10-DEV-08 | Inspect deviation | `RequestedBy` tercatat | [ ] |
| D10-DEV-09 | Inspect deviation | `RequestedAt` tercatat | [ ] |
| D10-DEV-10 | Inspect pending deviation | Pending consumption/LOT usage tersimpan | [ ] |
| D10-DEV-11 | Inspect step setelah request | Step menjadi `WAITING_APPROVAL` atau equivalent | [ ] |
| D10-DEV-12 | Inspect next step setelah request | Next step tetap `Locked` | [ ] |
| D10-DEV-13 | Inspect inventory setelah request | Stock belum berubah | [ ] |
| D10-DEV-14 | Inspect stock movement setelah request | Stock movement belum dibuat | [ ] |
| D10-DEV-15 | Request approval kedua untuk step yang sama di local/staging | Duplicate pending request dicegah | [ ] |
| D10-DEV-16 | Refresh operator page saat waiting approval | Waiting approval state tetap tampil | [ ] |

## B. Supervisor Queue

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-QUEUE-01 | Login supervisor, buka deviation approval queue | Pending queue tampil | [ ] |
| D10-QUEUE-02 | Filter by status | Status filter berjalan | [ ] |
| D10-QUEUE-03 | Filter by date | Date filter berjalan | [ ] |
| D10-QUEUE-04 | Filter by production order | Production Order filter berjalan | [ ] |
| D10-QUEUE-05 | Navigasi pagination | Pagination berjalan dan tidak duplikat/missing item | [ ] |
| D10-QUEUE-06 | Buka deviation detail | Deviation detail tampil | [ ] |
| D10-QUEUE-07 | Inspect detail | Target tampil | [ ] |
| D10-QUEUE-08 | Inspect detail | Actual tampil | [ ] |
| D10-QUEUE-09 | Inspect detail | Variance tampil | [ ] |
| D10-QUEUE-10 | Inspect detail | Tolerance tampil | [ ] |
| D10-QUEUE-11 | Inspect detail | LOT usage tampil | [ ] |
| D10-QUEUE-12 | Inspect detail | Operator reason tampil | [ ] |
| D10-QUEUE-13 | Unauthorized user membuka queue/detail di local/staging | Ditolak forbidden/unauthorized; detail tidak bocor | [ ] |

## C. Approve Flow

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-APP-01 | Supervisor approve pending deviation authorized | Approval berhasil | [ ] |
| D10-APP-02 | Inspect approved deviation | Approver tercatat | [ ] |
| D10-APP-03 | Inspect approved deviation | `ApprovedAt` tercatat | [ ] |
| D10-APP-04 | Approve setelah stock berubah di local/staging | Stock di-revalidate sebelum posting | [ ] |
| D10-APP-05 | Approve multi-LOT deviation di local/staging | Multi-LOT di-revalidate sebelum posting | [ ] |
| D10-APP-06 | Inspect consumption setelah approve | Actual consumption dipost | [ ] |
| D10-APP-07 | Inspect inventory setelah approve | Stock berkurang berdasarkan actual | [ ] |
| D10-APP-08 | Inspect stock movement setelah approve | Stock movement terbentuk | [ ] |
| D10-APP-09 | Inspect production step setelah approve | Step menjadi `Completed` | [ ] |
| D10-APP-10 | Inspect next step setelah approve | Next step menjadi `Ready` | [ ] |
| D10-APP-11 | Inspect audit | Audit lengkap: request, approve, consumption, unlock | [ ] |
| D10-APP-12 | Double approve request yang sama di local/staging | Request kedua ditolak; no duplicate consumption | [ ] |
| D10-APP-13 | Approve rejected request di local/staging | Ditolak; state tidak berubah | [ ] |
| D10-APP-14 | Approve saat stock insufficient di local/staging | Ditolak; tidak menyebabkan negative stock | [ ] |
| D10-APP-15 | Force transaction failure saat approve di test environment | Semua perubahan rollback | [ ] |

## D. Reject Flow

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-REJ-01 | Supervisor reject pending deviation dengan reason | Reject berhasil | [ ] |
| D10-REJ-02 | Reject tanpa reason di local/staging | Ditolak; request tetap pending | [ ] |
| D10-REJ-03 | Inspect rejected deviation | `ReviewedBy` tercatat | [ ] |
| D10-REJ-04 | Inspect rejected deviation | `ReviewedAt` tercatat | [ ] |
| D10-REJ-05 | Inspect inventory setelah reject | Stock tidak berubah | [ ] |
| D10-REJ-06 | Inspect stock movement setelah reject | Stock movement tidak dibuat | [ ] |
| D10-REJ-07 | Inspect production step setelah reject | Step tetap belum completed | [ ] |
| D10-REJ-08 | Inspect next step setelah reject | Next step tetap locked | [ ] |
| D10-REJ-09 | Operator refresh setelah reject | Operator melihat correction required | [ ] |
| D10-REJ-10 | Operator melakukan correction | Correction dapat dilakukan pada step yang sama sesuai policy | [ ] |
| D10-REJ-11 | Operator resubmit setelah correction | Resubmit dapat dilakukan dan request baru/updated sesuai policy | [ ] |
| D10-REJ-12 | Reject approved request di local/staging | Ditolak; approved state tidak berubah | [ ] |

## E. Guided Production Hardening

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-HARD-01 | Direct API request ke future step di local/staging | Ditolak backend | [ ] |
| D10-HARD-02 | Saat step waiting approval, coba buka/complete next step | Waiting approval memblokir next step | [ ] |
| D10-HARD-03 | Setelah rejected deviation, coba buka/complete next step | Rejected deviation memblokir next step | [ ] |
| D10-HARD-04 | Setelah approved deviation | Approved deviation membuka next step sesuai sequence | [ ] |
| D10-HARD-05 | Complete timer sebelum elapsed di local/staging | Timer premature completion ditolak | [ ] |
| D10-HARD-06 | Refresh timer berjalan | Timer refresh-safe dari server timestamp | [ ] |
| D10-HARD-07 | Complete check step tanpa confirmation di local/staging | Check confirmation wajib | [ ] |
| D10-HARD-08 | Complete step dua kali di local/staging | Double complete ditolak | [ ] |
| D10-HARD-09 | Concurrent complete di integration/local | Concurrent complete aman; no duplicate unlock/consumption | [ ] |

## F. Frontend Operator Flow

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-FE-01 | Input actual outside tolerance | Outside tolerance state tampil | [ ] |
| D10-FE-02 | Lihat material step | Allowed range tampil | [ ] |
| D10-FE-03 | Lihat variance | Variance tampil benar | [ ] |
| D10-FE-04 | Outside tolerance state | Reason field tersedia dan required | [ ] |
| D10-FE-05 | Klik request approval dengan reason | Request approval berjalan; no stock mutation before approval | [ ] |
| D10-FE-06 | Setelah request | Waiting approval screen tersedia | [ ] |
| D10-FE-07 | Refresh status approval | Approval status refresh berjalan | [ ] |
| D10-FE-08 | Setelah approved | Approved result tampil | [ ] |
| D10-FE-09 | Setelah rejected | Rejected result tampil | [ ] |
| D10-FE-10 | Rejected detail | Supervisor notes tampil | [ ] |
| D10-FE-11 | Correction after rejection | Correction flow berjalan | [ ] |
| D10-FE-12 | Lock/unlock UI | Next step lock/unlock benar sesuai backend state | [ ] |

## G. Tutorial Deviation Simulation

| ID | Action | Expected result | Result |
| --- | --- | --- | --- |
| D10-TUT-01 | Tutorial material actual within tolerance | Within tolerance simulation berjalan | [ ] |
| D10-TUT-02 | Tutorial material actual outside tolerance | Outside tolerance simulation berjalan | [ ] |
| D10-TUT-03 | Klik simulate request approval | Simulate request approval berjalan lokal | [ ] |
| D10-TUT-04 | Setelah simulate request | Waiting approval simulation tampil | [ ] |
| D10-TUT-05 | Klik simulate approved | Approved simulation berjalan dan membuka flow tutorial sesuai state lokal | [ ] |
| D10-TUT-06 | Klik simulate rejected | Rejected simulation berjalan | [ ] |
| D10-TUT-07 | Rejected simulation | Correction dijelaskan | [ ] |
| D10-TUT-08 | Inspect database/network setelah tutorial | Tutorial tidak membuat deviation real | [ ] |
| D10-TUT-09 | Inspect inventory setelah tutorial | Tutorial tidak mengubah inventory | [ ] |
| D10-TUT-10 | Inspect PO setelah tutorial | Tutorial tidak mengubah Production Order | [ ] |

## Automated Evidence

- Backend unit/integration tests should cover deviation creation, tolerance boundaries, pending state, approval/rejection state transitions, stock revalidation, transaction rollback, duplicate requests, double approval/rejection, unauthorized access, and concurrency.
- Frontend tests should cover outside tolerance UI, reason validation, waiting approval, approved/rejected states, correction flow, and tutorial deviation simulation.
- Production evidence should include only authorized operational deviations and approvals, with before/after stock, deviation ID, consumption ID, stock movement ID, and audit timestamps.
