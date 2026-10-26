# Hair Salon Color Record --- Project Design Specification

**Version:** 0.1.0\
**Status:** Design baseline + initial offline-first prototype\
**Language:** Swiss Standard German (`de-CH`) for salon UI; Thai for
development notes\
**Platforms:** Mobile, iPad, laptop browsers (responsive)

## 1. Project goal

แอปบันทึกประวัติสูตรผสมสีผมสำหรับช่างใช้งานคนเดียว โดยให้ความรู้สึกเหมือนสมุดหรือเทมเพลต
Procreate: เปิดหน้ากระดาษแล้วใช้ Apple Pencil, stylus, นิ้ว
หรือเมาส์เขียนได้โดยตรง ไม่ใช่ฟอร์มที่ต้องพิมพ์ทุกช่อง

Workflow: เปิดแอป → ค้นหาลูกค้าเรียงตามชื่อ → เปิดประวัติสูตร →
เลือกสูตรเดิมหรือสร้างใหม่ → เขียนบนเทมเพลต → บันทึกลงเครื่อง → กลับมาแก้ไขภายหลัง

## 2. Design language

-   **Style:** minimalist premium salon stationery; warm neutral, soft
    dusty rose, paper-like surfaces, thin grid lines, rounded cards,
    uncluttered navigation.
-   **Main background:** `#FAF7F4`
-   **Sidebar background:** `#F5EFEB`
-   **Paper:** `#FFFDFA`
-   **Primary dusty rose:** `#9D666D`
-   **Secondary rose:** `#A26B70`
-   **Selected state:** `#E8D0CE`
-   **Section headers:** `#E7D6D0`
-   **Borders:** `#E0D3CD`
-   **Primary text:** `#322B2C`
-   **Secondary text:** `#877779`
-   **Ink:** `#543B3D`
-   **Typography:** clean sans-serif (Inter / system UI), spaced
    uppercase German section titles.
-   **Branding:** use a generic Hair Salon identity in app code;
    reference images were L'Oréal-inspired, not official licensed
    assets.

## 3. Responsive layout

### Mobile

-   Searchable customer list, single customer profile and vertical
    recipe history.
-   Floating/compact handwriting toolbar; full document can scroll
    horizontally or zoom.
-   Finger/stylus drawing supported. Prioritize large tap targets. \###
    iPad
-   Left customer sidebar, recipe history beside large document canvas.
-   Pencil-friendly handwriting and editing tools; large paper
    workspace. \### Laptop
-   Two-pane sidebar and content layout; mouse writing supported.

## 4. Main screens

1.  **Kunden:** alphabetical customers, search, add customer.
2.  **Kundenprofil:** customer name, recipe history sorted by date
    (newest first), new recipe.
3.  **Rezept-Editor:** full handwritten color sheet, undo, eraser, save.
4.  **Backup / Restore:** portable local JSON backups.
5.  **Future:** image/PDF export, photo attachment, templates gallery,
    autosave, stylus pressure, zoom and pan.

## 5. Canonical color-formula template

**Heading:** `FARBBERATUNG & REZEPTUR — KUNDENKARTE`\
**Top right:** DO NOT add a separate date / stylist / salon box.\
**Sections:** - `KUNDIN / KUNDE` --- Name, Tel., E-Mail, Geb. Datum -
`HAARSTRUKTUR` --- Fein, Normal, Dick - `HAARZUSTAND` --- Gesund,
Trocken, Strapaziert, Stark strapaziert - `NATURHAARFARBE` --- 1--8
shade scale - `GRAUANTEIL (%)` --- percentage checkboxes -
`FARBREZEPTUR` --- eight blank rows - `PRODUKTE VERWENDET` - `TECHNIK` -
`ERGEBNIS / FOTO` - `NOTIZEN / BESONDERHEITEN`

**Formula table column order (must preserve):**
`NR. | DATUM (Tag/Monat/Jahr) | BEREICH | FARBNUANCE | FARBMENGE (g) | OXIDANT | OXIDANTMENGE (g) | MISCHUNGSVERHÄLTNIS | BEMERKUNGEN`

The date belongs near the start of the table, immediately after row
number; processing time is not the first column.

## 6. Data and storage

-   **Architecture:** local-first, no server or account required.
-   **Current prototype:** React + Vite + `idb` / IndexedDB.
-   **Entities:** `customers` (id, name, createdAt); `records` (id,
    customerId, date, strokes, updatedAt).
-   **Handwriting:** store normalized vector strokes (editable), not
    only flattened screenshots.
-   **Backups:** manual JSON export/import. Browser storage is not a
    substitute for backups.
-   **Future:** optional Tauri desktop packaging or a native iPad app
    for durable filesystem integration; image/PDF export.

## 7. Behavior and quality requirements

-   Customer list alphabetical by Swiss German collation.
-   History sorted newest first; no overwriting old visits.
-   Each customer can have many records.
-   Preserve all handwriting on save and reopen.
-   Works without network after the app assets have loaded locally.
-   Do not claim automatic cloud backup, direct laptop access, or
    cross-device sync.
-   Responsive, accessible, and pen-friendly.

## 8. Development milestones

-   **MVP starter (implemented):** customer list/search, local customer
    records, editable drawing canvas, save/reopen, undo/erase, JSON
    backup/restore, responsive layout.
-   **Next:** autosave, reliable PNG/PDF export, zoom/pan, editable
    customer contact details, better mobile handwriting toolbar.
-   **Later:** photos, multi-template selection, image thumbnails,
    full-text notes search, secure backups, installable offline app.

## 9. Source of truth

Use this file as the primary product/design specification for all future
screens and implementation changes. If new requirements conflict, update
this file explicitly. All names, phone numbers and formula values in
visual mockups are fictional examples.
