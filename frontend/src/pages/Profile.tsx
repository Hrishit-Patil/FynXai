import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Download,
  Trash2,
  Camera,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const [profile, setProfile] = useState({
    firstName: "Hrishit",
    lastName: "Patil",
    email: "hrishitpatil@email.com",
    phone: "+91 9876543210",
    avatar: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    applicationUpdates: true,
    securityAlerts: true,
  });

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleProfileUpdate = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Profile & Settings
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </motion.div>

        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName[0]}
                    {profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-muted-foreground">{profile.phone}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 glass rounded-lg">
                <h3 className="font-semibold">Credit Score</h3>
                <p className="text-2xl font-bold text-primary">720</p>
                <p className="text-sm text-muted-foreground">
                  Last updated: Today
                </p>
              </div>
              <div className="p-4 glass rounded-lg">
                <h3 className="font-semibold">Applications</h3>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Total submitted</p>
              </div>
              <div className="p-4 glass rounded-lg">
                <h3 className="font-semibold">Member Since</h3>
                <p className="text-2xl font-bold">2025</p>
                <p className="text-sm text-muted-foreground">January 15</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) =>
                          handleProfileUpdate("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) =>
                          handleProfileUpdate("lastName", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          handleProfileUpdate("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          handleProfileUpdate("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="hover-lift">Save Changes</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={() => handleNotificationToggle("email")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={() => handleNotificationToggle("sms")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Application Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified about loan application status changes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.applicationUpdates}
                      onCheckedChange={() =>
                        handleNotificationToggle("applicationUpdates")
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Security Alerts</h4>
                      <p className="text-sm text-muted-foreground">
                        Important security and account notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={() =>
                        handleNotificationToggle("securityAlerts")
                      }
                      disabled
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button className="hover-lift">Save Preferences</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Settings
                </h3>

                <div className="space-y-6">
                  <div className="p-4 glass rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Password</h4>
                        <p className="text-sm text-muted-foreground">
                          Last changed 3 months ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 glass rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Disabled</Badge>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Privacy & Data */}
            <TabsContent value="privacy">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  Data & Privacy
                </h3>

                <div className="space-y-6">
                  <div className="p-4 glass rounded-lg">
                    <h4 className="font-semibold mb-3">Data Export</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a copy of all your data including applications,
                      documents, and account information.
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download My Data
                    </Button>
                  </div>

                  <div className="p-4 glass rounded-lg">
                    <h4 className="font-semibold mb-3">Data Retention</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Application Data</span>
                        <span className="text-muted-foreground">
                          7 years (regulatory requirement)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Document Uploads</span>
                        <span className="text-muted-foreground">
                          7 years (encrypted storage)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activity Logs</span>
                        <span className="text-muted-foreground">2 years</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-red-200 rounded-lg">
                    <h4 className="font-semibold mb-3 text-red-600">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>

                    <Dialog
                      open={deleteAccountOpen}
                      onOpenChange={setDeleteAccountOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Request Account Deletion
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Are you sure you want to delete your account? This
                            will:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Permanently delete all your data</li>
                            <li>• Cancel any pending applications</li>
                            <li>• Remove access to all loan offers</li>
                            <li>• Cannot be undone after 30 days</li>
                          </ul>
                          <p className="text-sm font-semibold">
                            Type "DELETE" to confirm:
                          </p>
                          <Input placeholder="Type DELETE to confirm" />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteAccountOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button variant="destructive">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      🔒 All personal data is encrypted and used only for loan
                      evaluation purposes.
                    </p>
                    <p>
                      We comply with RBI guidelines and data protection
                      regulations.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
