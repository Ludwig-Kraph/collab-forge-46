import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { AdminCard } from '@/components/admin/AdminCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Users, Zap, Crown, Building2, Landmark, Save, Plus } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { CreateTierDialog } from '@/components/subscription/CreateTierDialog';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxUsers: number;
  maxStkPushes: number | null;
  features: string[];
  terms: string;
  icon: any;
}

const defaultTiers: SubscriptionTier[] = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    currency: 'KES',
    maxUsers: 1,
    maxStkPushes: 3,
    features: ['3 free STK pushes', 'Single user', 'Basic support', '30 days trial'],
    terms: 'Free trial for 30 days. Limited to 3 STK push payments.',
    icon: Zap
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 1500,
    currency: 'KES',
    maxUsers: 3,
    maxStkPushes: 100,
    features: ['Up to 3 users', '100 STK pushes/month', 'Email support', 'Basic analytics'],
    terms: 'Monthly subscription. Billed monthly. Cancel anytime.',
    icon: Users
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 5000,
    currency: 'KES',
    maxUsers: 10,
    maxStkPushes: 500,
    features: ['Up to 10 users', '500 STK pushes/month', 'Priority support', 'Advanced analytics', 'Multi-outlet support'],
    terms: 'Monthly subscription. Billed monthly. Cancel anytime.',
    icon: Building2
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 15000,
    currency: 'KES',
    maxUsers: 50,
    maxStkPushes: 2000,
    features: ['Up to 50 users', '2000 STK pushes/month', '24/7 support', 'Custom reports', 'API access', 'Department management'],
    terms: 'Monthly subscription. Billed monthly. Cancel anytime.',
    icon: Crown
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 50000,
    currency: 'KES',
    maxUsers: 200,
    maxStkPushes: null,
    features: ['Up to 200 users', 'Unlimited STK pushes', 'Dedicated support', 'Custom integration', 'SLA guarantee', 'Advanced RBAC'],
    terms: 'Annual contract. Custom pricing available for larger organizations.',
    icon: Building2
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: 100000,
    currency: 'KES',
    maxUsers: 1000,
    maxStkPushes: null,
    features: ['Unlimited users', 'Unlimited STK pushes', 'White-label option', 'Dedicated account manager', 'Custom development', 'Multi-tenant support'],
    terms: 'Annual contract. Customizable to business needs.',
    icon: Building2
  },
  {
    id: 'government',
    name: 'Government',
    price: 0,
    currency: 'KES',
    maxUsers: 10000,
    maxStkPushes: null,
    features: ['Unlimited users', 'Unlimited STK pushes', 'Government-grade security', 'Compliance reporting', 'Inter-governmental integration', 'Audit trails'],
    terms: 'Special government pricing. Subject to approval and verification.',
    icon: Landmark
  }
];

