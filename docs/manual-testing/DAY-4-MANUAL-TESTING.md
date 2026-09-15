# Day 4 QA: LOT Management + QR + Frontend Receiving

Tulis `PASS` / `FAIL` / `BLOCKED` / `N/A` di kolom Hasil. Setiap `FAIL` wajib screenshot + `traceId`.

## Klasifikasi environment

| Run | Aturan |
| --- | --- |
| `LOCAL_DISPOSABLE` | Docker dev, data boleh hilang. Satu-satunya tempat untuk scan-test berulang, print-test, post 2-tab, token invalid sengaja |
| `SHARED_QA` / `STAGING` | Data tidak boleh hilang. Boleh 1 receiving uji + posting yang disetujui; label test langsung dibuang |
| `PRODUCTION` | **Read-only + verifikasi LOT nyata** (LOT `RM-20260916-00001` sudah ada dari Day 3). Dilarang create/posting coba-coba, print massal, dan scan dari URL tebakan |

## Persiapan

1. Day 3 selesai: minimal 1 receiving POSTED + 1 LOT (`RM-20260916-00001`, `Gula Pasir`, 10 KG, `LOT1`).
2. Prod wajib HTTPS (kamera dan QR resolve membutuhkan secure context + JWT + `lots.view`).
3. Siapkan 1 printer/label test (local) — jangan print massal di prod.
4. `QR_BASE_URL` sudah dikonfigurasi per environment (default `https://mosa.domain`). Jangan ganti setelah label dicetak — label lama mengarah ke host lama.

## 1. LOT List & Detail (semua: baca)

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D4-LOT-01 | SEMUA | `Warehouse > Lots`: cek list + pagination | List + `totalItems` + halaman benar | [ ] |
| D4-LOT-02 | SEMUA | Buka `RM-20260916-00001` | Material/supplier/supplier-LOT/warehouse/qty awal=current 10 KG/tanggal/GR ref/QR tampil | [ ] |
| D4-LOT-03 | SEMUA | Search `rm-20260916` (lowercase), `lot1`, `gula` | Ketemu (case-insensitive) | [ ] |
| D4-LOT-04 | SEMUA | Filter material/supplier/warehouse/status/expiry | Hasil sesuai; expiry filter hanya LOT berekspirasi (non-expiry terkecuali by-design) | [ ] |
| D4-LOT-05 | SEMUA | Pastikan tidak ada tombol edit quantity | Mutasi hanya via receiving-post/consumption/opname/adjustment — tidak ada PUT/PATCH LOT | [ ] |
| D4-LOT-06 | SEMUA | Sebagai viewer tanpa `lots.view` | 403 terkontrol | [ ] |

## 2. QR (semua: baca; tulis hanya local)

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D4-QR-01 | SEMUA | Detail LOT: token tampil, buka ulang halaman | Token sama (stabil, tidak regenerate); LOT berbeda token berbeda | [ ] |
| D4-QR-02 | SEMUA | `Warehouse > Lots > Scan`: scan label `RM-20260916-00001` (atau paste payload) | Membuka LOT yang tepat | [ ] |
| D4-QR-03 | LOCAL/STAGING | Scan QR rusak/acak | Error terkontrol (`400` format / `404` tidak ditemukan), app tidak crash | [ ] |
| D4-QR-04 | SEMUA | Print 1 label → Reprint 1 label | Label berisi material/internal-LOT/supplier-LOT/warehouse/receiving-date/expiry; reprint token sama, tanpa LOT baru | [ ] |
| D4-QR-05 | SEMUA | Tolak izin kamera di browser | Pesan ramah + pencarian manual tetap tersedia, tanpa crash | [ ] |

Catatan: payload QR hanya token (`<host>/q/rm/<token>`), tanpa info stok — stok selalu dibaca dari server. Token spasi/newline dari scanner dinormalisasi sebelum resolve.

## 3. Frontend Receiving (tulis: local/staging; prod: baca + 1 nyata)

| ID | Scope | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- | --- |
| D4-GR-01 | SEMUA | List + search + filter + pagination | Sesuai Day 3 | [ ] |
| D4-GR-02 | LOCAL/STAGING | Create draft multi-item + remove 1 item + Save | Toast sukses; double-click Save tidak membuat dokumen ganda (guard) | [ ] |
| D4-GR-03 | LOCAL/STAGING | Edit draft + detail + Post confirm | Dialog menyebut LOT+stok; Post sukses; double-click Post diblokir UI + backend 1-sukses-1-gagal | [ ] |
| D4-GR-04 | SEMUA | Dokumen POSTED | Read-only (banner, form disabled, Save/Post hidden); LOT per item bisa diklik langsung ke detail (`Membuka...` → `/lots/:id`, fallback list bila gagal) | [ ] |
| D4-GR-05 | SEMUA | 1440 / 768 / 375 list + form + dialog Post | Dialog scroll; sticky Save/Post terlihat; tanpa scroll horizontal | [ ] |

## 4. Verifikasi production saat ini (wajib)

| ID | Langkah | Lolos jika | Hasil |
| --- | --- | --- | --- |
| D4-PROD-01 | Buka LOT `RM-20260916-00001` | AVAILABLE, 10 KG, `LOT1`, ref `GR-20260916-0001`, QR tampil | [ ] |
| D4-PROD-02 | Scan QR labelnya dari halaman Scan | Membuka LOT yang sama | [ ] |
| D4-PROD-03 | Print 1 label fisik, tempel ke karung/bin, scan ulang | Terbaca + cocok dengan layar | [ ] |
| D4-PROD-04 | `Stock Movements` ref GR tersebut | 1 baris RECEIVING `0 → 10` | [ ] |
| D4-PROD-05 | `Audit Trail` | `goodsreceiving.created/posted` ada | [ ] |

## Yang DILARANG di prod

* Create/posting receiving dummy, scan URL tebakan, share `localStorage` token, print massal test, ubah `QR_BASE_URL` setelah label beredar, instruksi “edit POSTED via API”.

## Sign-off

| Tester | Tanggal | Env | Browser/Device | Hasil | Catatan FAIL (ID + traceId) |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | ☐ PASS ☐ FAIL |  |
