import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/Home.module.css";

const today = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; };
const initialServices = [
  { id: "s1", name: "ตัดผม", duration: 45, price: 450, active: true },
  { id: "s2", name: "สระไดร์", duration: 30, price: 300, active: true },
  { id: "s3", name: "ทำสีผม", duration: 120, price: 1800, active: true },
  { id: "s4", name: "ทรีตเมนต์", duration: 60, price: 900, active: true },
];
const demoData = {
  customers: [
    { id: "c1", name: "คุณแพรวา ใจดี", phone: "0812345678", email: "praewa@example.com", note: "แพ้ผลิตภัณฑ์ที่มีน้ำหอม", createdAt: today() },
    { id: "c2", name: "คุณณัฐวุฒิ พงษ์ศรี", phone: "0897654321", email: "", note: "ชอบทรงสั้น", createdAt: today() },
    { id: "c3", name: "คุณมินตรา วัฒนกุล", phone: "0861122334", email: "mintra@example.com", note: "", createdAt: today() },
  ],
  bookings: [
    { id: "b1", customerId: "c1", serviceId: "s1", date: today(), time: "10:00", status: "ยืนยันแล้ว", note: "ตัดปลาย", createdAt: new Date().toISOString() },
    { id: "b2", customerId: "c2", serviceId: "s3", date: today(), time: "13:00", status: "รอยืนยัน", note: "", createdAt: new Date().toISOString() },
    { id: "b3", customerId: "c3", serviceId: "s2", date: today(), time: "15:00", status: "ยืนยันแล้ว", note: "", createdAt: new Date().toISOString() },
  ],
  services: initialServices,
  settings: { salonName: "MUSE Hair Studio", open: "09:00", close: "19:00", closedDays: [], latitude: "", longitude: "" },
  history: [],
};
const navItems = [
  ["overview", "home", "ภาพรวม"], ["bookings", "calendar", "จัดการการจอง"],
  ["customers", "users", "จัดการลูกค้า"], ["services", "sparkles", "บริการและเวลา"],
  ["data", "database", "ข้อมูลและสำรอง"],
];
const money = (n) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(n || 0));
const localDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function Home() {
  const [data, setData] = useState(demoData);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeRecordId, setActiveRecordId] = useState(null);
  const [recordDirty, setRecordDirty] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const importRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("muse-salon-data");
      if (saved) setData({ ...demoData, ...JSON.parse(saved) });
      if (sessionStorage.getItem("muse-salon-auth") === "admin") setAuthed(true);
    } catch { /* keep the starter data if storage is unavailable */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("muse-salon-data", JSON.stringify(data)); }, [data, ready]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(""), 3000); return () => clearTimeout(timer); } }, [notice]);

  const activeBookings = data.bookings.filter((b) => b.status !== "ยกเลิกแล้ว");
  const todayBookings = activeBookings.filter((b) => b.date === today());
  const gross = data.history.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const filteredCustomers = useMemo(() => data.customers.filter((c) => `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(query.toLowerCase())), [data.customers, query]);
  const filteredBookings = useMemo(() => data.bookings.filter((b) => {
    const customer = data.customers.find((c) => c.id === b.customerId);
    const service = data.services.find((s) => s.id === b.serviceId);
    return `${customer?.name || ""} ${customer?.phone || ""} ${service?.name || ""} ${b.date} ${b.status}`.toLowerCase().includes(query.toLowerCase());
  }), [data.bookings, data.customers, data.services, query]);

  function update(patch) { setData((current) => ({ ...current, ...patch })); }
  function login(event) {
    event.preventDefault();
    if (credentials.username === "admin" && credentials.password === "admin") {
      sessionStorage.setItem("muse-salon-auth", "admin"); setAuthed(true); setNotice("เข้าสู่ระบบสำเร็จ");
    } else setNotice("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }
  function logout() { if (recordDirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากระบบหรือไม่?")) return; sessionStorage.removeItem("muse-salon-auth"); setRecordDirty(false); setActiveRecordId(null); setAuthed(false); setPage("overview"); }
  function saveCustomer(form) {
    const existing = data.customers.find((c) => c.id === form.id);
    const customer = { ...form, id: form.id || `c${Date.now()}`, createdAt: form.createdAt || today() };
    update({ customers: existing ? data.customers.map((c) => c.id === customer.id ? customer : c) : [customer, ...data.customers] });
    setSelectedCustomer(customer.id); setModal(null); setNotice(existing ? "บันทึกข้อมูลลูกค้าแล้ว" : "เพิ่มลูกค้าแล้ว");
  }
  function deleteCustomer(customer) {
    update({
      customers: data.customers.filter((c) => c.id !== customer.id),
      bookings: data.bookings.filter((b) => b.customerId !== customer.id),
      history: data.history.filter((item) => item.customerId !== customer.id),
    });
    setSelectedCustomer(null); setModal(null); setNotice("ลบข้อมูลลูกค้าและรายการที่เกี่ยวข้องแล้ว");
  }
  function saveBooking(form) {
    const service = data.services.find((s) => s.id === form.serviceId);
    const customer = data.customers.find((c) => c.id === form.customerId);
    if (!customer || !service) return setNotice("กรุณาเลือกลูกค้าและบริการ");
    const [openH, openM] = data.settings.open.split(":").map(Number);
    const [closeH, closeM] = data.settings.close.split(":").map(Number);
    const [startH, startM] = form.time.split(":").map(Number);
    const start = startH * 60 + startM, end = start + Number(service.duration);
    if (start < openH * 60 + openM || end > closeH * 60 + closeM) return setNotice("เวลาจองอยู่นอกเวลาทำการ");
    const weekday = (new Date(`${form.date}T00:00:00`).getDay() + 6) % 7;
    if ((data.settings.closedDays || []).includes(weekday)) return setNotice("ร้านปิดทำการในวันที่เลือก กรุณาเลือกวันอื่น");
    const conflict = data.bookings.some((b) => b.id !== form.id && b.date === form.date && b.status !== "ยกเลิกแล้ว" && (() => {
      const other = data.services.find((s) => s.id === b.serviceId); if (!other) return false;
      const [h, m] = b.time.split(":").map(Number); const a = h * 60 + m, z = a + Number(other.duration);
      return start < z && end > a;
    })());
    if (conflict) return setNotice("ช่วงเวลานี้มีคิวแล้ว กรุณาเลือกเวลาอื่น");
    const booking = { ...form, id: form.id || `b${Date.now()}`, status: form.status || "รอยืนยัน", createdAt: form.createdAt || new Date().toISOString() };
    update({ bookings: form.id ? data.bookings.map((b) => b.id === form.id ? booking : b) : [booking, ...data.bookings] });
    setModal(null); setNotice(form.id ? "อัปเดตการจองแล้ว" : "สร้างรายการจองแล้ว");
  }
  function setBookingStatus(booking, status) {
    if (status === "เสร็จสิ้น" && booking.status !== "เสร็จสิ้น") {
      const svc = data.services.find((s) => s.id === booking.serviceId);
      update({ bookings: data.bookings.map((b) => b.id === booking.id ? { ...b, status } : b), history: [{ id: `h${Date.now()}`, bookingId: booking.id, customerId: booking.customerId, serviceId: booking.serviceId, date: booking.date, amount: svc?.price || 0, note: booking.note || "" }, ...data.history] });
    } else update({ bookings: data.bookings.map((b) => b.id === booking.id ? { ...b, status } : b) });
    setNotice(`เปลี่ยนสถานะเป็น${status}แล้ว`);
  }
  function saveService(form) {
    const exists = data.services.some((s) => s.id === form.id);
    update({ services: exists ? data.services.map((s) => s.id === form.id ? form : s) : [...data.services, { ...form, id: `s${Date.now()}`, active: true }] });
    setModal(null); setNotice("บันทึกบริการแล้ว");
  }
  function saveHairRecord(bookingId, consultation) {
    setData((current) => ({ ...current, bookings: current.bookings.map((booking) => booking.id === bookingId ? { ...booking, consultation } : booking) }));
    setRecordDirty(false); setNotice("บันทึกใบวิเคราะห์และสูตรสีแล้ว");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `muse-salon-backup-${today()}.json`; link.click(); URL.revokeObjectURL(link.href); setNotice("ดาวน์โหลดไฟล์สำรองแล้ว");
  }
  function importData(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!Array.isArray(imported.customers) || !Array.isArray(imported.bookings) || !Array.isArray(imported.services)) throw new Error(); update({ ...demoData, ...imported }); setNotice("นำเข้าข้อมูลสำเร็จ"); } catch { setNotice("ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์สำรอง JSON"); } event.target.value = ""; }; reader.readAsText(file);
  }

  if (!ready) return <div className={styles.loading}>กำลังเตรียมระบบ…</div>;
  if (!authed) return <><Head><title>เข้าสู่ระบบ · MUSE Hair Studio</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head><main className={styles.loginPage}>
    <section className={styles.loginCard}><div className={styles.brandMark}>m</div><p className={styles.eyebrow}>MUSE HAIR STUDIO</p><h1>ดูแลทุกคิว<br />ให้เป็นเรื่องง่าย</h1><p className={styles.loginSub}>ระบบจัดการร้านทำผมของคุณ</p>
      <form onSubmit={login} className={styles.loginForm}><label>ชื่อผู้ใช้<input autoComplete="username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} placeholder="กรอกชื่อผู้ใช้" required /></label><label>รหัสผ่าน<input type="password" autoComplete="current-password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} placeholder="กรอกรหัสผ่าน" required /></label><button className={styles.primaryButton}>เข้าสู่ระบบ <NavIcon name="arrowRight" size={15} /></button></form>
      <div className={styles.demoLogin}>บัญชีเริ่มต้น <b>admin</b> / <b>admin</b><span>สิทธิ์ผู้ดูแลระบบ</span></div>
    </section><div className={styles.loginAside}><div className={styles.heroCircle}><NavIcon name="sparkles" size={62} /></div><p>พื้นที่เล็ก ๆ<br />สำหรับวันดี ๆ ของเส้นผม</p><span>จัดการร้านได้อย่างสบายใจ</span></div>
    {notice && <div className={styles.toast}>{notice}</div>}</main></>;

  const pageTitle = navItems.find((item) => item[0] === page)?.[2] || "ภาพรวม";
  return <><Head><title>{pageTitle} · MUSE Hair Studio</title><meta name="description" content="ระบบจัดการร้านทำผม MUSE Hair Studio" /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
    <div className={styles.appShell}><aside className={styles.sidebar}><a className={styles.brand} onClick={() => { if (recordDirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?")) return; setRecordDirty(false); setActiveRecordId(null); setPage("overview"); }}><span className={styles.brandMarkSmall}>m</span><span><b>MUSE</b><small>HAIR STUDIO</small></span></a><div className={styles.navLabel}>WORKSPACE</div><nav>{navItems.map(([key, icon, label]) => <button key={key} className={`${styles.navItem} ${page === key ? styles.navActive : ""}`} onClick={() => { if (recordDirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?")) return; setRecordDirty(false); setActiveRecordId(null); setPage(key); setQuery(""); }}><span className={styles.navIcon}><NavIcon name={icon} /></span>{label}{key === "bookings" && todayBookings.length > 0 && <i>{todayBookings.length}</i>}</button>)}</nav><div className={styles.sidebarBottom}><div className={styles.adminBadge}><div className={styles.avatar}>A</div><span><b>ผู้ดูแลระบบ</b><small>admin</small></span></div><button className={styles.logout} onClick={logout}><NavIcon name="logout" /><span>ออกจากระบบ</span></button></div></aside>
      <main className={styles.mainPanel}><header className={styles.topbar}><div className={styles.mobileBrand}><span className={styles.brandMarkSmall}>m</span> MUSE</div><div className={styles.breadcrumb}>หน้าหลัก <span>/</span> <b>{pageTitle}</b></div><div className={styles.topRight}><span className={styles.todayDate}>{new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}</span><div className={styles.avatar}>A</div></div></header>
        <div className={styles.content}>{activeRecordId ? <HairRecord booking={data.bookings.find((booking) => booking.id === activeRecordId)} data={data} saveRecord={saveHairRecord} onDirtyChange={setRecordDirty} back={() => setActiveRecordId(null)} /> : <>
          {page === "overview" && <Overview data={data} todayBookings={todayBookings} activeBookings={activeBookings} gross={gross} setPage={setPage} setModal={setModal} setBookingStatus={setBookingStatus} openRecord={(booking) => { setRecordDirty(false); setPage("bookings"); setActiveRecordId(booking.id); }} />}
          {page === "bookings" && <BookingsPage data={data} bookings={filteredBookings} query={query} setQuery={setQuery} setModal={setModal} setBookingStatus={setBookingStatus} openRecord={(booking) => { setRecordDirty(false); setActiveRecordId(booking.id); }} />}
          {page === "customers" && <>{selectedCustomer ? <CustomerProfile customer={data.customers.find((c) => c.id === selectedCustomer)} data={data} back={() => setSelectedCustomer(null)} edit={(c) => setModal({ type: "customer", item: c })} remove={(c) => setModal({ type: "deleteCustomer", item: c })} newBooking={(c) => setModal({ type: "booking", item: { customerId: c.id } })} /> : <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>CUSTOMER CARE</p><h1>จัดการลูกค้า</h1><p>ข้อมูลติดต่อ ความชอบ และประวัติการใช้บริการ</p></div><button className={styles.primaryButton} onClick={() => setModal({ type: "customer" })}><NavIcon name="plus" size={15} /> เพิ่มลูกค้า</button></div><div className={styles.panel}><div className={styles.panelHeader}><div><h2>ลูกค้าทั้งหมด</h2><span>{filteredCustomers.length} คน</span></div><Search value={query} setValue={setQuery} placeholder="ค้นหาชื่อหรือเบอร์โทร" /></div><CustomerTable customers={filteredCustomers} data={data} select={(c) => setSelectedCustomer(c.id)} edit={(c) => setModal({ type: "customer", item: c })} remove={(c) => setModal({ type: "deleteCustomer", item: c })} /></div></>}</>}
          {page === "services" && <Services data={data} saveService={saveService} setModal={setModal} update={update} />}
          {page === "data" && <DataPage data={data} exportData={exportData} importRef={importRef} importData={importData} reset={() => setModal({ type: "reset" })} />}
        </>}</div><footer className={styles.footer}>MUSE Hair Studio <span>·</span> ระบบจัดการร้านทำผม</footer>
      </main>
      {modal && <Modal modal={modal} data={data} close={() => setModal(null)} saveCustomer={saveCustomer} saveBooking={saveBooking} saveService={saveService} deleteCustomer={deleteCustomer} update={update} />}
      {notice && <div className={styles.toast}>{notice}</div>}
    </div>
  </>;
}

function NavIcon({ name, size = 18, className }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v10h13V9M9 19v-6h6v6" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /><path d="M8 13h2M14 13h2M8 17h2" /></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V20" /><circle cx="10" cy="7.5" r="3.5" /><path d="M16 4.3a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a4 4 0 0 0-3-3.9" /></>,
    sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14ZM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8-1.8-.7 1.8-.7L5 3Z" /></>,
    database: <><ellipse cx="12" cy="5" rx="8.5" ry="3" /><path d="M3.5 5v7c0 1.7 3.8 3 8.5 3 1.1 0 2.1-.1 3-.2M3.5 12v7c0 1.7 3.8 3 8.5 3M20.5 5v6" /><path d="M20 15.5v6M17 18.5h6" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3.5" /><path d="M12 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    money: <><rect x="3" y="5" width="18" height="14" rx="2.2" /><circle cx="12" cy="12" r="3" /><path d="M6.5 8.5h.01M17.5 15.5h.01" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrowRight: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
    download: <><path d="M12 4v12M7 11l5 5 5-5" /><path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrowBack: <><path d="M20 12H5M11 6l-6 6 6 6" /></>,
    external: <><path d="M13 5h6v6M19 5l-9 9" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
    file: <><path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 2-1.5Z" /><path d="M14 4v4h4M8 12h8M8 16h8" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    pen: <><path d="m4 20 4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /><path d="m14.8 6.2 3 3" /></>,
    eraser: <><path d="m7 19-3-3a2 2 0 0 1 0-2.8l8.2-8.2a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L14 19H7Z" /><path d="m9 9 7 7M7 19h13" /></>,
    undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h9a6 6 0 0 1 0 12h-2" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    scissors: <><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="m8 8 12 12M8 16 20 4M14 10l-3 3" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} className={className} {...common}>{paths[name] || paths.sparkles}</svg>;
}

function Overview({ data, todayBookings, activeBookings, gross, setPage, setModal, setBookingStatus, openRecord }) {
  const upcoming = todayBookings.filter((b) => b.status !== "เสร็จสิ้น").sort((a, b) => a.time.localeCompare(b.time));
  return <><div className={styles.welcome}><div><p className={styles.eyebrow}>ภาพรวมประจำวัน</p><h1>สวัสดีครับ, <span>แอดมิน</span> <span className={styles.wave}><NavIcon name="sparkles" size={18} /></span></h1><p>นี่คือสิ่งที่เกิดขึ้นที่ร้านของคุณวันนี้</p></div><button className={styles.primaryButton} onClick={() => setModal({ type: "booking" })}><NavIcon name="plus" size={15} /> สร้างรายการจอง</button></div>
    <div className={styles.statGrid}><Stat icon="calendar" label="คิววันนี้" value={`${todayBookings.length}`} detail="รายการนัดหมาย" tone="blue" /><Stat icon="users" label="ลูกค้าทั้งหมด" value={`${data.customers.length}`} detail="รายชื่อในระบบ" tone="violet" /><Stat icon="clock" label="คิวที่กำลังดำเนินการ" value={`${activeBookings.filter((b) => b.status === "กำลังให้บริการ").length}`} detail="รายการ" tone="orange" /><Stat icon="money" label="รายได้สะสม" value={money(gross)} detail="จากรายการที่ปิดบริการ" tone="green" /></div>
    <div className={styles.overviewGrid}><section className={styles.panel}><div className={styles.panelHeader}><div><h2>คิววันนี้</h2><span>{new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</span></div><button className={styles.textButton} onClick={() => setPage("bookings")}>ดูทั้งหมด <NavIcon name="arrowRight" size={13} /></button></div>{upcoming.length ? <BookingTable bookings={upcoming.slice(0, 5)} data={data} setBookingStatus={setBookingStatus} compact onView={openRecord} /> : <Empty title="วันนี้ยังไม่มีคิว" body="เพิ่มรายการจองใหม่เพื่อเริ่มต้นวันดี ๆ" />}</section><aside className={styles.sideStack}><section className={`${styles.panel} ${styles.quickPanel}`}><div className={styles.panelHeader}><div><h2>ทางลัด</h2><span>ทำรายการที่ใช้บ่อย</span></div></div><button onClick={() => setModal({ type: "booking" })}><span className={styles.quickIcon}><NavIcon name="plus" /></span><span><b>สร้างรายการจอง</b><small>ลงคิวลูกค้าและเลือกบริการ</small></span><i><NavIcon name="arrowRight" size={14} /></i></button><button onClick={() => { setPage("customers"); }}><span className={`${styles.quickIcon} ${styles.quickPurple}`}><NavIcon name="users" /></span><span><b>จัดการลูกค้า</b><small>ดูประวัติและบันทึกข้อมูล</small></span><i><NavIcon name="arrowRight" size={14} /></i></button><button onClick={() => setPage("data")}><span className={`${styles.quickIcon} ${styles.quickGreen}`}><NavIcon name="upload" /></span><span><b>สำรองข้อมูล</b><small>ส่งออกไฟล์ JSON</small></span><i><NavIcon name="arrowRight" size={14} /></i></button></section><section className={styles.tipCard}><span className={styles.tipSpark}><NavIcon name="sparkles" size={26} /></span><b>ทุกวันคือวันดูแลตัวเอง</b><p>จัดการคิวให้เรียบร้อย แล้วออกไปสร้างทรงผมที่ลูกค้ารักกัน</p></section></aside></div>
  </>;
}
function calendarDate(date) { return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0"); }
function shiftDate(date, amount) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount); }
function mondayOf(date) { return shiftDate(date, -((date.getDay() + 6) % 7)); }
function displayDate(date, options = { day: "numeric", month: "short" }) { return date.toLocaleDateString("th-TH", options); }
function BookingsPage({ data, bookings, query, setQuery, setModal, setBookingStatus, openRecord }) {
  const [view, setView] = useState("calendar");
  const [mode, setMode] = useState("week");
  const [focusDate, setFocusDate] = useState(() => new Date());
  const start = mode === "month" ? mondayOf(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1)) : mode === "week" ? mondayOf(focusDate) : focusDate;
  const days = mode === "day" ? [focusDate] : Array.from({ length: mode === "month" ? 42 : 7 }, (_, i) => shiftDate(start, i));
  const end = days[days.length - 1];
  const title = mode === "day" ? displayDate(focusDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : mode === "month" ? displayDate(focusDate, { month: "long", year: "numeric" }) : displayDate(start) + " – " + displayDate(end, { day: "numeric", month: "short", year: "numeric" });
  function navigate(amount) {
    if (mode === "day") setFocusDate((date) => shiftDate(date, amount));
    else if (mode === "week") setFocusDate((date) => shiftDate(date, amount * 7));
    else setFocusDate((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  }
  function createAt(date, time = "09:00") { setModal({ type: "booking", item: { date: calendarDate(date), time } }); }
  return <>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>APPOINTMENTS</p><h1>จัดการการจอง</h1><p>ดูคิวลูกค้าในปฏิทิน หรือจัดการจากรายการทั้งหมด</p></div><button className={styles.primaryButton} onClick={() => setModal({ type: "booking" })}><NavIcon name="plus" size={15} /> สร้างรายการจอง</button></div>
    <section className={styles.panel + " " + styles.calendarPanel}>
      <div className={styles.calendarToolbar}>
        <div className={styles.calendarDateNav}><button className={styles.calendarArrow} onClick={() => navigate(-1)} aria-label="ช่วงก่อนหน้า"><NavIcon name="chevronLeft" size={16} /></button><button className={styles.calendarArrow} onClick={() => navigate(1)} aria-label="ช่วงถัดไป"><NavIcon name="chevronRight" size={16} /></button><button className={styles.todayButton} onClick={() => setFocusDate(new Date())}>วันนี้</button><h2>{title}</h2></div>
        <div className={styles.calendarToolbarRight}><label className={styles.dateSelector}><NavIcon name="calendar" /><input type="date" aria-label="เลือกวันที่" value={calendarDate(focusDate)} onChange={(event) => { if (event.target.value) setFocusDate(new Date(event.target.value + "T00:00:00")); }} /></label><div className={styles.viewSwitch}><button className={view === "calendar" ? styles.viewSelected : ""} onClick={() => setView("calendar")}>ปฏิทิน</button><button className={view === "list" ? styles.viewSelected : ""} onClick={() => setView("list")}>รายการ</button></div>{view === "calendar" && <div className={styles.viewSwitch}><button className={mode === "day" ? styles.viewSelected : ""} onClick={() => setMode("day")}>วัน</button><button className={mode === "week" ? styles.viewSelected : ""} onClick={() => setMode("week")}>สัปดาห์</button><button className={mode === "month" ? styles.viewSelected : ""} onClick={() => setMode("month")}>เดือน</button></div>}</div>
      </div>
      {view === "calendar" ? <CalendarGrid mode={mode} days={days} bookings={bookings} data={data} onCreate={createAt} onView={openRecord} /> : <><div className={styles.listToolbar}><span>{bookings.length} รายการจอง</span><Search value={query} setValue={setQuery} placeholder="ค้นหาชื่อ เบอร์โทร หรือบริการ" /></div><BookingTable bookings={bookings} data={data} setBookingStatus={setBookingStatus} edit={(booking) => setModal({ type: "booking", item: booking })} onView={openRecord} /></>}
    </section>
  </>;
}
function CalendarGrid({ mode, days, bookings, data, onCreate, onView }) {
  if (mode === "month") return <div className={styles.monthCalendar}><div className={styles.monthWeekdays}>{["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((day) => <span key={day}>{day}</span>)}</div><div className={styles.monthGrid}>{days.map((day) => {
    const dayBookings = bookings.filter((booking) => booking.date === calendarDate(day)).sort((a, b) => a.time.localeCompare(b.time));
    const outside = day.getMonth() !== days[10].getMonth();
    return <div key={calendarDate(day)} className={styles.monthCell + (outside ? " " + styles.outsideMonth : "") + (calendarDate(day) === today() ? " " + styles.currentDay : "")} onClick={() => onCreate(day)}><span className={styles.monthDate}>{day.getDate()}</span>{dayBookings.slice(0, 3).map((booking) => { const customer = data.customers.find((c) => c.id === booking.customerId); const service = data.services.find((s) => s.id === booking.serviceId); return <button key={booking.id} className={styles.monthEvent + (booking.status === "ยกเลิกแล้ว" ? " " + styles.eventCancelled : "")} onClick={(event) => { event.stopPropagation(); onView(booking); }}><b>{booking.time}</b> {customer?.name || "ไม่พบลูกค้า"}<small>{service?.name || "บริการ"}</small></button>; })}{dayBookings.length > 3 && <small className={styles.moreEvents}>อีก {dayBookings.length - 3} คิว</small>}</div>;
  })}</div></div>;
  const hourStart = 8, hourEnd = 20, pixelsPerHour = 64;
  return <div className={styles.weekScroller}><div className={styles.weekGrid} style={{ "--days": days.length, "--hours-height": (hourEnd - hourStart) * pixelsPerHour + "px" }}><div className={styles.timeCorner} /><div className={styles.dayHeaders}>{days.map((day) => <div key={calendarDate(day)} className={calendarDate(day) === today() ? styles.todayHeader : ""}><span>{displayDate(day, { weekday: "short" }).replace(".", "")}</span><b>{day.getDate()}</b></div>)}</div><div className={styles.timeLabels}>{Array.from({ length: hourEnd - hourStart }, (_, i) => <div key={i}>{String(hourStart + i).padStart(2, "0") + ":00"}</div>)}</div><div className={styles.dayColumns}>{days.map((day) => {
    const dayBookings = bookings.filter((booking) => booking.date === calendarDate(day) && booking.status !== "ยกเลิกแล้ว");
    return <div className={styles.dayColumn + (calendarDate(day) === today() ? " " + styles.todayColumn : "")} key={calendarDate(day)} style={{ height: (hourEnd - hourStart) * pixelsPerHour + "px" }} onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const offset = Math.max(0, event.clientY - rect.top); const mins = hourStart * 60 + Math.floor(offset / pixelsPerHour * 2) * 30; onCreate(day, String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0")); }}>
      {Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => <div key={i} className={styles.hourLine} style={{ top: i * pixelsPerHour + "px" }} />)}
      {dayBookings.map((booking) => { const [hour, minute] = booking.time.split(":").map(Number); const service = data.services.find((item) => item.id === booking.serviceId); const customer = data.customers.find((item) => item.id === booking.customerId); const top = ((hour * 60 + minute) - hourStart * 60) * pixelsPerHour / 60; const height = Math.max(37, (Number(service?.duration || 45) / 60) * pixelsPerHour); return <button key={booking.id} className={styles.calendarEvent + (booking.status === "กำลังให้บริการ" ? " " + styles.eventWorking : booking.status === "รอยืนยัน" ? " " + styles.eventPending : "")} style={{ top: top + "px", height: height + "px" }} onClick={(event) => { event.stopPropagation(); onView(booking); }}><b>{booking.time} · {customer?.name || "ไม่พบลูกค้า"}</b><span>{service?.name || "บริการ"}</span></button>; })}
    </div>;
  })}</div></div></div>;
}
const formulaTemplate = () => ({ date: "", area: "", shade: "", colorGrams: "", oxidant: "", oxidantGrams: "", ratio: "", remarks: "" });
function createHairRecord(customer, booking) {
  return { clientName: customer?.name || "", phone: customer?.phone || "", email: customer?.email || "", birthDate: "", hairStructure: [], hairCondition: [], naturalLevel: "", grayCoverage: "", formulas: Array.from({ length: 8 }, formulaTemplate), products: [], otherProductEnabled: false, otherProduct: "", techniques: [], notes: "", sketch: [], photo: "", recordDate: booking?.date || today() };
}
function normalizeHairRecord(saved, customer, booking) {
  const base = createHairRecord(customer, booking), value = saved || {};
  const formulas = Array.isArray(value.formulas) ? value.formulas : [];
  return { ...base, ...value, hairStructure: Array.isArray(value.hairStructure) ? value.hairStructure : [], hairCondition: Array.isArray(value.hairCondition) ? value.hairCondition : [], products: Array.isArray(value.products) ? value.products : [], techniques: Array.isArray(value.techniques) ? value.techniques : [], sketch: Array.isArray(value.sketch) ? value.sketch : [], formulas: Array.from({ length: 8 }, (_, index) => ({ ...formulaTemplate(), ...(formulas[index] || {}) })) };
}
function HairRecord({ booking, data, saveRecord, onDirtyChange, back }) {
  const customer = data.customers.find((item) => item.id === booking?.customerId);
  const [record, setRecord] = useState(() => normalizeHairRecord(booking?.consultation, customer, booking));
  const [dirty, setDirty] = useState(false);
  const [drawOptions, setDrawOptions] = useState({ tool: "pen", color: "#282725", width: 2.4 });
  const photoInput = useRef(null);
  useEffect(() => { setRecord(normalizeHairRecord(booking?.consultation, customer, booking)); setDirty(false); }, [booking?.id]);
  if (!booking) return <Empty title="ไม่พบรายการจอง" body="รายการนี้อาจถูกลบไปแล้ว" />;
  const service = data.services.find((item) => item.id === booking.serviceId);
  function setField(key, value) { setRecord((current) => ({ ...current, [key]: value })); setDirty(true); onDirtyChange(true); }
  function toggleList(key, value) { setField(key, (record[key] || []).includes(value) ? record[key].filter((item) => item !== value) : [...(record[key] || []), value]); }
  function changeFormula(index, key, value) { const formulas = [...record.formulas]; formulas[index] = { ...formulaTemplate(), ...formulas[index], [key]: value }; setField("formulas", formulas); }
  function handlePhoto(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        setField("photo", canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file); event.target.value = "";
  }
  function save() { saveRecord(booking.id, record); setDirty(false); onDirtyChange(false); }
  function goBack() { if (dirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?")) return; setDirty(false); onDirtyChange(false); back(); }
  const textureOptions = ["เส้นเล็ก", "ปกติ", "เส้นหนา"];
  const conditionOptions = ["สุขภาพดี", "แห้ง", "เสีย", "เสียมาก"];
  const productOptions = ["Majirel", "INOA", "Dia color", "Blond Studio"];
  const techniqueOptions = ["ย้อมโคน", "ย้อมทั้งศีรษะ", "ไฮไลต์ / ช่อผม", "บาลายาจ", "ฟอกสี"];
  const swatches = ["#24201f", "#382c29", "#60483b", "#8b654e", "#ad876b", "#c6a88d", "#dec9ad", "#e9e6e1"];
  const columns = [["date", "วันที่", "date"], ["area", "บริเวณ", "text"], ["shade", "เฉดสี", "text"], ["colorGrams", "สี (กรัม)", "number"], ["oxidant", "ออกซิแดนท์", "text"], ["oxidantGrams", "ปริมาณ (กรัม)", "number"], ["ratio", "อัตราส่วน", "text"], ["remarks", "หมายเหตุ", "text"]];
  return <div className={styles.hairRecord}>
    <div className={styles.recordToolbar}><button className={styles.secondaryButton} onClick={goBack}><NavIcon name="arrowBack" size={15} /> กลับไปยังการจอง</button><div className={styles.recordToolbarTitle}><span>HAIR DESIGN · CLIENT RECORD</span><b>บันทึกสูตรและผลลัพธ์</b></div><div className={styles.recordSaveArea}>{dirty && <span className={styles.unsaved}>ยังไม่ได้บันทึก</span>}<button className={styles.primaryButton} onClick={save}><NavIcon name="check" size={15} /> บันทึกข้อมูล</button></div></div>
    <div className={styles.recordMasthead}><div><span className={styles.eyebrow}>CONSULTATION & COLOR FORMULA</span><h1>บันทึกการทำผม</h1><p>{localDate(booking.date)} · {booking.time} · {customer?.name || record.clientName || "ลูกค้า"} · {service?.name || "บริการ"}</p></div><div className={styles.recordLogo}><span>MUSE</span><small>HAIR STUDIO</small></div></div>
    <div className={styles.recordTopGrid}>
      <section className={styles.recordCard}><h2>ข้อมูลลูกค้า</h2><div className={styles.recordFields}><label>ชื่อ<input value={record.clientName ?? customer?.name ?? ""} onChange={(event) => setField("clientName", event.target.value)} /></label><label>โทรศัพท์<input value={record.phone ?? customer?.phone ?? ""} onChange={(event) => setField("phone", event.target.value)} /></label><label>อีเมล<input value={record.email ?? customer?.email ?? ""} onChange={(event) => setField("email", event.target.value)} /></label><label>วันเกิด<input type="date" value={record.birthDate || ""} onChange={(event) => setField("birthDate", event.target.value)} /></label></div></section>
      <section className={styles.recordCard}><h2>โครงสร้างเส้นผม</h2><div className={styles.recordChecks}>{textureOptions.map((option) => <label key={option}><input type="checkbox" checked={(record.hairStructure || []).includes(option)} onChange={() => toggleList("hairStructure", option)} />{option}</label>)}</div></section>
      <section className={styles.recordCard}><h2>สภาพเส้นผม</h2><div className={styles.recordChecks}>{conditionOptions.map((option) => <label key={option}><input type="checkbox" checked={(record.hairCondition || []).includes(option)} onChange={() => toggleList("hairCondition", option)} />{option}</label>)}</div></section>
      <section className={styles.recordCard}><h2>สีผมธรรมชาติ</h2><div className={styles.swatchRow}>{swatches.map((color, index) => <button key={color} type="button" className={record.naturalLevel === String(index + 1) ? styles.swatchSelected : ""} style={{ backgroundColor: color }} onClick={() => setField("naturalLevel", String(index + 1))} aria-label={"ระดับสี " + (index + 1)} title={"ระดับสี " + (index + 1)}><span>{index + 1}</span></button>)}</div><div className={styles.grayOptions}><b>ผมหงอก</b>{["0%", "<30%", "30–50%", ">50%"].map((option) => <label key={option}><input type="radio" name="grayCoverage" checked={record.grayCoverage === option} onChange={() => setField("grayCoverage", option)} />{option}</label>)}</div></section>
    </div>
    <section className={styles.recordCard + " " + styles.formulaCard}><h2>สูตรสีและการผสม</h2><div className={styles.formulaScroll}><table className={styles.formulaTable}><thead><tr><th>ลำดับ</th>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{record.formulas.map((formula, index) => <tr key={index}><td>{index + 1}</td>{columns.map(([key, label, type]) => <td key={key}><input type={type} aria-label={label + " แถวที่ " + (index + 1)} value={formula[key] || ""} onChange={(event) => changeFormula(index, key, event.target.value)} /></td>)}</tr>)}</tbody></table></div></section>
    <div className={styles.recordBottomGrid}>
      <section className={styles.recordCard}><h2>ผลิตภัณฑ์ที่ใช้</h2><div className={styles.recordChecks}>{productOptions.map((option) => <label key={option}><input type="checkbox" checked={(record.products || []).includes(option)} onChange={() => toggleList("products", option)} />{option}</label>)}<label><input type="checkbox" checked={Boolean(record.otherProductEnabled)} onChange={(event) => setField("otherProductEnabled", event.target.checked)} />อื่น ๆ</label>{record.otherProductEnabled && <label className={styles.otherProductField}>ระบุ<input value={record.otherProduct || ""} onChange={(event) => setField("otherProduct", event.target.value)} /></label>}</div></section>
      <section className={styles.recordCard}><h2>เทคนิค</h2><div className={styles.recordChecks}>{techniqueOptions.map((option) => <label key={option}><input type="checkbox" checked={(record.techniques || []).includes(option)} onChange={() => toggleList("techniques", option)} />{option}</label>)}</div></section>
      <section className={styles.recordCard}><h2>ผลลัพธ์ / ภาพ / สเก็ตช์</h2><div className={styles.canvasTools}><button className={styles.secondaryButton} onClick={() => photoInput.current?.click()}><NavIcon name="upload" size={13} /> เพิ่มภาพ</button><input ref={photoInput} hidden type="file" accept="image/*" onChange={handlePhoto} /><DrawCanvas strokes={record.sketch || []} onChange={(sketch) => setField("sketch", sketch)} options={drawOptions} setOptions={setDrawOptions} /></div><div className={styles.resultStage}>{record.photo && <img src={record.photo} alt="ภาพอ้างอิงทรงผม" />}<SketchPad strokes={record.sketch || []} onChange={(sketch) => setField("sketch", sketch)} options={drawOptions} /></div>{record.photo && <button className={styles.removePhoto} onClick={() => setField("photo", "")}>ลบภาพ</button>}</section>
      <section className={styles.recordCard}><h2>บันทึก / ข้อควรระวัง</h2><textarea className={styles.ruledNotes} value={record.notes || ""} onChange={(event) => setField("notes", event.target.value)} placeholder="ประวัติการทำสี ความต้องการ และข้อควรระวัง..." /></section>
    </div>
    <div className={styles.recordBottomSave}><span>{dirty ? "มีการแก้ไขที่ยังไม่ได้บันทึก" : "ข้อมูลใบวิเคราะห์ผูกกับรายการจองนี้"}</span><button className={styles.primaryButton} onClick={save}><NavIcon name="check" size={15} /> บันทึกใบวิเคราะห์</button></div>
  </div>;
}
function DrawCanvas({ strokes, onChange, options, setOptions }) {
  const colors = ["#282725", "#9a664e", "#bd5652", "#486f9c"];
  return <div className={styles.drawToolbar}><div className={styles.toolGroup}><button className={options.tool === "pen" ? styles.toolSelected : ""} onClick={() => setOptions((current) => ({ ...current, tool: "pen" }))} aria-label="ปากกา"><NavIcon name="pen" size={14} /></button><button className={options.tool === "eraser" ? styles.toolSelected : ""} onClick={() => setOptions((current) => ({ ...current, tool: "eraser" }))} aria-label="ยางลบ"><NavIcon name="eraser" size={14} /></button><select aria-label="ขนาดเส้น" value={options.width} onChange={(event) => setOptions((current) => ({ ...current, width: Number(event.target.value) }))}><option value={1.4}>บาง</option><option value={2.4}>กลาง</option><option value={4}>หนา</option></select></div><div className={styles.colorTools}>{colors.map((value) => <button key={value} className={options.color === value ? styles.colorSelected : ""} style={{ "--swatch": value }} onClick={() => setOptions((current) => ({ ...current, color: value, tool: "pen" }))} aria-label={"สี " + value} />)}</div><div className={styles.toolGroup}><button onClick={() => onChange(strokes.slice(0, -1))} aria-label="ย้อนกลับหนึ่งเส้น"><NavIcon name="undo" size={14} /></button><button onClick={() => onChange([])} aria-label="ล้างภาพวาด"><NavIcon name="trash" size={14} /></button></div><span className={styles.pencilHint}>เขียนด้วย Apple Pencil หรือเมาส์</span></div>;
}
function SketchPad({ strokes, onChange, options }) {
  const canvasRef = useRef(null), activeStroke = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const render = () => {
      const context = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1;
      if (!rect.width || !rect.height) return;
      canvas.width = Math.max(1, Math.round(rect.width * ratio)); canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const draw = (stroke) => {
        const points = stroke.points || []; if (!points.length) return;
        context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over"; context.strokeStyle = stroke.color; context.fillStyle = stroke.color; context.lineCap = "round"; context.lineJoin = "round";
        if (points.length === 1) { context.beginPath(); context.arc(points[0].x * rect.width, points[0].y * rect.height, stroke.width / 2, 0, Math.PI * 2); context.fill(); return; }
        for (let i = 1; i < points.length; i++) { const from = points[i - 1], to = points[i]; context.beginPath(); context.lineWidth = stroke.width * (0.55 + (to.pressure || 0.45)); context.moveTo(from.x * rect.width, from.y * rect.height); context.lineTo(to.x * rect.width, to.y * rect.height); context.stroke(); }
      };
      context.clearRect(0, 0, rect.width, rect.height); strokes.forEach(draw); context.globalCompositeOperation = "source-over";
    };
    render();
    const observer = new ResizeObserver(render); observer.observe(canvas);
    return () => observer.disconnect();
  }, [strokes]);
  function point(event) { const rect = canvasRef.current.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)), pressure: event.pressure || 0.45 }; }
  function pointerDown(event) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); activeStroke.current = { tool: options.tool, color: options.color, width: Number(options.width), points: [point(event)] }; const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext("2d"); ctx.globalCompositeOperation = activeStroke.current.tool === "eraser" ? "destination-out" : "source-over"; ctx.fillStyle = activeStroke.current.color; const p = activeStroke.current.points[0]; ctx.beginPath(); ctx.arc(p.x * rect.width, p.y * rect.height, activeStroke.current.width / 2, 0, Math.PI * 2); ctx.fill(); }
  function pointerMove(event) { if (!activeStroke.current) return; const next = point(event), points = activeStroke.current.points, previous = points[points.length - 1], rect = canvasRef.current.getBoundingClientRect(); points.push(next); const ctx = canvasRef.current.getContext("2d"); ctx.globalCompositeOperation = activeStroke.current.tool === "eraser" ? "destination-out" : "source-over"; ctx.strokeStyle = activeStroke.current.color; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = activeStroke.current.width * (0.55 + (next.pressure || 0.45)); ctx.beginPath(); ctx.moveTo(previous.x * rect.width, previous.y * rect.height); ctx.lineTo(next.x * rect.width, next.y * rect.height); ctx.stroke(); }
  function pointerUp() { if (!activeStroke.current) return; const completed = activeStroke.current; activeStroke.current = null; onChange([...strokes, completed]); }
  return <canvas ref={canvasRef} className={styles.sketchCanvas} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="พื้นที่วาดและเขียนสูตรด้วย Apple Pencil" />;
}
function Stat({ icon, label, value, detail, tone }) { return <article className={styles.statCard}><div className={`${styles.statIcon} ${styles[tone]}`}><NavIcon name={icon} size={16} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function Search({ value, setValue, placeholder }) { return <label className={styles.search}><NavIcon name="search" size={16} /><input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} /></label>; }
function BookingTable({ bookings, data, setBookingStatus, edit, onView, compact = false }) {
  return <div className={styles.tableWrap}><table><thead><tr><th>ลูกค้า</th><th>บริการ</th><th>วันและเวลา</th><th>สถานะ</th>{!compact && <th></th>}</tr></thead><tbody>{bookings.map((b) => { const customer = data.customers.find((c) => c.id === b.customerId), service = data.services.find((s) => s.id === b.serviceId); return <tr key={b.id}><td><button className={styles.personCellButton} onClick={() => onView?.(b)}><div className={styles.personAvatar}>{(customer?.name || "?").slice(-1)}</div><span><b>{customer?.name || "ไม่พบลูกค้า"}</b><small>{customer?.phone || "ดูรายละเอียด"}</small></span></button></td><td><span className={styles.servicePill}>{service?.name || "บริการที่ลบแล้ว"}</span></td><td><b>{b.time}</b><small className={styles.subCell}>{localDate(b.date)}</small></td><td><Status status={b.status} /></td>{!compact && <td><select className={styles.statusSelect} value={b.status} onChange={(e) => setBookingStatus(b, e.target.value)} aria-label="เปลี่ยนสถานะ"><option>รอยืนยัน</option><option>ยืนยันแล้ว</option><option>กำลังให้บริการ</option><option>เสร็จสิ้น</option><option>ยกเลิกแล้ว</option></select>{onView && <button className={styles.rowAction} onClick={() => onView(b)} title="เปิดใบวิเคราะห์ผม"><NavIcon name="file" size={16} /></button>}{edit && <button className={styles.rowAction} onClick={() => edit(b)} title="แก้ไขการจอง"><NavIcon name="more" size={17} /></button>}</td>}</tr>; })}</tbody></table>{bookings.length === 0 && <Empty title="ยังไม่มีรายการ" body="รายการจองจะแสดงที่นี่" />}</div>;
}
function Status({ status }) { const cls = status === "ยืนยันแล้ว" || status === "เสร็จสิ้น" ? "success" : status === "ยกเลิกแล้ว" ? "danger" : status === "กำลังให้บริการ" ? "working" : "pending"; return <span className={`${styles.status} ${styles[cls]}`}><i />{status}</span>; }
function CustomerTable({ customers, data, select, edit, remove }) { return <div className={styles.tableWrap}><table><thead><tr><th>ชื่อลูกค้า</th><th>เบอร์โทรศัพท์</th><th>อีเมล</th><th>ใช้บริการ</th><th>เพิ่มเมื่อ</th><th></th></tr></thead><tbody>{customers.map((c) => { const count = data.history.filter((h) => h.customerId === c.id).length; return <tr key={c.id}><td><button className={styles.personCellButton} onClick={() => select(c)}><div className={styles.personAvatar}>{c.name.slice(-1)}</div><span><b>{c.name}</b><small>ดูโปรไฟล์ <NavIcon name="arrowRight" size={11} /></small></span></button></td><td>{c.phone}</td><td>{c.email || "—"}</td><td>{count} ครั้ง</td><td>{localDate(c.createdAt)}</td><td><div className={styles.customerActions}><button className={styles.rowAction} onClick={() => edit(c)}>แก้ไข</button><button className={`${styles.rowAction} ${styles.deleteAction}`} onClick={() => remove(c)}>ลบ</button></div></td></tr>; })}</tbody></table>{customers.length === 0 && <Empty title="ไม่พบรายชื่อลูกค้า" body="ลองค้นหาด้วยชื่อหรือเบอร์โทรอีกครั้ง" />}</div>; }
function CustomerProfile({ customer, data, back, edit, remove, newBooking }) { if (!customer) return <Empty title="ไม่พบข้อมูลลูกค้า" body="ลูกค้ารายนี้อาจถูกลบออกจากระบบ" />; const history = data.history.filter((h) => h.customerId === customer.id); const bookings = data.bookings.filter((b) => b.customerId === customer.id); return <><div className={styles.profileBack}><button className={styles.textButton} onClick={back}><NavIcon name="arrowBack" size={14} /> กลับไปยังรายชื่อลูกค้า</button></div><div className={styles.pageHeading}><div><p className={styles.eyebrow}>CUSTOMER PROFILE</p><h1>ข้อมูลลูกค้า</h1><p>ประวัติและรายละเอียดสำหรับการดูแลลูกค้า</p></div><div className={styles.buttonRow}><button className={`${styles.secondaryButton} ${styles.deleteButton}`} onClick={() => remove(customer)}>ลบลูกค้า</button><button className={styles.secondaryButton} onClick={() => edit(customer)}>แก้ไขข้อมูล</button><button className={styles.primaryButton} onClick={() => newBooking(customer)}><NavIcon name="plus" size={14} /> จองคิว</button></div></div><div className={styles.profileGrid}><section className={styles.panel}><div className={styles.profileIdentity}><div className={styles.profileAvatar}>{customer.name.slice(-1)}</div><div><h2>{customer.name}</h2><span>ลูกค้าตั้งแต่ {localDate(customer.createdAt)}</span></div></div><div className={styles.detailRows}><div><span>เบอร์โทรศัพท์</span><b>{customer.phone}</b></div><div><span>อีเมล</span><b>{customer.email || "—"}</b></div><div><span>หมายเหตุและข้อควรระวัง</span><b>{customer.note || "ไม่มีหมายเหตุ"}</b></div><div><span>รายการจองทั้งหมด</span><b>{bookings.length} รายการ</b></div></div></section><section className={styles.panel}><div className={styles.panelHeader}><div><h2>ประวัติการใช้บริการ</h2><span>รายการที่ปิดบริการแล้ว · {history.length} ครั้ง</span></div></div>{history.length ? <div className={styles.historyList}>{history.map((h) => <div key={h.id}><span className={styles.historyDot}><NavIcon name="scissors" size={14} /></span><span><b>{data.services.find((s) => s.id === h.serviceId)?.name || "บริการ"}</b><small>{localDate(h.date)} {h.note && `· ${h.note}`}</small></span><strong>{money(h.amount)}</strong></div>)}</div> : <Empty title="ยังไม่มีประวัติบริการ" body="ประวัติจะแสดงหลังจากปิดรายการจอง" />}</section></div></>; }
function Services({ data, setModal, update }) { const [tab, setTab] = useState("services"); return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>SALON SETTINGS</p><h1>บริการและเวลา</h1><p>กำหนดบริการ ราคา และช่วงเวลาที่ร้านเปิดให้บริการ</p></div></div><div className={styles.tabs}><button className={tab === "services" ? styles.tabActive : ""} onClick={() => setTab("services")}>รายการบริการ</button><button className={tab === "hours" ? styles.tabActive : ""} onClick={() => setTab("hours")}>เวลาทำการ</button></div>{tab === "services" ? <section className={styles.panel}><div className={styles.panelHeader}><div><h2>บริการของร้าน</h2><span>{data.services.length} รายการ</span></div><button className={styles.primaryButton} onClick={() => setModal({ type: "service" })}><NavIcon name="plus" size={14} /> เพิ่มบริการ</button></div><div className={styles.serviceGrid}>{data.services.map((s) => <article className={styles.serviceCard} key={s.id}><div className={styles.serviceHead}><span className={styles.serviceSymbol}><NavIcon name="scissors" size={15} /></span><button className={styles.rowAction} onClick={() => setModal({ type: "service", item: s })}>แก้ไข</button></div><h3>{s.name}</h3><div className={styles.serviceMeta}><span><NavIcon name="clock" size={13} /> {s.duration} นาที</span><b>{money(s.price)}</b></div><div className={styles.serviceFoot}><span className={`${styles.activeDot} ${!s.active ? styles.inactiveDot : ""}`} />{s.active ? "เปิดให้จอง" : "ปิดให้จอง"}<button onClick={() => update({ services: data.services.map((x) => x.id === s.id ? { ...x, active: !x.active } : x) })}>{s.active ? "ปิดบริการ" : "เปิดบริการ"}</button></div></article>)}</div></section> : <HoursSettings settings={data.settings} update={update} />}</>; }
function HoursSettings({ settings, update }) {
  const [form, setForm] = useState(settings);
  useEffect(() => { setForm({ ...demoData.settings, salonName: settings.salonName || demoData.settings.salonName, open: settings.open || demoData.settings.open, close: settings.close || demoData.settings.close, closedDays: settings.closedDays || [], latitude: settings.latitude || "", longitude: settings.longitude || "" }); }, [settings]);
  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  const hasPin = Boolean(form.latitude && form.longitude);
  const googleMapsUrl = hasPin ? `https://www.google.com/maps/search/?api=1&query=${form.latitude},${form.longitude}` : "https://www.google.com/maps";
  return <section className={styles.panel}>
    <div className={styles.panelHeader}><div><h2>เวลาทำการและตำแหน่งร้าน</h2><span>ตั้งค่าช่วงเวลารับจองและพิกัดสถานที่ให้บริการ</span></div></div>
    <div className={styles.settingsForm}>
      <label>ชื่อร้าน<input value={form.salonName || ""} onChange={(e) => setForm({ ...form, salonName: e.target.value })} /></label>
      <div className={styles.timeInputs}><label>เวลาเปิด<input type="time" value={form.open || "09:00"} onChange={(e) => setForm({ ...form, open: e.target.value })} /></label><span>ถึง</span><label>เวลาปิด<input type="time" value={form.close || "19:00"} onChange={(e) => setForm({ ...form, close: e.target.value })} /></label></div>
      <div className={styles.closedDays}><b>วันหยุดประจำสัปดาห์</b><div>{days.map((day, i) => <label key={day}><input type="checkbox" checked={(form.closedDays || []).includes(i)} onChange={() => setForm({ ...form, closedDays: (form.closedDays || []).includes(i) ? form.closedDays.filter((x) => x !== i) : [...(form.closedDays || []), i] })} />{day}</label>)}</div></div>
      <div className={styles.locationSection}>
        <div className={styles.locationTitle}><span className={styles.locationIcon}><NavIcon name="home" /></span><span><b>ตำแหน่งร้าน</b><small>บันทึกหมุดสถานที่ตัดผม เผื่อร้านย้ายสถานที่</small></span></div>
        <p className={styles.locationHelp}>คลิกบนแผนที่เพื่อปักหมุด หรือกดค้างที่หมุดแล้วลากเพื่อปรับตำแหน่ง</p>
        <MapPicker latitude={form.latitude} longitude={form.longitude} onSelect={(latitude, longitude) => setForm({ ...form, latitude, longitude })} />
        <div className={styles.pinSummary}>{hasPin ? <><span><i /> ปักหมุดแล้ว</span><code>{Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}</code><a href={googleMapsUrl} target="_blank" rel="noreferrer">ดูใน Google Maps <NavIcon name="external" size={12} /></a></> : <span className={styles.noPin}>ยังไม่ได้เลือกตำแหน่งร้าน</span>}</div>
      </div>
      <button className={styles.primaryButton} onClick={() => update({ settings: form })}>บันทึกเวลาทำการและตำแหน่ง</button>
    </div>
  </section>;
}
let leafletLoader;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link"); link.id = "leaflet-css"; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
  }
  leafletLoader = new Promise((resolve, reject) => {
    const existing = document.getElementById("leaflet-script");
    if (existing) { existing.addEventListener("load", () => resolve(window.L), { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
    const script = document.createElement("script"); script.id = "leaflet-script"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.async = true;
    script.onload = () => resolve(window.L); script.onerror = () => { leafletLoader = null; reject(new Error("map library unavailable")); }; document.body.appendChild(script);
  });
  return leafletLoader;
}
function MapPicker({ latitude, longitude, onSelect }) {
  const elementRef = useRef(null), mapRef = useRef(null), markerRef = useRef(null), onSelectRef = useRef(onSelect);
  const [mapReady, setMapReady] = useState(false), [mapError, setMapError] = useState(false);
  onSelectRef.current = onSelect;
  useEffect(() => {
    let mounted = true;
    loadLeaflet().then((L) => {
      if (!mounted || !elementRef.current) return;
      const hasPin = latitude && longitude;
      const center = hasPin ? [Number(latitude), Number(longitude)] : [13.7563, 100.5018];
      const map = L.map(elementRef.current, { scrollWheelZoom: true }).setView(center, hasPin ? 16 : 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>' }).addTo(map);
      mapRef.current = map;
      const setPin = (lat, lng) => {
        if (!markerRef.current) markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        else markerRef.current.setLatLng([lat, lng]);
        markerRef.current.off("dragend").on("dragend", (event) => { const point = event.target.getLatLng(); onSelectRef.current(point.lat.toFixed(6), point.lng.toFixed(6)); });
        onSelectRef.current(lat.toFixed(6), lng.toFixed(6));
      };
      if (hasPin) markerRef.current = L.marker(center, { draggable: true }).addTo(map);
      if (markerRef.current) markerRef.current.on("dragend", (event) => { const point = event.target.getLatLng(); onSelectRef.current(point.lat.toFixed(6), point.lng.toFixed(6)); });
      map.on("click", (event) => setPin(event.latlng.lat, event.latlng.lng));
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 0);
    }).catch(() => { if (mounted) setMapError(true); });
    return () => { mounted = false; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; } };
  // This map is created once; the initial pin is read when its library finishes loading.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (latitude && longitude) {
      const point = [Number(latitude), Number(longitude)];
      if (!markerRef.current) markerRef.current = window.L.marker(point, { draggable: true }).addTo(map);
      else markerRef.current.setLatLng(point);
      markerRef.current.off("dragend").on("dragend", (event) => { const location = event.target.getLatLng(); onSelectRef.current(location.lat.toFixed(6), location.lng.toFixed(6)); });
      map.setView(point, Math.max(map.getZoom(), 16));
    } else if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
  }, [latitude, longitude, mapReady]);
  return <div className={styles.mapPickerWrap}><div ref={elementRef} className={styles.mapPicker} aria-label="แผนที่เลือกตำแหน่งร้าน" />{!mapReady && !mapError && <div className={styles.mapLoading}>กำลังโหลดแผนที่…</div>}{mapError && <div className={styles.mapLoading}>โหลดแผนที่ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</div>}</div>;
}
function DataPage({ data, exportData, importRef, importData, reset }) { return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>DATA & BACKUP</p><h1>ข้อมูลและสำรอง</h1><p>เก็บสำเนาข้อมูลร้าน หรือย้ายข้อมูลจากไฟล์สำรอง</p></div></div><div className={styles.dataGrid}><section className={styles.panel}><div className={styles.dataIcon + " " + styles.quickGreen}><NavIcon name="download" /></div><h2>สำรองข้อมูล</h2><p>ดาวน์โหลดข้อมูลลูกค้า การจอง บริการ และประวัติทั้งหมดเป็นไฟล์ JSON</p><div className={styles.dataStats}><span>ลูกค้า <b>{data.customers.length}</b></span><span>การจอง <b>{data.bookings.length}</b></span><span>บริการ <b>{data.services.length}</b></span></div><button className={styles.primaryButton} onClick={exportData}>ดาวน์โหลดไฟล์สำรอง <NavIcon name="download" size={14} /></button></section><section className={styles.panel}><div className={styles.dataIcon + " " + styles.quickPurple}><NavIcon name="upload" /></div><h2>นำเข้าข้อมูล</h2><p>เลือกไฟล์ JSON ที่ส่งออกจากระบบนี้ เพื่อกู้คืนข้อมูลปัจจุบัน</p><div className={styles.importNotice}>การนำเข้าจะแทนที่ข้อมูลปัจจุบัน กรุณาสำรองข้อมูลก่อนทุกครั้ง</div><input hidden ref={importRef} type="file" accept=".json,application/json" onChange={importData} /><button className={styles.secondaryButton} onClick={() => importRef.current?.click()}><NavIcon name="upload" size={14} /> เลือกไฟล์สำรอง JSON</button></section><section className={styles.panel + " " + styles.storagePanel}><div className={styles.dataIcon + " " + styles.quickBlue}><NavIcon name="database" /></div><div><h2>พื้นที่จัดเก็บ</h2><p>ข้อมูลบันทึกไว้ในเบราว์เซอร์เครื่องนี้โดยอัตโนมัติ</p><span className={styles.storageTag}><i /> กำลังบันทึกอัตโนมัติ</span></div><button className={styles.textButton} onClick={reset}>เริ่มข้อมูลใหม่</button></section></div></>; }
function Empty({ title, body }) { return <div className={styles.empty}><span><NavIcon name="calendar" size={20} /></span><b>{title}</b><p>{body}</p></div>; }

