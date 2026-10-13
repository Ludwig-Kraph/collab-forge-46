import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, RefreshCw, ShieldQuestion } from "lucide-react";

type Kind = "math" | "slide" | "sequence" | "pick";
const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function build(kind: Kind) {
  if (kind === "math") {
    const op = ["+", "−", "×", "÷"][rnd(0, 3)];
    let a = rnd(2, 20), b = rnd(2, 12), ans = 0;
    if (op === "+") ans = a + b;
    if (op === "−") { if (b > a) [a, b] = [b, a]; ans = a - b; }
    if (op === "×") ans = a * b;
    if (op === "÷") { ans = a; a = a * b; }
    return { kind, prompt: `Solve: ${a} ${op} ${b} = ?`, answer: String(ans) };
  }
  if (kind === "slide") {
    const target = rnd(15, 85);
    return { kind, prompt: `Slide the marker to ${target}`, answer: String(target) };
  }
  if (kind === "sequence") {
    const start = rnd(1, 9), step = rnd(2, 7);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    return { kind, prompt: `Next number: ${seq.join(", ")}, ?`, answer: String(start + 4 * step) };
  }
  const words = ["Till", "Paybill", "Ledger", "Token", "Receipt", "Outlet"];
  const target = words[rnd(0, words.length - 1)];
  const options = [...words].sort(() => Math.random() - 0.5).slice(0, 4);
  if (!options.includes(target)) options[rnd(0, 3)] = target;
  return { kind, prompt: `Tap the word "${target}"`, answer: target, options };
}

export function SecurityPuzzle({ onSolved }: { onSolved: (ok: boolean) => void }) {
  const [seed, setSeed] = useState(0);
  const p = useMemo(() => build((["math", "slide", "sequence", "pick"] as Kind[])[rnd(0, 3)]) as ReturnType<typeof build> & { options?: string[] }, [seed]);
  const [val, setVal] = useState("");
  const [slide, setSlide] = useState([50]);
  const [solved, setSolved] = useState(false);

  const check = (v: string) => {
    const ok = p.kind === "slide" ? Math.abs(Number(v) - Number(p.answer)) <= 2 : v.trim().toLowerCase() === p.answer.toLowerCase();
    setSolved(ok); onSolved(ok);
    if (!ok && p.kind !== "slide") { setVal(""); setSeed((s) => s + 1); }
  };
  const reset = () => { setSeed((s) => s + 1); setVal(""); setSlide([50]); setSolved(false); onSolved(false); };

  if (solved) return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
      <CheckCircle2 className="h-4 w-4" /> Human verification passed
    </div>
  );

  return (
    <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium"><ShieldQuestion className="h-4 w-4 text-primary" />{p.prompt}</span>
        <button type="button" onClick={reset} aria-label="New puzzle" className="text-muted-foreground hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>
      {p.kind === "slide" && (
        <div className="space-y-2">
          <Slider value={slide} onValueChange={setSlide} onValueCommit={(v) => check(String(v[0]))} max={100} step={1} />
          <p className="text-xs text-muted-foreground font-mono">Position: {slide[0]}</p>
        </div>
      )}
      {(p.kind === "math" || p.kind === "sequence") && (
        <div className="flex gap-2">
          <Input inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value)} placeholder="Answer" className="h-9 font-mono" />
          <Button type="button" size="sm" onClick={() => check(val)}>Verify</Button>
        </div>
      )}
      {p.kind === "pick" && (
        <div className="grid grid-cols-2 gap-2">
          {p.options!.map((o) => <Button key={o} type="button" variant="outline" size="sm" onClick={() => check(o)}>{o}</Button>)}
        </div>
      )}
    </div>
  );
}
