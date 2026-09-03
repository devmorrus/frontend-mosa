# Manual Testing Frontend Day 3: Goods Receiving + Master Data Frontend

## Tujuan
Validasi E2E **frontend** untuk **Goods Receiving (Draft → Posting → Internal LOT + Stock Movement)** dan regresi **Master Data** (Supplier, UOM, Warehouse, Raw Material, Product). Semua langkah dari **browser** (bukan Swagger langsung), kecuali verifikasi LOT/Movement setelah posting via `Warehouse > Raw Material Lots / Stock Movements`.

---

## 1. Setup Role & Akun Login (WAJIB)

> Buat 3 user di `Administration > Users` (atau via seed). Login **logout/login** tiap ganti role untuk cek permission UI (`can()` `src/hooks/useAuth.tsx` → `Sidebar.tsx`).

| Akun | Username contoh | Password contoh | Permission (AppPermissions) | Untuk case |
|---|---|---|---|---|
| **A. Warehouse Manager** | `warehouse.manager` | `Password123!` | `receiving.view, receiving.create, receiving.update, receiving.post, receiving.cancel` + `suppliers.view/create/update`, `warehouses.view/create/update`, `uoms.view/create/update`, `materials.view/create/update`, `products.view/create/update`, `lots.view`, `stock-movements.view` | Semua case **CREATE/EDIT/POST** (`D3-MD-*`, `D3-GR-05..20`, `D3-POST-*`, `D3-ATOM-*`) |
| **B. Viewer** | `warehouse.viewer` | `Password123!` | `receiving.view`, `suppliers.view`, `warehouses.view`, `uoms.view`, `materials.view`, `products.view`, `lots.view` ( **tanpa** `create/update/post`) | Case **D3-PERM-01, D3-MD-09, D3-GR view only** |
| **C. No Access** | `no.access` | `Password123!` | **tanpa** `receiving.*` dan **tanpa** `suppliers/warehouses/materials` (hanya `dashboard.view`) | Case **D3-PERM-02** (403) |

**Cara cek:** setelah login, buka DevTools `Application > LocalStorage > accessToken` decode JWT `roles/permissions`.

---

## 2. Data Master yang Harus Disiapkan & Di-CRUD

> Gunakan **code unik `DAY3`** agar tidak bentrok. Semua create via **UI** (bukan DB) untuk test frontend.

### 2.1 Supplier (Master Data > Suppliers `src/pages/master-data/SuppliersPage.tsx:25`)

| Field UI | Contoh input VALID | Required | Catatan |
|---|---|---|---|
| Code | `SUP-DAY3-ACT` | Ya | Unik `SUP-MANUAL-01`, max 20, `Hash` icon |
| Name | `Supplier Day3 Active` | Ya | `Building2` |
| Phone | `081234567890` | Tidak | `Phone` |
| Email | `sup-day3@mosa.local` | Tidak | format email |
| Address | `Jl. Industri Day3 No.1 Surabaya` | Tidak | `MapPin` |
| Status | `Active` toggle | Ya | `StatusToggle Active/Inactive` |

**Data wajib dibuat:**
1. `SUP-DAY3-ACT` Active (untuk receiving valid `D3-GR-06`)
2. `SUP-DAY3-INACT` Active lalu **Edit → Status Inactive** (untuk `D3-GR-09` supplier inactive ditolak)
3. Satu data duplicate test `SUP-DAY3-DUP` (untuk `D3-MD-04`)

### 2.2 Unit of Measure (Master Data > Units `UnitsPage.tsx:34`)

| Field UI | Contoh input | Required |
|---|---|---|
| Code | `KG-DAY3` | Ya, unik |
| Name | `Kilogram Day3` | Ya |
| Symbol | `kg` | Tidak |
| Status | `Active` | Ya |

**Data:** `KG-DAY3` Active (dipakai Raw Material & Product & Receiving).

### 2.3 Warehouse (Master Data > Warehouses `WarehousesPage.tsx:33`)

| Field UI | Contoh input | Required |
|---|---|---|
| Code | `WH-DAY3-ACT` | Ya, unik |
| Name | `Warehouse Day3 Active` | Ya |
| Status | `Active` | Ya |

