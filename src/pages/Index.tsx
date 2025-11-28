import { useEffect, useState, useMemo, useRef } from "react";
import Layout from "@/components/layout/Layout";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, AlertCircle, Users, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useQuery } from "@tanstack/react-query";

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
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  // Prefetch likely next pages for instant navigation
  usePrefetch(user?.id);
  
  const [balance, setBalance] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  
  // Super Admin specific states
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingRegistrations: 0,
    openTickets: 0,
    systemAlerts: 0,
  });

  const fetchSuperAdminDashboard = async () => {
    // Fetch all counts in parallel
    const [usersCount, subsCount, transCount, regCount, ticketsCount, alertsCount, revenueData, recentActivity] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('registration_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
      supabase.from('system_alerts').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
      supabase
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'received')
        .eq('status', 'completed'),
      supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const totalRevenue = revenueData.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return {
      platformStats: {
        totalUsers: usersCount.count || 0,
        totalTransactions: transCount.count || 0,
        totalRevenue,
        activeSubscriptions: subsCount.count || 0,
        pendingRegistrations: regCount.count || 0,
        openTickets: ticketsCount.count || 0,
        systemAlerts: alertsCount.count || 0,
      },
      recentTransactions: recentActivity.data || []
    };
  };

  const fetchDashboardData = async () => {
    // Calculate monthly revenue start date
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch all data in parallel with optimized queries
    const [subResult, transResult, monthlyResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('tier, free_stk_pushes_remaining, used_stk_pushes, max_stk_pushes')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString())
    ]);

    // Calculate balance from latest transaction
    const balance = transResult.data?.[0]?.balance_after || 0;

    // Calculate monthly revenue
    const revenue = monthlyResult.data
      ?.filter(t => t.transaction_type === 'received')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return {
      balance,
      subscription: subResult.data,
      recentTransactions: transResult.data || [],
      monthlyRevenue: revenue
    };
  };

  // Use React Query for automatic caching and background refetching
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard', user?.id, isSuperAdmin],
    queryFn: async () => {
      if (isSuperAdmin) {
        return await fetchSuperAdminDashboard();
      } else {
        return await fetchDashboardData();
      }
    },
    enabled: !!user,
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  useEffect(() => {
    if (dashboardData && !isSuperAdmin) {
      const data = dashboardData as Awaited<ReturnType<typeof fetchDashboardData>>;
      setBalance(data.balance);
      setSubscription(data.subscription);
      setRecentTransactions(data.recentTransactions);
      setMonthlyRevenue(data.monthlyRevenue);
    } else if (dashboardData && isSuperAdmin) {
      const data = dashboardData as Awaited<ReturnType<typeof fetchSuperAdminDashboard>>;
      setPlatformStats(data.platformStats);
      setRecentTransactions(data.recentTransactions);
    }
  }, [dashboardData, isSuperAdmin]);

  const freePushes = subscription?.free_stk_pushes_remaining;
  
  // Calculate these values BEFORE any early returns (Rules of Hooks)
  const tierName = useMemo(() => 
    subscription?.tier?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Free Trial',
    [subscription?.tier]
  );
  const isUnlimited = useMemo(() => 
    freePushes === null || subscription?.max_stk_pushes === null,
    [freePushes, subscription?.max_stk_pushes]
  );
  const usagePercent = useMemo(() => 
    !isUnlimited && subscription?.max_stk_pushes 
      ? ((subscription.used_stk_pushes / subscription.max_stk_pushes) * 100)
      : 0,
    [isUnlimited, subscription?.max_stk_pushes, subscription?.used_stk_pushes]
  );

  // Super Admin Dashboard Render
  if (isSuperAdmin && !isDashboardLoading) {
    return (
      <Layout>
        <div className="container px-4 py-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Super Admin Control Center
            </h1>
            <p className="text-muted-foreground mt-2">System-wide overview and management</p>
          </div>

          {/* Platform Statistics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{platformStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                  <Activity className="h-5 w-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{platformStats.totalTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Platform-wide</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <Wallet className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  KES {platformStats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{platformStats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards Grid */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-elegant transition-all duration-300 border-amber-500/20 bg-amber-500/5"
              onClick={() => navigate('/control-panel/onboarding')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{platformStats.pendingRegistrations}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-elegant transition-all duration-300 border-blue-500/20 bg-blue-500/5"
              onClick={() => navigate('/control-panel/support')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{platformStats.openTickets}</div>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-elegant transition-all duration-300 border-destructive/20 bg-destructive/5"
              onClick={() => navigate('/control-panel')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{platformStats.systemAlerts}</div>
                <p className="text-xs text-muted-foreground mt-1">Unresolved</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button onClick={() => navigate('/control-panel/accounts')} className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Accounts
                </Button>
                <Button onClick={() => navigate('/control-panel/onboarding')} variant="secondary" className="w-full">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Review Registrations
                </Button>
                <Button onClick={() => navigate('/control-panel/system-settings')} variant="outline" className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button onClick={() => navigate('/control-panel/support')} variant="outline" className="w-full">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Support Center
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Platform Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
              <CardDescription>Latest transactions across all users</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.slice(0, 8).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {transaction.transaction_type === "received" ? (
                          <div className="rounded-full bg-primary/10 p-2">
                            <ArrowDownLeft className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-destructive/10 p-2">
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.transaction_type === "received" ? "Received" : "Sent"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.phone_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold font-mono ${
                          transaction.transaction_type === "received" 
                            ? "text-primary" 
                            : "text-destructive"
                        }`}>
                          {transaction.transaction_type === "received" ? "+" : "-"}
                          KES {Number(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                        </p>
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
  }

  // Show skeleton while loading
  if (isDashboardLoading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-6">
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
            {isDashboardLoading ? (
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
