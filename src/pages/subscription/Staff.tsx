import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Mail, Users, UserCheck, Wallet } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AssignMpesaDialog } from "@/components/staff/AssignMpesaDialog";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function Staff() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignMpesaDialogOpen, setAssignMpesaDialogOpen] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "user"
  });

  useEffect(() => {
    fetchStaffAndInvitations();
  }, [user]);

  const fetchStaffAndInvitations = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      // Fetch staff members with better error handling
      const { data: staffData, error: staffError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone_number,
          created_at,
          user_roles!inner(role)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_rbac_user', true);

      if (staffError) {
        console.error('Staff fetch error:', staffError);
        throw staffError;
      }

      const formattedStaff = staffData?.map((member: any) => ({
        id: member.id,
        full_name: member.full_name,
        email: member.email || '',
        phone_number: member.phone_number,
        role: member.user_roles[0]?.role || 'user',
        created_at: member.created_at
      })) || [];

      setStaff(formattedStaff);

      // Fetch invitations with error handling
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.error('Invitations fetch error:', invitationsError);
        throw invitationsError;
      }
      
      setInvitations(invitationsData || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch staff data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStaff = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive"
        });
        return;
      }

      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('invitations')
        .insert({
          organization_id: profile.organization_id,
          email: formData.email,
          role: formData.role,
          invited_by: user.id,
          invitation_token: token,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully"
      });

      setDialogOpen(false);
      setFormData({ email: "", role: "user" });
      fetchStaffAndInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Staff & RBAC Management</h1>
            <p className="text-muted-foreground">Manage your team members and permissions</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Staff
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Active Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No staff members yet</p>
              ) : (
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.phone_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaffMember(member);
                            setAssignMpesaDialogOpen(true);
                          }}
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Assign M-Pesa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Pending Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending invitations</p>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">Role: {invitation.role}</p>
                      </div>
                      <Badge variant={invitation.status === 'pending' ? 'secondary' : 'default'}>
                        {invitation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="sales_agent">Sales Agent</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="assistant_manager">Assistant Manager</SelectItem>
                    <SelectItem value="senior_manager">Senior Manager</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="cfo">CFO</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="corporate_admin">Corporate Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInviteStaff} className="w-full">
                <UserCheck className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {selectedStaffMember && (
          <AssignMpesaDialog
            open={assignMpesaDialogOpen}
            onOpenChange={setAssignMpesaDialogOpen}
            staffMemberId={selectedStaffMember.id}
            staffMemberName={selectedStaffMember.full_name}
          />
        )}
      </div>
    </Layout>
  );
}
