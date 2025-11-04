import Layout from "@/components/layout/Layout";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, Users, TrendingUp, Shield } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="container px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-elegant">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Welcome to M-Leja
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Streamline your MPESA payment operations with our powerful platform. 
            Trigger STK push payments, track transactions, and manage your business finances effortlessly.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 bg-gradient-primary shadow-elegant hover:shadow-glow">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader>
              <Wallet className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>STK Push</CardTitle>
              <CardDescription>
                Initiate payment requests instantly with MPESA STK push
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-secondary/20 shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader>
              <TrendingUp className="mb-2 h-8 w-8 text-secondary" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track performance with real-time financial insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-accent/20 shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-accent" />
              <CardTitle>Multi-User</CardTitle>
              <CardDescription>
                Collaborate with team members across your organization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Secure</CardTitle>
              <CardDescription>
                End-to-end encryption for all your transactions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="mb-12 overflow-hidden border-primary/20 bg-gradient-subtle">
          <CardHeader>
            <CardTitle>Your Account Overview</CardTitle>
            <CardDescription>Start your journey with 3 free STK pushes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="font-mono-numbers text-3xl font-bold text-primary">
                  KES 0.00
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Free Pushes Remaining</p>
                <p className="font-mono-numbers text-3xl font-bold text-secondary">
                  3
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="font-mono-numbers text-3xl font-bold text-foreground">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-primary/20 bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Ready to get started?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Link your MPESA account and start managing payments today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="lg" className="gap-2">
              Link MPESA Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <FloatingActionButton />
    </Layout>
  );
};

export default Index;
