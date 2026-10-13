import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateSecret, getSecurity, otpauthUri, setSecurity, verifyTotp } from "@/lib/totp";
import { KeyRound, ShieldCheck, Smartphone, Copy } from "lucide-react";

export default function SecurityCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const account = (user?.phone || user?.email || "").replace(/^\+/, "");
  const [enabled, setEnabled] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => { if (account) getSecurity(account).then((s) => { setEnabled(!!s.totp); setHasPin(!!s.pinHash); }); }, [account]);

  const confirm = async () => {
    if (!(await verifyTotp(secret, code))) return toast({ title: "Code incorrect", description: "Check the 6-digit code in Google Authenticator.", variant: "destructive" });
    await setSecurity(account, { totp: secret });
    setEnabled(true); setSecret(""); setCode("");
    toast({ title: "Authenticator linked", description: "You'll be asked for a code at every sign in." });
  };
  const savePin = async () => {
    if (!/^\d{4}$/.test(pin)) return toast({ title: "PIN must be 4 digits", variant: "destructive" });
    await setSecurity(account, { pin }); setHasPin(true); setPin("");
    toast({ title: "Login PIN saved" });
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Security Center</h1>
          <p className="text-sm text-muted-foreground">Layered protection: puzzle check, login PIN and Google Authenticator.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" />Google Authenticator {enabled && <Badge>Linked</Badge>}</CardTitle>
            <CardDescription>Scan the QR code or type the setup key manually in the Authenticator app on your phone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enabled && !secret ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setSecret(generateSecret())}>Re-link new device</Button>
                <Button variant="destructive" onClick={async () => { await setSecurity(account, { totp: null }); setEnabled(false); }}>Unlink</Button>
              </div>
            ) : !secret ? (
              <Button onClick={() => setSecret(generateSecret())}>Link authenticator</Button>
            ) : (
              <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="rounded-lg bg-card p-3 border"><QRCodeSVG value={otpauthUri(secret, account)} size={160} /></div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Setup key (manual entry)</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm break-all bg-muted px-2 py-1 rounded">{secret.match(/.{1,4}/g)?.join(" ")}</code>
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(secret)} aria-label="Copy key"><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" inputMode="numeric" maxLength={6} className="font-mono tracking-widest" />
                  <Button onClick={confirm} disabled={code.length !== 6}>Confirm & link</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Login PIN {hasPin && <Badge>Set</Badge>}</CardTitle>
            <CardDescription>A 4-digit PIN entered on the keypad after your password.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 max-w-sm">
            <Input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="font-mono tracking-widest" />
            <Button onClick={savePin}>{hasPin ? "Change" : "Save"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            Every sign in also requires a randomly chosen verification puzzle (math, slider, sequence or word pick).
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
