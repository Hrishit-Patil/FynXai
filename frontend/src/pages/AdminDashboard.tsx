import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  UserPlus,
  Upload,
  RotateCcw,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";

// Mock data
const modelVersions = [
  { version: "v2.3.1", status: "deployed", deployedAt: "2025-01-10", accuracy: 0.92 },
  { version: "v2.2.8", status: "archived", deployedAt: "2023-12-15", accuracy: 0.89 },
  { version: "v2.4.0-beta", status: "testing", deployedAt: null, accuracy: 0.94 },
];

const auditLogs = [
  { time: "2025-01-15 14:30", user: "admin@fynxai.com", action: "Model deployed: v2.3.1", type: "deploy" },
  { time: "2025-01-15 12:15", user: "officer@fynxai.com", action: "Application APP001 approved", type: "approval" },
  { time: "2025-01-15 10:45", user: "admin@fynxai.com", action: "User created: newuser@fynxai.com", type: "user" },
  { time: "2025-01-14 16:20", user: "admin@fynxai.com", action: "Fairness alert: Rural approval rate below threshold", type: "alert" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("v2.3.1");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  // User Management States
  const [officersList, setOfficersList] = useState<any[]>([]);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState("Officer");

  // Dynamic State for Top Metrics
  const [dynamicMetrics, setDynamicMetrics] = useState([
    { label: "Total Applications", value: "--", icon: Users, change: "Live" },
    { label: "Approval Rate", value: "--", icon: CheckCircle, change: "Live" },
    { label: "Avg Processing Time", value: "--", icon: Clock, change: "Live" },
    { label: "Active Officers", value: "--", icon: Users, change: "Live" },
  ]);

  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchAdminStats();
    fetchLoans();
    fetchOfficers();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setDynamicMetrics([
          { label: "Total Applications", value: data.totalApplications, icon: Users, change: "Live" },
          { label: "Approval Rate", value: data.approvalRate, icon: CheckCircle, change: "Live" },
          { label: "Avg Processing Time", value: data.avgProcessingTime, icon: Clock, change: "Live" },
          { label: "Active Officers", value: data.activeOfficers, icon: Users, change: "Live" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
      toast.error("Failed to load live metrics.");
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        const formattedData = data.map((loan: any) => {
            const decision = loan.officer_decision?.toLowerCase();
            const processStatus = loan.loan_status?.toLowerCase();
            let displayStatus = 'pending';
            
            if (decision === 'approved' || decision === 'rejected') {
                displayStatus = decision;
            } else if (processStatus === 'under_review' || processStatus === 'submitted') {
                displayStatus = 'under_review';
            }

            return {
                id: loan.application_id || loan.id || '',
                name: `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Unknown Applicant',
                score: loan.credit_score, 
                loanAmount: loan.loan_amount || 0,
                status: displayStatus,
                modelStatus: loan.loan_status || "pending",
                lastActivity: loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A',
            };
        });
        setApplicants(formattedData);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['Officer', 'Admin', 'Applicant'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOfficersList(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      toast.loading("Creating user...");
      const response = await fetch('http://127.0.0.1:8000/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newFirstName,
          last_name: newLastName,
          email: newUserEmail,
          phone_number: newUserPhone,
          role: newUserRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create user");
      }

      toast.dismiss();
      toast.success(`User ${newFirstName} created! (Password: Password123!)`);
      setIsAddUserModalOpen(false);
      
      setNewFirstName(""); setNewLastName(""); setNewUserEmail(""); setNewUserPhone(""); setNewUserRole("Officer");
      fetchOfficers();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Email might already be registered.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      toast.loading("Deleting user completely...");
      const response = await fetch(`http://127.0.0.1:8000/admin/delete-user/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.dismiss();
      toast.success("User deleted from the system successfully!");
      fetchOfficers();
    } catch (error: any) {
      toast.dismiss();
      toast.error("Failed to delete user.");
    }
  };

  const handleModelDeploy = () => {
    toast.success(`Model ${selectedModel} deployed successfully!`);
    setIsDeployModalOpen(false);
  };

  const handleModelRollback = () => {
    toast.warning("Model rolled back to previous version");
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      (applicant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(applicant.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const filterKey = statusFilter.toLowerCase().replace(' ', '_'); 
    const matchesStatus =
      statusFilter === "All" || 
      (applicant.status || '').toLowerCase() === filterKey || 
      (filterKey === 'under_review' && applicant.status === 'under_review');
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800 border-green-200"; 
      case "rejected": return "bg-red-100 text-red-800 border-red-200"; 
      case "under_review": case "under review": return "bg-yellow-100 text-yellow-800 border-yellow-200"; 
      case "pending": default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  if (loading && dynamicMetrics[0].value === "--") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </motion.div>

        {/* System Metrics */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {dynamicMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div key={metric.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <motion.p className="text-2xl font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}>
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

        {/* Filters for Loan Applications */}
        <motion.div className="flex flex-col sm:flex-row gap-4 mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applications by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {["All", "Pending", "Under Review", "Approved", "Rejected"].map((status) => (
                <Button key={status} variant={statusFilter === status ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(status)}>
                  {status}
                </Button>
            ))}
          </div>
        </motion.div>

        {/* Loan Applications Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle>System Loan Applications</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Officer Decision</TableHead>
                    <TableHead>Applied Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {loading ? (
                       <TableRow>
                         <TableCell colSpan={5} className="text-center py-12">
                           <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                           <p className="text-sm text-muted-foreground mt-2">Loading records...</p>
                         </TableCell>
                       </TableRow>
                    ) : filteredApplicants.length > 0 ? (
                      filteredApplicants.map((applicant, index) => (
                        <motion.tr key={applicant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">ID: {applicant.id ? String(applicant.id).slice(0, 8) : '...'}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {applicant.score ? <Badge variant="outline" className="font-mono">{applicant.score}</Badge> : <span className="text-muted-foreground text-sm italic">Pending AI</span>}
                          </TableCell>
                          <TableCell>₹{Number(applicant.loanAmount).toLocaleString('en-IN')}</TableCell>
                          <TableCell><Badge className={getStatusColor(applicant.status)} variant="outline">{(applicant.status || 'pending').replace('_', ' ').toUpperCase()}</Badge></TableCell>
                          <TableCell>{applicant.lastActivity}</TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <p>No applications found.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
          {/* User Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </div>
                  <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm"><UserPlus className="h-4 w-4 mr-2" /> Add User</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="First name" />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Last name" />
                          </div>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Enter email address" />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input type="tel" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} placeholder="Enter phone number" />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select value={newUserRole} onValueChange={setNewUserRole}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Officer">Loan Officer</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddUser} disabled={!newFirstName || !newLastName || !newUserEmail}>Create User</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {officersList.length > 0 ? (
                    officersList.map((officer) => (
                      <div 
                        key={officer.id} 
                        // UPDATED: HIGHLIGHT USERS WHO REQUESTED DELETION
                        className={`flex items-center justify-between p-3 rounded-lg border group ${officer.deletion_requested ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                              <p className="font-medium">{officer.first_name} {officer.last_name}</p>
                              {officer.deletion_requested && (
                                <Badge variant="destructive" className="h-5 text-[10px] uppercase animate-pulse">
                                  Deletion Requested
                                </Badge>
                              )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {officer.email} {officer.phone_number ? `• ${officer.phone_number}` : ''}
                          </p>
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-[10px] uppercase">{officer.role}</Badge>
                          </div>
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteUser(officer.id)}
                            title="Remove User & All Data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">No officers or admins found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Audit Logs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle>Recent Audit Logs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <motion.div key={index} className="flex items-center justify-between p-3 rounded-lg border" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                    <div>
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                      <Badge variant="outline" className="text-xs">{log.type}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center space-x-2"><Settings className="h-5 w-5" /><span>Model Management</span></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Model Version</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {modelVersions.map((version) => (
                        <SelectItem key={version.version} value={version.version}>
                          {version.version} - {version.status} ({version.accuracy}% accuracy)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={isDeployModalOpen} onOpenChange={setIsDeployModalOpen}>
                    <DialogTrigger asChild><Button className="flex-1"><Upload className="h-4 w-4 mr-2" />Deploy Model</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Deploy Model</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <p>Are you sure you want to deploy model {selectedModel}?</p>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsDeployModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleModelDeploy}>Confirm Deploy</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" className="flex-1" onClick={handleModelRollback}><RotateCcw className="h-4 w-4 mr-2" />Rollback</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}