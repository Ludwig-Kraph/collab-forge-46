import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, Building2, Globe, ArrowRight, Shield, Infinity } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isSuperAdmin } = useAuth();
  const currentUsage = {
    stkPushes: 342,
    stkPushesLimit: 500,
    users: 3,
    usersLimit: 5,
    isUnlimited: false,
  };

  const handleUpgrade = (tierName: string) => {
    toast.success(`Upgrade to ${tierName} initiated`);
  };

  // Super Admin view
  if (isSuperAdmin) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Subscription</h1>
            <p className="text-muted-foreground">Super Admin - Unlimited Access</p>
          </div>

          {/* Super Admin Plan Card */}
          <Card className="mb-8 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Super Admin Plan
                  </CardTitle>
                  <CardDescription>Unlimited access to all features</CardDescription>
                </div>
                <Badge variant="default" className="bg-primary">
                  <Infinity className="h-4 w-4 mr-1" />
                  Unlimited
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">STK Pushes</span>
                      <span className="font-mono font-medium flex items-center gap-1">
                        <Infinity className="h-4 w-4" />
                        Unlimited
                      </span>
                    </div>
                    <Progress value={100} className="bg-primary/20" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Users</span>
                      <span className="font-mono font-medium flex items-center gap-1">
                        <Infinity className="h-4 w-4" />
                        Unlimited
                      </span>
                    </div>
                    <Progress value={100} className="bg-primary/20" />
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-2 rounded-lg bg-background/50 p-4">
                  <p className="text-sm font-medium">Super Admin Features:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Unlimited STK pushes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Unlimited users
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Full Control Panel access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Complete system management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      All enterprise features
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  As a Super Admin, you have unrestricted access to all M-Leja features and the Control Panel.
                  This account is not subject to any subscription limits or billing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans for Reference */}
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">Available Plans</h2>
            <p className="text-muted-foreground">View subscription tiers available to regular users</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={tier.popular ? "border-primary shadow-lg" : ""}
              >
                {tier.popular && (
                  <div className="bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <tier.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {tier.price === "Custom" ? tier.price : `KES ${tier.price}`}
                    </span>
                    {tier.price !== "Custom" && (
                      <span className="text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                  <CardDescription>{tier.users}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Regular user view
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
                {currentUsage.isUnlimited ? (
                  <>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">STK Pushes</span>
                        <span className="font-mono font-medium flex items-center gap-1">
                          <Infinity className="h-4 w-4" />
                          Unlimited
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-mono font-medium flex items-center gap-1">
                          <Infinity className="h-4 w-4" />
                          Unlimited
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-mono font-medium">
                          {currentUsage.users} / {currentUsage.usersLimit}
                        </span>
                      </div>
                      <Progress value={(currentUsage.users / currentUsage.usersLimit) * 100} />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col justify-center space-y-2 rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Next billing date</p>
                <p className="text-2xl font-bold">Jan 1, 2025</p>
                <p className="text-sm text-muted-foreground">KES 5,000/month</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Want to increase your limits?</p>
                <p className="text-sm text-muted-foreground">Upgrade to a higher tier for more features</p>
              </div>
              <Button>Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold">Available Plans</h2>
          <p className="text-muted-foreground">Choose the plan that best fits your needs</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`${tier.current ? "border-primary shadow-lg" : ""} ${
                tier.popular ? "border-primary" : ""
              }`}
            >
              {tier.popular && (
                <div className="bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <tier.icon className="h-6 w-6 text-primary" />
                  {tier.current && <Badge variant="outline">Current</Badge>}
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {tier.price === "Custom" ? tier.price : `KES ${tier.price}`}
                  </span>
                  {tier.price !== "Custom" && (
                    <span className="text-sm text-muted-foreground">/month</span>
                  )}
                </div>
                <CardDescription>{tier.users}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.current ? "outline" : "default"}
                  className="w-full"
                  disabled={tier.current}
                  onClick={() => handleUpgrade(tier.name)}
                >
                  {tier.current ? "Current Plan" : "Upgrade"}
                  {!tier.current && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View your past invoices and payment records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 border-b pb-2 text-sm font-medium">
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Invoice</div>
              </div>
              {billingHistory.map((record) => (
                <div key={record.invoice} className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-muted-foreground">{record.date}</div>
                  <div className="font-medium">{record.amount}</div>
                  <div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {record.status}
                    </Badge>
                  </div>
                  <div>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Download
                    </Button>
                  </div>
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
