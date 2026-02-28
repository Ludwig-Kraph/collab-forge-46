import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, ShoppingCart, History, Zap, TrendingUp, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const TokenStore = () => {
  const { user } = useAuth();

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['token-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['token-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('token_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['token-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePurchase = (pkg: any) => {
    toast.info(`Token purchase flow coming soon! Package: ${pkg.name}`);
  };

  const getPackageIcon = (index: number) => {
    const icons = [Package, Zap, TrendingUp, Coins, ShoppingCart];
    return icons[index % icons.length];
  };

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">M-Leja Credits</h1>
          <p className="text-muted-foreground">Purchase STK push tokens to extend your service limits</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Token Balance</p>
                  <p className="text-3xl font-bold font-mono">
                    {balanceLoading ? '...' : (balance?.balance ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Total Purchased: <span className="font-mono font-medium">{balance?.total_purchased ?? 0}</span></p>
                <p>Total Used: <span className="font-mono font-medium">{balance?.total_used ?? 0}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Packages */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Packages</h2>
          {packagesLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : !packages?.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No token packages available yet. Check back soon!</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => {
                const Icon = getPackageIcon(index);
                const perToken = pkg.token_count > 0 ? (pkg.price / pkg.token_count).toFixed(2) : '0';
                return (
                  <Card key={pkg.id} className="hover-lift transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{pkg.name}</CardTitle>
                          {pkg.description && (
                            <CardDescription className="text-xs">{pkg.description}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono">
                          {pkg.token_count.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">tokens</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold">
                          KES {pkg.price.toLocaleString()}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          KES {perToken}/token
                        </Badge>
                      </div>
                      <Button className="w-full" onClick={() => handlePurchase(pkg)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Token History
            </CardTitle>
            <CardDescription>Your recent token transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : !transactions?.length ? (
              <p className="text-center text-muted-foreground py-8">No token transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-mono font-medium ${
                        tx.type === 'usage' ? 'text-destructive' : 'text-primary'
                      }`}>
                        {tx.type === 'usage' ? '-' : '+'}{tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">Bal: {tx.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TokenStore;
