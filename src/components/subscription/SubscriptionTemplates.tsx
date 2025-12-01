import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateFeatures {
  name: string;
  description: string;
  period: 'daily' | 'monthly' | 'annual';
  features: string[];
  pricing: {
    daily?: number;
    monthly?: number;
    annual?: number;
  };
  maxUsers: number;
  maxStkPushes: number | null;
}

const SUBSCRIPTION_TEMPLATES: TemplateFeatures[] = [
  {
    name: 'Get Started Free',
    description: 'Perfect for testing and trying out M-Leja',
    period: 'monthly',
    features: [
      '1 User Account',
      '3 Free STK Pushes',
      'Basic Analytics',
      'Transaction History',
      'Email Support',
    ],
    pricing: { daily: 0, monthly: 0, annual: 0 },
    maxUsers: 1,
    maxStkPushes: 3,
  },
  {
    name: 'Business Starter',
    description: 'Ideal for small businesses and startups',
    period: 'monthly',
    features: [
      'Up to 10 Users',
      '500 STK Pushes/month',
      'Multi-Outlet Management',
      'Basic Analytics',
      'Transaction History',
      'RBAC User Management',
      'Data Export (CSV/PDF)',
      'Email Notifications',
      'Team Collaboration',
    ],
    pricing: { daily: 50, monthly: 1200, annual: 12000 },
    maxUsers: 10,
    maxStkPushes: 500,
  },
  {
    name: 'Professional',
    description: 'For growing businesses needing advanced features',
    period: 'monthly',
    features: [
      'Up to 25 Users',
      '2000 STK Pushes/month',
      'Multi-Outlet Management',
      'Advanced Analytics & Reports',
      'Department Management',
      'RBAC User Management',
      'API Access',
      'Priority Support',
      'Custom Branding',
      'Data Export (CSV/PDF)',
      'Workflow Automations',
      'SMS Notifications',
      'Audit Logs',
    ],
    pricing: { daily: 120, monthly: 2500, annual: 25000 },
    maxUsers: 25,
    maxStkPushes: 2000,
  },
  {
    name: 'Enterprise',
    description: 'Unlimited power for large organizations',
    period: 'monthly',
    features: [
      'Unlimited Users',
      'Unlimited STK Pushes',
      'Multi-Outlet Management',
      'Advanced Analytics & Reports',
      'Department Management',
      'RBAC User Management',
      'API Access',
      'Priority Support',
      'Custom Branding',
      'Data Export (CSV/PDF)',
      'Workflow Automations',
      'Real-time Dashboard',
      'SMS Notifications',
      'Email Notifications',
      'Mobile App Access',
      'Offline Mode',
      'Audit Logs',
      'Security Features',
      'Dedicated Account Manager',
    ],
    pricing: { daily: 300, monthly: 7500, annual: 75000 },
    maxUsers: null,
    maxStkPushes: null,
  },
  {
    name: 'Government',
    description: 'Specialized for government agencies (Annual Only)',
    period: 'annual',
    features: [
      'Unlimited Users',
      'Unlimited STK Pushes',
      'Multi-Outlet Management',
      'Advanced Analytics & Reports',
      'Department Management',
      'RBAC User Management',
      'API Access',
      'Priority Support',
      'Government Branding',
      'Data Export (CSV/PDF)',
      'Workflow Automations',
      'Real-time Dashboard',
      'Compliance Reports',
      'Inter-Governmental Communications',
      'Audit Trails',
      'Security Features',
      'County & National Level Support',
      'Revenue Stream Tracking',
      'Dedicated Support Team',
    ],
    pricing: { annual: 150000 },
    maxUsers: null,
    maxStkPushes: null,
  },
];

interface SubscriptionTemplatesProps {
  onUseTemplate?: (template: TemplateFeatures) => void;
}

export function SubscriptionTemplates({ onUseTemplate }: SubscriptionTemplatesProps) {
  const handleCopyFeatures = (features: string[]) => {
    navigator.clipboard.writeText(features.join('\n'));
    toast.success('Features copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Subscription Plan Templates</h3>
        <p className="text-sm text-muted-foreground">
          Use these templates as guides when creating subscription tiers. Each template represents a proven pricing structure with recommended features.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SUBSCRIPTION_TEMPLATES.map((template) => (
          <Card key={template.name} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </div>
                {template.name.includes('Government') && (
                  <Badge variant="outline" className="text-xs">Annual Only</Badge>
                )}
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Pricing Guide:</div>
                {template.pricing.daily && (
                  <div className="text-sm">
                    Daily: <span className="font-semibold">KES {template.pricing.daily.toLocaleString()}</span>
                  </div>
                )}
                {template.pricing.monthly && (
                  <div className="text-sm">
                    Monthly: <span className="font-semibold">KES {template.pricing.monthly.toLocaleString()}</span>
                  </div>
                )}
                {template.pricing.annual && (
                  <div className="text-sm">
                    Annual: <span className="font-semibold">KES {template.pricing.annual.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Max Users:</span>{' '}
                  <span className="font-semibold">{template.maxUsers || 'Unlimited'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">STK Pushes:</span>{' '}
                  <span className="font-semibold">{template.maxStkPushes || 'Unlimited'}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommended Features:</div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCopyFeatures(template.features)}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copy Features
                </Button>
                {onUseTemplate && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => onUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-medium">📋 Template Usage Guidelines:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Daily Plans:</strong> Best for testing or short-term needs</li>
              <li>• <strong>Monthly Plans:</strong> Standard billing for most businesses</li>
              <li>• <strong>Annual Plans:</strong> Best value with 20%+ savings</li>
              <li>• <strong>Government Plans:</strong> Annual only, never shown on landing page</li>
              <li>• Features can be customized based on your specific needs</li>
              <li>• Pricing should be adjusted based on your market and costs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
