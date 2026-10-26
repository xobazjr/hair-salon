"use client";

import { PointerEvent as ReactPointerEvent, MutableRefObject, useEffect, useLayoutEffect, useRef } from "react";
import {
  createStrokeHistory,
  distanceToStroke,
  drawStrokes,
  eraseStrokesAt,
  moveStroke,
  normalizePointerPressure,
  normalizeStrokes,
  type DrawingTool,
  type Stroke,
  type StrokePoint,
} from "../lib/drawing";

export type EditorTool = DrawingTool | "select" | "eraser" | "pan";
export type DrawingActions = {
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  clearUnsaved: () => void;
  markSaved: () => void;
};
export type DrawingState = { canUndo: boolean; canRedo: boolean; selectedId: string | null };

type Props = {
  strokes: Stroke[];
  recipeId: string;
  enabled: boolean;
  tool: EditorTool;
  color: string;
  width: number;
  opacity: number;
  eraserRadius: number;
  actionsRef: MutableRefObject<DrawingActions | null>;
  onStrokesChange: (strokes: Stroke[]) => void;
  onStateChange: (state: DrawingState) => void;
};

type Gesture =
  | { kind: "draw"; pointerId: number; stroke: Stroke }
  | { kind: "erase"; pointerId: number; working: Stroke[] }
  | { kind: "move"; pointerId: number; strokeId: string; working: Stroke[]; previous: StrokePoint }
  | { kind: "pan"; center: { x: number; y: number } }
  | { kind: "mouse-pan"; pointerId: number; x: number; y: number };

function sameStrokes(left: Stroke[], right: Stroke[]) {
  return left.length === right.length && left.every((stroke, index) => {
    const other = right[index];
    return stroke === other || (stroke.id === other.id && stroke.points.length === other.points.length && stroke.points.every((point, pointIndex) => {
      const candidate = other.points[pointIndex];
      return point.x === candidate.x && point.y === candidate.y && point.pressure === candidate.pressure;
    }));
  });
}

