import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AssignMpesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMemberId: string;
  staffMemberName: string;
}

interface MpesaAccount {
  id: string;
  account_name: string;
  account_number: string;
  account_type: string;
  is_active: boolean;
}

export function AssignMpesaDialog({ open, onOpenChange, staffMemberId, staffMemberName }: AssignMpesaDialogProps) {
  const [mpesaAccounts, setMpesaAccounts] = useState<MpesaAccount[]>([]);
  const [assignedAccounts, setAssignedAccounts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMpesaAccounts();
      fetchAssignedAccounts();
    }
  }, [open, staffMemberId]);

  const fetchMpesaAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('mpesa_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch M-Pesa accounts');
      return;
    }

    setMpesaAccounts(data || []);
  };

  const fetchAssignedAccounts = async () => {
    const { data, error } = await supabase
      .from('user_mpesa_accounts')
      .select('mpesa_account_id')
      .eq('user_id', staffMemberId);

    if (error) {
      toast.error('Failed to fetch assigned accounts');
      return;
    }

    setAssignedAccounts(new Set(data?.map(a => a.mpesa_account_id) || []));
  };

  const handleToggleAccount = (accountId: string) => {
    setAssignedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);

    try {
      // Delete all existing assignments
      await supabase
        .from('user_mpesa_accounts')
        .delete()
        .eq('user_id', staffMemberId);

      // Insert new assignments
      if (assignedAccounts.size > 0) {
        const assignments = Array.from(assignedAccounts).map(accountId => ({
          user_id: staffMemberId,
          mpesa_account_id: accountId,
          assigned_by: user.id,
        }));

        const { error } = await supabase
          .from('user_mpesa_accounts')
          .insert(assignments);

        if (error) throw error;
      }

      toast.success('M-Pesa accounts assigned successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to assign M-Pesa accounts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign M-Pesa Accounts</DialogTitle>
          <DialogDescription>
            Select which M-Pesa accounts {staffMemberName} can access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mpesaAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No M-Pesa accounts found. Add accounts in Settings first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mpesaAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={assignedAccounts.has(account.id)}
                      onCheckedChange={() => handleToggleAccount(account.id)}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="font-medium">{account.account_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-muted-foreground">
                          {account.account_number}
                        </code>
                        <Badge variant="secondary" className="text-xs">
                          {account.account_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || mpesaAccounts.length === 0}>
            {loading ? 'Saving...' : 'Save Assignments'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
