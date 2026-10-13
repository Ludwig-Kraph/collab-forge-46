import { useEffect, useRef } from "react";

// Animated payment network: dense node cloud over East Africa/Ethiopia with
// green (settled) and red (pending) links, plus large arcs to the rest of the world.
const HUBS: [number, number][] = [
  [0.60, 0.52], [0.62, 0.44], [0.58, 0.58], [0.64, 0.50], [0.56, 0.48], // Nairobi, Addis, Dar, Mombasa, Kampala
];
const WORLD: [number, number][] = [
  [0.48, 0.25], [0.30, 0.30], [0.85, 0.35], [0.92, 0.70], [0.25, 0.70], [0.45, 0.80], [0.70, 0.22], [0.40, 0.55], [0.52, 0.70],
];

export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, t = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => { const d = Math.min(devicePixelRatio, 2); w = c.offsetWidth; h = c.offsetHeight; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    resize(); addEventListener("resize", resize);
    const nodes = Array.from({ length: 260 }, () => {
      const [hx, hy] = HUBS[Math.floor(Math.random() * HUBS.length)];
      const r = Math.random() ** 1.6 * 0.12;
      const a = Math.random() * Math.PI * 2;
      return { x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r * 1.3, p: Math.random() * 6 };
    });
    const pulses = Array.from({ length: 34 }, () => ({ a: 0, b: 0, k: Math.random(), s: 0.003 + Math.random() * 0.006, red: Math.random() < 0.28, far: Math.random() < 0.35 }));
    const reseed = (p: typeof pulses[number]) => { p.a = Math.floor(Math.random() * nodes.length); p.b = Math.floor(Math.random() * (p.far ? WORLD.length : nodes.length)); p.k = 0; };
    pulses.forEach(reseed);
    const pt = (x: number, y: number) => [x * w, y * h] as const;

    const draw = () => {
      t += 1; ctx.clearRect(0, 0, w, h);
      // local mesh
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i += 2) {
        const n = nodes[i], m = nodes[(i * 7 + 3) % nodes.length];
        const [x1, y1] = pt(n.x, n.y), [x2, y2] = pt(m.x, m.y);
        if (Math.hypot(x1 - x2, y1 - y2) > 120) continue;
        ctx.strokeStyle = i % 5 === 0 ? "rgba(220,38,38,0.18)" : "rgba(16,185,129,0.16)";
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      // world arcs
      HUBS.slice(0, 2).forEach(([hx, hy]) => WORLD.forEach(([wx, wy], j) => {
        const [x1, y1] = pt(hx, hy), [x2, y2] = pt(wx, wy);
        ctx.strokeStyle = j % 3 === 0 ? "rgba(220,38,38,0.12)" : "rgba(16,185,129,0.14)";
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 80, x2, y2); ctx.stroke();
      }));
      // nodes
      nodes.forEach((n) => {
        const [x, y] = pt(n.x, n.y); const s = 1 + Math.sin(t / 30 + n.p) * 0.6;
        ctx.fillStyle = "rgba(52,211,153,0.75)"; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
      });
      WORLD.forEach(([wx, wy]) => { const [x, y] = pt(wx, wy); ctx.fillStyle = "rgba(52,211,153,0.9)"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); });
      // flowing transactions
      pulses.forEach((p) => {
        p.k += p.s; if (p.k >= 1) reseed(p);
        const a = nodes[p.a]; const b = p.far ? { x: WORLD[p.b][0], y: WORLD[p.b][1] } : nodes[p.b];
        const [x1, y1] = pt(a.x, a.y), [x2, y2] = pt(b.x, b.y);
        const cy = p.far ? Math.min(y1, y2) - 80 : (y1 + y2) / 2;
        const k = p.k, x = (1 - k) ** 2 * x1 + 2 * (1 - k) * k * ((x1 + x2) / 2) + k * k * x2;
        const y = (1 - k) ** 2 * y1 + 2 * (1 - k) * k * cy + k * k * y2;
        ctx.fillStyle = p.red ? "rgba(248,113,113,0.95)" : "rgba(110,231,183,1)";
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, p.far ? 2.4 : 1.8, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
