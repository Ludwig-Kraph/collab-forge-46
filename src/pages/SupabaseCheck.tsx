import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Database, Cloud, Wifi, Lock, Radio } from "lucide-react";
import { runConnectivityCheck, type ConnectivityReport } from "@/utils/supabaseConnectivity";

export default function SupabaseCheck() {
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<ConnectivityReport | null>(null);

  const handleRunCheck = async () => {
    setChecking(true);
    try {
      const result = await runConnectivityCheck();
      setReport(result);
    } catch (error) {
      console.error('Connectivity check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'error':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getCheckIcon = (checkName: string) => {
    switch (checkName) {
      case 'api':
        return <Cloud className="h-4 w-4" />;
      case 'auth':
        return <Lock className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'edgeFunctions':
        return <Wifi className="h-4 w-4" />;
      case 'realtime':
        return <Radio className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <img src="/logo.png" alt="M-Leja Logo" className="h-20 mx-auto" />
          <h1 className="text-4xl font-bold">Supabase Connectivity Check</h1>
          <p className="text-muted-foreground">
            Verify your M-Leja application's connection to Supabase backend services
          </p>
        </div>

        {/* Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>Current Supabase project configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Project ID:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">cfuolhkzxsxfovalswhp</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Project URL:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                https://cfuolhkzxsxfovalswhp.supabase.co
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Client Version:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">@supabase/supabase-js</code>
            </div>
          </CardContent>
        </Card>

        {/* Run Check Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRunCheck}
            disabled={checking}
            size="lg"
            className="gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Running Checks...' : 'Run Connectivity Check'}
          </Button>
        </div>

        {/* Results */}
        {report && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Alert>
              <div className="flex items-center gap-3">
                {getStatusIcon(report.overallStatus)}
                <div className="flex-1">
                  <AlertTitle>
                    Overall Status: {report.overallStatus.toUpperCase()}
                  </AlertTitle>
                  <AlertDescription>
                    Checked at {new Date(report.timestamp).toLocaleString()}
                  </AlertDescription>
                </div>
                <Badge className={getStatusColor(report.overallStatus)}>
                  {report.overallStatus}
                </Badge>
              </div>
            </Alert>

            {/* Individual Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
                <CardDescription>Individual service connectivity checks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(report.checks).map(([name, result]) => (
                  <div
                    key={name}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                  >
                    <div className="mt-0.5">{getCheckIcon(name)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {getStatusIcon(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {report.overallStatus !== 'healthy' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    {report.checks.api.status === 'error' && (
                      <li>• Check your internet connection and firewall settings</li>
                    )}
                    {report.checks.database.status === 'error' && (
                      <li>• Verify RLS policies are correctly configured</li>
                    )}
                    {report.checks.edgeFunctions.status === 'error' && (
                      <li>• Ensure Edge Functions are deployed</li>
                    )}
                    {report.checks.realtime.status === 'error' && (
                      <li>• Check if WebSocket connections are allowed</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Documentation Link */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Additional resources and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/SUPABASE_CONNECTIVITY.md"
              target="_blank"
              className="block text-sm text-primary hover:underline"
            >
              → Supabase Connectivity Guide
            </a>
            <a
              href="/PRIVATE_HOSTING_DEPLOYMENT.md"
              target="_blank"
              className="block text-sm text-primary hover:underline"
            >
              → Private Hosting Deployment Guide
            </a>
            <a
              href="https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              → Supabase Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
