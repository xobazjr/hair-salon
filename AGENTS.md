# Hair Salon App Requirements

เอกสารนี้เป็นข้อกำหนดปัจจุบันของโปรแกรมสำหรับใช้เป็นบริบทหลักในการพัฒนาและตรวจงานของเอเจนต์

## เป้าหมายของโปรแกรม

สร้างระบบบันทึกประวัติการทำผมของลูกค้า โดยผู้ใช้งานสามารถค้นหาลูกค้าเดิมหรือสร้างข้อมูลลูกค้าใหม่ แล้วบันทึกรายละเอียดการทำผมในครั้งนั้นได้

## User flow หลัก

ลำดับการทำงานต้องเป็นดังนี้:

1. ผู้ใช้กด `เข้าหน้าแอพ`
2. ระบบแสดงหน้าค้นหารายชื่อลูกค้า
3. ผู้ใช้เลือกได้ 2 ทางเลือก
   - `สร้างข้อมูลลูกค้าใหม่`
   - `ดึงข้อมูลลูกค้าเก่า`
4. ทั้งสองทางเลือกนำไปสู่หน้าบันทึกข้อมูลการทำผม
5. ผู้ใช้บันทึกข้อมูลให้ครบถ้วน
6. ระบบบันทึกข้อมูลสำเร็จ และให้ผู้ใช้กลับไปยังหน้าแอพหรือหน้าค้นหารายชื่อลูกค้าได้

## ข้อมูลที่ต้องจัดเก็บ

### ข้อมูลลูกค้า

กรณีสร้างลูกค้าใหม่ อย่างน้อยต้องมีข้อมูลสำหรับระบุตัวลูกค้าและค้นหาในภายหลัง เช่น ชื่อลูกค้าและข้อมูลติดต่อ โดยรายละเอียดฟิลด์ที่ยังไม่ได้ระบุในภาพให้เลือกตามความเหมาะสมของระบบและต้องไม่ทำให้ flow หลักซับซ้อนเกินจำเป็น

### ประวัติการทำผม

ทุกบันทึกต้องเชื่อมโยงกับลูกค้า 1 คน และต้องมีฟิลด์ต่อไปนี้:

- วันที่ทำ
- รหัสสีที่ทำ
- โปรดักต์ที่ใช้
- ลักษณะเส้นผม

ฟิลด์ที่ควรเป็นรายการเลือกหรือ autocomplete หากระบบมีรายการมาตรฐาน ได้แก่ รหัสสีที่ทำ, โปรดักต์ที่ใช้ และลักษณะเส้นผม แต่ต้องเปิดทางให้เพิ่มค่าที่ไม่มีในรายการได้เมื่อจำเป็น

## พฤติกรรมหน้าค้นหาลูกค้า

- ค้นหาได้จากข้อมูลระบุตัวลูกค้าที่มีอยู่
- แสดงรายชื่อลูกค้าที่ตรงกับคำค้นอย่างชัดเจน
- การเลือกชื่อลูกค้าเดิมต้องโหลดข้อมูลลูกค้าเข้าสู่ฟอร์มบันทึกประวัติ โดยไม่สร้างลูกค้าซ้ำ
- หากค้นหาไม่พบ ต้องมีปุ่มหรือทางเลือก `สร้างข้อมูลลูกค้าใหม่`
- ต้องมีสถานะสำหรับกำลังค้นหา, ไม่พบข้อมูล และเกิดข้อผิดพลาด

## พฤติกรรมฟอร์มบันทึกข้อมูล

- ฟอร์มต้องแยกข้อมูลลูกค้าออกจากข้อมูลการทำผมให้เข้าใจง่าย
- วันที่ทำต้องมีค่าเริ่มต้นเป็นวันที่ปัจจุบัน แต่ผู้ใช้แก้ไขได้
- ต้องตรวจสอบฟิลด์บังคับก่อนบันทึก
- เมื่อบันทึกสำเร็จ ต้องแสดงข้อความยืนยันที่ผู้ใช้เข้าใจได้
- หากบันทึกไม่สำเร็จ ต้องไม่ล้างข้อมูลที่ผู้ใช้กรอก และต้องแสดงสาเหตุหรือแนวทางแก้ไข
- ป้องกันการกดบันทึกซ้ำระหว่างที่กำลังส่งข้อมูล

## ข้อกำหนดด้านข้อมูลและความถูกต้อง

- ห้ามสร้างลูกค้าซ้ำเมื่อผู้ใช้เลือกข้อมูลลูกค้าเดิม
- ประวัติการทำผมแต่ละครั้งต้องมีรหัสอ้างอิงของลูกค้า
- วันที่ต้องเก็บในรูปแบบที่สม่ำเสมอ และแสดงผลตามบริบทผู้ใช้ภาษาไทย/ประเทศไทย
- ค่าที่กรอกต้องถูกตัดช่องว่างส่วนเกินก่อนบันทึก
- ข้อมูลที่ผู้ใช้กรอกต้องไม่ถูกนำไปแสดงเป็น HTML โดยไม่ escape
- ห้ามเก็บ secret, password หรือข้อมูลที่ไม่เกี่ยวข้องกับการทำงานไว้ในฝั่ง client หรือ repository

