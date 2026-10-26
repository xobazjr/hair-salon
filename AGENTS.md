# Hair Salon Color Record — Agent Requirements

เอกสารนี้เป็น source of truth สำหรับการพัฒนาโปรเจกต์ Hair Salon Color Record โดยสรุปจาก source prototype ที่ได้รับและภาพตัวอย่างฟอร์มบันทึกสีผม 2 แบบ ผู้พัฒนาต้องยึด requirement นี้ก่อนเพิ่มฟีเจอร์หรือเปลี่ยนโครงสร้างระบบ

## เป้าหมายผลิตภัณฑ์

สร้างแอปสำหรับช่างทำผมเพื่อบันทึกประวัติการวิเคราะห์เส้นผม สูตรผสมสี เทคนิค และผลลัพธ์ของลูกค้าแต่ละครั้ง ให้ความรู้สึกเหมือนสมุด/แบบฟอร์มกระดาษที่สามารถเขียนด้วยนิ้ว เมาส์ หรือ stylus ได้โดยตรง

แอปต้องทำงานแบบ local-first เป็นหลักในระยะแรก ไม่ต้องมี account, server หรือ cloud sync จนกว่าจะมี requirement ใหม่ที่ระบุชัดเจน

## Tech stack ของโปรเจกต์นี้

ต้องใช้ tech stack ของ repository นี้เป็นหลัก ไม่ยึด stack จาก source prototype:

- Next.js 16 ด้วย App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint และ npm scripts ที่มีอยู่ใน `package.json`
- ใช้ browser storage/local persistence ตามความเหมาะสมของ implementation ระยะแรก

ห้ามเปลี่ยนไปใช้ Vite, React JavaScript, หรือ framework อื่นเพียงเพราะ source prototype ใช้เทคโนโลยีนั้น

## User flow หลัก

1. ผู้ใช้กด `เข้าหน้าแอพ`
2. ระบบแสดงรายชื่อลูกค้า พร้อมค้นหาและปุ่มเพิ่มลูกค้า
3. ผู้ใช้เลือกหรือสร้างลูกค้า
4. ระบบแสดงโปรไฟล์ลูกค้าและประวัติสูตรสี เรียงจากรายการล่าสุดไปเก่าสุด
5. ผู้ใช้เลือก `สูตรเดิม` เพื่อเปิดแก้ไข หรือ `สร้างสูตรใหม่`
6. ระบบเปิดหน้าเอกสารสูตรสีแบบกระดาษ
7. ผู้ใช้กรอกข้อมูลในฟอร์มและเขียน/วาดลงบนเอกสารได้
8. ผู้ใช้กด `บันทึก`
9. ระบบบันทึกข้อมูลในเครื่อง แสดงสถานะสำเร็จ และผู้ใช้กลับไปประวัติหรือสร้างรายการถัดไปได้

หากมีการแก้ไขที่ยังไม่บันทึก ผู้ใช้ต้องได้รับคำเตือนก่อนเปลี่ยนลูกค้า ออกจากเอกสาร ปิดหน้า หรือเปิดรายการอื่น

## หน้าหลักที่ต้องรองรับ

### 1. รายชื่อลูกค้า

- แสดงลูกค้าเรียงตามชื่อ
- ค้นหาได้จากชื่อและข้อมูลระบุตัวตนที่ระบบรองรับ
- มีสถานะกำลังโหลด, ไม่พบข้อมูล และเกิดข้อผิดพลาด
- มีปุ่มสร้างลูกค้าใหม่ที่มองเห็นได้ชัดเจน
- บนมือถือยังต้องเข้าถึงการสร้างลูกค้าและ backup ได้

### 2. โปรไฟล์ลูกค้า

- แสดงชื่อและข้อมูลพื้นฐานของลูกค้า
- แสดงประวัติสูตรสีหลายรายการของลูกค้าคนเดียวกัน
- เรียงประวัติล่าสุดก่อน
- เปิดรายการเดิมได้โดยไม่สร้าง record ใหม่
- สร้างสูตรใหม่ได้โดยไม่เขียนทับประวัติเก่า

### 3. ตัวแก้ไขสูตรสี

- แสดงเอกสารขนาดใหญ่ที่มีโครงสร้างเหมือนแบบฟอร์มกระดาษ
- รองรับการเขียนด้วย mouse, touch และ stylus ผ่าน pointer events
- มีเครื่องมืออย่างน้อย: ปากกา, ยางลบ, undo และบันทึก
- แสดงสถานะ `บันทึกแล้ว` หรือ `ยังไม่ได้บันทึก`
- ป้องกันการกดบันทึกซ้ำระหว่างกำลังบันทึก
- หากบันทึกล้มเหลวต้องคงข้อมูลบนหน้าจอไว้และแจ้งสาเหตุที่เข้าใจได้

