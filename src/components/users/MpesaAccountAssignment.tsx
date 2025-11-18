import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Check } from "lucide-react";

interface MpesaAccount {
  id: string;
  account_name: string;
  account_number: string;
  account_type: string;
  is_active: boolean;
}

interface AssignedAccount {
  mpesa_account_id: string;
}

interface MpesaAccountAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  organizationId: string;
}

export const MpesaAccountAssignment = ({
  open,
  onOpenChange,
  userId,
  userName,
  organizationId,
}: MpesaAccountAssignmentProps) => {
  const [accounts, setAccounts] = useState<MpesaAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAccounts();
      fetchAssignedAccounts();
    }
  }, [open, organizationId, userId]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Fetch all MPESA accounts for the organization owner
      const { data: orgData } = await supabase
        .from('organizations')
        .select('owner_id')
        .eq('id', organizationId)
        .single();

      if (orgData) {
        const { data, error } = await supabase
          .from('mpesa_accounts')
          .select('*')
          .eq('user_id', orgData.owner_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAccounts(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load MPESA accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedAccounts = async () => {
    try {
      // For now, we'll store assigned accounts in a junction table
      // You may need to create this table via migration
      const { data, error } = await supabase
        .from('user_mpesa_accounts')
        .select('mpesa_account_id')
        .eq('user_id', userId);

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means table doesn't exist yet
        console.error('Error fetching assigned accounts:', error);
      }

      if (data) {
        setSelectedAccounts(new Set(data.map((a: AssignedAccount) => a.mpesa_account_id)));
      }
    } catch (error) {
      console.error('Error fetching assigned accounts:', error);
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => {
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
    setSaving(true);
    try {
      // First, delete existing assignments
      await supabase
        .from('user_mpesa_accounts')
        .delete()
        .eq('user_id', userId);

      // Then insert new assignments
      if (selectedAccounts.size > 0) {
        const assignments = Array.from(selectedAccounts).map(accountId => ({
          user_id: userId,
          mpesa_account_id: accountId,
        }));

        const { error } = await supabase
          .from('user_mpesa_accounts')
          .insert(assignments);

        if (error) throw error;
      }

      toast.success(`MPESA accounts assigned to ${userName}`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error assigning accounts:', error);
      toast.error(error.message || 'Failed to assign accounts');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Assign MPESA Accounts to {userName}
          </DialogTitle>
          <DialogDescription>
            Select which MPESA accounts this user can use for payment processing
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No MPESA accounts available</p>
            <p className="text-sm mt-1">Organization owner needs to add MPESA accounts first</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleAccount(account.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedAccounts.has(account.id)}
                      onCheckedChange={() => toggleAccount(account.id)}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{account.account_name}</span>
                        <Badge variant="outline">{account.account_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{account.account_number}</p>
                    </div>
                  </div>
                  {selectedAccounts.has(account.id) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedAccounts.size} account(s) selected
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Assignment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
