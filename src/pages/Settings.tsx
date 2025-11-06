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
import { useState } from "react";

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    marketing: false,
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated");
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+254 712 345 678" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business">Business Name</Label>
                  <Input id="business" defaultValue="Acme Stores Ltd" />
                </div>

                <Button onClick={handleSaveProfile}>Save Changes</Button>
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
                    <Label htmlFor="current-pin">Current PIN</Label>
                    <Input id="current-pin" type="password" placeholder="Enter current PIN" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pin">New PIN</Label>
                    <Input id="new-pin" type="password" placeholder="Enter new PIN" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                    <Input id="confirm-pin" type="password" placeholder="Confirm new PIN" />
                  </div>
                </div>

                <Button onClick={handleSaveSecurity}>Update PIN</Button>

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