### 4. Backup / Restore

- ส่งออกข้อมูลลูกค้าและประวัติทั้งหมดเป็น JSON
- นำเข้า JSON backup กลับมาได้
- ตรวจสอบโครงสร้างไฟล์ก่อน import
- แจ้งผลสำเร็จหรือข้อผิดพลาดอย่างชัดเจน
- ห้ามสื่อว่าเป็น cloud backup หรือ sync ข้ามอุปกรณ์

## โครงสร้างเอกสารสูตรสีมาตรฐาน

ภาพตัวอย่างที่ศึกษาเป็นฟอร์มสไตล์ salon stationery ของ L’Oréal Professionnel แต่ในแอปต้องใช้ branding ของ Hair Salon แบบ generic ห้ามใช้ logo, trademark หรือ asset ที่ทำให้เข้าใจว่าเป็นผลิตภัณฑ์ทางการของ L’Oréal

### Header

- ชื่อเอกสารแนว `FARBBERATUNG & REZEPTUR` / `KUNDENKARTE` หรือชื่อภาษาไทยที่ product owner กำหนดภายหลัง
- subtitle สื่อถึงการวิเคราะห์, สูตร, เทคนิค และผลลัพธ์
- แสดงข้อมูลวันที่ทำและข้อมูลช่าง/ร้านเมื่อมีฟิลด์รองรับ
- ไม่ทำ header ให้แย่งความสนใจจากข้อมูลลูกค้าและตารางสูตร

### ข้อมูลลูกค้า

รองรับฟิลด์อย่างน้อย:

- ชื่อ
- โทรศัพท์
- อีเมล
- วันเกิด
- เพศ/คำนำหน้าแบบไม่บังคับ และต้องมีตัวเลือกที่ไม่จำกัดเพศแบบ binary

ข้อมูลลูกค้าต้องแยกจากข้อมูลการทำผมแต่ละครั้ง และเลือกใช้ซ้ำได้ในประวัติครั้งถัดไป

### วิเคราะห์เส้นผม

ต้องมีตัวเลือกหรือช่องบันทึกสำหรับ:

- โครงสร้างเส้นผม: `ละเอียด`, `ปกติ`, `หนา`
- สภาพเส้นผม: `สุขภาพดี`, `แห้ง`, `เสีย/ผ่านการทำเคมี`, `เสียมาก`
- สีผมธรรมชาติเป็นระดับเฉด 1–8 หรือรูปแบบเทียบเท่า
- เปอร์เซ็นต์ผมหงอก: `0%`, `<30%`, `30–50%`, `50–70%`, `>70%`

### พื้นที่/บริเวณที่ทำ

รองรับการเลือกบริเวณอย่างน้อย:

- โคนผม
- ความยาวผม
- ปลายผม
- ทั้งศีรษะ

ควรแสดงด้วย label และภาพ/diagram ที่เข้าใจได้ แต่ห้ามใช้สีอย่างเดียวในการสื่อความหมาย

### ตารางสูตรสี

ตารางต้องคงลำดับคอลัมน์เชิงธุรกิจดังนี้:

`ลำดับ | วันที่ | บริเวณ | รหัสสี/เฉดสี | ปริมาณสี (g) | Oxidant/Developer | ปริมาณ Oxidant (g) | อัตราส่วนผสม | เวลาในการทำ (นาที) | หมายเหตุ`

รายละเอียดสำคัญ:

- รองรับหลายแถวต่อหนึ่ง record เพื่อบันทึกสูตรผสมหลายส่วน
- วันที่ต้องอยู่ใกล้ต้นตารางหลังเลขลำดับ
- ฟิลด์ปริมาณและเวลาเป็นตัวเลขที่ตรวจสอบได้
- อัตราส่วนผสมรองรับรูปแบบ เช่น `1:1`, `1:1.5`, `1:2`
- หมายเหตุต้องรองรับข้อความยาวและรายละเอียดเทคนิค
- ห้ามเขียนทับแถว/สูตรเดิมโดยไม่ตั้งใจ

### ผลิตภัณฑ์ที่ใช้

รองรับรายการผลิตภัณฑ์ที่ตั้งค่าได้ เช่น:

- สีผม
- Developer/Oxidant
- ผลิตภัณฑ์ฟอกหรือปรับสี
- ผลิตภัณฑ์ดูแล/ซ่อมแซมเส้นผม
- รายการอื่นแบบกรอกเอง

