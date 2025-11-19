import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { exportData } from "@/utils/exportData";

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

interface LedgerEntry {
  id: string;
  date: Date;
  description: string;
  received: number;
  spent: number;
  balance: number;
  category: string;
  status: string;
}

const Ledger = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [loading, setLoading] = useState(true);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [netFlow, setNetFlow] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchLedgerData();
    }
  }, [user, period]);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      
      // Determine date range based on period
      const startDate = new Date();
      switch (period) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform transactions to ledger format
      const entries: LedgerEntry[] = transactions?.map(t => ({
        id: t.id,
        date: new Date(t.created_at),
        description: t.description || `${t.transaction_type} - ${t.phone_number}`,
        received: t.transaction_type === 'received' ? Number(t.amount) : 0,
        spent: t.transaction_type === 'sent' ? Number(t.amount) : 0,
        balance: Number(t.balance_after) || 0,
        category: t.transaction_type === 'received' ? 'Sales' : 'Expenses',
        status: t.status,
      })) || [];

      setLedgerEntries(entries);
      
      // Calculate totals
      const received = entries.reduce((sum, e) => sum + e.received, 0);
      const spent = entries.reduce((sum, e) => sum + e.spent, 0);
      
      setTotalReceived(received);
      setTotalSpent(spent);
      setNetFlow(received - spent);
      setCurrentBalance(entries[0]?.balance || 0);

    } catch (error: any) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportData(ledgerEntries, `ledger-${period}`, 'csv');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Digital Ledger</h1>
          <p className="text-muted-foreground">Complete financial overview with balance tracking</p>
        </div>

        {/* Period Selector and Export */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Ledger
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription>Current Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono-numbers text-2xl font-bold text-primary">
                KES {currentBalance.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">As of today</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription>Total Received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="font-mono-numbers text-2xl font-bold text-secondary">
                  KES {totalReceived.toLocaleString()}
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <ArrowDownLeft className="h-5 w-5 text-secondary" />
                </div>
              </div>
              <p className="mt-1 flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Income this period
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription>Total Spent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="font-mono-numbers text-2xl font-bold text-accent">
                  KES {totalSpent.toLocaleString()}
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <ArrowUpRight className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="mt-1 flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3" />
                Expenses this period
              </p>
            </CardContent>
          </Card>

          <Card className={`shadow-elegant ${netFlow >= 0 ? "border-secondary/20" : "border-accent/20"}`}>
            <CardHeader className="pb-3">
              <CardDescription>Net Cash Flow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`font-mono-numbers text-2xl font-bold ${
                netFlow >= 0 ? "text-secondary" : "text-accent"
              }`}>
                {netFlow >= 0 ? "+" : ""}KES {netFlow.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {netFlow >= 0 ? "Positive" : "Negative"} flow
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Income/Expense Breakdown */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Income Breakdown</CardTitle>
              <CardDescription>By category</CardDescription>
            </CardHeader>
            <CardContent>
              {totalReceived > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-secondary"></div>
                      <span className="text-sm">Total Received</span>
                    </div>
                    <span className="font-mono-numbers text-sm font-semibold">
                      KES {totalReceived.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No income recorded for this period</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              <CardDescription>By category</CardDescription>
            </CardHeader>
            <CardContent>
              {totalSpent > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-accent"></div>
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <span className="font-mono-numbers text-sm font-semibold">
                      KES {totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No expenses recorded for this period</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ledger Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ledger Entries</CardTitle>
            <CardDescription>Complete transaction history with running balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(entry.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="max-w-xs">{entry.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entry.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.received > 0 ? (
                          <span className="font-mono-numbers font-semibold text-secondary">
                            +KES {entry.received.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.spent > 0 ? (
                          <span className="font-mono-numbers font-semibold text-accent">
                            -KES {entry.spent.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono-numbers font-bold">
                          KES {entry.balance.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Ledger;