**Data:**
1. `WH-DAY3-ACT` Active (`D3-GR-06`)
2. `WH-DAY3-INACT` Active lalu Inactive (`D3-GR-10`)

### 2.4 Raw Material (Master Data > Raw Materials `RawMaterialsPage.tsx:66`)

| Field UI | Contoh input | Required | Catatan |
|---|---|---|---|
| Code | `RM-DAY3-ACT` | Ya, unik |  |
| Name | `Bahan Day3 Active` | Ya |  |
| Category | `Spices` | Tidak | dropdown |
| Unit Of Measure | `KG-DAY3` (pilih dari list **Active only** `unitOfMeasuresApi.listActiveOptions()` `RawMaterialsPage.tsx:96`) | Ya | `mergeCurrentUnit` |
| Has Expiry | `false` | Ya | toggle |
| Shelf Life Days | kosong jika false | Jika HasExpiry=true |  |
| Minimum Stock | `10` | Ya | `>0` |
| Status | `Active` | Ya |  |

**Data wajib:**
1. `RM-DAY3-ACT` HasExpiry=false, UOM `KG-DAY3`, Active (untuk `D3-GR-06`, qty 10)
2. `RM-DAY3-INACT` HasExpiry=false, Active lalu **Inactivate** (untuk `D3-GR-12`)
3. `RM-DAY3-HASEXP` HasExpiry=true, ShelfLife 30, Active (untuk `D3-GR-17`)

### 2.5 Product (Master Data > Products `ProductsPage.tsx:52`)

| Field UI | Contoh | Required |
|---|---|---|
| Code | `PROD-DAY3-ACT` | Ya |
| Name | `Product Day3` | Ya |
| Unit Of Measure | `KG-DAY3` | Ya |
| Shelf Life Days | `60` | Tidak |
| Status | `Active` | Ya |

**Data:** satu `PROD-DAY3-ACT` untuk regresi product.

### 2.6 Goods Receiving Item (Warehouse > Goods Receiving > Create `GoodsReceivingFormPage.tsx:59`)

| Field header | Contoh valid | Required |
|---|---|---|
| Supplier | `SUP-DAY3-ACT` | Ya, Active |
| Warehouse | `WH-DAY3-ACT` | Ya, Active |
| Receiving Date | `2026-09-03` (hari ini) | Ya |
| Notes | `DAY3-TEST valid` | Tidak, max 500 |
| Receiving Number | **auto** `GR-20260903-0001` read-only `GenerateUniqueReceivingNumberAsync:353` | auto |

| Field per Item (`features/goods-receivings/components/ReceivingItemFields.tsx`) | Contoh valid | Required | Catatan |
|---|---|---|---|
| Raw Material | `RM-DAY3-ACT` | Ya, Active | dropdown `rawMaterialsApi.listActiveOptions()` |
| Quantity | `10` | Ya, `>0` | `CreateGoodsReceivingItemInputValidator:152` |
| Unit Of Measure | `KG-DAY3` | Ya, Active | harus match `rawMaterial.unitOfMeasure` |
| Supplier LOT | `SUP-LOT-DAY3-01` atau **kosong** | Tidak, max 100 | kosong = `null` `GoodsReceivingItem.cs:79` |
| Production Date | `2026-09-01` atau kosong | Tidak | nullable |
| Expiry Date | kosong jika `HasExpiry=false`; `2026-12-01` jika true | Kondisional `GoodsReceivingItem.cs:61-73` |  |
| Notes | `Item Day3` | Tidak, max 500 |  |

---

## 3. Master Data Frontend - Regresi (Login sebagai `warehouse.manager`)

