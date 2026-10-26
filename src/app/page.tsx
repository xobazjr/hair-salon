"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import RecipeDrawingCanvas, { type DrawingActions, type DrawingState, type EditorTool } from "../components/RecipeDrawingCanvas";
import { DrawingIcon } from "../components/DrawingIcon";
import type { Stroke } from "../lib/drawing";

type Row = { date: string; area: string; shade: string; amount: string; oxidant: string; oxidantAmount: string; ratio: string; notes: string };
type Recipe = { id: string; date: string; updatedAt: string; rows: Row[]; products: string; technique: string; notes: string; strokes: Stroke[]; naturalColorLevel?: number };
type Customer = { id: string; name: string; phone: string; email: string; records: Recipe[] };

const KEY = "hair-salon-demo-v1";
const dateNow = () => new Date().toISOString().slice(0, 10);
const inkPalette = ["#543b3d", "#9d666d", "#877779", "#6f8173", "#b98155", "#8e7392"];
const blankRow = (): Row => ({ date: dateNow(), area: "Roots", shade: "", amount: "", oxidant: "", oxidantAmount: "", ratio: "1:1", notes: "" });
const blankRecipe = (): Recipe => ({ id: crypto.randomUUID(), date: dateNow(), updatedAt: new Date().toISOString(), rows: Array.from({ length: 8 }, blankRow), products: "", technique: "", notes: "", strokes: [] });
const starter: Customer[] = [{ id: "demo-customer", name: "Teerapat Kotanart", phone: "+41 79 555 01 24", email: "teerapat@example.ch", records: [] }];
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const displayDate = (value: string) => new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>(starter);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"welcome" | "list" | "profile" | "editor">("welcome");
  const [customerId, setCustomerId] = useState(starter[0].id);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState("Local workspace ready");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const value = localStorage.getItem(KEY);
      if (value) {
        // Read persisted data after hydration so the server-rendered shell stays stable.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCustomers(JSON.parse(value));
      }
    } catch { setNotice("Could not read local data; using demo data"); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(customers)); }, [customers, ready]);

  const customer = customers.find((item) => item.id === customerId) ?? customers[0];
  const recipe = customer?.records.find((item) => item.id === recipeId) ?? null;
  const visible = customers.filter((item) => `${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name, "de-CH"));
  const goCustomer = (id: string) => { setCustomerId(id); setRecipeId(null); setView("profile"); setNotice("Customer profile loaded"); };
  const openRecipe = (existing?: Recipe) => { if (!customer) return; const next = existing ?? blankRecipe(); if (!existing) setCustomers((all) => all.map((item) => item.id === customer.id ? { ...item, records: [...item.records, next] } : item)); setRecipeId(next.id); setView("editor"); setNotice(existing ? "Recipe opened" : "New recipe started"); };
  const updateRecipe = (next: Recipe) => setCustomers((all) => all.map((item) => item.id === customer?.id ? { ...item, records: item.records.map((old) => old.id === next.id ? next : old) } : item));
  const save = async () => { if (!recipe) return; setSaving(true); await new Promise((resolve) => setTimeout(resolve, 300)); updateRecipe({ ...recipe, updatedAt: new Date().toISOString() }); setSaving(false); setNotice("Saved locally"); };
  const exportData = () => { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([JSON.stringify(customers, null, 2)], { type: "application/json" })); link.download = `hair-salon-backup-${dateNow()}.json`; link.click(); setNotice("Backup exported as JSON"); };
  const importData = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)) as Customer[]; if (!Array.isArray(data) || data.some((item) => !item.id || !item.name || !Array.isArray(item.records))) throw new Error(); setCustomers(data); setCustomerId(data[0]?.id ?? ""); setView("list"); setNotice("Backup imported successfully"); } catch { setNotice("Import failed: choose a valid JSON backup"); } }; reader.readAsText(file); event.target.value = ""; };
  const addCustomer = (name: string, phone: string, email: string) => { const next = { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim(), email: email.trim(), records: [] }; setCustomers((all) => [...all, next]); setCustomerId(next.id); setModal(false); setView("profile"); setNotice("Customer created"); };

  if (view === "welcome") return <main className="welcome-page"><div className="welcome-card"><div className="brand-mark">HS</div><p className="eyebrow">HAIR SALON  COLOR RECORD</p><h1>Keep every formula<br /><em>beautifully documented.</em></h1><p className="welcome-copy">A calm, local-first workspace for customer history, color recipes and handwritten notes.</p><button className="button button-primary button-large" onClick={() => { setView("list"); setNotice("Customer list loaded"); }}>Enter app <span> </span></button><p className="privacy-note">  Stored securely on this device  No account required</p></div><div className="welcome-orbit orbit-one" /><div className="welcome-orbit orbit-two" /></main>;

  return <main className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><div className="brand-wordmark">HAIR SALON</div><div className="brand-subtitle">COLOR RECORD  DEMO 0.1</div></div><label className="search-box"><span></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers..." /></label><div className="customer-nav">{visible.map((item) => <button key={item.id} className={`customer-nav-item ${item.id === customerId ? "selected" : ""}`} onClick={() => goCustomer(item.id)}><span className="avatar small">{initials(item.name)}</span>{item.name}</button>)}{!visible.length && <p className="sidebar-empty">No customers found</p>}</div><div className="sidebar-bottom"><button className="button button-rose full-width" onClick={() => setModal(true)}> New customer</button><button type="button" className="text-action" onClick={exportData}><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14V3m0 0L6 7m4-4 4 4M4 12v4h12v-4" /></svg><span>Export backup</span></button><label className="text-action"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 6v11m0 0 4-4m-4 4-4-4M4 3v4h12V3" /></svg><span>Import backup</span><input className="visually-hidden" type="file" accept="application/json,.json" onChange={importData} /></label></div></aside><section className="workspace"><header className="topbar"><div className="breadcrumb"><span>Hair Salon</span><b>/</b><strong>{view === "editor" ? "Recipe Editor" : view === "profile" ? "Customer Profile" : "Customers"}</strong></div><div className="status-pill"><span className="status-dot" /> {notice}</div></header>{view === "list" && <CustomerList customers={visible} onSelect={goCustomer} onCreate={() => setModal(true)} />}{view === "profile" && customer && <Profile customer={customer} onBack={() => setView("list")} onOpen={openRecipe} />}{view === "editor" && customer && recipe && <Editor customer={customer} recipe={recipe} saving={saving} onBack={() => setView("profile")} onChange={updateRecipe} onSave={save} />}</section>{modal && <CustomerModal onClose={() => setModal(false)} onSubmit={addCustomer} />}</main>;
}

function CustomerList({ customers, onSelect, onCreate }: { customers: Customer[]; onSelect: (id: string) => void; onCreate: () => void }) { return <div className="content-page"><div className="page-heading"><div><p className="eyebrow">CUSTOMER DIRECTORY</p><h2>Customers</h2><p className="muted">Select a customer to view their color history.</p></div><button className="button button-rose" onClick={onCreate}> New customer</button></div>{!customers.length ? <div className="empty-state"><div className="empty-icon"></div><h3>No customers yet</h3><p>Create your first customer to start a color record.</p><button className="button button-primary" onClick={onCreate}>Create customer</button></div> : <div className="customer-grid">{customers.map((item) => <button className="customer-card" key={item.id} onClick={() => onSelect(item.id)}><span className="avatar">{initials(item.name)}</span><span className="customer-card-copy"><strong>{item.name}</strong><small>{item.phone || "No phone added"}</small></span><span className="card-arrow"> </span></button>)}</div>}</div>; }

function Profile({ customer, onBack, onOpen }: { customer: Customer; onBack: () => void; onOpen: (recipe?: Recipe) => void }) { const records = [...customer.records].sort((a, b) => b.date.localeCompare(a.date)); return <div className="content-page narrow-page"><button className="back-link" onClick={onBack}>  Customers</button><div className="profile-heading"><span className="avatar large">{initials(customer.name)}</span><div><p className="eyebrow">CUSTOMER PROFILE</p><h2>{customer.name}</h2><p className="muted">{customer.phone}  {customer.email}</p></div><button className="button button-rose push-right" onClick={() => onOpen()}> New recipe</button></div><div className="section-divider"><span>COLOR HISTORY</span><span>{records.length} records</span></div>{!records.length ? <div className="empty-state compact"><div className="empty-icon"></div><h3>No recipes yet</h3><p>Start with a clean formula sheet for this customer.</p><button className="button button-primary" onClick={() => onOpen()}>Create first recipe</button></div> : <div className="recipe-list">{records.map((item, index) => <button className="recipe-card" key={item.id} onClick={() => onOpen(item)}><span className="recipe-number">{String(records.length - index).padStart(2, "0")}</span><span><strong>{displayDate(item.date)}</strong><small>{item.technique || "Color formula"}  {item.rows.length} formula rows</small></span><span className="card-arrow"> </span></button>)}</div>}</div>; }

function Editor({ customer, recipe, saving, onBack, onChange, onSave }: { customer: Customer; recipe: Recipe; saving: boolean; onBack: () => void; onChange: (recipe: Recipe) => void; onSave: () => void }) {
  const [drawMode, setDrawMode] = useState(false);
  const [studioExpanded, setStudioExpanded] = useState(true);
  const [tool, setTool] = useState<EditorTool>("pen");
  const [inkColor, setInkColor] = useState("#543b3d");
  const [brushSize, setBrushSize] = useState(2.5);
  const [eraserSize, setEraserSize] = useState(18);
  const [opacity, setOpacity] = useState(0.85);
  const [drawingState, setDrawingState] = useState<DrawingState>({ canUndo: false, canRedo: false, selectedId: null });
  const drawingActions = useRef<DrawingActions | null>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      const command = event.ctrlKey || event.metaKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) drawingActions.current?.redo(); else drawingActions.current?.undo();
        return;
      }
      if (command && event.key.toLowerCase() === "y") { event.preventDefault(); drawingActions.current?.redo(); return; }
      if (event.key === "Delete" || event.key === "Backspace") { if (drawingState.selectedId) { event.preventDefault(); drawingActions.current?.deleteSelected(); } return; }
      if (event.key === "Escape") { setTool("select"); return; }
      if (event.key.toLowerCase() === "v") setTool("select");
      if (event.key.toLowerCase() === "h") setTool("pan");
      if (event.key.toLowerCase() === "b") setTool("pen");
      if (event.key.toLowerCase() === "e") setTool("eraser");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawingState.selectedId]);  const changeRow = (index: number, key: keyof Row, value: string) => onChange({ ...recipe, rows: recipe.rows.map((row, i) => i === index ? { ...row, [key]: value } : row) });
  const columns: { key: keyof Row; label: string; type?: string; placeholder?: string }[] = [
    { key: "date", label: "DATE (Day/Month/Year)", type: "date" }, { key: "area", label: "AREA" }, { key: "shade", label: "COLOR NUANCE", placeholder: "7.13" }, { key: "amount", label: "COLOR AMOUNT (g)" }, { key: "oxidant", label: "OXIDANT", placeholder: "6%" }, { key: "oxidantAmount", label: "OXIDANT AMOUNT (g)" }, { key: "ratio", label: "MIXING RATIO" }, { key: "notes", label: "NOTES" },
  ];
  return <div className={`editor-page ${drawMode ? "draw-mode" : ""}`}>
    <div className="editor-toolbar">
      <button className="back-link" onClick={onBack}>Back to {customer.name}</button>
      <div className={`color-studio-island ${studioExpanded ? "island-open" : "island-closed"}`}>
        <button className="studio-toggle" aria-expanded={studioExpanded} onClick={() => setStudioExpanded((value) => !value)}>
          <span className="studio-title"><DrawingIcon name="studio" /> Color Studio</span>
          <span className="studio-toggle-detail">{drawMode ? "Drawing on template" : "Template tools"}</span>
          <DrawingIcon className="studio-chevron" name={studioExpanded ? "collapse" : "expand"} />
        </button>
        <div className={`editor-actions ${studioExpanded ? "studio-expanded" : "studio-collapsed"}`}>
          <button className={`tool-button ${drawMode ? "active" : ""}`} onClick={() => setDrawMode((current) => !current)}><DrawingIcon name="draw" />{drawMode ? "Drawing on template" : "Draw on template"}</button>
          <button className={`tool-button ${tool === "select" ? "active" : ""}`} aria-pressed={tool === "select"} title="Select and move a stroke  V" onClick={() => setTool("select")}><DrawingIcon name="select" />Select</button>
          <button className={`tool-button ${tool === "pan" ? "active" : ""}`} aria-pressed={tool === "pan"} title="Pan the page  H" onClick={() => setTool("pan")}><DrawingIcon name="pan" />Pan</button>
          <button className={`tool-button ${tool === "pen" ? "active" : ""}`} aria-pressed={tool === "pen"} title="Pen  B" onClick={() => setTool("pen")}><DrawingIcon name="pen" />Pen</button>
          <button className={`tool-button ${tool === "pressure" ? "active" : ""}`} aria-pressed={tool === "pressure"} title="Pressure-sensitive pen" onClick={() => setTool("pressure")}><DrawingIcon name="pressure" />Pressure</button>
          <button className={`tool-button ${tool === "calligraphy" ? "active" : ""}`} aria-pressed={tool === "calligraphy"} title="Calligraphy pen" onClick={() => setTool("calligraphy")}><DrawingIcon name="calligraphy" />Calligraphy</button>
          <button className={`tool-button ${tool === "highlighter" ? "active" : ""}`} aria-pressed={tool === "highlighter"} title="Translucent highlighter" onClick={() => setTool("highlighter")}><DrawingIcon name="highlighter" />Highlighter</button>
          <button className={`tool-button ${tool === "eraser" ? "active" : ""}`} aria-pressed={tool === "eraser"} title="Erase complete strokes  E" onClick={() => setTool("eraser")}><DrawingIcon name="eraser" />Eraser</button>
          <label className="size-control">{tool === "eraser" ? "Eraser size" : "Stroke width"}<input aria-label={tool === "eraser" ? "Eraser size" : "Stroke width"} type="range" min={tool === "eraser" ? 4 : 1} max={tool === "eraser" ? 56 : 14} value={tool === "eraser" ? eraserSize : brushSize} onChange={(event) => tool === "eraser" ? setEraserSize(Number(event.target.value)) : setBrushSize(Number(event.target.value))} /><span>{tool === "eraser" ? eraserSize : brushSize}px</span></label>
          <label className="size-control opacity-control"><span>Opacity</span><input type="range" min="10" max="100" value={Math.round(opacity * 100)} aria-label="Stroke opacity" onChange={(event) => setOpacity(Number(event.target.value) / 100)} /><span>{Math.round(opacity * 100)}%</span></label>
          <div className="ink-colors" aria-label="Ink color">{inkPalette.map((swatch) => <button key={swatch} className={`ink-swatch ${inkColor === swatch ? "selected" : ""}`} style={{ "--ink-swatch": swatch } as React.CSSProperties} aria-label={`Choose ${swatch}`} onClick={() => setInkColor(swatch)} />)}<label className="custom-ink" title="Custom ink color"><input type="color" value={inkColor} aria-label="Custom ink color" onChange={(event) => setInkColor(event.target.value)} /><span>+</span></label></div>
          <button className="tool-button" disabled={!drawingState.selectedId} onClick={() => drawingActions.current?.deleteSelected()}><DrawingIcon name="delete" />Delete</button>
          <span className="save-state"><span className="status-dot" />{saving ? "Saving..." : "Saved locally"}</span>
          <button className="tool-button" disabled={!drawingState.canUndo} onClick={() => drawingActions.current?.undo()} aria-keyshortcuts="Control+Z Meta+Z"><DrawingIcon name="undo" />Undo</button>
          <button className="tool-button" disabled={!drawingState.canRedo} onClick={() => drawingActions.current?.redo()} aria-keyshortcuts="Control+Y Meta+Y"><DrawingIcon name="redo" />Redo</button>
          <button className="tool-button" onClick={() => drawingActions.current?.clearUnsaved()}><DrawingIcon name="clear" />Clear unsaved ink</button>
          <button className="button button-rose" disabled={saving} onClick={async () => { await onSave(); drawingActions.current?.markSaved(); }}>{saving ? "Saving..." : "Save recipe"}</button>
        </div>
      </div>
    </div>
    <div className="paper-wrap"><article className="formula-paper">
      <div className="paper-header"><div><div className="paper-brand">HAIR SALON</div><small>COLOR RECORD  FORMULA SHEET</small></div><div className="paper-title"><span>COLOR CONSULTATION & FORMULA</span><strong>CUSTOMER CARD</strong></div></div>
      <div className="paper-meta"><div><span>Customer</span><strong>{customer.name}</strong></div><label><span>Date</span><input type="date" value={recipe.date} onChange={(event) => onChange({ ...recipe, date: event.target.value })} /></label><div><span>Status</span><strong>Local record</strong></div></div>
      <div className="paper-sections"><section><h4>HAIR ANALYSIS</h4><div className="checks"><label><input type="checkbox" /> Fine</label><label><input type="checkbox" defaultChecked /> Normal</label><label><input type="checkbox" /> Thick</label><label><input type="checkbox" /> Dry</label><label><input type="checkbox" /> Damaged</label></div></section><section><h4>NATURAL HAIR COLOR</h4><div className="shade-scale" role="radiogroup" aria-label="Natural hair color level">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <label className={`shade-option ${recipe.naturalColorLevel === n ? "selected" : ""}`} key={n}><input type="radio" name="natural-hair-color" value={n} checked={recipe.naturalColorLevel === n} onChange={() => onChange({ ...recipe, naturalColorLevel: n })} /><span>{n}</span></label>)}</div><strong className="selected-level">Selected level: {recipe.naturalColorLevel ?? ""}</strong><small>GRAY PERCENTAGE: 0%  &lt;30%  30  &gt;70%</small></section></div>
      <section className="formula-section"><div className="section-title"><h4>COLOR FORMULA</h4></div><div className="formula-table"><div className="formula-row formula-head"><span>NO.</span>{columns.map((column) => <span key={column.key}>{column.label}</span>)}</div>{recipe.rows.map((row, index) => <div className="formula-row" key={`${recipe.id}-${index}`}><span>{index + 1}</span>{columns.map((column) => <input key={column.key} aria-label={column.label} type={column.type ?? "text"} value={row[column.key] ?? ""} onChange={(event) => changeRow(index, column.key, event.target.value)} placeholder={column.placeholder} />)}</div>)}</div><button className="add-row" onClick={() => onChange({ ...recipe, rows: [...recipe.rows, blankRow()] })}>+ Add formula row</button></section>
      <div className="paper-bottom-grid"><section><h4>PRODUCTS USED</h4><textarea placeholder="Color, developer, care..." value={recipe.products} onChange={(event) => onChange({ ...recipe, products: event.target.value })} /></section><section><h4>TECHNIQUE</h4><textarea placeholder="Balayage, root color..." value={recipe.technique} onChange={(event) => onChange({ ...recipe, technique: event.target.value })} /></section><section><h4>NOTES / SPECIAL DETAILS</h4><textarea placeholder="Write notes here..." value={recipe.notes} onChange={(event) => onChange({ ...recipe, notes: event.target.value })} /></section></div>
      <div className="ink-area"><div className="ink-label"><h4>HANDWRITTEN NOTES</h4><span>{drawMode ? "Draw directly over the template" : "Use your finger, mouse or stylus"}</span></div></div>
      <RecipeDrawingCanvas key={recipe.id} recipeId={recipe.id} strokes={recipe.strokes} enabled={drawMode} tool={tool} color={inkColor} width={brushSize} opacity={opacity} eraserRadius={eraserSize} actionsRef={drawingActions} onStrokesChange={(strokes) => onChange({ ...recipe, strokes })} onStateChange={setDrawingState} />
      <p className="paper-footnote">Stored locally on this device  Export a JSON backup regularly</p>
    </article></div>
  </div>;
}

function CustomerModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (name: string, phone: string, email: string) => void }) { const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState(""); const [error, setError] = useState(""); const submit = () => name.trim() ? onSubmit(name, phone, email) : setError("Customer name is required"); return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="modal-close" onClick={onClose} aria-label="Close"></button><p className="eyebrow">NEW CUSTOMER</p><h2 id="dialog-title">Add a customer</h2><p className="muted">Keep the essentials here. You can add the first formula next.</p><label>Name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /></label><label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+41 ..." /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" onClick={submit}>Create customer</button></div></div></div>; }
