import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, Building2, Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const tiers = [
  {
    name: "Starter",
    icon: Zap,
    price: "1,500",
    users: "1 user",
    features: ["100 STK pushes/month", "Basic analytics", "Email support", "Mobile & Web access"],
    current: false,
  },
  {
    name: "Professional",
    icon: Crown,
    price: "5,000",
    users: "Up to 5 users",
    features: [
      "500 STK pushes/month",
      "Advanced analytics",
      "Priority support",
      "Export capabilities",
      "Custom reports",
    ],
    current: true,
    popular: true,
  },
  {
    name: "Business",
    icon: Building2,
    price: "15,000",
    users: "Up to 20 users",
    features: [
      "2,000 STK pushes/month",
      "Full analytics suite",
      "24/7 support",
      "API access",
      "Multi-location tracking",
      "Dedicated account manager",
    ],
    current: false,
  },
  {
    name: "Enterprise",
    icon: Globe,
    price: "Custom",
    users: "Unlimited users",
    features: [
      "Unlimited STK pushes",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "On-premise deployment",
      "Custom training",
    ],
    current: false,
  },
];

const billingHistory = [
  { date: "2024-12-01", amount: "KES 5,000", status: "Paid", invoice: "INV-2024-12" },
  { date: "2024-11-01", amount: "KES 5,000", status: "Paid", invoice: "INV-2024-11" },
  { date: "2024-10-01", amount: "KES 5,000", status: "Paid", invoice: "INV-2024-10" },
  { date: "2024-09-01", amount: "KES 5,000", status: "Paid", invoice: "INV-2024-09" },
];

const Subscription = () => {
  const currentUsage = {
    stkPushes: 342,
    stkPushesLimit: 500,
    users: 3,
    usersLimit: 5,
  };

  const handleUpgrade = (tierName: string) => {
    toast.success(`Upgrade to ${tierName} initiated`);
  };

  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">Manage your plan and billing information</p>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-8 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Professional Plan
                </CardTitle>
                <CardDescription>Your current subscription</CardDescription>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">STK Pushes Used</span>
                    <span className="font-mono font-medium">
                      {currentUsage.stkPushes} / {currentUsage.stkPushesLimit}
                    </span>
                  </div>
                  <Progress value={(currentUsage.stkPushes / currentUsage.stkPushesLimit) * 100} />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-mono font-medium">
                      {currentUsage.users} / {currentUsage.usersLimit}
                    </span>
                  </div>
                  <Progress value={(currentUsage.users / currentUsage.usersLimit) * 100} />
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-secondary/20 p-4">
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="text-2xl font-bold font-mono">Jan 01, 2025</p>
                <p className="text-sm text-muted-foreground">Amount: KES 5,000</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={`relative ${tier.current ? "border-primary shadow-elegant" : ""} ${
                    tier.popular ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <Icon className={`h-8 w-8 ${tier.current ? "text-primary" : "text-muted-foreground"}`} />
                    <CardTitle className="mt-4">{tier.name}</CardTitle>
                    <CardDescription>{tier.users}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold font-mono">
                        {tier.price !== "Custom" && "KES "}
                        {tier.price}
                      </span>
                      {tier.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {tier.current ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant={tier.popular ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleUpgrade(tier.name)}
                      >
                        {tier.price === "Custom" ? "Contact Sales" : "Upgrade"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((bill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{bill.date}</p>
                      <p className="text-sm text-muted-foreground">{bill.invoice}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-medium">{bill.amount}</p>
                        <Badge variant="outline" className="text-xs">
                          {bill.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                  {index < billingHistory.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Subscription;
