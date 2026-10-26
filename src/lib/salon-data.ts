export type HairAnalysis = {
  texture: string;
  condition: string;
  naturalLevel: string;
  greyCoverage: string;
};

export type FormulaRow = {
  id: string;
  date: string;
  area: string;
  shade: string;
  colorAmount: string;
  oxidant: string;
  oxidantAmount: string;
  ratio: string;
  processingTime: string;
  notes: string;
};

export type StrokePoint = { x: number; y: number };
export type Stroke = { id: string; points: StrokePoint[]; color: string; width: number };

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  prefix: string;
  createdAt: string;
  updatedAt: string;
};

export type ColorRecord = {
  id: string;
  customerId: string;
  date: string;
  analysis: HairAnalysis;
  serviceAreas: string[];
  formulaRows: FormulaRow[];
  products: string[];
  techniques: string[];
  notes: string;
  strokes: Stroke[];
  updatedAt: string;
};

export type SalonBackup = { version: 1; customers: Customer[]; records: ColorRecord[] };

export const STORAGE_KEY = "hair-salon-color-record-v1";
export const uid = () => crypto.randomUUID();
export const today = () => new Date().toISOString().slice(0, 10);

export function newRow(date = today()): FormulaRow {
  return {
    id: uid(), date, area: "โคนผม", shade: "", colorAmount: "", oxidant: "",
    oxidantAmount: "", ratio: "1:1", processingTime: "", notes: "",
  };
}

export function newRecord(customerId: string): ColorRecord {
  return {
    id: uid(), customerId, date: today(),
    analysis: { texture: "ปกติ", condition: "สุขภาพดี", naturalLevel: "5", greyCoverage: "0%" },
    serviceAreas: ["โคนผม"], formulaRows: [], products: [], techniques: [], notes: "", strokes: [],
    updatedAt: new Date().toISOString(),
  };
}

const sampleCustomerId = "sample-customer";
export const sampleData: SalonBackup = {
  version: 1,
  customers: [{
    id: sampleCustomerId, name: "พิมพ์ชนก วัฒนาสกุล", phone: "081 234 5678", email: "pim@example.com",
    birthday: "1992-08-16", prefix: "คุณ", createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-18T00:00:00.000Z",
  }],
  records: [{
    ...newRecord(sampleCustomerId), id: "sample-record", date: "2026-10-18", updatedAt: "2026-10-18T10:00:00.000Z",
    formulaRows: [{ ...newRow("2026-10-18"), id: "sample-row", area: "โคนผม", shade: "5.0", colorAmount: "30", oxidant: "6%", oxidantAmount: "30", ratio: "1:1", processingTime: "35", notes: "เก็บโคนผมหงอก" }, ...Array.from({ length: 7 }, () => newRow("2026-10-18"))],
    products: ["Permanent color", "Developer 6%"], techniques: ["ทำสีโคน"], notes: "โทนอุ่นธรรมชาติ ลูกค้าต้องการปิดผมหงอกแบบนุ่มนวล",
  }],
};

export function sortCustomers(customers: Customer[]) {
  return [...customers].sort((a, b) => a.name.localeCompare(b.name, "th"));
}

export function isSalonBackup(value: unknown): value is SalonBackup {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SalonBackup>;
  const isText = (item: unknown): item is string => typeof item === "string";
  const isTextList = (item: unknown) => Array.isArray(item) && item.every(isText);
  const isRow = (item: unknown): item is FormulaRow => {
    if (!item || typeof item !== "object") return false;
    const row = item as FormulaRow;
    return [row.id, row.date, row.area, row.shade, row.colorAmount, row.oxidant, row.oxidantAmount, row.ratio, row.processingTime, row.notes].every(isText);
  };
  const isStroke = (item: unknown): item is Stroke => {
    if (!item || typeof item !== "object") return false;
    const stroke = item as Stroke;
    return isText(stroke.id) && isText(stroke.color) && typeof stroke.width === "number" && Array.isArray(stroke.points)
      && stroke.points.every((point) => point && typeof point.x === "number" && typeof point.y === "number");
  };
  if (data.version !== 1 || !Array.isArray(data.customers) || !Array.isArray(data.records)) return false;
  const customerIds = new Set<string>();
  const customersAreValid = data.customers.every((customer) => {
    if (!customer || typeof customer !== "object") return false;
    const current = customer as Customer;
    const valid = [current.id, current.name, current.phone, current.email, current.birthday, current.prefix, current.createdAt, current.updatedAt].every(isText) && !customerIds.has(current.id);
    customerIds.add(current.id);
    return valid;
  });
  return customersAreValid && data.records.every((record) => {
    if (!record || typeof record !== "object") return false;
    const current = record as ColorRecord;
    const analysis = current.analysis;
    return isText(current.id) && customerIds.has(current.customerId) && isText(current.date) && isText(current.updatedAt)
      && !!analysis && [analysis.texture, analysis.condition, analysis.naturalLevel, analysis.greyCoverage].every(isText)
      && isTextList(current.serviceAreas) && Array.isArray(current.formulaRows) && current.formulaRows.every(isRow)
      && isTextList(current.products) && isTextList(current.techniques) && isText(current.notes)
      && Array.isArray(current.strokes) && current.strokes.every(isStroke);
  });
}

export function cleanRecord(record: ColorRecord): ColorRecord {
  const trim = (value: string) => value.trim();
  return {
    ...record,
    date: trim(record.date),
    products: record.products.map(trim).filter(Boolean),
    techniques: record.techniques.map(trim).filter(Boolean),
    notes: trim(record.notes),
    formulaRows: record.formulaRows.map((row) => ({
      ...row, date: trim(row.date), area: trim(row.area), shade: trim(row.shade), colorAmount: trim(row.colorAmount),
      oxidant: trim(row.oxidant), oxidantAmount: trim(row.oxidantAmount), ratio: trim(row.ratio), processingTime: trim(row.processingTime), notes: trim(row.notes),
    })),
    updatedAt: new Date().toISOString(),
  };
}