## Acceptance criteria

- ผู้ใช้เข้าสู่หน้าแอพได้จากปุ่ม `เข้าหน้าแอพ`
- ผู้ใช้ค้นหาและเลือกลูกค้าเดิมได้
- ผู้ใช้สร้างข้อมูลลูกค้าใหม่ได้เมื่อยังไม่มีข้อมูล
- ผู้ใช้บันทึก วันที่ทำ, รหัสสีที่ทำ, โปรดักต์ที่ใช้ และลักษณะเส้นผมได้ครบ
- ระบบไม่สร้างลูกค้าซ้ำจากการเลือกลูกค้าเดิม
- ระบบแจ้งเตือนเมื่อข้อมูลจำเป็นไม่ครบ
- ระบบแจ้งผลสำเร็จหรือข้อผิดพลาดหลังการบันทึกอย่างชัดเจน
- หลังบันทึกสำเร็จ ผู้ใช้สามารถกลับไปค้นหาลูกค้าหรือบันทึกครั้งถัดไปได้

## แนวทางการพัฒนา

- โปรเจกต์ยังไม่มีการกำหนด framework, database หรือคำสั่ง build/test อย่างเป็นทางการ ให้ตรวจไฟล์จริงก่อนเพิ่มเครื่องมือหรือ dependency
- ทำงานตาม flow ที่ระบุในเอกสารนี้ก่อนเพิ่มฟีเจอร์นอกขอบเขต
- อย่าเดาฟิลด์ธุรกิจเพิ่มเติมโดยไม่มีเหตุผล หากจำเป็นให้เลือกโครงสร้างที่แก้ไขต่อได้และบันทึกสมมติฐานไว้ในเอกสารหรือโค้ด
- ทุกการเปลี่ยนแปลงควรมีการตรวจสอบ flow หลักและ validation ที่เกี่ยวข้อง
- ห้าม commit ไฟล์ `.env`, credential, secret หรือข้อมูลลูกค้าจริง

## สิ่งที่ยังต้องตัดสินใจภายหลัง

- ฟิลด์ระบุตัวลูกค้าที่แน่นอน เช่น ชื่อ, เบอร์โทร หรือรหัสลูกค้า
- รูปแบบการเก็บข้อมูลและฐานข้อมูล
- รายการมาตรฐานของรหัสสี, โปรดักต์ และลักษณะเส้นผม
- สิทธิ์ผู้ใช้งานและการเข้าสู่ระบบ
- การแก้ไข/ลบประวัติ และการดูประวัติย้อนหลัง

## Product design specification

รายละเอียดในหมวดนี้เป็น baseline ด้าน product/design สำหรับหน้าจอและการเปลี่ยนแปลงในอนาคต โดยข้อกำหนด flow และ acceptance criteria ด้านบนยังคงเป็นข้อกำหนดการทำงานหลัก

### เป้าหมายและ workflow ด้านการออกแบบ

- แอปใช้บันทึกประวัติสูตรผสมสีผมสำหรับช่างใช้งานคนเดียว
- ประสบการณ์หลักควรให้ความรู้สึกเหมือนสมุดหรือเทมเพลต Procreate ผู้ใช้เขียนด้วย Apple Pencil, stylus, นิ้ว หรือเมาส์ได้โดยตรง ไม่บังคับให้พิมพ์ทุกช่อง
- Workflow: เปิดแอป → ค้นหาลูกค้าเรียงตามชื่อ → เปิดประวัติสูตร → เลือกสูตรเดิมหรือสร้างใหม่ → เขียนบนเทมเพลต → บันทึกลงเครื่อง → กลับมาแก้ไขภายหลัง
- รองรับ mobile, iPad และ laptop browser แบบ responsive
- ภาษาหลักของ UI salon คือ Swiss Standard German (`de-CH`); หมายเหตุการพัฒนาใช้ภาษาไทยได้

### Design language

- สไตล์ minimalist premium salon stationery: warm neutral, soft dusty rose, พื้นผิวคล้ายกระดาษ เส้น grid บาง การ์ดมุมมน และ navigation ที่ไม่รก
- สีหลัก: พื้นหลัง `#FAF7F4`, sidebar `#F5EFEB`, กระดาษ `#FFFDFA`, dusty rose หลัก `#9D666D`, rose รอง `#A26B70`, selected state `#E8D0CE`, section header `#E7D6D0`, border `#E0D3CD`, primary text `#322B2C`, secondary text `#877779`, ink `#543B3D`
- Typography: clean sans-serif (Inter หรือ system UI) และชื่อ section ภาษาเยอรมันแบบ uppercase ที่มีระยะห่างตัวอักษร
- ใช้ generic Hair Salon identity ในโค้ด ภาพอ้างอิงที่ได้แรงบันดาลใจจาก L'Oréal ไม่ใช่ทรัพย์สินที่ได้รับอนุญาตให้ใช้

### Responsive layout