| ID | Role | Langkah di browser + Data yang diisi | Harus terlihat |
|---|---|---|---|
| D3-MD-01 | A | Buka **Master Data > Suppliers**, cek header `Total Supplier` `SuppliersPage.tsx:63` `pagination.totalItems`. | Angka sesuai tabel, `MasterDataLoadingState` sebentar lalu tabel. |
| D3-MD-02 | A | **Search `SUP-DAY3`**, ubah `10 / halaman → 20 / halaman`, `Next Page`. | Filter debounce 350ms `useMasterDataModule.ts:84`, pagination update, reset tidak rusak. |
| D3-MD-03 | A | **Create** klik `Add Supplier` → isi `SUP-DAY3-MANUAL-01`, `Supplier Day3 Manual`, `081234567890`, `sup-manual@mosa.local`, `Jl. Manual`, `Active` → Simpan. | `pushToast success Supplier berhasil ditambahkan` `useMasterDataModule.ts:189`, row baru. |
| D3-MD-04 | A | **Duplicate** buat lagi `SUP-DAY3-MANUAL-01` sama persis. | `MasterDataFormFieldError getFieldError(errors,'code') SupplierFormDialog.tsx:328` + `ApiError.errors` 409 `duplicate_receiving_number`; tidak duplicate row. |
| D3-MD-05 | A | **Edit** klik edit `SUP-DAY3-MANUAL-01` ubah `name=Supplier Day3 Updated`, Simpan. | Dialog badge `✎ Edit` `SupplierFormDialog.tsx:55`, toast `berhasil diperbarui`, tabel refresh. |
| D3-MD-06 | A | **Status** klik toggle `Active→Inactive` `MasterDataStatusDialog` Confirm. | Badge `Inactive` + count Inactive naik; filter `Status=Inactive` menemukan. `useMasterDataModule.ts:222`. |
| D3-MD-07 | A | Ulangi untuk **UOM** `KG-DAY3-02`, `KG Manual` (`UnitsPage.tsx:34`), **Warehouse** `WH-DAY3-MANUAL` (`WarehousesPage.tsx:33`), **Raw Material** `RM-DAY3-MANUAL-01` (`RawMaterialsPage.tsx:66` pilih `KG-DAY3`, `minimumStock=10`), **Product** `PROD-DAY3-MANUAL` (`ProductsPage.tsx:52`). | Masing `List/Create/Edit/Status` jalan; `viewer` tidak lihat tombol `Add`. |
| D3-MD-08 | A | **Backend validation di UI**: Supplier tanpa `code`, Raw Material `minimumStock=-5`, Product tanpa `UOM`. | Field merah `MasterDataFormFieldError` + banner `formError` `SupplierFormDialog.tsx:303` dari `ApiError.errors` `useMasterDataModule.ts:199`. |
| D3-MD-09 | B | Login `warehouse.viewer` (`suppliers.view` saja) buka tiap master data. | `Add Supplier` hidden `canCreate=can('suppliers.create') false` `useMasterDataModule.ts:80`; edit/status hidden `canUpdate false`; force URL API 403 `ForbiddenPage`. |
| D3-MD-10 | A | **Responsive** Desktop 1440 / Tablet 768 / Mobile 375: cek toolbar `flex-col sm:flex-row`, hero `lg:flex-row`, tabel `overflow-x-auto`, dialog `max-h-[60vh]`. | Tidak ada tombol terpotong `SuppliersPage.tsx:44`. |

---

## 4. Goods Receiving - Draft (Login sebagai `warehouse.manager` kecuali disebut)

