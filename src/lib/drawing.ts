export type DrawingTool = "pen" | "pressure" | "calligraphy" | "highlighter";
export type StrokePoint = { x: number; y: number; pressure?: number };
export type Stroke = {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
  tool: DrawingTool;
  opacity: number;
};
export type CanvasSize = { width: number; height: number };

export function normalizePointerPressure(pressure: number | undefined, pointerType: string) {
  if (pointerType !== "pen" || pressure === undefined || !Number.isFinite(pressure) || pressure <= 0) return 0.5;
  return Math.max(0.05, Math.min(1, pressure));
}

export function smoothPoints(points: StrokePoint[], subdivisions = 3): StrokePoint[] {
  if (points.length < 3 || subdivisions < 1) return points.slice();
  const result: StrokePoint[] = [points[0]];
  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    for (let step = 1; step <= subdivisions; step++) {
      const t = step / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      const interpolate = (a: number, b: number, c: number, d: number) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      const pressure = [p0.pressure, p1.pressure, p2.pressure, p3.pressure].every((value) => value !== undefined)
        ? interpolate(p0.pressure!, p1.pressure!, p2.pressure!, p3.pressure!)
        : p1.pressure === undefined && p2.pressure === undefined ? undefined : p1.pressure ?? p2.pressure;
      result.push({ x: interpolate(p0.x, p1.x, p2.x, p3.x), y: interpolate(p0.y, p1.y, p2.y, p3.y), ...(pressure === undefined ? {} : { pressure: Math.max(0.05, Math.min(1, pressure)) }) });
    }
  }
  result[result.length - 1] = points[points.length - 1];
  return result;
}

export function normalizeStrokes(value: unknown): Stroke[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const source = entry as Partial<Stroke> & { points?: unknown; width?: unknown; color?: unknown };
    if (!Array.isArray(source.points)) return [];
    const points = source.points.flatMap((point) => {
      if (!point || typeof point !== "object") return [];
      const candidate = point as { x?: unknown; y?: unknown; pressure?: unknown };
      if (typeof candidate.x !== "number" || typeof candidate.y !== "number" || !Number.isFinite(candidate.x) || !Number.isFinite(candidate.y)) return [];
      return [{ x: candidate.x, y: candidate.y, ...(typeof candidate.pressure === "number" && Number.isFinite(candidate.pressure) ? { pressure: Math.max(0.05, Math.min(1, candidate.pressure)) } : {}) }];
    });
    if (points.length === 0) return [];
    const validTools: DrawingTool[] = ["pen", "pressure", "calligraphy", "highlighter"];
    const tool = validTools.includes(source.tool as DrawingTool) ? source.tool as DrawingTool : "pen";
    const width = typeof source.width === "number" && Number.isFinite(source.width) && source.width > 0 ? source.width : 0.002;
    const color = typeof source.color === "string" ? source.color : "#543b3d";
    const opacity = typeof source.opacity === "number" && Number.isFinite(source.opacity) ? Math.max(0.05, Math.min(1, source.opacity)) : 1;
    return [{ id: typeof source.id === "string" && source.id ? source.id : `legacy-${index}-${points.length}`, points, color, width, tool, opacity }];
  });
}

export function distanceToStroke(stroke: Stroke, point: StrokePoint, size: CanvasSize) {
  if (size.width <= 0 || size.height <= 0 || stroke.points.length === 0) return Infinity;
  const target = { x: point.x * size.width, y: point.y * size.height };
  const points = stroke.points.map((sample) => ({ x: sample.x * size.width, y: sample.y * size.height }));
  if (points.length === 1) return Math.hypot(target.x - points[0].x, target.y - points[0].y);
  let distance = Infinity;
  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1];
    const b = points[index];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((target.x - a.x) * dx + (target.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    distance = Math.min(distance, Math.hypot(target.x - (a.x + t * dx), target.y - (a.y + t * dy)));
  }
  return distance;
}

export function eraseStrokesAt(strokes: Stroke[], point: StrokePoint, size: CanvasSize, radius: number) {
  return strokes.filter((stroke) => distanceToStroke(stroke, point, size) > radius + stroke.width * size.width / 2);
}

export function drawStrokes(context: CanvasRenderingContext2D, strokes: Stroke[], size: CanvasSize) {
  context.clearRect(0, 0, size.width, size.height);
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    const points = smoothPoints(stroke.points, stroke.points.length > 8 ? 2 : 3);
    const baseWidth = Math.max(0.75, stroke.width * size.width);
    context.save();
    context.globalAlpha = stroke.opacity;
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.beginPath();
    if (stroke.tool === "pressure") {
      for (let index = 1; index < points.length; index++) {
        const previous = points[index - 1];
        const current = points[index];
        const pressure = ((previous.pressure ?? 0.5) + (current.pressure ?? 0.5)) / 2;
        context.lineWidth = baseWidth * (0.25 + pressure * 1.25);
        context.beginPath();
        context.moveTo(previous.x * size.width, previous.y * size.height);
        context.lineTo(current.x * size.width, current.y * size.height);
        context.stroke();
      }
    } else if (stroke.tool === "calligraphy") {
      for (let index = 1; index < points.length; index++) {
        const previous = points[index - 1];
        const current = points[index];
        const dx = (current.x - previous.x) * size.width;
        const dy = (current.y - previous.y) * size.height;
        const angle = Math.atan2(dy, dx);
        context.lineWidth = baseWidth * (0.25 + 0.75 * Math.abs(Math.sin(angle - Math.PI / 4)));
        context.beginPath();
        context.moveTo(previous.x * size.width, previous.y * size.height);
        context.lineTo(current.x * size.width, current.y * size.height);
        context.stroke();
      }
    } else {
      context.globalAlpha = stroke.tool === "highlighter" ? stroke.opacity * 0.36 : stroke.opacity;
      context.lineWidth = stroke.tool === "highlighter" ? baseWidth * 2.6 : baseWidth;
      context.moveTo(points[0].x * size.width, points[0].y * size.height);
      if (points.length === 1) {
        context.lineTo(points[0].x * size.width + 0.01, points[0].y * size.height + 0.01);
      } else {
        for (let index = 1; index < points.length - 1; index++) {
          const middleX = (points[index].x + points[index + 1].x) / 2 * size.width;
          const middleY = (points[index].y + points[index + 1].y) / 2 * size.height;
          context.quadraticCurveTo(points[index].x * size.width, points[index].y * size.height, middleX, middleY);
        }
        const last = points[points.length - 1];
        context.lineTo(last.x * size.width, last.y * size.height);
      }
      context.stroke();
    }
    context.restore();
  }
}

export function moveStroke(stroke: Stroke, dx: number, dy: number): Stroke {
  const shift = (value: number, delta: number) => Math.round(Math.max(0, Math.min(1, value + delta)) * 1_000_000) / 1_000_000;
  return { ...stroke, points: stroke.points.map((point) => ({ ...point, x: shift(point.x, dx), y: shift(point.y, dy) })) };
}

export function createStrokeHistory<T>(initial: T, capacity = 100) {
  let current = initial;
  const past: T[] = [];
  const future: T[] = [];
  return {
    get current() { return current; },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    commit(next: T) { past.push(current); if (past.length > capacity) past.shift(); current = next; future.length = 0; return current; },
    undo() { if (past.length === 0) return null; future.push(current); current = past.pop()!; return current; },
    redo() { if (future.length === 0) return null; past.push(current); current = future.pop()!; return current; },
    reset(next: T) { current = next; past.length = 0; future.length = 0; },
  };
}
