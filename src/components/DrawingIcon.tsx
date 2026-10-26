import type { ReactNode, SVGProps } from "react";

type IconName = "studio" | "expand" | "collapse" | "draw" | "select" | "pan" | "pen" | "pressure" | "calligraphy" | "highlighter" | "eraser" | "delete" | "undo" | "redo" | "clear";

const paths: Record<IconName, ReactNode> = {
  studio: <><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12"/><circle cx="12" cy="12" r="3"/></>,
  expand: <path d="m7 10 5 5 5-5"/>, collapse: <path d="m7 14 5-5 5 5"/>,
  draw: <><path d="m4 16-.8 4 4-.8L19 7.4 15.6 4 4 16Z"/><path d="m13.8 5.8 3.4 3.4M4 20h16"/></>,
  select: <path d="m5 3 14 10-6 .8-3.5 5.2L5 3Z"/>,
  pan: <><path d="M8 11V5a1.5 1.5 0 0 1 3 0v5-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v7l1-2a1.5 1.5 0 0 1 2.8 1l-2 6a4 4 0 0 1-3.8 2.7h-3a4 4 0 0 1-3.3-1.7L5 14a1.7 1.7 0 0 1 2.6-2.2L10 14"/></>,
  pen: <><path d="m4 16-.8 4 4-.8L19 7.4 15.6 4 4 16Z"/><path d="m13.8 5.8 3.4 3.4"/></>,
  pressure: <><path d="M5 19 18 6l-4-3L3 14l2 5Z"/><path d="m12 9 3 3M4 21h16"/><path d="M19 12v5m-2.5-2.5h5"/></>,
  calligraphy: <><path d="m4 17-.8 3.8L7 20 19 8l-4-4L4 15Z"/><path d="m13 6 4 4M5 20h14"/></>,
  highlighter: <><path d="m4 15 8-11 8 6-8 11H4v-6Z"/><path d="m4 20 8-1M12 4l8 6"/></>,
  eraser: <><path d="m7 4 13 12-5 5H9l-6-6 9-11a3 3 0 0 1 4.2-.4"/><path d="m8 20 7-8"/></>,
  delete: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
  undo: <><path d="M9 14 4 9l5-5"/><path d="M4 9h9a7 7 0 0 1 0 14h-2"/></>,
  redo: <><path d="m15 14 5-5-5-5"/><path d="M20 9h-9a7 7 0 0 0 0 14h2"/></>,
  clear: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/><path d="m3 3 18 18"/></>,
};

export function DrawingIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg {...props} width={props.width ?? 16} height={props.height ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
