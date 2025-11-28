import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { Plus, X, Zap, Users, Building2, Crown, Landmark, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ICON_OPTIONS = [
  { value: 'Zap', label: 'Lightning', icon: Zap },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Building2', label: 'Building', icon: Building2 },
  { value: 'Crown', label: 'Crown', icon: Crown },
  { value: 'Landmark', label: 'Landmark', icon: Landmark },
  { value: 'DollarSign', label: 'Dollar', icon: DollarSign },
];

const AVAILABLE_FEATURES = [
  'Multi-Outlet Management',
  'Basic Analytics',
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
  'Transaction History',
  'Receipt Generation',
  'Team Collaboration',
  'Audit Logs',
  'Security Features',
  'Mobile App Access',
  'Offline Mode',
];

interface CreateTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTierDialog({ open, onOpenChange, onSuccess }: CreateTierDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tierData, setTierData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'KES',
    period: 'monthly',
    max_users: 1,
    max_stk_pushes: null as number | null,
    icon_name: 'Building2',
    is_active: true,
    is_period_enabled: true,
  });
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const availableFeatures = AVAILABLE_FEATURES.filter(
    feature => !features.includes(feature)
  );

  const handleAddFeature = () => {
    if (selectedFeature && !features.includes(selectedFeature)) {
      setFeatures([...features, selectedFeature]);
      setSelectedFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!tierData.name || !tierData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (features.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('subscription_tiers')
      .insert({
        ...tierData,
        features: features,
      });

    setLoading(false);

    if (error) {
      toast.error('Failed to create subscription tier');
      console.error(error);
      return;
    }

    toast.success('Subscription tier created successfully');
    onSuccess();
    onOpenChange(false);
    
    // Reset form
    setTierData({
      name: '',
      description: '',
      price: 0,
      currency: 'KES',
      period: 'monthly',
      max_users: 1,
      max_stk_pushes: null,
      icon_name: 'Building2',
      is_active: true,
      is_period_enabled: true,
    });
    setFeatures([]);
    setSelectedFeature('');
  };

  const SelectedIcon = ICON_OPTIONS.find(opt => opt.value === tierData.icon_name)?.icon || Building2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Subscription Tier</DialogTitle>
          <DialogDescription>
            Add a new subscription tier with custom pricing and features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Tier Name" required>
              <Input
                value={tierData.name}
                onChange={(e) => setTierData({ ...tierData, name: e.target.value })}
                placeholder="e.g., Professional"
              />
            </FormField>

            <FormField label="Icon" required>
              <Select
                value={tierData.icon_name}
                onValueChange={(value) => setTierData({ ...tierData, icon_name: value })}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <SelectedIcon className="h-4 w-4" />
                    <span>{ICON_OPTIONS.find(opt => opt.value === tierData.icon_name)?.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Description" required>
            <Textarea
              value={tierData.description}
              onChange={(e) => setTierData({ ...tierData, description: e.target.value })}
              placeholder="Describe this subscription tier"
              rows={3}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Price" required>
              <Input
                type="number"
                value={tierData.price}
                onChange={(e) => setTierData({ ...tierData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </FormField>

            <FormField label="Currency" required>
              <Select
                value={tierData.currency}
                onValueChange={(value) => setTierData({ ...tierData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Subscription Period" required>
              <Select
                value={tierData.period}
                onValueChange={(value) => setTierData({ ...tierData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Max Users" required>
              <Input
                type="number"
                value={tierData.max_users}
                onChange={(e) => setTierData({ ...tierData, max_users: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </FormField>

            <FormField label="Max STK Pushes" hint="Leave empty for unlimited">
              <Input
                type="number"
                value={tierData.max_stk_pushes || ''}
                onChange={(e) => setTierData({ 
                  ...tierData, 
                  max_stk_pushes: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="Unlimited"
              />
            </FormField>
          </div>

          <div className="space-y-3">
            <Label>Features</Label>
            
            {/* Selected Features List */}
            {features.length > 0 && (
              <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 bg-background rounded-md p-2">
                    <span className="text-sm">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Feature Selection Dropdown */}
            <div className="flex gap-2">
              <Select
                value={selectedFeature}
                onValueChange={setSelectedFeature}
                disabled={availableFeatures.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={availableFeatures.length === 0 ? "All features added" : "Select a feature to add"} />
                </SelectTrigger>
                <SelectContent>
                  {availableFeatures.map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddFeature}
                disabled={!selectedFeature || availableFeatures.length === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={tierData.is_period_enabled}
                onCheckedChange={(checked) => setTierData({ ...tierData, is_period_enabled: checked })}
              />
              <Label>Enable Period Selection for Users</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={tierData.is_active}
                onCheckedChange={(checked) => setTierData({ ...tierData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Tier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