รายการตัวอย่างในภาพเป็นเพียง reference ไม่ใช่รายการบังคับตายตัวของ database

### เทคนิค/กระบวนการ

รองรับอย่างน้อย:

- ทำสีโคน
- ทำสีทั้งศีรษะ
- ไฮไลต์/ช่อผม
- Balayage
- ฟอกสี
- Toning/Glossing
- Color correction
- เทคนิคอื่นแบบกรอกเอง

### รูปภาพ ผลลัพธ์ และหมายเหตุ

- มีพื้นที่สำหรับ before/after หรือภาพ/สเก็ตช์ผลลัพธ์ใน roadmap
- มีพื้นที่โน้ต/ความพิเศษหลายบรรทัด
- ใน MVP หากยังไม่รองรับการอัปโหลดรูป ต้องแสดง placeholder ที่ไม่ทำให้ผู้ใช้เข้าใจว่ารูปถูกบันทึกแล้ว
- ห้ามอ้างว่า PNG/PDF export หรือ photo attachment ใช้งานได้จนกว่าจะ implement และทดสอบจริง

## Data model เชิงธุรกิจ

โครงสร้าง implementation ต้องรองรับความสัมพันธ์ดังนี้:

- `Customer`: `id`, `name`, ข้อมูลติดต่อ, `createdAt`, `updatedAt`
- `ColorRecord`: `id`, `customerId`, `date`, `analysis`, `serviceAreas`, `formulaRows`, `products`, `techniques`, `notes`, `strokes`, `updatedAt`
- `FormulaRow`: ลำดับ, วันที่, บริเวณ, รหัสสี, ปริมาณสี, oxidant, ปริมาณ oxidant, ratio, processing time, หมายเหตุ
- `Stroke`: จุดพิกัดแบบ normalized, สี, ความหนา และข้อมูลที่จำเป็นต่อการแก้ไข/วาดซ้ำ

กติกาข้อมูล:

- ลูกค้า 1 คนมีประวัติได้หลายรายการ
- ทุก record ต้องมี `customerId`
- ต้องเก็บ stroke แบบ vector ที่แก้ไขได้ ไม่เก็บแค่ภาพ flatten หากยังต้องรองรับ undo/erase
- บันทึกใหม่ต้องไม่ลบหรือเขียนทับ record เก่า
- ชื่อควรเรียงตาม locale ภาษาไทย/ภาษาเยอรมันตามภาษาที่ product กำหนด
- วันที่ต้องใช้รูปแบบมาตรฐานเดียวกัน และแสดงตาม locale ของผู้ใช้
- trim ข้อมูลข้อความก่อนบันทึก
- escape ข้อมูลผู้ใช้ก่อนแสดงผล และห้ามนำข้อความไป render เป็น HTML โดยไม่จำเป็น

## Visual direction จากภาพตัวอย่าง

ภาพตัวอย่างทั้งสองภาพให้ทิศทางเดียวกัน:

- premium salon stationery
- พื้นหลัง warm neutral และพื้นกระดาษ off-white
- dusty rose / beige สำหรับ section headers และ selected state
- เส้นตารางบาง สีอ่อน และ card มุมโค้งเล็กน้อย
- typography สะอาด อ่านง่าย มี uppercase tracking สำหรับชื่อ section
- visual hierarchy ชัด: customer/analysis → formula table → products/technique/result/notes
- ใช้พื้นที่ว่างและเส้นบรรทัดแบบฟอร์มให้ความรู้สึกเขียนได้จริง

โทนสีอ้างอิงเบื้องต้น:

- Background: `#FAF7F4`
- Paper: `#FFFDFA`
- Sidebar: `#F5EFEB`
- Primary dusty rose: `#9D666D`
- Selected: `#E8D0CE`
- Section header: `#E7D6D0`
- Border: `#E0D3CD`
- Primary text: `#322B2C`
- Secondary text: `#877779`
- Ink: `#543B3D`

ใช้ semantic design tokens ในโค้ดและหลีกเลี่ยงการกระจายค่า hex แบบไม่มีชื่อความหมาย

## Responsive และ accessibility