export default function RecipeDrawingCanvas({ strokes, recipeId, enabled, tool, color, width, opacity, eraserRadius, actionsRef, onStrokesChange, onStateChange }: Props) {
  const layer = useRef<HTMLDivElement>(null);
  const baseCanvas = useRef<HTMLCanvasElement>(null);
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const size = useRef({ width: 0, height: 0, ratio: 1 });
  const committed = useRef<Stroke[]>([]);
  const savedBaseline = useRef<Stroke[]>([]);
  const lastProp = useRef(strokes);
  const history = useRef(createStrokeHistory<Stroke[]>([]));
  const didInitialize = useRef(false);
  const activeGesture = useRef<Gesture | null>(null);
  const activeTouches = useRef(new Map<number, { x: number; y: number }>());
  const selectedId = useRef<string | null>(null);
  const frame = useRef<number | null>(null);

  const publishState = () => onStateChange({ canUndo: history.current.canUndo, canRedo: history.current.canRedo, selectedId: selectedId.current });
  const clearPreview = () => {
    const canvas = previewCanvas.current;
    const context = canvas?.getContext("2d");
    if (context) context.clearRect(0, 0, size.current.width, size.current.height);
  };
  const renderBase = (items = committed.current) => {
    const canvas = baseCanvas.current;
    const context = canvas?.getContext("2d");
    if (context) drawStrokes(context, items, size.current);
  };
  const renderPreview = () => {
    frame.current = null;
    const gesture = activeGesture.current;
    if (!gesture || gesture.kind === "pan" || gesture.kind === "mouse-pan") { clearPreview(); return; }
    if (gesture.kind === "draw") {
      const context = previewCanvas.current?.getContext("2d");
      if (context) drawStrokes(context, [gesture.stroke], size.current);
      return;
    }
    if (baseCanvas.current) baseCanvas.current.style.visibility = "hidden";
    const items = gesture.working;
    const canvas = previewCanvas.current;
    const context = canvas?.getContext("2d");
    if (context) drawStrokes(context, items, size.current);
  };
  const schedulePreview = () => {
    if (frame.current === null) frame.current = requestAnimationFrame(renderPreview);
  };
  const restoreLayers = (items = committed.current) => {
    if (baseCanvas.current) baseCanvas.current.style.visibility = "visible";
    renderBase(items);
    clearPreview();
  };
  const commit = (next: Stroke[]) => {
    committed.current = next;
    lastProp.current = next;
    history.current.commit(next);
    selectedId.current = null;
    restoreLayers(next);
    onStrokesChange(next);
    publishState();
  };
  const undo = () => {
    const previous = history.current.undo();
    if (!previous) return;
    committed.current = previous;
    lastProp.current = previous;
    selectedId.current = null;
    restoreLayers(previous);
    onStrokesChange(previous);
    publishState();
  };
  const redo = () => {
    const next = history.current.redo();
    if (!next) return;
    committed.current = next;
    lastProp.current = next;
    selectedId.current = null;
    restoreLayers(next);
    onStrokesChange(next);
    publishState();
  };
  const deleteSelected = () => {
    if (!selectedId.current) return;
    const next = committed.current.filter((stroke) => stroke.id !== selectedId.current);
    if (next.length !== committed.current.length) commit(next);
    else { selectedId.current = null; publishState(); }
  };
  const clearUnsaved = () => {
    const baselineIds = new Set(savedBaseline.current.map((stroke) => stroke.id));
    const next = committed.current.filter((stroke) => baselineIds.has(stroke.id));
    if (next.length !== committed.current.length) commit(next);
  };
  const markSaved = () => { savedBaseline.current = committed.current.slice(); };

  useEffect(() => { actionsRef.current = { undo, redo, deleteSelected, clearUnsaved, markSaved }; return () => { actionsRef.current = null; }; });

  useLayoutEffect(() => {
    const container = layer.current;
    if (!container) return;
    const measure = () => {
      const bounds = container.getBoundingClientRect();
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      size.current = { width: bounds.width, height: bounds.height, ratio };
      for (const canvas of [baseCanvas.current, previewCanvas.current]) {
        if (!canvas) continue;
        const pixelWidth = Math.max(1, Math.round(bounds.width * ratio));
        const pixelHeight = Math.max(1, Math.round(bounds.height * ratio));
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
        canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      renderBase();
      clearPreview();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    if (!didInitialize.current) {
      didInitialize.current = true;
      const initial = normalizeStrokes(strokes);
      committed.current = initial;
      savedBaseline.current = initial.slice();
      history.current.reset(initial);
      restoreLayers(initial);
      publishState();
      return;
    }
    if (lastProp.current === strokes) return;
    lastProp.current = strokes;
    const next = normalizeStrokes(strokes);
    committed.current = next;
    savedBaseline.current = next.slice();
    history.current.reset(next);
    selectedId.current = null;
    restoreLayers(next);
    publishState();
    // These ref-backed helpers synchronize persisted strokes when the recipe changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, recipeId]);

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  const getPoint = (clientX: number, clientY: number, pressure?: number, pointerType?: string, preservePressure = false): StrokePoint => {
    const rect = previewCanvas.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
      ...(preservePressure ? { pressure: normalizePointerPressure(pressure, pointerType ?? "mouse") } : {}),
    };
  };
  const coalesced = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const native = event.nativeEvent;
    const samples = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    return samples.length ? samples : [native];
  };
  const centroid = () => {
    const points = [...activeTouches.current.values()];
    return { x: points.reduce((sum, point) => sum + point.x, 0) / points.length, y: points.reduce((sum, point) => sum + point.y, 0) / points.length };
  };
  const beginPan = () => {
    activeGesture.current = { kind: "pan", center: centroid() };
    schedulePreview();
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* The pointer may have been cancelled by the browser. */ }
    if (event.pointerType === "touch") {
      activeTouches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (activeTouches.current.size >= 2) { activeGesture.current = null; beginPan(); return; }
    }
    const at = getPoint(event.clientX, event.clientY);
    if (tool === "pan") {
      activeGesture.current = { kind: "mouse-pan", pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      return;
    }
    if (tool === "select") {
      const hit = [...committed.current].reverse().find((stroke) => distanceToStroke(stroke, at, size.current) <= 10 + stroke.width * size.current.width / 2);
      selectedId.current = hit?.id ?? null;
      publishState();
      if (hit) activeGesture.current = { kind: "move", pointerId: event.pointerId, strokeId: hit.id, working: committed.current.slice(), previous: at };
      return;
    }
    if (tool === "eraser") {
      const working = eraseStrokesAt(committed.current, at, size.current, eraserRadius);
      activeGesture.current = { kind: "erase", pointerId: event.pointerId, working };
      schedulePreview();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const point = getPoint(event.clientX, event.clientY, event.pressure, event.pointerType, tool === "pressure");
    activeGesture.current = {
      kind: "draw",
      pointerId: event.pointerId,
      stroke: {
        id: crypto.randomUUID(),
        points: [point],
        color,
        width: width / Math.max(1, rect.width),
        tool,
        opacity: tool === "highlighter" ? Math.min(opacity, 0.55) : opacity,
      },
    };
    schedulePreview();
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    if (event.pointerType === "touch" && activeTouches.current.has(event.pointerId)) activeTouches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = activeGesture.current;
    if (!gesture) return;
    if (activeTouches.current.size >= 2) {
      if (gesture.kind !== "pan") { activeGesture.current = null; beginPan(); return; }
      const center = centroid();
      const dx = center.x - gesture.center.x;
      const dy = center.y - gesture.center.y;
      const wrapper = layer.current?.closest(".paper-wrap");
      if (wrapper) wrapper.scrollLeft -= dx;
      window.scrollBy({ left: 0, top: -dy, behavior: "instant" });
      activeGesture.current = { kind: "pan", center };
      return;
    }
    if (gesture.kind === "mouse-pan") {
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      const wrapper = layer.current?.closest(".paper-wrap");
      if (wrapper) wrapper.scrollLeft -= dx;
      window.scrollBy({ left: 0, top: -dy, behavior: "instant" });
      activeGesture.current = { ...gesture, x: event.clientX, y: event.clientY };
      return;
    }
    if (gesture.kind === "draw") {
      for (const sample of coalesced(event)) {
        gesture.stroke.points.push(getPoint(sample.clientX, sample.clientY, sample.pressure, sample.pointerType, gesture.stroke.tool === "pressure"));
      }
      schedulePreview();
      return;
    }
    let at = getPoint(event.clientX, event.clientY);
    if (gesture.kind === "erase") {
      for (const sample of coalesced(event)) {
        at = getPoint(sample.clientX, sample.clientY);
        gesture.working = eraseStrokesAt(gesture.working, at, size.current, eraserRadius);
      }
    } else if (gesture.kind === "move") {
      const dx = at.x - gesture.previous.x;
      const dy = at.y - gesture.previous.y;
      gesture.working = gesture.working.map((stroke) => stroke.id === gesture.strokeId ? moveStroke(stroke, dx, dy) : stroke);
      gesture.previous = at;
    }
    activeGesture.current = gesture;
    schedulePreview();
  };
  const finishGesture = (event: ReactPointerEvent<HTMLCanvasElement>, cancelled = false) => {
    if (event.pointerType === "touch") activeTouches.current.delete(event.pointerId);
    const gesture = activeGesture.current;
    if (!gesture || ("pointerId" in gesture && gesture.pointerId !== event.pointerId)) {
      if (activeTouches.current.size === 0) activeGesture.current = null;
      return;
    }
    activeGesture.current = null;
    if (cancelled) { restoreLayers(); return; }
    if (gesture.kind === "draw") commit([...committed.current, gesture.stroke]);
    else if ((gesture.kind === "erase" || gesture.kind === "move") && !sameStrokes(gesture.working, committed.current)) commit(gesture.working);
    else restoreLayers();
  };

  return <div ref={layer} className={`recipe-drawing-layer ${enabled ? "drawing-enabled" : ""}`} aria-label="Recipe handwriting and drawing layer">
    <canvas ref={baseCanvas} className="recipe-ink-base" aria-hidden="true" />
    <canvas ref={previewCanvas} className="recipe-ink-preview" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={(event) => finishGesture(event)} onPointerCancel={(event) => finishGesture(event, true)} aria-label="Handwriting and drawing canvas" />
  </div>;
}







