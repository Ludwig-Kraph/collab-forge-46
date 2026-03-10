import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Shield, Zap, ArrowLeft, Home, ArrowRight } from "lucide-react";
import { RegistrationWizard } from "@/components/auth/RegistrationWizard";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import logo from "@/assets/m-leja-logo.png";

export default function Auth() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let normalizedPhone = loginPhone.trim().replace(/[\s\-()]/g, "");
    if (normalizedPhone.startsWith("+254")) normalizedPhone = normalizedPhone.slice(1);
    else if (normalizedPhone.startsWith("0")) normalizedPhone = "254" + normalizedPhone.slice(1);
    else if (!normalizedPhone.startsWith("254")) normalizedPhone = "254" + normalizedPhone;

    await signIn(normalizedPhone, loginPassword);
    setLoading(false);
  };

  if (showRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-6xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRegistration(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          <RegistrationWizard
            onComplete={() => {
              setShowRegistration(false);
              setShowWelcome(true);
            }}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
        <div className="relative">
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  const highlights = [
    {
      icon: Smartphone,
      title: "Easy STK Push",
      desc: "Trigger payments directly to your Till, Paybill, or Pochi numbers",
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      desc: "End-to-end encryption for all your payment data",
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      desc: "Automatic transaction capture and digital ledger updates",
    },
  ];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-10"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center px-4 py-12">
          {/* Left — Branding */}
          <div className="hidden md:flex flex-col gap-8">
            <div className="space-y-3">
              <img src={logo} alt="M-Leja" className="h-12 w-auto" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Streamline your MPESA payment operations with M-Leja
              </p>
            </div>

            <div className="space-y-5">
              {highlights.map((h) => (
                <div key={h.title} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <h.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-0.5">{h.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Login Card */}
          <Card className="shadow-lg border-border/60">
            <CardHeader className="space-y-1 pb-4">
              <div className="md:hidden mb-4">
                <img src={logo} alt="M-Leja" className="h-10 w-auto" />
              </div>
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <PhoneInput
                  label="Phone Number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10"
                  onClick={() => setShowRegistration(true)}
                >
                  Create New Account
                </Button>

                <p className="text-xs text-center text-muted-foreground pt-1">
                  New users get 3 free STK pushes to try M-Leja 🎉
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={userName}
      />
    </>
  );
}
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let normalizedPhone = loginPhone.trim().replace(/[\s\-()]/g, "");
    if (normalizedPhone.startsWith("+254")) normalizedPhone = normalizedPhone.slice(1);
    else if (normalizedPhone.startsWith("0")) normalizedPhone = "254" + normalizedPhone.slice(1);
    else if (!normalizedPhone.startsWith("254")) normalizedPhone = "254" + normalizedPhone;

    await signIn(normalizedPhone, loginPassword);
    setLoading(false);
  };

  if (showRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-6xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRegistration(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          <RegistrationWizard
            onComplete={() => {
              setShowRegistration(false);
              setShowWelcome(true);
            }}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      </div>
    );
  }

  const highlights = [
    {
      icon: Smartphone,
      title: "Easy STK Push",
      desc: "Trigger payments directly to your Till, Paybill, or Pochi numbers",
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      desc: "End-to-end encryption for all your payment data",
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      desc: "Automatic transaction capture and digital ledger updates",
    },
  ];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-10"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center px-4 py-12">
          {/* Left — Branding */}
          <div className="hidden md:flex flex-col gap-8">
            <div className="space-y-3">
              <img src={logo} alt="M-Leja" className="h-12 w-auto" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Streamline your MPESA payment operations with M-Leja
              </p>
            </div>

            <div className="space-y-5">
              {highlights.map((h) => (
                <div key={h.title} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <h.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-0.5">{h.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Login Card */}
          <Card className="shadow-lg border-border/60">
            <CardHeader className="space-y-1 pb-4">
              <div className="md:hidden mb-4">
                <img src={logo} alt="M-Leja" className="h-10 w-auto" />
              </div>
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <PhoneInput
                  label="Phone Number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                />

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10"
                  onClick={() => setShowRegistration(true)}
                >
                  Create New Account
                </Button>

                <p className="text-xs text-center text-muted-foreground pt-1">
                  New users get 3 free STK pushes to try M-Leja 🎉
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={userName}
      />
    </>
  );
}
