"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { RecordEditor } from "@/components/record-editor";
import { UiIcon } from "@/components/ui-icon";
import { cleanRecord, type ColorRecord, type Customer, isSalonBackup, newRecord, sampleData, sortCustomers, STORAGE_KEY, type SalonBackup, uid } from "@/lib/salon-data";

type View = "workspace" | "editor";
const blankCustomer = () => ({ name: "", phone: "", email: "", birthday: "", prefix: "คุณ" });

export function SalonApp() {
  const [view, setView] = useState<View>("workspace");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [records, setRecords] = useState<ColorRecord[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [editorRecord, setEditorRecord] = useState<ColorRecord | null>(null);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [customerForm, setCustomerForm] = useState(blankCustomer());
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const data = saved ? JSON.parse(saved) : sampleData;
        if (!isSalonBackup(data)) throw new Error("ไม่พบข้อมูลเดโมที่ใช้งานได้");
        setCustomers(data.customers); setRecords(data.records); setActiveCustomerId(data.customers[0]?.id ?? null);
      } catch (reason) { setError(reason instanceof Error ? `โหลดข้อมูลไม่สำเร็จ: ${reason.message}` : "โหลดข้อมูลไม่สำเร็จ"); }
      finally { setReady(true); }
    }, 0);
    return () => window.clearTimeout(load);
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const persist = (nextCustomers: Customer[], nextRecords: ColorRecord[]) => {
    const backup: SalonBackup = { version: 1, customers: nextCustomers, records: nextRecords };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(backup)); setCustomers(nextCustomers); setRecords(nextRecords); return true; }
    catch (reason) { setError(reason instanceof Error ? `บันทึกในอุปกรณ์ไม่สำเร็จ: ${reason.message}` : "บันทึกในอุปกรณ์ไม่สำเร็จ"); return false; }
  };
  const guarded = (action: () => void) => { if (!dirty || window.confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ต้องการทิ้งการแก้ไขหรือไม่?")) { setDirty(false); action(); } };
  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) ?? null;
  const visibleCustomers = useMemo(() => sortCustomers(customers).filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))), [customers, query]);
  const customerRecords = useMemo(() => records.filter((record) => record.customerId === activeCustomerId).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)), [records, activeCustomerId]);

  const saveRecord = (record: ColorRecord) => {
    const clean = cleanRecord(record);
    const exists = records.some((item) => item.id === clean.id);
    if (persist(customers, exists ? records.map((item) => item.id === clean.id ? clean : item) : [clean, ...records])) { setEditorRecord(clean); setNotice("บันทึกสูตรลงในอุปกรณ์แล้ว"); }
  };
  const createCustomer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = customerForm.name.trim();
    if (!name) return;
    const now = new Date().toISOString();
    const customer: Customer = { id: uid(), name, phone: customerForm.phone.trim(), email: customerForm.email.trim(), birthday: customerForm.birthday, prefix: customerForm.prefix, createdAt: now, updatedAt: now };
    if (persist([...customers, customer], records)) { setActiveCustomerId(customer.id); setShowCustomerForm(false); setCustomerForm(blankCustomer()); setNotice(`เพิ่มลูกค้า ${customer.name} แล้ว`); }
  };
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ version: 1, customers, records }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `hair-salon-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); setNotice("ดาวน์โหลดไฟล์สำรองข้อมูลแล้ว");
  };
  const importBackup = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(String(reader.result));
        if (!isSalonBackup(data)) throw new Error("ไฟล์ไม่ใช่ backup ของ Hair Salon หรือโครงสร้างไม่ครบ");
        if (!window.confirm("นำเข้าข้อมูลจะเขียนทับข้อมูลในอุปกรณ์นี้ ต้องการดำเนินการต่อหรือไม่?")) return;
        if (persist(data.customers, data.records)) { setActiveCustomerId(data.customers[0]?.id ?? null); setView("workspace"); setNotice(`นำเข้าลูกค้า ${data.customers.length} ราย และสูตร ${data.records.length} รายการแล้ว`); }
      } catch (reason) { setError(reason instanceof Error ? `นำเข้าไม่สำเร็จ: ${reason.message}` : "นำเข้าไม่สำเร็จ"); }
    };
    reader.onerror = () => setError("ไม่สามารถอ่านไฟล์ backup ได้"); reader.readAsText(file);
  };
  const selectCustomer = (id: string) => guarded(() => { setActiveCustomerId(id); setEditorRecord(null); setView("workspace"); });
  const openEditor = (record: ColorRecord) => guarded(() => { setEditorRecord(record); setView("editor"); });

  if (!ready) return <main className="loading-screen" aria-busy="true"><div className="loading-card"><p className="eyebrow">HAIR SALON</p><h1>กำลังเตรียมสมุดบันทึกสี…</h1><p>กำลังเปิดข้อมูลในอุปกรณ์ของคุณ</p></div></main>;
  if (view === "editor" && activeCustomer && editorRecord) return <RecordEditor key={editorRecord.id} customer={activeCustomer} record={editorRecord} onSave={saveRecord} onDirtyChange={setDirty} onBack={() => guarded(() => { setView("workspace"); setEditorRecord(null); })} />;

  return <main className="app-shell">
    <input ref={fileRef} className="sr-only" type="file" accept="application/json,.json" onChange={importBackup} />
    <aside className="sidebar"><div className="brand"><p className="eyebrow">HAIR SALON</p><h1>Color Record</h1><p>บันทึกสีผมอย่างละเอียด</p></div><div className="sidebar-actions"><button className="primary-button" type="button" onClick={() => setShowCustomerForm(true)}>+ เพิ่มลูกค้า</button><div className="backup-buttons"><button type="button" className="text-button" onClick={exportBackup}><UiIcon name="export" /> Export JSON</button><button type="button" className="text-button" onClick={() => fileRef.current?.click()}><UiIcon name="import" /> Import</button></div></div><label className="search"><span className="sr-only">ค้นหาลูกค้า</span><input type="search" placeholder="ค้นหาชื่อ, เบอร์, อีเมล" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="customer-list" aria-label="รายชื่อลูกค้า">{visibleCustomers.length ? visibleCustomers.map((customer) => <button type="button" key={customer.id} className={customer.id === activeCustomerId ? "customer-row selected" : "customer-row"} onClick={() => selectCustomer(customer.id)}><span className="avatar">{customer.name.slice(0, 1)}</span><span><strong>{customer.name}</strong><small>{customer.phone || customer.email || "ยังไม่มีข้อมูลติดต่อ"}</small></span></button>) : <div className="empty-list"><strong>ไม่พบลูกค้า</strong><p>ลองเปลี่ยนคำค้น หรือเพิ่มลูกค้ารายใหม่</p></div>}</div><p className="sidebar-foot">ข้อมูลอยู่ใน browser ของเครื่องนี้</p></aside>
      <section className="profile-panel">{error && <div className="alert error" role="alert">{error}<button type="button" onClick={() => setError("")}>ปิด</button></div>}{notice && <div className="alert success" role="status">✓ {notice}<button type="button" onClick={() => setNotice("")}>ปิด</button></div>}{activeCustomer ? <><header className="profile-header"><div><p className="eyebrow">CLIENT PROFILE</p><h2>{activeCustomer.prefix} {activeCustomer.name}</h2><p>{activeCustomer.phone || "ไม่ระบุโทรศัพท์"} <span>·</span> {activeCustomer.email || "ไม่ระบุอีเมล"}</p></div><button className="primary-button" type="button" onClick={() => openEditor(newRecord(activeCustomer.id))}>+ สร้างสูตรใหม่</button></header><div className="record-intro"><div><h3>ประวัติสูตรสี</h3><p>{customerRecords.length} รายการ · รายการล่าสุดอยู่ด้านบน</p></div><span>{activeCustomer.birthday ? `เกิด ${activeCustomer.birthday}` : "ยังไม่ระบุวันเกิด"}</span></div>{customerRecords.length ? <div className="record-list">{customerRecords.map((record) => <article className="record-card" key={record.id}><div className="record-date"><span>{record.date.slice(-2)}</span><small>{record.date.slice(0, 7)}</small></div><div className="record-detail"><p className="eyebrow">{record.serviceAreas.join(" · ") || "ยังไม่ระบุบริเวณ"}</p><h3>{record.formulaRows.map((row) => row.shade).filter(Boolean).join(" + ") || "สูตรที่ยังไม่ระบุเฉดสี"}</h3><p>{record.notes || "ไม่มีหมายเหตุเพิ่มเติม"}</p></div><div className="record-meta"><span>{record.techniques.join(", ") || "ยังไม่ระบุเทคนิค"}</span><button type="button" className="small-button" onClick={() => openEditor(record)}>เปิดสูตร <UiIcon name="chevron" /></button></div></article>)}</div> : <div className="empty-records"><p className="eyebrow">NO RECORDS YET</p><h3>เริ่มสร้างสูตรแรกของ {activeCustomer.name}</h3><p>บันทึกการวิเคราะห์ สีผม และเทคนิค เพื่อนำกลับมาใช้ในครั้งถัดไป</p><button className="primary-button" type="button" onClick={() => openEditor(newRecord(activeCustomer.id))}>สร้างสูตรใหม่</button></div>}</> : <div className="empty-records"><p className="eyebrow">NO CUSTOMERS</p><h2>เริ่มจากเพิ่มลูกค้ารายแรก</h2><button className="primary-button" type="button" onClick={() => setShowCustomerForm(true)}>+ เพิ่มลูกค้า</button></div>}</section>
    {showCustomerForm && <div className="modal-layer" role="presentation"><form className="customer-modal" onSubmit={createCustomer}><div><p className="eyebrow">NEW CLIENT</p><h2>เพิ่มลูกค้าใหม่</h2></div><label>ชื่อ-นามสกุล<input autoFocus required value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} /></label><div className="form-grid"><label>คำนำหน้า<select value={customerForm.prefix} onChange={(event) => setCustomerForm({ ...customerForm, prefix: event.target.value })}><option>คุณ</option><option>นาง</option><option>นาย</option><option>ไม่ระบุ</option></select></label><label>วันเกิด<input type="date" value={customerForm.birthday} onChange={(event) => setCustomerForm({ ...customerForm, birthday: event.target.value })} /></label></div><label>โทรศัพท์<input type="tel" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} /></label><label>อีเมล<input type="email" value={customerForm.email} onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })} /></label><div className="modal-actions"><button type="button" className="text-button" onClick={() => setShowCustomerForm(false)}>ยกเลิก</button><button className="primary-button" type="submit">บันทึกลูกค้า</button></div></form></div>}
  </main>;
}