| ID | Role | Langkah + Data | Harus terlihat |
|---|---|---|---|
| D3-GR-01 | A | Buka **Warehouse > Goods Receiving** `/goods-receiving` `GoodsReceivingsPage.tsx:49`, cek card `Total receiving` `143`. | Header `Penerimaan bahan baku...` + toolbar filter siap. |
| D3-GR-02 | A | Ubah `pageSize 10→20`, next page, filter `Status=Draft`. | `goodsReceivingsApi.list(query)` `101`, pagination `totalPages` update. |
| D3-GR-03 | A | Search `GR-` / nama supplier. | Debounce 350ms `GoodsReceivingsPage.tsx:64`, empty → `MasterDataEmptyState`. |
| D3-GR-04 | A | Filter `Supplier=SUP-DAY3-ACT`, `Warehouse=WH-DAY3-ACT`, `dateFrom=2026-09-01 dateTo=2026-09-03`. | Query `supplierId, warehouseId, dateFrom/dateTo` `196`, hasil backend sesuai. |
| D3-GR-05 | A | Klik `Create Receiving` `/goods-receiving/create` `GoodsReceivingFormPage.tsx:59`. Cek dropdown hanya Active. | `suppliersApi.listOptions('ACTIVE')` `72` → `SUP-DAY3-INACT` & `WH-DAY3-INACT` tidak ada. |
| D3-GR-06 | A | **Create Draft VALID**: `Supplier=SUP-DAY3-ACT`, `Warehouse=WH-DAY3-ACT`, `Date=hari ini`, `Notes=DAY3-TEST valid`, tambah Item: `RawMaterial=RM-DAY3-ACT`, `Quantity=10`, `UOM=KG-DAY3`, `Supplier LOT kosong`, `Production Date kosong`, `Expiry kosong` → `Save Draft`. | `goodsReceivingsApi.create` `useGoodsReceivingForm.ts:123` → toast `Draft berhasil dibuat` → redirect `/goods-receiving/{id}` → `Receiving Number GR-20260903-xxxx` auto `GenerateUniqueReceivingNumberAsync:353`, `InternalLot` masih `-`. |
| D3-GR-07 | A | Buat draft kedua sama hari ini (tanpa isi Receiving Number). | Nomor kedua `xxxx+1` (`while ExistsByReceivingNumberAsync` `360`), unique index `20260826062855:104`. |
| D3-GR-08 | A | **Tanpa Supplier**: create draft `Supplier kosong` → `Save Draft`. | Frontend `validateGoodsReceivingForm` → `supplierId` error; backend `SupplierId NotEmpty:119` 400. |
| D3-GR-09 | A | **Supplier inactive**: gunakan `SUP-DAY3-INACT` (bypass DevTools atau buat Active lalu Inactive-kan). | Backend `supplier.IsActive false → BadRequest Supplier is inactive` `265`, UI banner `formError` `GoodsReceivingFormPage.tsx:234`. |
| D3-GR-10 | A | **Warehouse inactive**: `WH-DAY3-INACT`. | Backend `warehouse.IsActive false → BadRequest Warehouse is inactive` `272`. |
| D3-GR-11 | A | **Tanpa Item**: `Remove` semua item → `Save Draft`. | Frontend `ensureAtLeastOneItem` `34` + backend `Items NotEmpty 400` `127`. |
| D3-GR-12 | A | **Raw Material inactive**: Item `RM-DAY3-INACT` `Quantity=10`. | Backend `rawMaterial.IsActive false → BadRequest Raw material X is inactive` `301`. |
| D3-GR-13 | A | **Quantity 0**: Item `Quantity=0`. | Frontend+Backend `>0` `152` + `GoodsReceivingItem.cs:52` → 400 `Quantity must be greater than zero`. |
| D3-GR-14 | A | **Quantity -5**: | Sama 400. |
| D3-GR-15 | A | **Supplier LOT kosong**: `Supplier LOT = ""` → Simpan. | `SupplierLot null` `79` → draft sukses (PASS). |
| D3-GR-16 | A | **Production Date kosong**: | `ProductionDate nullable:16` → sukses. |
| D3-GR-17a | A | **Expiry ditolak jika HasExpiry=false**: `RM-DAY3-ACT` + isi `Expiry=2026-09-10`. | Backend `!HasExpiry && expiry != null → Expiry must be null` `GoodsReceivingItem.cs:70` 400. |
| D3-GR-17b | A | **Expiry wajib jika HasExpiry=true**: `RM-DAY3-HASEXP` + kosongkan `Expiry`. | Backend `HasExpiry && expiry==null → Expiry required` `65` 400. |
| D3-GR-18 | A | **Get Detail**: klik `View Detail` draft. | Ringkasan `Receiving Number/Date/Supplier/Warehouse/Created By` `GoodsReceivingFormPage.tsx:253` muncul; `InternalLot -`. |
| D3-GR-19 | A | **Update Draft**: buka draft `GR-...` DRAFT → ubah `Notes=Updated`, tambah item `RM-DAY3-ACT qty 5`, hapus item lama → `Save Draft`. | `UpdateGoodsReceivingCommandHandler:401` `ClearItems+RemoveRange` sukses jika belum ada LOT; toast `Draft berhasil diperbarui`. |
| D3-GR-20 | A | **Posted tidak dapat diedit**: setelah POST (bab C) buka `/goods-receiving/{id}` edit. | `isReadOnly = detail.status !=='DRAFT'` `31` → banner kuning `tidak dapat diedit` `219`, form `disabled`, `Save Draft` hidden; backend `PUT` 400 `Only draft can be updated` `407`. |

