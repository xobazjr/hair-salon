import assert from "node:assert/strict";
import test from "node:test";
import {
  createStrokeHistory,
  drawStrokes,
  distanceToStroke,
  eraseStrokesAt,
  moveStroke,
  normalizePointerPressure,
  normalizeStrokes,
  smoothPoints,
} from "./drawing.ts";

const stroke = (id, points, extra = {}) => ({
  id,
  points,
  color: "#543b3d",
  width: 0.004,
  tool: "pen",
  opacity: 1,
  ...extra,
});

test("pressure keeps real pen values and uses a steady fallback for other pointers", () => {
  assert.equal(normalizePointerPressure(0.82, "pen"), 0.82);
  assert.equal(normalizePointerPressure(0, "pen"), 0.5);
  assert.equal(normalizePointerPressure(0.1, "touch"), 0.5);
  assert.equal(normalizePointerPressure(0.9, "mouse"), 0.5);
});

test("smoothed paths retain their exact start and end points", () => {
  const points = [{ x: 0.1, y: 0.2 }, { x: 0.4, y: 0.5 }, { x: 0.8, y: 0.3 }];
  const result = smoothPoints(points, 3);
  assert.deepEqual(result[0], points[0]);
  assert.deepEqual(result.at(-1), points.at(-1));
  assert.ok(result.length > points.length);
});

test("distance and object erasing find strokes along the complete path", () => {
  const line = stroke("line", [{ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }]);
  assert.ok(distanceToStroke(line, { x: 0.5, y: 0.51 }, { width: 1000, height: 500 }) < 10);
  assert.deepEqual(eraseStrokesAt([line], { x: 0.5, y: 0.51 }, { width: 1000, height: 500 }, 10), []);
});

test("moving a selected stroke preserves its style and pressure samples", () => {
  const source = stroke("pressure", [{ x: 0.2, y: 0.3, pressure: 0.2 }, { x: 0.4, y: 0.5, pressure: 0.8 }], { tool: "pressure", opacity: 0.6 });
  const moved = moveStroke(source, 0.1, -0.05);
  assert.deepEqual(moved.points, [{ x: 0.3, y: 0.25, pressure: 0.2 }, { x: 0.5, y: 0.45, pressure: 0.8 }]);
  assert.equal(moved.tool, "pressure");
  assert.equal(moved.opacity, 0.6);
});

test("stroke history supports undo, redo, and clearing the redo branch after a new edit", () => {
  const history = createStrokeHistory([]);
  const first = [stroke("one", [{ x: 0, y: 0 }])];
  const second = [...first, stroke("two", [{ x: 1, y: 1 }])];
  history.commit(first);
  history.commit(second);
  assert.deepEqual(history.undo(), first);
  assert.deepEqual(history.redo(), second);
  history.undo();
  history.commit([stroke("replacement", [{ x: 0.5, y: 0.5 }])]);
  assert.equal(history.redo(), null);
});

test("legacy recipe strokes normalize without losing their points, color, or width", () => {
  const old = [{ points: [{ x: 0.2, y: 0.4 }, { x: 0.7, y: 0.6 }], color: "#543B3D", width: 0.0018 }];
  const migrated = normalizeStrokes(old);
  assert.equal(migrated.length, 1);
  assert.deepEqual(migrated[0].points, old[0].points);
  assert.equal(migrated[0].color, old[0].color);
  assert.equal(migrated[0].width, old[0].width);
  assert.equal(migrated[0].tool, "pen");
  assert.ok(migrated[0].id);
});

test("new stroke data survives the same JSON save and restore path as local storage", () => {
  const original = stroke("saved", [{ x: 0.1, y: 0.2, pressure: 0.7 }, { x: 0.8, y: 0.9, pressure: 0.4 }], { tool: "highlighter", opacity: 0.32 });
  const restored = normalizeStrokes(JSON.parse(JSON.stringify([original])));
  assert.deepEqual(restored, [original]);
});

test("canvas renderer varies pressure width and renders highlighter opacity", () => {
  const seen = { widths: [], alphas: [], strokes: 0 };
  const context = {
    clearRect() {}, save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {},
    stroke() { seen.strokes++; },
    set lineCap(_value) {}, set lineJoin(_value) {}, set strokeStyle(_value) {}, set fillStyle(_value) {},
    set lineWidth(value) { seen.widths.push(value); }, set globalAlpha(value) { seen.alphas.push(value); },
  };
  drawStrokes(context, [
    stroke("pressure", [{ x: 0, y: 0, pressure: 0.2 }, { x: 1, y: 1, pressure: 0.9 }], { tool: "pressure" }),
    stroke("highlight", [{ x: 0, y: 0 }, { x: 1, y: 1 }], { tool: "highlighter", opacity: 0.8 }),
  ], { width: 100, height: 80 });
  assert.ok(seen.widths.some((width) => width >= 1.25 && width <= 6));
  assert.ok(seen.alphas.includes(0.8 * 0.36));
  assert.equal(seen.strokes, 2);
});

