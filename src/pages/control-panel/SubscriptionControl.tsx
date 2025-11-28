import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Upload, Download, Star, Building2 } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { CreateTierDialog } from '@/components/subscription/CreateTierDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxUsers: number;
  maxStkPushes: number | null;
  features: string[];
  terms: string;
  period: string;
  isPeriodEnabled: boolean;
  showOnLanding?: boolean;
  isRecommended?: boolean;
}

export default function SubscriptionControl() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');

  useEffect(() => {
    fetchTiers();
    ensureFreeTierExists();
  }, []);

  const ensureFreeTierExists = async () => {
    // Check if free trial tier exists
    const { data: existingTier } = await supabase
      .from('subscription_tiers')
      .select('id')
      .eq('name', 'Free Trial')
      .single();

    if (!existingTier) {
      // Create the free trial tier with all free tier features
      const { error } = await supabase
        .from('subscription_tiers')
        .insert({
          name: 'Get Started Free',
          description: 'Perfect for trying out M-Leja with basic features',
          price: 0,
          currency: 'KES',
          period: 'monthly',
          max_users: 1,
          max_stk_pushes: 3,
          features: [
            'Basic Analytics',
            'Real-time Dashboard',
            'Transaction History',
            'Receipt Generation',
            'SMS Notifications',
            'Email Notifications',
          ],
          icon_name: 'Zap',
          is_active: true,
          is_period_enabled: false,
          show_on_landing: true,
        });

      if (!error) {
        toast({
          title: 'Free Trial Tier Created',
          description: 'The Get Started Free tier has been automatically created.',
        });
        fetchTiers();
      }
    }
  };

  const fetchTiers = async () => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price', { ascending: true });

    if (data && !error) {
      const formattedTiers: SubscriptionTier[] = data.map(tier => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        currency: tier.currency,
        maxUsers: tier.max_users || 0,
        maxStkPushes: tier.max_stk_pushes,
        features: (Array.isArray(tier.features) ? tier.features : []).filter((f): f is string => typeof f === 'string'),
        terms: tier.description || '',
        period: tier.period || 'monthly',
        isPeriodEnabled: tier.is_period_enabled ?? true,
        showOnLanding: tier.show_on_landing || false,
        isRecommended: tier.is_recommended || false,
      }));
      setTiers(formattedTiers);
    }
  };

  const handleToggleLandingPage = async (tierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .update({ 
          show_on_landing: !currentStatus,
          period: selectedPeriod,
        })
        .eq('id', tierId);

      if (error) throw error;

      toast({
        title: currentStatus ? 'Pulled from Landing Page' : 'Pushed to Landing Page',
        description: `Subscription tier is now ${!currentStatus ? 'visible' : 'hidden'} on the landing page with ${selectedPeriod} billing.`,
      });

      fetchTiers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleRecommended = async (tierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .update({ is_recommended: !currentStatus })
        .eq('id', tierId);

      if (error) throw error;

      toast({
        title: currentStatus ? 'Removed Recommended Flag' : 'Set as Recommended',
        description: currentStatus 
          ? 'This tier is no longer marked as recommended.' 
          : 'This tier is now marked as recommended. All other tiers have been unmarked.',
      });

      fetchTiers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveTier = async () => {
    if (!selectedTier) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .update({
          name: selectedTier.name,
          price: selectedTier.price,
          currency: selectedTier.currency,
          max_users: selectedTier.maxUsers,
          max_stk_pushes: selectedTier.maxStkPushes,
          features: selectedTier.features,
          description: selectedTier.terms,
          period: selectedTier.period,
          is_period_enabled: selectedTier.isPeriodEnabled,
        })
        .eq('id', selectedTier.id);

      if (error) throw error;

      toast({
        title: 'Subscription Updated',
        description: `${selectedTier.name} tier has been updated successfully.`,
      });

      fetchTiers();
      setSelectedTier(null);
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
          onSuccess={fetchTiers}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Tiers</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Billing Period for Go-Live</CardTitle>
                <CardDescription>
                  Select the billing period before pushing a tier to the landing page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select billing period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {tiers.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    No subscription tiers found. Create one to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tiers.map((tier) => (
                  <Card key={tier.id} className={tier.isRecommended ? 'border-2 border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Building2 className="h-8 w-8 text-primary" />
                        <div className="flex gap-1">
                          {tier.isRecommended && (
                            <Badge variant="default" className="gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Recommended
                            </Badge>
                          )}
                          <Badge variant={tier.showOnLanding ? 'default' : 'secondary'}>
                            {tier.showOnLanding ? 'Live' : 'Hidden'}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle>{tier.name}</CardTitle>
                      <CardDescription>
                        {tier.price === 0 ? 'Free' : `${tier.currency} ${tier.price.toLocaleString()}/${tier.period}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max Users:</span>
                          <span className="font-medium">{tier.maxUsers || 'Unlimited'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">STK Pushes:</span>
                          <span className="font-medium">
                            {tier.maxStkPushes === null ? 'Unlimited' : tier.maxStkPushes}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Period:</span>
                          <span className="font-medium capitalize">{tier.period}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Label htmlFor={`recommended-${tier.id}`} className="text-sm">Recommended</Label>
                          <Switch
                            id={`recommended-${tier.id}`}
                            checked={tier.isRecommended}
                            onCheckedChange={() => handleToggleRecommended(tier.id, tier.isRecommended || false)}
                          />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedTier(tier)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="icon"
                            variant={tier.showOnLanding ? 'destructive' : 'default'}
                            onClick={() => handleToggleLandingPage(tier.id, tier.showOnLanding || false)}
                            title={tier.showOnLanding ? 'Pull from Landing Page (Hide)' : `Push to Landing Page (Go Live as ${selectedPeriod})`}
                          >
                            {tier.showOnLanding ? <Download className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

                    <FormField label="Price" required>
                      <Input 
                        type="number"
                        value={selectedTier.price}
                        onChange={(e) => handleUpdateField('price', parseFloat(e.target.value))}
                      />
                    </FormField>

                    <FormField label="Currency" required>
                      <Input 
                        value={selectedTier.currency}
                        onChange={(e) => handleUpdateField('currency', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Billing Period" required>
                      <Select
                        value={selectedTier.period}
                        onValueChange={(value) => handleUpdateField('period', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Max Users" hint="0 for unlimited">
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

                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <Label htmlFor="period-enabled">Enable Period Display</Label>
                      <p className="text-sm text-muted-foreground">Show billing period on landing page</p>
                    </div>
                    <Switch
                      id="period-enabled"
                      checked={selectedTier.isPeriodEnabled}
                      onCheckedChange={(checked) => handleUpdateField('isPeriodEnabled', checked)}
                    />
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