---

## 5. Posting & Internal LOT (Verifikasi via UI Warehouse)

| ID | Role | Langkah + Data | Harus terlihat |
|---|---|---|---|
| D3-POST-01 | A | Buka draft `GR-...` `status DRAFT`, klik `Post Receiving` (`detail.status==='DRAFT' && can('receiving.post')` `58`), confirm `Post Receiving` dialog. | `isPosting spinner` `useGoodsReceivingForm.ts:184` → toast `Receiving berhasil dipost` → badge `POSTED` `207`, `PostedBy=warehouse.manager`, `PostedAt` terisi. |
| D3-POST-02 | A | **Non-Draft reject**: coba POST lagi via DevTools `POST /api/goods-receivings/{id}/post`. | `400 Only draft goods receiving documents can be posted` `541` + tombol Post hilang `canShowPostAction false`. |
| D3-POST-03 | A | **Double POST**: klik Post 2x cepat / 2 tab bersamaan. | 1×200, 1×400; tidak ada LOT duplikat (cek `Raw Material Lots` filter by GR). Transaction `BeginTransactionAsync:550`. |
| D3-POST-04 | A | **Per Item LOT**: setelah POST, buka `Warehouse > Raw Material Lots` search `GR-...` atau `GET /api/raw-material-lots?search=GR-`. | Tiap item → 1 LOT `item.SetInternalLot(lotCode):559` `InternalLot RM-20260903-00001` dll. |
| D3-POST-05 | A | **LOT auto**: 1 receiving 2 item cek urutan. | `RM-YYYYMMDD-xxxxx` `GetNextLotSequenceValueAsync:556` `00001,00002`. |
| D3-POST-06 | A | **Unique**: posting 2 receiving beda tanggal sama. | Index `InternalLotNumber unique` tidak bentrok. |
| D3-POST-07 | A | **Supplier LOT terpisah**: bandingkan input `SUP-LOT-DAY3-01` vs `InternalLotNumber`. | `RawMaterialLot.SupplierLot = input` `63`, `InternalLotNumber = RM-...` generate. |
| D3-POST-08 | A | **Initial Quantity**: buka `Lots/{lotId}` detail. | `InitialQuantity = item.Quantity` `571` `RawMaterialLot.cs:71` = `10`. |
| D3-POST-09 | A | **Current Quantity**: | `CurrentQuantity = Initial` `71` `Available`. |
| D3-POST-10 | A | **Warehouse LOT**: | `WarehouseId = gr.WarehouseId` `568` |
| D3-POST-11 | A | **Material LOT**: | `RawMaterialId = item.RawMaterialId` `566` |
| D3-POST-12 | A | **GR ref**: | `GoodsReceivingId=gr.Id, GoodsReceivingItemId=item.Id` `569` |
| D3-POST-13 | A | **PostedBy/At**: list `GoodsReceivingsPage` + detail. | `gr.Post(actor,utcNow):595` → tampil `PostedBy`. |

---

## 6. Atomic Transaction & Audit

