import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, Smartphone, CreditCard, Trash2, Wallet, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user, updatePassword, updateProfile, isSuperAdmin } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    marketing: false,
  });

  const [profileData, setProfileData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [mpesaAccounts, setMpesaAccounts] = useState<any[]>([]);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_number: '',
    account_type: 'till' as 'till' | 'paybill' | 'pochi',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone_number, email')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfileData({
            fullName: data.full_name || '',
            phoneNumber: data.phone_number || '',
            email: data.email || user.email || '',
          });
        }
      }
    };

    fetchProfile();
    fetchMpesaAccounts();
  }, [user]);

  const fetchMpesaAccounts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('mpesa_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setMpesaAccounts(data);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const { error } = await updateProfile(profileData.fullName, profileData.phoneNumber);
    setLoading(false);
    if (!error) {
      toast.success("Profile updated successfully");
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(passwordData.newPassword);
    setLoading(false);
    
    if (!error) {
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }
  };

  const handleAddMpesaAccount = async () => {
    if (!newAccount.account_name || !newAccount.account_number) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^\d{5,10}$/.test(newAccount.account_number)) {
      toast.error("Account number must be 5-10 digits");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('mpesa_accounts')
      .insert({
        user_id: user!.id,
        account_name: newAccount.account_name,
        account_number: newAccount.account_number,
        account_type: newAccount.account_type,
        is_active: true,
      });

    setLoading(false);

    if (error) {
      toast.error("Failed to add MPESA account");
      console.error(error);
      return;
    }

    toast.success("MPESA account added successfully");
    setShowAddAccountDialog(false);
    setNewAccount({ account_name: '', account_number: '', account_type: 'till' });
    fetchMpesaAccounts();
  };

  const handleToggleAccount = async (accountId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('mpesa_accounts')
      .update({ is_active: !currentStatus })
      .eq('id', accountId);

    if (error) {
      toast.error("Failed to update account status");
      return;
    }

    toast.success(currentStatus ? "Account deactivated" : "Account activated");
    fetchMpesaAccounts();
  };

  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          {isSuperAdmin && (
            <Badge variant="default" className="bg-primary text-primary-foreground">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="mpesa">MPESA</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=John Doe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    />
                  </div>

                  {isSuperAdmin && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <Badge variant="default" className="mb-2">Super Admin</Badge>
                      <p className="text-sm text-muted-foreground">
                        You have full access to the M-Leja Control Panel
                      </p>
                    </div>
                  )}
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Linked Accounts */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your payment methods and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Payment methods coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MPESA Accounts */}
          <TabsContent value="mpesa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Linked MPESA Accounts
                  {isSuperAdmin && (
                    <Badge variant="outline" className="ml-2">Unlimited Access</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isSuperAdmin 
                    ? "Super Admin: Full access to all MPESA features with no limits"
                    : "Manage your connected Till, Paybill, and Pochi la Biashara numbers"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mpesaAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MPESA accounts linked yet</p>
                    <p className="text-sm">Add your Till, Paybill, or Pochi la Biashara to get started</p>
                  </div>
                ) : (
                  mpesaAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{account.account_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {account.account_type.toUpperCase()}
                            </Badge>
                            <button
                              onClick={() => setShowCredentials({ ...showCredentials, [account.id]: !showCredentials[account.id] })}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              {showCredentials[account.id] ? (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  {account.account_number}
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" />
                                  ****{account.account_number.slice(-4)}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAccount(account.id, account.is_active)}
                        >
                          <Badge variant={account.is_active ? "default" : "outline"}>
                            {account.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                <Separator className="my-4" />

                <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New MPESA Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add MPESA Account</DialogTitle>
                      <DialogDescription>
                        Link your Till, Paybill, or Pochi la Biashara number
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="account_name">Account Name</Label>
                        <Input
                          id="account_name"
                          placeholder="e.g., Main Till, Branch Paybill"
                          value={newAccount.account_name}
                          onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_type">Account Type</Label>
                        <Select
                          value={newAccount.account_type}
                          onValueChange={(value: 'till' | 'paybill' | 'pochi') =>
                            setNewAccount({ ...newAccount, account_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="till">Till Number</SelectItem>
                            <SelectItem value="paybill">Paybill Number</SelectItem>
                            <SelectItem value="pochi">Pochi la Biashara</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_number">Account Number</Label>
                        <Input
                          id="account_number"
                          placeholder="e.g., 123456"
                          value={newAccount.account_number}
                          onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">5-10 digits</p>
                      </div>
                      <Button onClick={handleAddMpesaAccount} disabled={loading} className="w-full">
                        {loading ? "Adding..." : "Add Account"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive transaction alerts via email</p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, email: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notif">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive payment confirmations via SMS</p>
                    </div>
                    <Switch
                      id="sms-notif"
                      checked={notificationSettings.sms}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, sms: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notif">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive instant notifications in the app</p>
                    </div>
                    <Switch
                      id="push-notif"
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, push: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-notif">Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">Receive tips, updates, and promotional offers</p>
                    </div>
                    <Switch
                      id="marketing-notif"
                      checked={notificationSettings.marketing}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, marketing: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => toast.success("Notification preferences saved")}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSavePassword} disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>

                <Separator />

                <div>
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Active Devices
                  </h3>
                  <div className="space-y-3">
                    {[
                      { device: "iPhone 13 Pro", location: "Nairobi, Kenya", lastActive: "Currently active" },
                      { device: "Chrome on MacBook", location: "Nairobi, Kenya", lastActive: "2 days ago" },
                    ].map((device, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{device.device}</p>
                          <p className="text-sm text-muted-foreground">{device.location}</p>
                          <p className="text-xs text-muted-foreground">{device.lastActive}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-semibold text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
