"use client";

import { useEffect, useRef } from "react";

const CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

type Blob = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
};

type TrailPoint = { x: number; y: number };
type RGB = { r: number; g: number; b: number };

function parseCssColor(raw: string): RGB | null {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    if (full.length !== 6) return null;
    const n = Number.parseInt(full, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const m = value.match(
    /rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i
  );
  if (!m) return null;
  return {
    r: Math.round(Number(m[1])),
    g: Math.round(Number(m[2])),
    b: Math.round(Number(m[3])),
  };
}

function luminance({ r, g, b }: RGB) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

type Props = {
  /** Full window vs container-bounded panel (CV side art) */
  mode?: "viewport" | "panel";
  /** Coarser grid + lower fps — for intro overlays */
  lite?: boolean;
  className?: string;
};

/**
 * Shared ASCII luminous field — used on home, CV panel, and intro.
 */
export default function AsciiGlowBackground({
  mode = "viewport",
  lite = false,
  className = "pointer-events-none absolute inset-0 z-0 h-full w-full",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fpsCap = lite || reduced ? 24 : 32;
    const frameMs = 1000 / fpsCap;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cell = lite ? 12 : 10;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let t0 = performance.now();
    let lastNow = t0;
    let lastDraw = 0;
    let bg: RGB = { r: 2, g: 6, b: 23 };
    let fg: RGB = { r: 255, g: 255, b: 255 };
    let lightBg = false;
    let frame = 0;
    let themeAt = 0;
    let visible = !document.hidden;

    const readTheme = (force = false) => {
      const now = performance.now();
      if (!force && now - themeAt < 180) return;
      themeAt = now;
      // Read vars from the component itself so ancestors can override
      // --background / --foreground locally (e.g. a dark hero on a light page).
      const styles = getComputedStyle(wrap ?? canvas);
      const nextBg = parseCssColor(styles.getPropertyValue("--background"));
      const nextFg = parseCssColor(styles.getPropertyValue("--foreground"));
      if (nextBg) bg = nextBg;
      if (nextFg) fg = nextFg;
      lightBg = luminance(bg) > 0.55;
      const frameTarget =
        styles.getPropertyValue("--home-frame").trim() === "1" ? 1 : 0;
      frame += (frameTarget - frame) * 0.12;
    };

    const blobs: Blob[] =
      mode === "panel"
        ? [
            { x: 0.2, y: 0.35, r: 0.55, vx: 0.00018, vy: 0.00012, phase: 0.3 },
            { x: 0.75, y: 0.2, r: 0.42, vx: -0.00014, vy: 0.0001, phase: 1.4 },
            { x: 0.55, y: 0.8, r: 0.48, vx: 0.0001, vy: -0.00016, phase: 2.6 },
            { x: 0.9, y: 0.7, r: 0.32, vx: -0.00012, vy: -0.0001, phase: 3.8 },
          ]
        : [
            { x: 0.12, y: 0.55, r: 0.42, vx: 0.00018, vy: 0.00012, phase: 0.2 },
            { x: 0.08, y: 0.18, r: 0.28, vx: 0.0001, vy: -0.00014, phase: 1.1 },
            { x: 0.55, y: 0.92, r: 0.34, vx: -0.00012, vy: 0.00008, phase: 2.4 },
            { x: 0.92, y: 0.75, r: 0.22, vx: -0.00016, vy: -0.0001, phase: 3.7 },
          ];

    const pointer = { x: 0.5, y: 0.5, active: false };
    const liquid = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
    const trail: TrailPoint[] = Array.from({ length: lite ? 6 : 10 }, () => ({
      x: 0.5,
      y: 0.5,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
      if (mode === "panel" && wrap) {
        const rect = wrap.getBoundingClientRect();
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
      } else {
        width = window.innerWidth;
        height = window.innerHeight;
      }
      if (width < 2 || height < 2) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const base = lite ? 12 : width < 640 ? 10 : width < 1024 ? 11 : 12;
      cell = base;
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reduced) return;
      if (mode === "panel" && wrap) {
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.x = (e.clientX - rect.left) / rect.width;
        pointer.y = (e.clientY - rect.top) / rect.height;
      } else {
        pointer.x = e.clientX / Math.max(1, width);
        pointer.y = e.clientY / Math.max(1, height);
      }
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const stepLiquid = (dt: number) => {
      if (reduced) return;
      const targetX = pointer.active ? pointer.x : liquid.x;
      const targetY = pointer.active ? pointer.y : liquid.y;
      const stiffness = pointer.active ? 8 : 3;
      const drag = pointer.active ? 5.2 : 6.5;
      const ax = (targetX - liquid.x) * stiffness;
      const ay = (targetY - liquid.y) * stiffness;
      liquid.vx = (liquid.vx + ax * dt) * Math.exp(-drag * dt);
      liquid.vy = (liquid.vy + ay * dt) * Math.exp(-drag * dt);
      liquid.x += liquid.vx * dt;
      liquid.y += liquid.vy * dt;

      let px = liquid.x;
      let py = liquid.y;
      for (let i = 0; i < trail.length; i++) {
        const lag = 0.1 + i * 0.025;
        trail[i].x += (px - trail[i].x) * Math.min(1, lag * dt * 60);
        trail[i].y += (py - trail[i].y) * Math.min(1, lag * dt * 60);
        px = trail[i].x;
        py = trail[i].y;
      }
    };

    const fieldAt = (nx: number, ny: number, time: number) => {
      let v = 0;
      const aspect = height / Math.max(1, width);

      for (const b of blobs) {
        const px = b.x + Math.sin(time * 0.35 + b.phase) * 0.04;
        const py = b.y + Math.cos(time * 0.28 + b.phase * 1.3) * 0.035;
        const dx = nx - px;
        const dy = (ny - py) * aspect;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pulse = 1 + Math.sin(time * 0.9 + b.phase) * 0.08;
        const R = b.r * pulse;
        const falloff = Math.max(0, 1 - dist / R);
        v += falloff * falloff;
      }

      if (!reduced) {
        const speed = Math.min(1.4, Math.hypot(liquid.vx, liquid.vy) * 0.9);
        const stretch = 1 + speed * 1.4;
        const angle = Math.atan2(liquid.vy, liquid.vx);
        const cos = Math.cos(-angle);
        const sin = Math.sin(-angle);

        const addBlob = (bx: number, by: number, radius: number, weight: number) => {
          const dx = nx - bx;
          const dy = (ny - by) * aspect;
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          const dist = Math.sqrt((rx / stretch) ** 2 + (ry * stretch * 0.55) ** 2);
          const falloff = Math.max(0, 1 - dist / radius);
          v += falloff * falloff * weight;
        };

        const headR = mode === "panel" ? 0.12 : 0.085;
        addBlob(liquid.x, liquid.y, headR + speed * 0.025, 1.15);

        for (let i = 0; i < trail.length; i++) {
          const t = trail[i];
          const w = 0.72 - i * 0.075;
          const r = (mode === "panel" ? 0.09 : 0.065) - i * 0.005 + speed * 0.012;
          if (w > 0.08) addBlob(t.x, t.y, Math.max(0.028, r), w);
        }
      }

      const cx = nx - 0.5;
      const cy = ny - 0.48;
      const center = Math.sqrt(cx * cx + cy * cy * 0.85);
      const edgeBoost =
        mode === "panel"
          ? Math.max(0, 0.22 - center * 0.18)
          : Math.max(0, center - 0.15) * 1.15;

      if (frame > 0.01) {
        const edgeDist = Math.min(nx, 1 - nx, ny, 1 - ny);
        const band = Math.max(0, 1 - edgeDist / 0.16);
        const breathe = 1 + Math.sin(time * 0.6) * 0.08;
        v += band * band * band * 1.5 * breathe * frame;
      }

      return Math.min(1.35, v * 0.95 + edgeBoost * (mode === "panel" ? 1 : 0.25));
    };

    const stepBlobs = () => {
      if (reduced) return;
      for (const b of blobs) {
        b.x += b.vx * 16;
        b.y += b.vy * 16;
        if (b.x < -0.05 || b.x > 1.05) b.vx *= -1;
        if (b.y < -0.05 || b.y > 1.05) b.vy *= -1;
        b.x = Math.min(1.08, Math.max(-0.08, b.x));
        b.y = Math.min(1.08, Math.max(-0.08, b.y));
      }
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      if (now - lastDraw < frameMs) return;
      lastDraw = now;

      if (width < 2 || height < 2) {
        resize();
        return;
      }

      const time = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      readTheme();
      stepBlobs();
      stepLiquid(dt);

      ctx.fillStyle = `rgb(${bg.r},${bg.g},${bg.b})`;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${Math.floor(cell * 0.92)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cell + cell * 0.5;
          const y = row * cell + cell * 0.5;
          let intensity = fieldAt(x / width, y / height, time);

          if (!reduced) {
            intensity += Math.sin(col * 0.7 + row * 1.1 + time * 1.6) * 0.02;
          }
          intensity = Math.max(0, Math.min(1, intensity));
          if (intensity < 0.04) continue;

          const idx = Math.min(
            CHARS.length - 1,
            Math.floor(intensity * (CHARS.length - 1))
          );
          const a = 0.14 + intensity * 0.86;
          let r: number;
          let g: number;
          let b: number;
          if (lightBg) {
            r = Math.floor(fg.r * (0.55 + intensity * 0.45));
            g = Math.floor(fg.g * (0.55 + intensity * 0.45));
            b = Math.floor(fg.b * (0.55 + intensity * 0.45));
          } else {
            r = Math.floor(fg.r * 0.35 + (40 + intensity * 90) * 0.65);
            g = Math.floor(fg.g * 0.35 + (160 + intensity * 70) * 0.65);
            b = Math.floor(fg.b * 0.35 + (220 + intensity * 35) * 0.65);
          }
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillText(CHARS[idx], x, y);
        }
      }
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        lastNow = performance.now();
        lastDraw = 0;
      }
    };

    readTheme(true);
    resize();

    const ro =
      mode === "panel" && wrap
        ? new ResizeObserver(() => resize())
        : null;
    if (ro && wrap) ro.observe(wrap);
    else window.addEventListener("resize", resize);

    const moveTarget = mode === "panel" && wrap ? wrap : window;
    moveTarget.addEventListener("pointermove", onPointerMove as EventListener, {
      passive: true,
    });
    moveTarget.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      moveTarget.removeEventListener("pointermove", onPointerMove as EventListener);
      moveTarget.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode, lite]);

  if (mode === "panel") {
    return (
      <div ref={wrapRef} className="relative h-full min-h-[inherit] w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden className={className} />
      </div>
    );
  }

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
