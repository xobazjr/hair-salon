"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { DrawingPad } from "@/components/drawing-pad";
import { type ColorRecord, type Customer, type FormulaRow, newRow } from "@/lib/salon-data";

type Props = {
  customer: Customer;
  record: ColorRecord;
  onSave: (record: ColorRecord) => void;
  onBack: () => void;
  onDirtyChange: (dirty: boolean) => void;
};

const areas = ["โคนผม", "ความยาวผม", "ปลายผม", "ทั้งศีรษะ"];
const techniques = ["ทำสีโคน", "ทำสีทั้งศีรษะ", "ไฮไลต์/ช่อผม", "Balayage", "ฟอกสี", "Toning/Glossing", "Color correction"];
const products = ["สีผม", "Developer/Oxidant", "ผลิตภัณฑ์ฟอก/ปรับสี", "ผลิตภัณฑ์ดูแล/ซ่อมแซม"];

type ChoiceGroupProps = {
  label: string;
  values: string[];
  selected: string[];
  onChange: (items: string[]) => void;
  selection?: "multiple" | "single";
};

function ChoiceGroup({ label, values, selected, onChange, selection = "multiple" }: ChoiceGroupProps) {
  const groupId = useId();
  const toggle = (value: string) => {
    if (selection === "single") {
      onChange([value]);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return <fieldset className="choice-group"><legend>{label}</legend><div className="choice-options">{values.map((value, index) => {
    const inputId = `${groupId}-${index}`;
    return <span key={value} className="choice"><input id={inputId} name={groupId} type={selection === "single" ? "radio" : "checkbox"} checked={selected.includes(value)} onChange={() => toggle(value)} /><label htmlFor={inputId}>{value}</label></span>;
  })}</div></fieldset>;
}

export function RecordEditor({ customer, record, onSave, onBack, onDirtyChange }: Props) {
  const [draft, setDraft] = useState(() => ({ ...record, formulaRows: [...record.formulaRows] }));
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [saving, setSaving] = useState(false);
  const [wasSaved, setWasSaved] = useState(false);
  const [productInput, setProductInput] = useState("");
  const [techniqueInput, setTechniqueInput] = useState("");

  const change = (next: ColorRecord) => { setDraft(next); setWasSaved(false); onDirtyChange(true); };
  const updateRow = (id: string, field: keyof FormulaRow, value: string) => change({ ...draft, formulaRows: draft.formulaRows.map((row) => row.id === id ? { ...row, [field]: value } : row) });
  const updateAnalysis = (field: keyof ColorRecord["analysis"], value: string) => change({ ...draft, analysis: { ...draft.analysis, [field]: value } });
  const addTag = (kind: "products" | "techniques", value: string, reset: () => void) => {
    const item = value.trim();
    if (item && !draft[kind].includes(item)) change({ ...draft, [kind]: [...draft[kind], item] });
    reset();
  };
  const save = () => {
    if (saving) return;
    setSaving(true);
    try { onSave(draft); setWasSaved(true); onDirtyChange(false); } finally { setSaving(false); }
  };

  return <main className="editor-shell">
    <div className="editor-bar">
      <button className="text-button" type="button" onClick={onBack}>← กลับประวัติ</button>
      <div><p className="eyebrow">COLOR RECORD</p><strong>{customer.name}</strong></div>
      <div className="save-cluster"><span className="save-state" aria-live="polite">{saving ? "กำลังบันทึก…" : wasSaved ? "✓ บันทึกแล้ว" : "ยังไม่ได้บันทึก"}</span><button className="primary-button" type="button" onClick={save} disabled={saving}>{saving ? "กำลังบันทึก" : "บันทึกสูตร"}</button></div>
    </div>
    <article className="paper recipe-paper">
      <header className="recipe-heading"><div><h1>COLOR CONSULTATION &amp; RECIPE</h1><p>CLIENT RECORD</p><small>วิเคราะห์ · สูตร · เทคนิค · ผลลัพธ์ · การดูแลต่อเนื่อง</small></div><div className="paper-mark"><strong>HAIR SALON</strong><span>COLOR RECORD</span></div><div className="recipe-date"><label>วันที่ทำ<input type="date" value={draft.date} onChange={(event) => change({ ...draft, date: event.target.value })} /></label><p>บันทึกโดย: <span>ช่างประจำร้าน</span></p></div></header>

      <section className="analysis-grid" aria-label="ข้อมูลลูกค้าและวิเคราะห์เส้นผม">
        <div className="paper-block client-block"><h2>ข้อมูลลูกค้า</h2><div className="client-lines"><p><span>ชื่อ</span><strong>{customer.prefix} {customer.name}</strong></p><p><span>โทรศัพท์</span><strong>{customer.phone || "—"}</strong></p><p><span>อีเมล</span><strong>{customer.email || "—"}</strong></p><p><span>วันเกิด</span><strong>{customer.birthday || "—"}</strong></p></div></div>
        <div className="paper-block texture-block"><h2>โครงสร้างเส้นผม</h2><Image unoptimized className="hair-structure-art" src="/record-assets/hair-structure.png" alt="เส้นตัวอย่างผมละเอียด ปกติ และหนา" width={1536} height={1024} /><div className="texture-options" role="group" aria-label="เลือกโครงสร้างเส้นผม">{["ละเอียด", "ปกติ", "หนา"].map((texture) => <button key={texture} type="button" className={draft.analysis.texture === texture ? "texture-choice is-selected" : "texture-choice"} aria-pressed={draft.analysis.texture === texture} onClick={() => updateAnalysis("texture", texture)}>{texture}</button>)}</div><ChoiceGroup label="บริเวณที่ทำ" values={areas} selected={draft.serviceAreas} onChange={(serviceAreas) => change({ ...draft, serviceAreas })} /></div>
        <div className="paper-block condition-block"><h2>สภาพเส้นผม</h2><ChoiceGroup label="สภาพเส้นผม" values={["สุขภาพดี", "แห้ง", "เสีย/ผ่านการทำเคมี", "เสียมาก"]} selected={[draft.analysis.condition]} selection="single" onChange={(items) => updateAnalysis("condition", items[0] ?? draft.analysis.condition)} /><ChoiceGroup label="ผมหงอก (%)" values={["0%", "<30%", "30–50%", "50–70%", ">70%"]} selected={[draft.analysis.greyCoverage]} selection="single" onChange={(items) => updateAnalysis("greyCoverage", items[0] ?? draft.analysis.greyCoverage)} /></div>
        <section className="paper-block natural-levels" aria-labelledby="natural-level-heading"><h2 id="natural-level-heading">สีผมธรรมชาติ</h2><Image unoptimized className="natural-level-art" src="/record-assets/natural-hair-levels.png" alt="ตัวอย่างสีผมธรรมชาติจากระดับ 1 ถึง 8" width={1536} height={1024} /><div className="natural-level-options" role="radiogroup" aria-label="เลือกระดับสีผมธรรมชาติ">{[1, 2, 3, 4, 5, 6, 7, 8].map((level) => { const value = String(level); const inputId = `natural-level-${level}`; const selected = draft.analysis.naturalLevel === value; return <label key={level} htmlFor={inputId} className={selected ? "natural-level-choice is-selected" : "natural-level-choice"}><input id={inputId} type="radio" name="natural-level" value={value} checked={selected} onChange={() => updateAnalysis("naturalLevel", value)} /><span>ระดับ {level}</span></label>; })}</div><small>ระดับ 1 เข้มที่สุด · ระดับ 8 อ่อนที่สุด</small></section>
      </section>

      <section className="recipe-table-section" aria-labelledby="formula-heading"><div className="section-title"><h2 id="formula-heading">สูตรสี</h2><button type="button" className="small-button" onClick={() => change({ ...draft, formulaRows: [...draft.formulaRows, newRow(draft.date)] })}>+ เพิ่มแถวสูตร</button></div><div className="table-wrap"><table><thead><tr><th>ลำดับ</th><th>วันที่</th><th>บริเวณ</th><th>รหัสสี/เฉดสี</th><th>ปริมาณสี<br />(g)</th><th>Oxidant/<br />Developer</th><th>ปริมาณ Oxidant<br />(g)</th><th>อัตราส่วนผสม</th><th>เวลา<br />(นาที)</th><th>หมายเหตุ</th><th><span className="sr-only">ลบ</span></th></tr></thead><tbody>{draft.formulaRows.map((row, index) => <tr key={row.id}><td>{index + 1}</td><td><input aria-label={`วันที่แถว ${index + 1}`} type="date" value={row.date} onChange={(event) => updateRow(row.id, "date", event.target.value)} /></td><td><select aria-label={`บริเวณแถว ${index + 1}`} value={row.area} onChange={(event) => updateRow(row.id, "area", event.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select></td><td><input aria-label={`รหัสสีแถว ${index + 1}`} value={row.shade} onChange={(event) => updateRow(row.id, "shade", event.target.value)} /></td><td><input aria-label={`ปริมาณสีแถว ${index + 1}`} type="number" min="0" value={row.colorAmount} onChange={(event) => updateRow(row.id, "colorAmount", event.target.value)} /></td><td><input aria-label={`Oxidant แถว ${index + 1}`} value={row.oxidant} onChange={(event) => updateRow(row.id, "oxidant", event.target.value)} /></td><td><input aria-label={`ปริมาณ Oxidant แถว ${index + 1}`} type="number" min="0" value={row.oxidantAmount} onChange={(event) => updateRow(row.id, "oxidantAmount", event.target.value)} /></td><td><input aria-label={`อัตราส่วนผสมแถว ${index + 1}`} pattern="\d+:\d+(\.\d+)?" value={row.ratio} onChange={(event) => updateRow(row.id, "ratio", event.target.value)} /></td><td><input aria-label={`เวลาแถว ${index + 1}`} type="number" min="0" value={row.processingTime} onChange={(event) => updateRow(row.id, "processingTime", event.target.value)} /></td><td><input aria-label={`หมายเหตุแถว ${index + 1}`} value={row.notes} onChange={(event) => updateRow(row.id, "notes", event.target.value)} /></td><td><button className="icon-button" type="button" aria-label={`ลบสูตรแถว ${index + 1}`} onClick={() => change({ ...draft, formulaRows: draft.formulaRows.filter((item) => item.id !== row.id) })}>×</button></td></tr>)}</tbody></table></div></section>

      <section className="paper-bottom-grid">
        <div className="paper-block products-block"><h2>ผลิตภัณฑ์ที่ใช้</h2><div><Image unoptimized className="product-art" src="/record-assets/salon-products.png" alt="ภาชนะผลิตภัณฑ์ทำผมแบบไม่ระบุแบรนด์" width={1536} height={1024} /><ChoiceGroup label="เลือกผลิตภัณฑ์" values={products} selected={draft.products} onChange={(items) => change({ ...draft, products: items })} /></div><div className="add-line"><label className="sr-only" htmlFor="new-product">เพิ่มผลิตภัณฑ์</label><input id="new-product" placeholder="รายการอื่น" value={productInput} onChange={(event) => setProductInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag("products", productInput, () => setProductInput("")); } }} /><button type="button" className="small-button" onClick={() => addTag("products", productInput, () => setProductInput(""))}>เพิ่ม</button></div></div>
        <div className="paper-block"><h2>เทคนิค</h2><ChoiceGroup label="เลือกเทคนิค" values={techniques} selected={draft.techniques} onChange={(items) => change({ ...draft, techniques: items })} /><div className="add-line"><label className="sr-only" htmlFor="new-technique">เพิ่มเทคนิค</label><input id="new-technique" placeholder="เทคนิคอื่น" value={techniqueInput} onChange={(event) => setTechniqueInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag("techniques", techniqueInput, () => setTechniqueInput("")); } }} /><button type="button" className="small-button" onClick={() => addTag("techniques", techniqueInput, () => setTechniqueInput(""))}>เพิ่ม</button></div></div>
        <div className="paper-block note-block"><h2>โน้ต / ความพิเศษ</h2><label className="sr-only" htmlFor="result-notes">รายละเอียดเทคนิค ผลลัพธ์ และข้อควรจำ</label><textarea id="result-notes" rows={8} value={draft.notes} onChange={(event) => change({ ...draft, notes: event.target.value })} placeholder="รายละเอียดเทคนิค ผลลัพธ์ และข้อควรจำ…" /></div>
        <div className="paper-block sketch"><div className="sketch-toolbar"><h2>ผลลัพธ์ / สเก็ตช์</h2><div><button type="button" className={tool === "pen" ? "tool active" : "tool"} onClick={() => setTool("pen")}>ปากกา</button><button type="button" className={tool === "eraser" ? "tool active" : "tool"} onClick={() => setTool("eraser")}>ยางลบ</button><button type="button" className="tool" onClick={() => change({ ...draft, strokes: draft.strokes.slice(0, -1) })} disabled={!draft.strokes.length}>Undo</button></div></div><div className="sketch-stage"><Image unoptimized className="result-reference-art" src="/record-assets/hair-result-views.png" alt="ภาพอ้างอิงทรงผมด้านหน้า ด้านข้าง และด้านหลัง" fill sizes="(max-width: 600px) 100vw, 320px" /><DrawingPad strokes={draft.strokes} tool={tool} onChange={(strokes) => change({ ...draft, strokes })} /></div><p className="helper">เขียนด้วยเมาส์ นิ้ว หรือ stylus</p></div>
      </section>
      <footer className="paper-footer"><span>ข้อมูลนี้บันทึกในอุปกรณ์เครื่องนี้</span><button className="primary-button" type="button" onClick={save} disabled={saving}>{saving ? "กำลังบันทึก…" : "บันทึกสูตร"}</button></footer>
    </article>
  </main>;
}