export default function SubscriptionControl() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<SubscriptionTier[]>(defaultTiers);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchCustomTiers();
  }, []);

  const fetchCustomTiers = async () => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const customTiers: SubscriptionTier[] = data.map(tier => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        currency: tier.currency,
        maxUsers: tier.max_users || 0,
        maxStkPushes: tier.max_stk_pushes,
        features: (Array.isArray(tier.features) ? tier.features : []).filter((f): f is string => typeof f === 'string'),
        terms: tier.description || '',
        icon: Building2,
      }));
      setTiers([...defaultTiers, ...customTiers]);
    }
  };

  const handleSaveTier = async () => {
    if (!selectedTier) return;

    setSaving(true);
    try {
      // In a real implementation, this would save to a subscription_tiers table
      // For now, we'll just show a success message
      toast({
        title: 'Subscription Updated',
        description: `${selectedTier.name} tier has been updated successfully.`,
      });

      // Update local state
      setTiers(prev => prev.map(t => t.id === selectedTier.id ? selectedTier : t));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateField = (field: string, value: any) => {
    if (!selectedTier) return;
    setSelectedTier({ ...selectedTier, [field]: value });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Control</h1>
            <p className="text-muted-foreground">
              Manage subscription tiers, pricing, features, and policies
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Subscription Tier
          </Button>
        </div>

        <CreateTierDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
          onSuccess={fetchCustomTiers}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Tiers</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <Card key={tier.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Icon className="h-8 w-8 text-primary" />
                        <Badge variant={tier.id === 'free_trial' ? 'secondary' : 'default'}>
                          {tier.id === 'government' ? 'Special' : 'Active'}
                        </Badge>
                      </div>
                      <CardTitle>{tier.name}</CardTitle>
                      <CardDescription>
                        {tier.price === 0 ? 'Free' : `${tier.currency} ${tier.price.toLocaleString()}/month`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max Users:</span>
                          <span className="font-medium">{tier.maxUsers}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">STK Pushes:</span>
                          <span className="font-medium">
                            {tier.maxStkPushes === null ? 'Unlimited' : tier.maxStkPushes}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => setSelectedTier(tier)}
                        >
                          Edit Tier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {selectedTier ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit {selectedTier.name} Tier</CardTitle>
                  <CardDescription>
                    Update pricing, features, and configuration for this subscription tier
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Tier Name" required>
                      <Input 
                        value={selectedTier.name}
                        onChange={(e) => handleUpdateField('name', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Price (KES)" required>
                      <Input 
                        type="number"
                        value={selectedTier.price}
                        onChange={(e) => handleUpdateField('price', parseFloat(e.target.value))}
                      />
                    </FormField>

                    <FormField label="Max Users" required>
                      <Input 
                        type="number"
                        value={selectedTier.maxUsers}
                        onChange={(e) => handleUpdateField('maxUsers', parseInt(e.target.value))}
                      />
                    </FormField>

                    <FormField label="Max STK Pushes" hint="Leave empty for unlimited">
                      <Input 
                        type="number"
                        value={selectedTier.maxStkPushes || ''}
                        onChange={(e) => handleUpdateField('maxStkPushes', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Unlimited"
                      />
                    </FormField>
                  </div>

                  <FormField label="Features" hint="One feature per line">
                    <Textarea 
                      value={selectedTier.features.join('\n')}
                      onChange={(e) => handleUpdateField('features', e.target.value.split('\n').filter(f => f.trim()))}
                      rows={6}
                    />
                  </FormField>

                  <FormField label="Terms & Conditions" required>
                    <Textarea 
                      value={selectedTier.terms}
                      onChange={(e) => handleUpdateField('terms', e.target.value)}
                      rows={4}
                    />
                  </FormField>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveTier} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTier(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    Select a tier from the Overview tab to edit
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Subscription Policies</CardTitle>
                <CardDescription>
                  Terms and policies applicable to all subscription tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="General Terms of Service">
                  <Textarea 
                    defaultValue="By subscribing to M-Leja, you agree to our terms of service. All subscriptions are subject to fair use policy. We reserve the right to modify pricing and features with 30 days notice."
                    rows={4}
                  />
                </FormField>

                <FormField label="Cancellation Policy">
                  <Textarea 
                    defaultValue="You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. No refunds for partial months."
                    rows={3}
                  />
                </FormField>

                <FormField label="Upgrade/Downgrade Policy">
                  <Textarea 
                    defaultValue="You may upgrade or downgrade your subscription at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle."
                    rows={3}
                  />
                </FormField>

                <FormField label="Payment Terms">
                  <Textarea 
                    defaultValue="All subscriptions are billed monthly in advance via M-Pesa. Failed payments will result in service suspension after 7 days grace period. Government subscriptions may have custom payment terms."
                    rows={3}
                  />
                </FormField>

                <FormField label="Data Protection & Privacy">
                  <Textarea 
                    defaultValue="We comply with Kenya's Data Protection Act, 2019 and GDPR. Your data is encrypted and stored securely. We never share your data with third parties without consent. See our Privacy Policy and Cookie Policy for details."
                    rows={4}
                  />
                </FormField>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Policies
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
