import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Calendar as CalendarIcon, Download, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ExportButton from "@/components/transactions/ExportButton";
import { useToast } from "@/hooks/use-toast";

type TransactionType = "received" | "sent" | "all";
type TransactionStatus = "completed" | "pending" | "failed" | "all";

interface Transaction {
  id: string;
  type: "received" | "sent";
  amount: number;
  phoneNumber: string;
  description: string;
  status: "completed" | "pending" | "failed";
  date: Date;
  mpesaRef: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType>("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTransactions: Transaction[] = data?.map(t => ({
        id: t.id,
        type: t.transaction_type === 'received' ? 'received' : 'sent',
        amount: Number(t.amount),
        phoneNumber: t.phone_number,
        description: t.description || `Transaction with ${t.phone_number}`,
        status: t.status as "completed" | "pending" | "failed",
        date: new Date(t.created_at),
        mpesaRef: t.mpesa_receipt_number || t.transaction_id,
      })) || [];

      setAllTransactions(formattedTransactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesSearch = 
      tx.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.mpesaRef.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    
    const matchesDate = 
      (!dateRange?.from || tx.date >= dateRange.from) &&
      (!dateRange?.to || tx.date <= dateRange.to);

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });


  const getStatusBadge = (status: Transaction["status"]) => {
    const variants: Record<Transaction["status"], { variant: "default" | "secondary" | "destructive"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">View and manage all your payment transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {allTransactions.length} transactions
              </p>
              <ExportButton transactions={filteredTransactions} />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Detailed list of all payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>MPESA Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              tx.type === "received" ? "bg-secondary/10" : "bg-accent/10"
                            }`}>
                              {tx.type === "received" ? (
                                <ArrowDownLeft className="h-4 w-4 text-secondary" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-accent" />
                              )}
                            </div>
                            <span className="capitalize">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono-numbers">{tx.phoneNumber}</TableCell>
                        <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(tx.date, "MMM dd, yyyy 'at' HH:mm")}
                        </TableCell>
                        <TableCell>
                          <span className={`font-mono-numbers font-semibold ${
                            tx.type === "received" ? "text-secondary" : "text-foreground"
                          }`}>
                            {tx.type === "received" ? "+" : "-"}KES {tx.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="font-mono-numbers text-sm">{tx.mpesaRef}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;