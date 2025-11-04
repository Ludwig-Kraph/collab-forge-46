import Layout from "@/components/layout/Layout";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const recentTransactions = [
    { id: 1, type: "received", amount: 5000, from: "+254712345678", time: "2 mins ago", status: "completed" },
    { id: 2, type: "sent", amount: 1200, to: "+254798765432", time: "15 mins ago", status: "completed" },
    { id: 3, type: "received", amount: 8500, from: "+254723456789", time: "1 hour ago", status: "completed" },
  ];

  const balance = 45750;
  const freePushes = 3;
  const tierName = "Free Trial";
  const usagePercent = 0;

  return (
    <Layout>
      <div className="container px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview</p>
        </div>

        {/* Free Trial Alert */}
        <Card className="mb-6 border-accent/50 bg-accent/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="font-medium">Free Trial Active</p>
              <p className="text-sm text-muted-foreground">
                You have {freePushes} free STK pushes remaining. Upgrade to unlock unlimited transactions.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/more")}>
              Upgrade
            </Button>
          </CardContent>
        </Card>

        {/* Balance Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20 shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription>Available Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono-numbers text-3xl font-bold text-primary">
                    KES {balance.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Last updated: Just now</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono-numbers text-3xl font-bold text-secondary">
                    KES {(13500).toLocaleString()}
                  </p>
                  <p className="mt-1 flex items-center text-xs text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +12.5% from last month
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <ArrowDownLeft className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription>Current Tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary">{tierName}</Badge>
                  <span className="text-sm text-muted-foreground">{usagePercent}%</span>
                </div>
                <Progress value={usagePercent} className="mb-2 h-2" />
                <p className="text-xs text-muted-foreground">
                  {freePushes} free pushes remaining
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/payment")}
          >
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <span className="font-medium">New Payment</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/transactions")}
          >
            <Wallet className="h-5 w-5 text-secondary" />
            <span className="font-medium">View Transactions</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/ledger")}
          >
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="font-medium">Digital Ledger</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/analytics")}
          >
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-medium">Analytics</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest payment activities</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate("/payment")}
                >
                  Make Your First Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.type === "received" ? "bg-secondary/10" : "bg-accent/10"
                      }`}>
                        {tx.type === "received" ? (
                          <ArrowDownLeft className="h-5 w-5 text-secondary" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === "received" ? "Received from" : "Sent to"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.type === "received" ? tx.from : tx.to} • {tx.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono-numbers font-semibold ${
                        tx.type === "received" ? "text-secondary" : "text-foreground"
                      }`}>
                        {tx.type === "received" ? "+" : "-"}KES {tx.amount.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FloatingActionButton />
    </Layout>
  );
};

export default Index;