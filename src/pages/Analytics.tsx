import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Activity } from "lucide-react";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 45000, transactions: 120 },
  { month: "Feb", revenue: 52000, transactions: 145 },
  { month: "Mar", revenue: 48000, transactions: 132 },
  { month: "Apr", revenue: 61000, transactions: 168 },
  { month: "May", revenue: 73000, transactions: 195 },
  { month: "Jun", revenue: 68000, transactions: 178 },
];

const transactionVolumeData = [
  { day: "Mon", count: 42, amount: 12400 },
  { day: "Tue", count: 38, amount: 10800 },
  { day: "Wed", count: 51, amount: 15200 },
  { day: "Thu", count: 45, amount: 13600 },
  { day: "Fri", count: 62, amount: 18900 },
  { day: "Sat", count: 28, amount: 8200 },
  { day: "Sun", count: 19, amount: 5400 },
];

const Analytics = () => {
  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your business performance and insights</p>
          </div>
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">KES 347,000</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">938</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">KES 370</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-destructive">-2.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">573</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary">+19.3%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="volume">Transaction Volume</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue and transaction count over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
                    transactions: { label: "Transactions", color: "hsl(var(--secondary))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="transactions" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Transaction Volume</CardTitle>
                <CardDescription>Transaction count and amounts by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Count", color: "hsl(var(--primary))" },
                    amount: { label: "Amount", color: "hsl(var(--accent))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Hours</CardTitle>
                  <CardDescription>Peak transaction times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: "12:00 PM - 1:00 PM", transactions: 142, percent: 85 },
                      { time: "2:00 PM - 3:00 PM", transactions: 128, percent: 75 },
                      { time: "5:00 PM - 6:00 PM", transactions: 115, percent: 68 },
                      { time: "10:00 AM - 11:00 AM", transactions: 98, percent: 58 },
                    ].map((hour) => (
                      <div key={hour.time} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{hour.time}</span>
                          <span className="text-muted-foreground">{hour.transactions} transactions</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${hour.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution by account type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "Till Number", count: 456, percent: 49 },
                      { type: "Paybill", count: 312, percent: 33 },
                      { type: "Pochi la Biashara", count: 170, percent: 18 },
                    ].map((method) => (
                      <div key={method.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{method.type}</span>
                          <span className="text-sm text-muted-foreground">{method.count} ({method.percent}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${method.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
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

export default Analytics;
