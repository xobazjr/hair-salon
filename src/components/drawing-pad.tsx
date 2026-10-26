"use client";

import { PointerEvent, useEffect, useRef } from "react";
import type { Stroke, StrokePoint } from "@/lib/salon-data";
import { uid } from "@/lib/salon-data";

type Props = {
  strokes: Stroke[];
  tool: "pen" | "eraser";
  onChange: (strokes: Stroke[]) => void;
};

function distance(a: StrokePoint, b: StrokePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function DrawingPad({ strokes, tool, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<Stroke | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const box = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = box.width * dpr;
      canvas.height = box.height * dpr;
      context.scale(dpr, dpr);
      context.clearRect(0, 0, box.width, box.height);
      context.lineCap = "round";
      context.lineJoin = "round";
      strokes.forEach((stroke) => {
        if (!stroke.points.length) return;
        context.strokeStyle = stroke.color;
        context.lineWidth = stroke.width;
        context.beginPath();
        stroke.points.forEach((point, index) => {
          const x = point.x * box.width;
          const y = point.y * box.height;
          if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
        });
        context.stroke();
      });
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [strokes]);

  const pointAt = (event: PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)), y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)) };
  };
  const eraseAt = (point: StrokePoint) => onChange(strokes.filter((stroke) => !stroke.points.some((candidate) => distance(point, candidate) < 0.045)));
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointAt(event);
    if (tool === "eraser") { eraseAt(point); return; }
    drawing.current = { id: uid(), points: [point], color: "#543b3d", width: 2.5 };
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (tool === "eraser" && event.buttons) { eraseAt(pointAt(event)); return; }
    if (!drawing.current || !event.buttons) return;
    drawing.current = { ...drawing.current, points: [...drawing.current.points, pointAt(event)] };
  };
  const end = () => {
    if (drawing.current && drawing.current.points.length > 1) onChange([...strokes, drawing.current]);
    drawing.current = null;
  };

  return <canvas ref={canvasRef} className="drawing-pad" aria-label="พื้นที่วาดหรือเขียนโน้ตด้วยปากกาหรือยางลบ" role="img" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />;
}
