import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Smartphone, BookOpen, ShieldCheck, Radio, Users, Receipt, Phone, Mail, Globe } from "lucide-react";
import { NetworkCanvas } from "@/components/landing/NetworkCanvas";
import logo from "@/assets/m-leja-logo.png";
import mpesa from "@/assets/rails/mpesa.jpg";
import airtel from "@/assets/rails/airtel.png";
import mtn from "@/assets/rails/mtn.png";
import tigo from "@/assets/rails/tigo.png";
import { getCopyrightText } from "@/utils/copyright";

const WORDS = ["payments", "ledgers", "receipts", "teams", "outlets"];

function KineticWord() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200); return () => clearInterval(id); }, []);
  return (
    <span className="relative inline-block min-w-[6ch] text-primary">
      <span key={i} className="inline-block animate-fade-in">{WORDS[i]}</span>
    </span>
  );
}

function Simulator() {
  const steps = [
    { icon: Smartphone, label: "Cashier enters phone & amount", detail: "254 7•• ••• 012 · KES 1,250" },
    { icon: Radio, label: "STK push sent to customer", detail: "Prompt delivered in < 2s" },
    { icon: ShieldCheck, label: "Customer approves with PIN", detail: "Verified M-PESA sender only" },
    { icon: BookOpen, label: "Ledger updated in real time", detail: "Balance +1,250.00" },
    { icon: Receipt, label: "Receipt issued", detail: "MLJ-BTILL-00042-10-2026-…" },
  ];
  const [s, setS] = useState(0);
  useEffect(() => { const id = setInterval(() => setS((v) => (v + 1) % (steps.length + 1)), 1600); return () => clearInterval(id); }, []);
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold">Live simulation</p>
        <Badge variant="outline" className="gap-1.5"><span className="h-2 w-2 rounded-full bg-primary animate-pulse" />running</Badge>
      </div>
      <ol className="space-y-3">
        {steps.map((st, idx) => {
          const on = idx < s;
          return (
            <li key={st.label} className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-500 ${on ? "border-primary/40 bg-primary/5 translate-x-0 opacity-100" : "opacity-40 -translate-x-1"}`}>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><st.icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{st.label}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{st.detail}</p>
              </div>
              {on && <Check className="ml-auto h-4 w-4 text-primary" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const plans = [
  { name: "Get Started Free", price: "KES 0", note: "3 trial STK pushes", users: "1 user" },
  { name: "Raia Pochi", price: "KES 1,200/mo", note: "or 50/day · Pochi under consideration", users: "1 user" },
  { name: "Raia Till", price: "KES 2,000/mo", note: "or 80/day · 5,000 pushes", users: "3 users" },
  { name: "Business Till", price: "KES 3,500/mo", note: "35,000/yr · 12,000 pushes", users: "15 users", popular: true },
  { name: "Business Paybill", price: "KES 5,000/mo", note: "50,000/yr · 20,000 pushes", users: "10 users" },
  { name: "Corporate", price: "Custom", note: "Till or Paybill · unlimited pushes", users: "Up to 10,000 users" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const go = () => navigate(user ? "/dashboard" : "/auth");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <img src={logo} alt="M-Leja" className="h-8 w-auto" />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#rails" className="hover:text-foreground">Networks</a>
            <a href="#plans" className="hover:text-foreground">Plans</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </nav>
          <Button size="sm" onClick={go}>{user ? "Dashboard" : "Sign in"}</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-foreground text-background">
        <NetworkCanvas />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
        <div className="container relative z-10 pt-24 pb-16">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">East Africa's payment ledger network</Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
              One ledger for all your <KineticWord />
            </h1>
            <p className="text-lg text-background/70 leading-relaxed">
              M-Leja turns every mobile-money payment into an organised, auditable record. Prompt customers with an STK push,
              watch the money land in real time, and close each day with clean books, verified receipts and a team that works as one.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={go} className="gap-2">Start free — 3 STK pushes <ArrowRight className="h-4 w-4" /></Button>
              <Button size="lg" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background" asChild><a href="#how">See it in motion</a></Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From prompt to receipt in seconds</h2>
            <p className="text-muted-foreground leading-relaxed">Link your Till or Paybill, invite your cashiers and start collecting. Every confirmation is checked against the genuine M-PESA sender, spoofed messages are blocked and flagged, and your ledger stays honest.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                [Radio, "STK push", "Request payment from any phone"],
                [BookOpen, "Digital ledger", "Received, spent and balance"],
                [Users, "Teams & outlets", "Roles for every cashier"],
                [ShieldCheck, "Layered sign-in", "Puzzle, PIN & authenticator"],
              ].map(([I, t, d]: any) => (
                <div key={t} className="rounded-xl border p-4 hover:border-primary/40 transition-colors">
                  <I className="h-5 w-5 text-primary mb-2" />
                  <p className="font-medium text-sm">{t}</p>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <Simulator />
        </div>
      </section>

      {/* Rails */}
      <section id="rails" className="py-20 bg-muted/40 border-y">
        <div className="container text-center space-y-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payment networks</h2>
            <p className="text-muted-foreground mt-2">Currently supporting M-PESA by Safaricom. More networks are on the way.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { src: mpesa, name: "M-PESA · Safaricom", live: true },
              { src: airtel, name: "Airtel Money" },
              { src: mtn, name: "MTN MoMo" },
              { src: tigo, name: "Tigo Pesa" },
            ].map((r, i) => (
              <div key={r.name} className="group rounded-2xl border bg-card p-6 flex flex-col items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="h-20 flex items-center">
                  <img src={r.src} alt={r.name} className={`max-h-20 max-w-[140px] object-contain transition ${r.live ? "" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"}`} />
                </div>
                <p className="text-sm font-medium">{r.name}</p>
                {r.live ? <Badge>Live now</Badge> : <Badge variant="secondary">Coming soon</Badge>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-24">
        <div className="container space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Plans that grow with you</h2>
            <p className="text-muted-foreground mt-2">Top up anytime with M-Leja Credits when you need extra pushes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl border p-6 space-y-3 ${p.popular ? "border-primary shadow-lg ring-1 ring-primary/30" : ""}`}>
                <div className="flex items-center justify-between"><p className="font-semibold">{p.name}</p>{p.popular && <Badge>Popular</Badge>}</div>
                <p className="text-2xl font-bold font-mono">{p.price}</p>
                <p className="text-sm text-muted-foreground">{p.note}</p>
                <p className="text-sm flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{p.users}</p>
                <Button variant={p.popular ? "default" : "outline"} className="w-full" onClick={go}>Choose</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-foreground text-background">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">About M-Leja</h2>
            <p className="text-background/70 leading-relaxed">
              M-Leja was developed by Senior Developer and Al Yasir Bin Zayed Founder, <strong className="text-background">Mr. Timothy Ng'ang'a</strong>.
              Built for merchants, enterprises and institutions across East Africa, it brings payment collection, record-keeping and team management into one secure workspace.
            </p>
            <p className="text-background/70 leading-relaxed">The project is developed, owned and maintained by <strong className="text-background">Al Yasir Bin Zayed</strong>.</p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" />+254 717 227 012</p>
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" />support@mleja.com · business@mleja.com</p>
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" />support@mleja.yasirzayed.com · business@mleja.yasirzayed.com</p>
            <p className="flex items-center gap-3"><Globe className="h-4 w-4 text-primary" />www.mleja.com · www.mleja.yasirzayed.com</p>
          </div>
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="container flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>{getCopyrightText()}</p>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <a href="/help" className="hover:text-foreground">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
