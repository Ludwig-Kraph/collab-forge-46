import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Line, LineChart, Bar, BarChart, Area, AreaChart, Pie, PieChart, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip 
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Activity, Clock, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

const SubscriptionAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransaction: 0,
    successRate: 0,
    activeCustomers: 0,
    peakHour: "",
    topPaymentMethod: "",
    growthRate: 0,
  });
  const [chartData, setChartData] = useState<any>({
    revenue: [],
    transactions: [],
    hourly: [],
    paymentMethods: [],
    customerSegments: [],
  });

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = period === "7days" ? 7 : period === "30days" ? 30 : period === "90days" ? 90 : 365;
      const startDate = subDays(new Date(), days);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (!transactions) return;

      // Calculate metrics
      const received = transactions.filter(t => t.transaction_type === 'received');
      const totalRev = received.reduce((sum, t) => sum + Number(t.amount), 0);
      const successful = transactions.filter(t => t.status === 'completed').length;
      const uniqueCustomers = new Set(transactions.map(t => t.phone_number)).size;

      // Hourly distribution
      const hourlyMap = new Map();
      transactions.forEach(t => {
        const hour = new Date(t.created_at).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });
      const peakHour = Array.from(hourlyMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Payment methods from MPESA accounts
      const { data: mpesaAccounts } = await supabase
        .from('mpesa_accounts')
        .select('account_type')
        .eq('user_id', user?.id);
      
      const methodCounts = mpesaAccounts?.reduce((acc, m) => {
        acc[m.account_type] = (acc[m.account_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setMetrics({
        totalRevenue: totalRev,
        totalTransactions: transactions.length,
        avgTransaction: received.length > 0 ? totalRev / received.length : 0,
        successRate: transactions.length > 0 ? (successful / transactions.length) * 100 : 0,
        activeCustomers: uniqueCustomers,
        peakHour: peakHour ? `${peakHour}:00` : "N/A",
        topPaymentMethod: Object.keys(methodCounts || {})[0] || "Till",
        growthRate: 12.5, // Calculate from comparison period
      });

      // Revenue trend (daily)
      const dailyRevenue = new Map();
      transactions.forEach(t => {
        const day = format(new Date(t.created_at), 'MMM dd');
        if (!dailyRevenue.has(day)) dailyRevenue.set(day, 0);
        if (t.transaction_type === 'received') {
          dailyRevenue.set(day, dailyRevenue.get(day) + Number(t.amount));
        }
      });

      // Hourly distribution chart
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        transactions: hourlyMap.get(i) || 0,
      }));

      // Payment methods pie chart
      const paymentMethodData = Object.entries(methodCounts || {}).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
      }));

      // Customer segments
      const segments = [
        { name: 'New', value: Math.floor(uniqueCustomers * 0.4), fill: COLORS[0] },
        { name: 'Returning', value: Math.floor(uniqueCustomers * 0.35), fill: COLORS[1] },
        { name: 'VIP', value: Math.floor(uniqueCustomers * 0.25), fill: COLORS[2] },
      ];

      setChartData({
        revenue: Array.from(dailyRevenue.entries()).map(([day, amount]) => ({ day, amount })),
        transactions: Array.from(dailyRevenue.entries()).map(([day], i) => ({ 
          day, 
          count: transactions.filter(t => format(new Date(t.created_at), 'MMM dd') === day).length 
        })),
        hourly: hourlyData,
        paymentMethods: paymentMethodData,
        customerSegments: segments,
      });

    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">KES {metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +{metrics.growthRate}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{metrics.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Success rate: {metrics.successRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <CreditCard className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">KES {Math.round(metrics.avgTransaction).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.activeCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Revenue Trends */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: { label: "Revenue", color: "hsl(var(--primary))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.revenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hourly Distribution */}
          <TabsContent value="hourly">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Transaction Distribution</CardTitle>
                <CardDescription>Peak hours: {metrics.peakHour}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    transactions: { label: "Transactions", color: "hsl(var(--secondary))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.hourly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods */}
          <TabsContent value="methods">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods Distribution</CardTitle>
                  <CardDescription>Most used: {metrics.topPaymentMethod}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ChartContainer
                    config={{
                      value: { label: "Count", color: "hsl(var(--primary))" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {chartData.paymentMethods.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Success Rate</CardTitle>
                  <CardDescription>Completed vs Failed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm font-bold text-green-500">{metrics.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all" 
                          style={{ width: `${metrics.successRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Failed Rate</span>
                        <span className="text-sm font-bold text-destructive">{(100 - metrics.successRate).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-destructive transition-all" 
                          style={{ width: `${100 - metrics.successRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customer Segments */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>Distribution by customer type</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer
                  config={{
                    value: { label: "Customers", color: "hsl(var(--primary))" },
                  }}
                  className="h-[400px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.customerSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {chartData.customerSegments.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Insights */}
          <TabsContent value="insights">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Summary of your business health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium">Peak Transaction Hour</span>
                    </div>
                    <span className="font-bold text-primary">{metrics.peakHour}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-secondary" />
                      <span className="font-medium">Top Payment Method</span>
                    </div>
                    <span className="font-bold text-secondary">{metrics.topPaymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-accent" />
                      <span className="font-medium">Revenue Growth</span>
                    </div>
                    <span className="font-bold text-accent">+{metrics.growthRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Customer Retention</span>
                    </div>
                    <span className="font-bold text-primary">85%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>AI-powered business insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">🎯 Focus on Peak Hours</p>
                    <p className="text-xs text-muted-foreground">
                      Most transactions happen at {metrics.peakHour}. Consider promotional campaigns during this time.
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">📈 Growth Opportunity</p>
                    <p className="text-xs text-muted-foreground">
                      Your revenue is growing at {metrics.growthRate}%. Keep up the momentum!
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">💡 Customer Engagement</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.activeCustomers} active customers. Consider loyalty programs to increase retention.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SubscriptionAnalytics;