| ID | Role | Langkah | Harus terlihat |
|---|---|---|---|
| D3-ATOM-01 | A | Posting receiving 3 items (`Quantity 10,5,2`) → cek setelah commit 3 LOT muncul semua. | `transaction CommitAsync:598` sebelum commit tidak ada. |
| D3-ATOM-02 | A | Buka `Warehouse > Stock Movements` filter `MovementType=RECEIVING` `reference=GR-...`. | 1 movement/LOT `StockMovement.Create(... Receiving, 0, quantity, "GoodsReceiving", gr.Id)` `579` `Quantity 10 Before 0 After 10`. |
| D3-ATOM-03 | A | Cek movement detail `QuantityBefore/After`. | `0 → item.Quantity` `585-586`. |
| D3-ATOM-04 | A | Cek status `POSTED` hanya setelah commit. | `gr.Post` sebelum `SaveChanges` tapi visible setelah `Commit`. |
| D3-ATOM-05 | A | Cek audit (Swagger `GET /api/audit` atau DB `audit_logs`). | `AuditEntry goodsreceiving.created:339` + `goodsreceiving.posted:609`. |
| D3-ATOM-06 | A | **Rollback**: buka 2 tab: tab1 draft `RM-DAY3-ACT`, tab2 hapus `RM-DAY3-ACT` (jadikan inactive) lalu post di tab1. | `catch RollbackAsync:600` → tidak ada LOT yatim; `Raw Material Lots` tidak ada new lot. |
| D3-ATOM-07 | A | Cek tidak ada orphan LOT setelah gagal. | `GET /api/raw-material-lots` tidak ada `GoodsReceivingId` gagal. |
| D3-ATOM-08 | A | Tidak ada orphan Movement. | Movement rollback. |
| D3-ATOM-09 | A | **Concurrent**: 2 browser posting draft sama hampir bersamaan. | Satu 200, satu 400; `Stock Movements` tidak ganda. |

---

## 7. Permission & Responsive Goods Receiving

| ID | Role | Langkah | Harus terlihat |
|---|---|---|---|
| D3-PERM-01 | B | Login `warehouse.viewer` buka `/goods-receiving`. | List/detail bisa; `Create Receiving` hidden `can('receiving.create')` `240`; form banner `hanya akses lihat` `225` `Save Draft` hidden `canSave false`, `Post` hidden `canPost false`. |
| D3-PERM-02 | C | Login `no.access` buka `/goods-receiving`. | Menu hilang `Sidebar.tsx`; URL langsung → `ForbiddenPage.tsx`. |
| D3-PERM-03 | A | User hanya `receiving.post` coba post draft orang lain. | Tombol Post muncul `can('receiving.post')` `55` independent. |
| D3-RWD-01 | A | Desktop 1440: `GoodsReceivingsPage` `lg:grid-cols` `152` + `GoodsReceivingFormPage` hero `lg:flex-row` `179` + sticky footer `406`. | Rapi tidak overflow. |
| D3-RWD-02 | A | Tablet 768: `md:grid-cols-2 xl:grid-cols` `195` + tabel `overflow-x-auto`. | Filter masih dipakai. |
| D3-RWD-03 | A | Mobile 375: `Supplier/Warehouse` select `h-12 rounded-2xl`, `ReceivingItemFields` card, sticky `Add Item / Save Draft / Post` visible. | Drawer `MainLayout` + dialog `max-h-[60vh]` scroll, tidak horizontal scroll. |

---

## 8. Eksekusi Cepat

1. `docker compose --profile dev up --build` atau `npm run dev` (`http://localhost:5173`) + backend `http://localhost:5104/swagger`.
2. Buat user A/B/C di `Administration > Users` → assign role permission sesuai tabel Bab 1.
3. Ikuti **Bab 2→3→4→5→6→7** urut; isi kolom `Hasil [ ]` dengan `PASS/FAIL/BLOCKED` + screenshot jika FAIL (terutama `D3-GR-09..17` error banner & `D3-POST-02` 400).
4. Verifikasi LOT/Movement via `Warehouse > Raw Material Lots` search `SUP-DAY3` + `Stock Movements` filter `Reference = GR-...` (tanpa query DB).
5. Untuk rollback `D3-ATOM-06` gunakan 2 tab atau Network Offline saat POST.

## Sign-off

| Tester (Login sebagai) | Tanggal | Browser / Viewport | Day 3 | Catatan FAIL (ID + screenshot) |
|---|---|---|---|---|
| ex: `warehouse.manager` / `warehouse.viewer` | 2026-09-03 | Chrome 1440 / iPad 768 / iPhone 375 | ☐ PASS ☐ FAIL | Jika FAIL sebut `D3-GR-09 BadRequest Supplier is inactive tidak muncul` + screenshot |
