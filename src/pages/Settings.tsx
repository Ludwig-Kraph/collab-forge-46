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
import { User, Bell, Shield, Smartphone, CreditCard, Trash2 } from "lucide-react";
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
  }, [user]);

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

  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
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
                  Linked MPESA Accounts
                </CardTitle>
                <CardDescription>Manage your connected Till, Paybill, and Pochi la Biashara numbers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: "Till Number", number: "****5678", status: "active", primary: true },
                  { type: "Paybill", number: "****1234", status: "active", primary: false },
                  { type: "Pochi la Biashara", number: "****9012", status: "inactive", primary: false },
                ].map((account, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{account.type}</p>
                          {account.primary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.status === "active" ? "default" : "outline"}>
                        {account.status}
                      </Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                <Button variant="outline" className="w-full">
                  + Add New Account
                </Button>
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