function Modal({ modal, data, close, saveCustomer, saveBooking, saveService, deleteCustomer, update }) {
  const [form, setForm] = useState(modal.item || (modal.type === "booking" ? { customerId: "", serviceId: data.services.find((s) => s.active)?.id || "", date: today(), time: "09:00", note: "", status: "รอยืนยัน" } : modal.type === "service" ? { name: "", duration: 30, price: 0, active: true } : { name: "", phone: "", email: "", note: "" }));
  if (modal.type === "deleteCustomer") return <div className={styles.modalOverlay} onClick={close}><div className={styles.modal} onClick={(e) => e.stopPropagation()}><div className={styles.modalHeader}><div><p className={styles.eyebrow}>ยืนยันการลบ</p><h2>ลบข้อมูลลูกค้า?</h2></div><button onClick={close} aria-label="ปิด"><NavIcon name="close" /></button></div><p className={styles.confirmCopy}>กำลังลบ <b>{modal.item.name}</b> รวมถึงรายการจองและประวัติการใช้บริการที่เกี่ยวข้อง การดำเนินการนี้ย้อนกลับไม่ได้</p><div className={styles.modalActions}><button className={styles.secondaryButton} onClick={close}>ยกเลิก</button><button className={styles.dangerButton} onClick={() => deleteCustomer(modal.item)}>ยืนยันลบลูกค้า</button></div></div></div>;
  if (modal.type === "reset") return <div className={styles.modalOverlay} onClick={close}><div className={styles.modal} onClick={(e) => e.stopPropagation()}><div className={styles.modalHeader}><h2>เริ่มข้อมูลใหม่?</h2><button onClick={close} aria-label="ปิด"><NavIcon name="close" /></button></div><p className={styles.confirmCopy}>ข้อมูลลูกค้า การจอง และประวัติในเบราว์เซอร์นี้จะถูกลบและแทนด้วยข้อมูลตัวอย่าง</p><div className={styles.modalActions}><button className={styles.secondaryButton} onClick={close}>ยกเลิก</button><button className={styles.dangerButton} onClick={() => { update(demoData); close(); }}>เริ่มใหม่</button></div></div></div>;
  const titles = { booking: modal.item?.id ? "แก้ไขรายการจอง" : "สร้างรายการจอง", customer: modal.item?.id ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่", service: modal.item?.id ? "แก้ไขบริการ" : "เพิ่มบริการ" };
  return <div className={styles.modalOverlay} onClick={close}><section className={styles.modal} onClick={(e) => e.stopPropagation()}><div className={styles.modalHeader}><div><p className={styles.eyebrow}>MUSE HAIR STUDIO</p><h2>{titles[modal.type]}</h2></div><button onClick={close} aria-label="ปิด"><NavIcon name="close" /></button></div>
    <form onSubmit={(e) => { e.preventDefault(); if (modal.type === "customer") saveCustomer(form); if (modal.type === "booking") saveBooking(form); if (modal.type === "service") saveService(form); }} className={styles.modalForm}>
      {modal.type === "customer" && <><label>ชื่อลูกค้า<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อและนามสกุล" /></label><div className={styles.formTwo}><label>เบอร์โทรศัพท์<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08X-XXX-XXXX" /></label><label>อีเมล<input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" /></label></div><label>หมายเหตุ / ข้อควรระวัง<textarea rows="3" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="เช่น แพ้ผลิตภัณฑ์ หรือความชอบส่วนตัว" /></label></>}
      {modal.type === "booking" && <><label>เลือกลูกค้า<select required value={form.customerId || ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">เลือกลูกค้าในระบบ</option>{data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select><small className={styles.fieldHint}>หากยังไม่มีรายชื่อ ให้เพิ่มในเมนูจัดการลูกค้าก่อน</small></label><label>บริการ<select required value={form.serviceId || ""} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>{data.services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name} · {s.duration} นาที · {money(s.price)}</option>)}</select></label><div className={styles.formTwo}><label>วันที่<input required type="date" min={form.id ? undefined : today()} value={form.date || today()} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>เวลาเริ่มต้น<input required type="time" value={form.time || "09:00"} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label></div><label>หมายเหตุ<textarea rows="2" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="รายละเอียดเพิ่มเติม" /></label></>}
      {modal.type === "service" && <><label>ชื่อบริการ<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น ตัดผม" /></label><div className={styles.formTwo}><label>ระยะเวลา (นาที)<input required min="5" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} /></label><label>ราคา (บาท)<input required min="0" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label></div></>}
      <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={close}>ยกเลิก</button><button className={styles.primaryButton}>บันทึกข้อมูล</button></div>
    </form></section></div>;
}