- Mobile: รายชื่อลูกค้าและประวัติเป็นแนวตั้ง เอกสารสูตรเลื่อนในแนวนอนหรือ zoom ได้ และ toolbar ต้องกดง่าย
- Tablet/iPad: รองรับ sidebar ลูกค้า + พื้นที่เอกสารขนาดใหญ่ เหมาะกับ Apple Pencil/stylus
- Laptop: รองรับ layout สองส่วน รายชื่อลูกค้า/ประวัติด้านข้าง และ editor ด้านหลัก
- ทดสอบอย่างน้อยที่ 320px, 768px, 1024px และ 1440px
- interactive control ต้องเป็น semantic HTML และใช้งานด้วย keyboard ได้
- ทุก input ต้องมี label หรือ accessible name
- มี focus-visible state และ contrast อย่างน้อย WCAG 2.1 AA
- canvas ต้องมี `aria-label` และมีทางเลือกที่ไม่พึ่งพาการวาดเพียงอย่างเดียวสำหรับข้อมูลสำคัญ
- ห้ามใช้สีเพียงอย่างเดียวเพื่อบอกสถานะหรือคำตอบ
- ต้องมี loading, empty, error และ success state ที่สื่อความหมาย

## Acceptance criteria

- ผู้ใช้เปิดแอปและเข้าหน้ารายชื่อลูกค้าได้
- ค้นหา/สร้างลูกค้า และเปิดโปรไฟล์ลูกค้าได้
- ลูกค้า 1 คนมีสูตรสีหลายครั้งและเห็นประวัติเรียงล่าสุดก่อน
- สร้างสูตรใหม่หรือเปิดสูตรเดิมได้โดยไม่ทำให้ประวัติเก่าหาย
- เอกสารมีส่วนข้อมูลลูกค้า, วิเคราะห์ผม, บริเวณที่ทำ, ตารางสูตร, ผลิตภัณฑ์, เทคนิค, ผลลัพธ์ และหมายเหตุ
- ผู้ใช้กรอกวันที่, รหัสสี, ปริมาณ, oxidant, ratio, เวลา และหมายเหตุได้
- ผู้ใช้เขียนด้วย mouse, touch หรือ stylus ได้ และ stroke ยังแก้ไข/undo/erase ได้หลังบันทึกและเปิดซ้ำ
- บันทึกสำเร็จแล้วกลับมาเปิดข้อมูลเดิมได้
- มี JSON export/import และแจ้งผลลัพธ์อย่างชัดเจน
- มีคำเตือนก่อนทิ้งการแก้ไขที่ยังไม่บันทึก
- แอปทำงานได้โดยไม่ต้องพึ่ง network หลังโหลด asset ที่จำเป็นแล้ว
- ไม่มีการอ้าง branding หรือความสัมพันธ์อย่างเป็นทางการกับ L’Oréal

## ขอบเขตที่ยังไม่ควรอ้างว่าทำเสร็จ

ห้ามแสดงหรือบอกผู้ใช้ว่าฟีเจอร์ต่อไปนี้พร้อมใช้งานจนกว่าจะ implement และ verify จริง:

- cloud backup หรือ multi-device sync
- PNG/PDF export
- autosave ที่เชื่อถือได้
- photo attachment และ before/after storage
- stylus pressure
- zoom/pan ขั้นสูง
- template gallery หลายแบบ
- full-text search ในโน้ต
- login, role และ permission

## แนวทางการพัฒนาใน repository นี้

- ใช้ Next.js + React + TypeScript + Tailwind ของโปรเจกต์นี้เป็นหลัก
- อ่านไฟล์ที่เกี่ยวข้องและตัวอย่างที่มีอยู่ก่อนแก้ไข
- แยก data/persistence logic ออกจาก presentation component เมื่อความซับซ้อนเพิ่มขึ้น
- เลือก state management ที่ง่ายที่สุดก่อน: local state สำหรับ UI เฉพาะส่วน, URL state สำหรับ search/filter และ server/global state เฉพาะเมื่อจำเป็น
- ใช้ semantic HTML และ component ที่โฟกัสหน้าที่เดียว
- อย่าเพิ่ม dependency หาก browser API หรือ utility ที่มีอยู่เพียงพอ
- ก่อน commit ต้องตรวจ `npm run lint` และ `npm run build` เมื่อ dependencies พร้อมใช้งาน
- ห้าม commit `.env`, credential, secret, backup ลูกค้าจริง หรือข้อมูลส่วนตัวจริง

## แหล่งอ้างอิงที่ใช้จัดทำเอกสารนี้

- Source prototype: `/Users/xobazjr/Downloads/hair-salon-app`
- `PROJECT_DESIGN.md`, `src/main.jsx`, `src/db.js`, `src/style.css` จาก source prototype
- ภาพตัวอย่างฟอร์มบันทึกสีผมที่ผู้ใช้แนบในบทสนทนา

Source prototype ใช้เพื่อศึกษา product behavior และ visual/content structure เท่านั้น ไม่ใช่ข้อกำหนดให้คัดลอก tech stack หรือ branding มาใช้ใน repository นี้

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->