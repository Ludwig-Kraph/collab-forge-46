import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Zap,
  TrendingUp,
  Users,
  Building2,
  Check,
  Calendar,
  CalendarDays,
  CalendarClock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import logo from "@/assets/m-leja-logo.png";
import { getCopyrightText } from "@/utils/copyright";
import { supabase } from "@/integrations/supabase/client";

interface Tier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "monthly" | "annual"
  >("monthly");

  useEffect(() => {
    let mounted = true;

    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_tiers")
          .select("*")
          .eq("show_on_landing", true)
          .eq("is_active", true)
          .eq("period", selectedPeriod)
          .order("price", { ascending: true });

        const filteredData = data?.filter(
          (tier) => !tier.name.toLowerCase().includes("government")
        );

        if (mounted && filteredData && !error) {
          const formattedTiers: Tier[] = filteredData.map((tier) => ({
            name: tier.name,
            price:
              tier.price === 0
                ? "Free"
                : `${tier.currency} ${tier.price.toLocaleString()}`,
            period: tier.is_period_enabled ? `/${tier.period}` : undefined,
            description: tier.description || "",
            features: (
              Array.isArray(tier.features) ? tier.features : []
            ).filter((f): f is string => typeof f === "string"),
            popular: tier.is_recommended || false,
          }));
          setTiers(formattedTiers);
        }
      } catch (error) {
        console.error("Error fetching tiers:", error);
      } finally {
        if (mounted) setLoadingTiers(false);
      }
    };

    fetchTiers();
    return () => { mounted = false; };
  }, [selectedPeriod]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  const features = [
    {
      icon: Zap,
      title: "STK Push Integration",
      description:
        "Trigger payment requests directly to Till, Paybill, or Pochi numbers",
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description:
        "End-to-end encryption ensures your payment data is always protected",
    },
    {
      icon: Sparkles,
      title: "Automatic Capture",
      description:
        "MPESA transaction messages are automatically parsed and recorded",
    },
    {
      icon: TrendingUp,
      title: "Digital Ledger",
      description:
        "Comprehensive transaction history with real-time balance tracking",
    },
    {
      icon: Users,
      title: "Multi-User Access",
      description:
        "Role-based permissions for team collaboration and management",
    },
    {
      icon: Building2,
      title: "Enterprise Ready",
      description:
        "Analytics and reporting for corporate and government agencies",
    },
  ];

  const periods = [
    { key: "daily" as const, label: "Daily", icon: Calendar, hint: "💡 Perfect for testing" },
    { key: "monthly" as const, label: "Monthly", icon: CalendarDays, hint: "⭐ Most popular" },
    { key: "annual" as const, label: "Annual", icon: CalendarClock, hint: "🎉 Save over 20%", badge: "Save 20%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-14 items-center justify-between">
          <img src={logo} alt="M-Leja" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              Pricing
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Get Started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container relative py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Sparkles className="h-3 w-3" />
              Trusted by 500+ businesses in Kenya
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Streamline Your{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                MPESA Payments
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trigger STK push payments, automatically capture transactions, and
              manage your digital ledger — all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="shadow-elegant text-base h-12 px-8"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-base h-12 px-8"
              >
                Learn More
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ✨ No credit card required · 3 free STK pushes included
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="mb-3">
              Everything You Need to Manage MPESA Payments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              M-Leja provides all the tools to streamline your payment operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="hover-lift border-border/60 bg-gradient-card"
              >
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start with our free trial and upgrade as you grow. No hidden fees.
            </p>

            {/* Period Switcher */}
            <div className="flex justify-center mt-8">
              <div className="inline-flex rounded-xl border bg-muted/50 p-1 gap-1">
                {periods.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPeriod(p.key)}
                    className={cn(
                      "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                      selectedPeriod === p.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <p.icon className="h-3.5 w-3.5" />
                    {p.label}
                    {p.badge && selectedPeriod !== p.key && (
                      <Badge className="ml-1 text-[10px] px-1.5 py-0 bg-accent text-accent-foreground">
                        {p.badge}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {periods.find((p) => p.key === selectedPeriod)?.hint}
            </p>
          </div>

          {loadingTiers ? (
            <div className="text-center py-16">
              <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse-soft mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading plans...</p>
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No {selectedPeriod} plans available yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setSelectedPeriod("monthly")}
              >
                View Monthly Plans
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto stagger-children">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={cn(
                    "relative hover-lift",
                    tier.popular && "border-primary shadow-elegant ring-1 ring-primary/20"
                  )}
                >
                  <CardHeader className="pb-4">
                    {tier.popular && (
                      <Badge className="w-fit mb-2 bg-primary/10 text-primary border-0 text-xs">
                        ⭐ Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-3xl font-bold tracking-tight">
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-muted-foreground text-sm">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <CardDescription className="mt-2 text-xs leading-relaxed min-h-[2.5rem]">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 mb-6">
                      {tier.features.map((feature, i) => (
                        <li
                          key={`${tier.name}-${i}`}
                          className="flex items-start gap-2"
                        >
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => navigate("/auth")}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <Card className="border-0 shadow-lg bg-gradient-hero text-primary-foreground overflow-hidden">
            <CardContent className="p-10 md:p-16 text-center relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Streamline Your Payments?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                Join businesses and organizations using M-Leja to manage their
                MPESA operations
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="h-12 px-8 text-base"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>{getCopyrightText()}</p>
            <div className="flex gap-4 text-xs">
              <Link to="/help" className="hover:text-foreground transition-colors">
                Help
              </Link>
              <Link to="/how-to" className="hover:text-foreground transition-colors">
                How To
              </Link>
              <Link to="/cookie-policy" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
