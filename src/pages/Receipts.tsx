import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Search, Download, FileText, Coins, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";

const Receipts = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['payment-receipts', user?.id, typeFilter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('payment_receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (typeFilter !== 'all') {
        query = query.eq('receipt_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = receipts?.filter(r =>
    !search || r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (receipt: any) => {
    const text = [
      '═══════════════════════════════════════',
      '              M-LEJA RECEIPT            ',
      '═══════════════════════════════════════',
      '',
      `Receipt No:    ${receipt.receipt_number}`,
      `Date:          ${new Date(receipt.created_at).toLocaleString()}`,
      `Type:          ${receipt.receipt_type === 'subscription' ? 'Subscription Payment' : 'Token Purchase'}`,
      `Amount:        ${receipt.currency} ${Number(receipt.amount).toLocaleString()}`,
      '',
      receipt.subscription_tier ? `Tier:          ${receipt.subscription_tier}` : '',
      receipt.token_package_name ? `Package:       ${receipt.token_package_name}` : '',
      receipt.token_count ? `Tokens:        ${receipt.token_count}` : '',
      receipt.token_serial ? `Token Serial:  ${receipt.token_serial}` : '',
      receipt.mpesa_receipt_number ? `MPESA Ref:     ${receipt.mpesa_receipt_number}` : '',
      receipt.account_number ? `Account:       ${receipt.account_number}` : '',
      receipt.description ? `Description:   ${receipt.description}` : '',
      '',
      '═══════════════════════════════════════',
      '        Thank you for using M-Leja      ',
      '═══════════════════════════════════════',
    ].filter(Boolean).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receipt.receipt_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" />
            Payment Receipts
          </h1>
          <p className="text-muted-foreground">View and download receipts for all your payments</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Receipts</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="token">Token Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Receipts List */}
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : !filtered?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No receipts found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Receipts are generated automatically after successful payments
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        receipt.receipt_type === 'token' ? 'bg-accent/10' : 'bg-primary/10'
                      }`}>
                        {receipt.receipt_type === 'token' ? (
                          <Coins className="h-5 w-5 text-accent" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold">{receipt.receipt_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(receipt.created_at).toLocaleDateString('en-KE', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        {receipt.description && (
                          <p className="text-xs text-muted-foreground mt-1">{receipt.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant={receipt.receipt_type === 'token' ? 'secondary' : 'default'} className="text-xs">
                            {receipt.receipt_type === 'token' ? 'Token' : 'Subscription'}
                          </Badge>
                          {receipt.token_serial && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {receipt.token_serial}
                            </Badge>
                          )}
                          {receipt.mpesa_receipt_number && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {receipt.mpesa_receipt_number}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-lg font-bold font-mono">
                        {receipt.currency} {Number(receipt.amount).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(receipt)}
                        className="text-xs"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Receipts;