- Mobile: รายชื่อลูกค้าที่ค้นหาได้ โปรไฟล์ลูกค้าเดี่ยว และประวัติสูตรแนวตั้ง มี handwriting toolbar แบบลอยหรือแบบย่อ รองรับการ scroll แนวนอนหรือ zoom และให้ความสำคัญกับ tap target ขนาดใหญ่
- iPad: sidebar ลูกค้าด้านซ้าย ประวัติสูตรถัดจาก document canvas ขนาดใหญ่ เครื่องมือเขียนและแก้ไขที่เหมาะกับ Pencil
- Laptop: layout แบบสอง pane ระหว่าง sidebar กับ content และรองรับการเขียนด้วยเมาส์

### Main screens

1. `Kunden`: รายชื่อลูกค้าเรียงตามตัวอักษร ค้นหา และเพิ่มลูกค้า
2. `Kundenprofil`: ชื่อลูกค้า ประวัติสูตรเรียงวันที่ใหม่สุดก่อน และสร้างสูตรใหม่
3. `Rezept-Editor`: color sheet แบบเขียนมือเต็มหน้า พร้อม undo, eraser และ save
4. `Backup / Restore`: สำรองและกู้คืน JSON ในเครื่องแบบพกพา
5. อนาคต: export รูปภาพ/PDF, แนบรูป, templates gallery, autosave, stylus pressure, zoom และ pan

### Canonical color-formula template

- Heading: `FARBBERATUNG & REZEPTUR — KUNDENKARTE`
- ห้ามเพิ่มกล่อง date / stylist / salon แยกที่มุมขวาบน
- Sections: `KUNDIN / KUNDE` (Name, Tel., E-Mail, Geb. Datum), `HAARSTRUKTUR` (Fein, Normal, Dick), `HAARZUSTAND` (Gesund, Trocken, Strapaziert, Stark strapaziert), `NATURHAARFARBE` (shade scale 1–8), `GRAUANTEIL (%)` (percentage checkboxes), `FARBREZEPTUR` (แถวว่าง 8 แถว), `PRODUKTE VERWENDET`, `TECHNIK`, `ERGEBNIS / FOTO`, `NOTIZEN / BESONDERHEITEN`
- ลำดับคอลัมน์ formula table ต้องคงไว้: `NR. | DATUM (Tag/Monat/Jahr) | BEREICH | FARBNUANCE | FARBMENGE (g) | OXIDANT | OXIDANTMENGE (g) | MISCHUNGSVERHÄLTNIS | BEMERKUNGEN`
- วันที่ต้องอยู่ช่วงต้นของตารางทันทีหลังเลขแถว และ processing time ต้องไม่เป็นคอลัมน์แรก

### Data, storage และคุณภาพด้านการออกแบบ

- Architecture เป็น local-first ไม่ต้องมี server หรือ account
- Prototype ปัจจุบันใช้ React + Vite + `idb` / IndexedDB
- Entities: `customers` (`id`, `name`, `createdAt`) และ `records` (`id`, `customerId`, `date`, `strokes`, `updatedAt`)
- เก็บ handwriting เป็น normalized vector strokes ที่แก้ไขได้ ไม่เก็บเพียงภาพ flattened screenshot
- สำรองข้อมูลด้วย manual JSON export/import และต้องไม่ถือว่า browser storage ทดแทน backup
- อนาคตอาจรองรับ Tauri desktop หรือ native iPad app เพื่อเชื่อม filesystem ที่คงทน รวมถึง image/PDF export
- รายชื่อลูกค้าเรียงตาม Swiss German collation และประวัติเรียงใหม่สุดก่อน โดยไม่เขียนทับ visit เดิม
- ลูกค้าหนึ่งคนมีได้หลาย records และ handwriting ต้องคงอยู่เมื่อบันทึกแล้วเปิดกลับมาใหม่
- แอปต้องทำงานได้โดยไม่ใช้ network หลังโหลด app assets ในเครื่องแล้ว
- ห้ามอ้างว่ามี automatic cloud backup, direct laptop access หรือ cross-device sync
- UI ต้อง responsive, accessible และรองรับการใช้งานด้วยปากกา

### Milestones

- MVP starter: customer list/search, local customer records, editable drawing canvas, save/reopen, undo/erase, JSON backup/restore และ responsive layout
- Next: autosave, PNG/PDF export ที่เชื่อถือได้, zoom/pan, แก้ไขข้อมูลติดต่อ และ mobile handwriting toolbar ที่ดีขึ้น
- Later: รูปภาพ, เลือกหลาย template, image thumbnails, full-text notes search, secure backups และ installable offline app

### Design source of truth

ใช้หมวดนี้เป็นแหล่งอ้างอิงหลักด้าน product/design สำหรับหน้าจอและการเปลี่ยนแปลง implementation ในอนาคต หากมี requirement ใหม่ที่ขัดแย้งกัน ต้องแก้เอกสารนี้อย่างชัดเจน ชื่อ เบอร์โทร และค่าของสูตรใน visual mockups ทั้งหมดเป็นข้อมูลตัวอย่างสมมติ

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
