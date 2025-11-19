import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  checkConnectionHealth, 
  performanceMetrics, 
  queryCache,
  type ConnectionHealth 
} from "@/utils/supabaseOptimization";
import { Activity, Database, Zap, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PerformanceMonitor = () => {
  const [health, setHealth] = useState<ConnectionHealth | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const healthStatus = await checkConnectionHealth();
      setHealth(healthStatus);
      
      const performanceData = performanceMetrics.getMetrics();
      setMetrics(performanceData);
    } catch (error) {
      toast.error("Failed to check database health");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    if (!health) return "default";
    switch (health.status) {
      case "healthy": return "success";
      case "degraded": return "warning";
      case "unhealthy": return "destructive";
      default: return "default";
    }
  };

  const getHealthIcon = () => {
    if (!health) return <Activity className="h-4 w-4" />;
    switch (health.status) {
      case "healthy": return <Zap className="h-4 w-4" />;
      case "degraded": return <TrendingUp className="h-4 w-4" />;
      case "unhealthy": return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleClearCache = () => {
    queryCache.clear();
    toast.success("Query cache cleared");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Performance</h2>
          <p className="text-sm text-muted-foreground">
            Monitor Supabase connection health and query performance
          </p>
        </div>
        <Button onClick={checkHealth} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Connection Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Health
          </CardTitle>
          <CardDescription>Real-time database connectivity status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getHealthIcon()}
              <span className="text-sm font-medium">Status</span>
            </div>
            <Badge variant={getHealthColor() as any}>
              {health?.status.toUpperCase() || "CHECKING..."}
            </Badge>
          </div>

          {health && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span className="text-sm font-medium">
                    {health.latency.toFixed(0)}ms
                  </span>
                </div>
                <Progress 
                  value={Math.min((health.latency / 1000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Check</p>
                  <p className="text-sm font-medium">
                    {health.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Performance</p>
                  <p className="text-sm font-medium">
                    {health.latency < 200 ? "Excellent" : 
                     health.latency < 500 ? "Good" : 
                     health.latency < 1000 ? "Fair" : "Poor"}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Query Performance */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Query Performance
            </CardTitle>
            <CardDescription>Application query metrics and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Duration</p>
                <p className="text-2xl font-bold">{metrics.averageDuration.toFixed(0)}ms</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
                <Progress value={metrics.successRate} className="h-2" />
              </div>
            </div>

            {metrics.recentErrors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Recent Errors</p>
                <div className="space-y-1">
                  {metrics.recentErrors.map((error: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{error.operation}</span>
                      <span className="text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleClearCache} variant="outline" className="w-full">
              Clear Query Cache
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Tips</CardTitle>
          <CardDescription>Improve database performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">🚀 Supabase Cloud</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Upgrade instance size during peak hours (Settings → Infrastructure)</li>
              <li>• Enable read replicas for read-heavy workloads (Pro+ plan)</li>
              <li>• Connection pooling is automatic via PgBouncer</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">⚡ Application Level</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Query caching is enabled with 60-second TTL</li>
              <li>• Automatic retry logic with exponential backoff</li>
              <li>• Real-time updates are throttled for performance</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">🔧 Self-Hosted</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• See SUPABASE_PERFORMANCE_GUIDE.md for Docker optimization</li>
              <li>• Configure PgBouncer pool size based on load</li>
              <li>• Allocate 4GB+ RAM and 2+ CPU cores minimum</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
