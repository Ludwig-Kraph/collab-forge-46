import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Settings, BarChart3, Building2, Briefcase, 
  FileText, CreditCard, MessageSquare, HelpCircle 
} from 'lucide-react';
import { useTierAccess } from '@/hooks/useTierAccess';
import { Badge } from '@/components/ui/badge';

const SubscriptionCMS = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { hasFeature, currentTier } = useTierAccess();

  // Super admins should use Control Panel CMS
  useEffect(() => {
    if (isSuperAdmin) {
      navigate('/control-panel');
    }
  }, [isSuperAdmin, navigate]);

  if (!isAdmin && !isSuperAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You need admin privileges to access the CMS</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  const cmsModules = [
    {
      title: 'Team Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/subscription/staff',
      enabled: hasFeature('rbacManagement'),
      badge: currentTier === 'free_trial' ? 'Upgrade Required' : null,
    },
    {
      title: 'Outlets & Locations',
      description: 'Multi-outlet management and analytics',
      icon: Building2,
      path: '/subscription/outlets',
      enabled: hasFeature('multiOutlet'),
      badge: !hasFeature('multiOutlet') ? 'Standard+' : null,
    },
    {
      title: 'Departments',
      description: 'Organize teams by departments',
      icon: Briefcase,
      path: '/subscription/departments',
      enabled: hasFeature('departments'),
      badge: !hasFeature('departments') ? 'Standard+' : null,
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive business insights',
      icon: BarChart3,
      path: '/analytics',
      enabled: hasFeature('advancedAnalytics'),
      badge: !hasFeature('advancedAnalytics') ? 'Standard+' : null,
    },
    {
      title: 'Transactions',
      description: 'View and export transaction history',
      icon: FileText,
      path: '/transactions',
      enabled: true,
      badge: null,
    },
    {
      title: 'Subscription',
      description: 'Manage your subscription plan',
      icon: CreditCard,
      path: '/subscription',
      enabled: true,
      badge: null,
    },
    {
      title: 'Settings',
      description: 'Configure account and MPESA settings',
      icon: Settings,
      path: '/settings',
      enabled: true,
      badge: null,
    },
    {
      title: 'Support',
      description: 'Get help and submit tickets',
      icon: HelpCircle,
      path: '/help',
      enabled: true,
      badge: null,
    },
  ];

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Subscription CMS</h1>
          <p className="text-muted-foreground">
            Manage your business operations and team
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              Current Plan: <span className="ml-1 font-bold">{currentTier.replace('_', ' ').toUpperCase()}</span>
            </Badge>
          </div>
        </div>

        {/* CMS Modules Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cmsModules.map((module) => (
            <Card 
              key={module.path}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                !module.enabled ? 'opacity-60' : ''
              }`}
              onClick={() => {
                if (module.enabled) {
                  navigate(module.path);
                } else {
                  navigate('/subscription');
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </div>
                  {module.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {module.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-2">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={module.enabled ? "default" : "outline"} 
                  className="w-full"
                  disabled={!module.enabled}
                >
                  {module.enabled ? 'Open' : 'Upgrade to Access'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your account usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Plan Type</p>
                <p className="text-2xl font-bold">{currentTier.replace('_', ' ')}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Features Unlocked</p>
                <p className="text-2xl font-bold">{cmsModules.filter(m => m.enabled).length}/{cmsModules.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Active Outlets</p>
                <p className="text-2xl font-bold">{hasFeature('multiOutlet') ? '-' : '1'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SubscriptionCMS;
