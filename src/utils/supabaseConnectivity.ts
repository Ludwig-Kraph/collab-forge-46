import { supabase } from '@/integrations/supabase/client';

export interface ConnectivityCheckResult {
  status: 'success' | 'error';
  message: string;
  details?: any;
}

export interface ConnectivityReport {
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'failed';
  checks: {
    api: ConnectivityCheckResult;
    auth: ConnectivityCheckResult;
    database: ConnectivityCheckResult;
    edgeFunctions: ConnectivityCheckResult;
    realtime: ConnectivityCheckResult;
  };
}

/**
 * Check if Supabase API is reachable
 */
export async function checkAPIReachability(): Promise<ConnectivityCheckResult> {
  try {
    const response = await fetch('https://cfuolhkzxsxfovalswhp.supabase.co/rest/v1/');
    if (response.status === 404 || response.status === 200) {
      return {
        status: 'success',
        message: 'Supabase API is reachable',
        details: { statusCode: response.status }
      };
    }
    return {
      status: 'error',
      message: `Unexpected status code: ${response.status}`,
      details: { statusCode: response.status }
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Cannot reach Supabase API',
      details: { error: error.message }
    };
  }
}

/**
 * Check authentication system
 */
export async function checkAuthentication(): Promise<ConnectivityCheckResult> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return {
        status: 'error',
        message: 'Authentication system error',
        details: { error: error.message }
      };
    }
    return {
      status: 'success',
      message: data.session ? 'User authenticated' : 'Auth system operational',
      details: { hasSession: !!data.session }
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Authentication check failed',
      details: { error: error.message }
    };
  }
}

/**
 * Check database connectivity
 */
export async function checkDatabase(): Promise<ConnectivityCheckResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return {
        status: 'error',
        message: 'Database query failed',
        details: { error: error.message, code: error.code }
      };
    }

    return {
      status: 'success',
      message: 'Database connection successful',
      details: { queryExecuted: true }
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Database check failed',
      details: { error: error.message }
    };
  }
}

/**
 * Check Edge Functions
 */
export async function checkEdgeFunctions(): Promise<ConnectivityCheckResult> {
  try {
    const { data, error } = await supabase.functions.invoke('test-mpesa-connection');
    
    if (error) {
      // Function not found is expected if not deployed
      if (error.message.includes('not found')) {
        return {
          status: 'success',
          message: 'Edge Functions reachable (test function not deployed)',
          details: { note: 'This is expected behavior' }
        };
      }
      return {
        status: 'error',
        message: 'Edge Functions error',
        details: { error: error.message }
      };
    }

    return {
      status: 'success',
      message: 'Edge Functions operational',
      details: { response: data }
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Edge Functions check failed',
      details: { error: error.message }
    };
  }
}

/**
 * Check Realtime connectivity
 */
export async function checkRealtime(): Promise<ConnectivityCheckResult> {
  return new Promise((resolve) => {
    try {
      const channel = supabase
        .channel('connectivity-test')
        .on('broadcast', { event: 'test' }, () => {})
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            supabase.removeChannel(channel);
            resolve({
              status: 'success',
              message: 'Realtime connection successful',
              details: { channelStatus: status }
            });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            supabase.removeChannel(channel);
            resolve({
              status: 'error',
              message: 'Realtime connection failed',
              details: { channelStatus: status }
            });
          }
        });

      // Timeout after 5 seconds
      setTimeout(() => {
        supabase.removeChannel(channel);
        resolve({
          status: 'error',
          message: 'Realtime connection timeout',
          details: { timeout: true }
        });
      }, 5000);
    } catch (error: any) {
      resolve({
        status: 'error',
        message: 'Realtime check failed',
        details: { error: error.message }
      });
    }
  });
}

/**
 * Run complete connectivity check
 */
export async function runConnectivityCheck(): Promise<ConnectivityReport> {
  console.log('🔍 Starting M-Leja Supabase Connectivity Check...\n');

  const checks = {
    api: await checkAPIReachability(),
    auth: await checkAuthentication(),
    database: await checkDatabase(),
    edgeFunctions: await checkEdgeFunctions(),
    realtime: await checkRealtime()
  };

  // Determine overall status
  const errorCount = Object.values(checks).filter(c => c.status === 'error').length;
  const overallStatus = errorCount === 0 ? 'healthy' : errorCount <= 2 ? 'degraded' : 'failed';

  const report: ConnectivityReport = {
    timestamp: new Date().toISOString(),
    overallStatus,
    checks
  };

  // Log results
  console.log('📊 Connectivity Check Results:\n');
  console.log(`Overall Status: ${overallStatus.toUpperCase()}\n`);
  
  Object.entries(checks).forEach(([name, result]) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${name}: ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });

  console.log('\n✨ Connectivity check complete!');

  return report;
}

/**
 * Get connection status summary
 */
export function getConnectionSummary(report: ConnectivityReport): string {
  const { overallStatus, checks } = report;
  const successCount = Object.values(checks).filter(c => c.status === 'success').length;
  const totalChecks = Object.keys(checks).length;

  return `Supabase Connection: ${overallStatus.toUpperCase()} (${successCount}/${totalChecks} checks passed)`;
}
