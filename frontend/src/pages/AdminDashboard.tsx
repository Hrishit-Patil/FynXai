import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  UserPlus,
  Download,
  Upload,
  RotateCcw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

// Mock data
const systemMetrics = [
  { label: "Total Applications", value: 1250, icon: Users, change: "+15%" },
  { label: "Approval Rate", value: "78%", icon: CheckCircle, change: "+5%" },
  { label: "Avg Processing Time", value: "2.3h", icon: Clock, change: "-12%" },
  { label: "Active Officers", value: 24, icon: Users, change: "+2" },
];

const fairnessMetrics = [
  {
    group: "Gender",
    metric: "Male",
    value: 76,
    threshold: 75,
    status: "warning",
  },
  {
    group: "Gender",
    metric: "Female",
    value: 82,
    threshold: 75,
    status: "good",
  },
  {
    group: "Region",
    metric: "Urban",
    value: 79,
    threshold: 75,
    status: "good",
  },
  {
    group: "Region",
    metric: "Rural",
    value: 73,
    threshold: 75,
    status: "alert",
  },
  { group: "Age", metric: "18-35", value: 81, threshold: 75, status: "good" },
  { group: "Age", metric: "35-50", value: 77, threshold: 75, status: "good" },
  { group: "Age", metric: "50+", value: 71, threshold: 75, status: "alert" },
];

const modelVersions = [
  {
    version: "v2.3.1",
    status: "deployed",
    deployedAt: "2025-01-10",
    accuracy: 0.92,
  },
  {
    version: "v2.2.8",
    status: "archived",
    deployedAt: "2023-12-15",
    accuracy: 0.89,
  },
  {
    version: "v2.4.0-beta",
    status: "testing",
    deployedAt: null,
    accuracy: 0.94,
  },
];

const auditLogs = [
  {
    time: "2025-01-15 14:30",
    user: "admin@fynxai.com",
    action: "Model deployed: v2.3.1",
    type: "deploy",
  },
  {
    time: "2025-01-15 12:15",
    user: "officer@fynxai.com",
    action: "Application APP001 approved",
    type: "approval",
  },
  {
    time: "2025-01-15 10:45",
    user: "admin@fynxai.com",
    action: "User created: newuser@fynxai.com",
    type: "user",
  },
  {
    time: "2025-01-14 16:20",
    user: "admin@fynxai.com",
    action: "Fairness alert: Rural approval rate below threshold",
    type: "alert",
  },
];

const officers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@fynxai.com",
    role: "Senior Officer",
    applicationsHandled: 45,
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@fynxai.com",
    role: "Officer",
    applicationsHandled: 32,
  },
  {
    id: 3,
    name: "Priya Singh",
    email: "priya@fynxai.com",
    role: "Officer",
    applicationsHandled: 38,
  },
];

const applicationsByRegion = [
  { name: "Mumbai", value: 320 },
  { name: "Delhi", value: 280 },
  { name: "Bangalore", value: 260 },
  { name: "Chennai", value: 190 },
  { name: "Kolkata", value: 150 },
  { name: "Others", value: 50 },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function AdminDashboard() {
  const [selectedModel, setSelectedModel] = useState("v2.3.1");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [selectedFairnessMetric, setSelectedFairnessMetric] = useState(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Officer");

  const handleModelDeploy = () => {
    toast.success(`Model ${selectedModel} deployed successfully!`);
    setIsDeployModalOpen(false);
  };

  const handleModelRollback = () => {
    toast.warning("Model rolled back to previous version");
  };

  const handleAddUser = () => {
    toast.success(`User ${newUserName} created successfully!`);
    setIsAddUserModalOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Officer");
  };

  const getFairnessColor = (status) => {
    switch (status) {
      case "good":
        return "text-success";
      case "warning":
        return "text-warning";
      case "alert":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getFairnessBadge = (status) => {
    switch (status) {
      case "good":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "alert":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </motion.div>

        {/* System Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {systemMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {metric.label}
                        </p>
                        <motion.p
                          className="text-2xl font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1 + 0.2,
                          }}
                        >
                          {metric.value}
                        </motion.p>
                        <p className="text-xs text-success">{metric.change}</p>
                      </div>
                      <IconComponent className="h-8 w-8 text-primary opacity-60" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fairness & Bias Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Fairness & Bias Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fairnessMetrics.map((metric, index) => (
                    <motion.div
                      key={`${metric.group}-${metric.metric}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedFairnessMetric(metric);
                        setIsDrilldownOpen(true);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <p className="font-medium">
                          {metric.group} - {metric.metric}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Approval Rate: {metric.value}%
                        </p>
                      </div>
                      <Badge className={getFairnessBadge(metric.status)}>
                        {metric.status === "good"
                          ? "Good"
                          : metric.status === "warning"
                          ? "Warning"
                          : "Alert"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-6">
              {/* Applications by Region Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationsByRegion}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {applicationsByRegion.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {/* Model Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Model Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Model Version</Label>
                      <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {modelVersions.map((version) => (
                            <SelectItem
                              key={version.version}
                              value={version.version}
                            >
                              {version.version} - {version.status} (
                              {version.accuracy}% accuracy)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog
                        open={isDeployModalOpen}
                        onOpenChange={setIsDeployModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="flex-1">
                            <Upload className="h-4 w-4 mr-2" />
                            Deploy Model
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Deploy Model</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>
                              Are you sure you want to deploy model{" "}
                              {selectedModel}?
                            </p>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsDeployModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleModelDeploy}>
                                Confirm Deploy
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleModelRollback}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rollback
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </div>
                  <Dialog
                    open={isAddUserModalOpen}
                    onOpenChange={setIsAddUserModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select
                            value={newUserRole}
                            onValueChange={setNewUserRole}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Officer">
                                Loan Officer
                              </SelectItem>
                              <SelectItem value="Senior Officer">
                                Senior Loan Officer
                              </SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddUserModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddUser}
                            disabled={!newUserName || !newUserEmail}
                          >
                            Create User
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {officers.map((officer) => (
                    <div
                      key={officer.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font mysteries-sans">{officer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {officer.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {officer.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {officer.applicationsHandled}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applications
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Audit Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div>
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {log.time}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {log.type}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fairness Drilldown Modal */}
        <Dialog open={isDrilldownOpen} onOpenChange={setIsDrilldownOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Fairness Analysis: {selectedFairnessMetric?.group} -{" "}
                {selectedFairnessMetric?.metric}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Approval Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {selectedFairnessMetric?.value}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Threshold</p>
                  <p className="text-2xl font-bold">
                    {selectedFairnessMetric?.threshold}%
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Impacted Applicants</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded border">
                    <span>Rajesh Kumar</span>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <div className="flex justify-between p-2 rounded border">
                    <span>Anjali Sharma</span>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <div className="flex justify-between p-2 rounded border">
                    <span>Vikram Singh</span>
                    <Badge className="bg-warning text-warning-foreground">
                      Under Review
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Suggested Actions</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Review model bias for rural applicants</li>
                  <li>• Consider additional features for fair assessment</li>
                  <li>• Schedule bias audit with ML team</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
