import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DemoAccountBadge } from "@/components/layout/DemoAccountBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  phone_number: string;
  status: string;
  created_at: string;
  balance_after: number | null;
}

interface SubscriptionData {
  tier: string;
  free_stk_pushes_remaining: number;
  used_stk_pushes: number;
  max_stk_pushes: number | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { isDemoAccount, user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Super Admins don't have subscription limits
      if (!isSuperAdmin) {
        // Fetch subscription data
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('tier, free_stk_pushes_remaining, used_stk_pushes, max_stk_pushes')
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .single();

        if (subError && subError.code !== 'PGRST116') throw subError;
        setSubscription(subData);
      }

      // Fetch recent transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transError) throw transError;
      setRecentTransactions(transData || []);

      // Calculate current balance from latest transaction
      if (transData && transData.length > 0 && transData[0].balance_after !== null) {
        setBalance(transData[0].balance_after);
      }

      // Calculate monthly revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      if (!monthlyError && monthlyData) {
        const revenue = monthlyData
          .filter(t => t.transaction_type === 'received')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        setMonthlyRevenue(revenue);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const freePushes = subscription?.free_stk_pushes_remaining;
  const tierName = subscription?.tier?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Free Trial';
  const isUnlimited = freePushes === null || subscription?.max_stk_pushes === null;
  const usagePercent = !isUnlimited && subscription?.max_stk_pushes 
    ? ((subscription.used_stk_pushes / subscription.max_stk_pushes) * 100)
    : 0;

  return (
    <Layout>
      <div className="container px-4 py-6">
        {isDemoAccount && <DemoAccountBadge />}
        
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview</p>
        </div>

        {!isSuperAdmin && subscription && subscription.tier === 'free_trial' && (
          <Card className="mb-6 border-accent/50 bg-accent/5">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="font-medium">Free Trial Active</p>
                <p className="text-sm text-muted-foreground">
                  You have {freePushes} free STK pushes remaining. Upgrade to unlock unlimited transactions.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/subscription")}>
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

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
                    KES {monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="mt-1 flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Total revenue this month
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <ArrowDownLeft className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {!isSuperAdmin && (
            <Card className="border-accent/20 shadow-elegant">
              <CardHeader className="pb-3">
                <CardDescription>Subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="mb-1 text-2xl font-bold">{tierName}</p>
                  {isUnlimited ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Wallet className="h-4 w-4" />
                      ∞ Unlimited Access
                    </p>
                  ) : subscription && subscription.max_stk_pushes ? (
                    <>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {subscription.used_stk_pushes} / {subscription.max_stk_pushes} used
                      </p>
                      <Progress value={usagePercent} className="h-2" />
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {freePushes || 0} free pushes remaining
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No transactions yet. Start by making your first payment!
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.transaction_type === "received" 
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
                          : "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
                      }`}>
                        {transaction.transaction_type === "received" ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.transaction_type === "received" ? "Received from" : "Sent to"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono-numbers font-semibold ${
                        transaction.transaction_type === "received" ? "text-green-600" : "text-orange-600"
                      }`}>
                        {transaction.transaction_type === "received" ? "+" : "-"}KES {Number(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate("/transactions")}>
                  View All Transactions
                </Button>
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
