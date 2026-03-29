import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  FileText,
  Eye,
  Download,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabaseClient";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approvalRate: 0,
    avgProcessing: "2 mins",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user, stop loading and return (Prevents crash if logged out)
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUser(user);

      // 2. Fetch Loans
      const { data: loanData, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (loanData && loanData.length > 0) {
        // 3. Transform Data for UI
        const formattedApps = loanData.map((loan: any) => {
          
          const P = Number(loan.loan_amount) || 0;
          const N = Number(loan.loan_tenure) || 0;
          let emiVal = 0;

          if (P > 0 && N > 0) {
            const R = 10.5 / 12 / 100; 
            try {
              const numerator = P * R * Math.pow(1 + R, N);
              const denominator = Math.pow(1 + R, N) - 1;
              if (denominator !== 0) {
                emiVal = numerator / denominator;
              }
            } catch (e) {
              console.warn("EMI Calc error", e);
            }
          }

          // --- NAME GENERATION LOGIC ---
          const displayName = `${loan.first_name || 'User'}_${loan.loan_purpose || 'Loan'}`;

          // --- STATUS LOGIC ---
          const decision = loan.officer_decision?.toLowerCase();
          const processStatus = loan.loan_status?.toLowerCase();
          
          let displayStatus = 'pending';

          // Priority 1: Officer Decision
          if (decision === 'approved' || decision === 'rejected') {
             displayStatus = decision;
          } 
          // Priority 2: Submitted / Under Review
          else if (processStatus === 'under_review' || processStatus === 'submitted') {
             displayStatus = 'under_review';
          }
          // Priority 3: Default Pending

          return {
            id: loan.application_id || loan.id,
            appName: displayName,
            amount: `₹${P.toLocaleString('en-IN')}`,
            
            // Updated Status
            status: displayStatus,
            
            score: loan.credit_score,
            date: loan.created_at || new Date().toISOString(),
            emi: `₹${Math.round(emiVal).toLocaleString('en-IN')}`,
            rawStatus: loan.loan_status?.toLowerCase() || 'pending'
          };
        });

        setApplications(formattedApps);

        // 4. Calculate Stats
        const total = formattedApps.length;
        const approved = formattedApps.filter((a: any) => a.status === 'approved').length;
        const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

        setStats(prev => ({
          ...prev,
          total,
          approvalRate: rate
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          variant: "default" as const,
          color: "text-green-600",
          icon: CheckCircle,
        };
      case "under_review":
      case "submitted":
        return {
          label: "Under Review",
          variant: "secondary" as const,
          color: "text-yellow-600",
          icon: Clock,
        };
      case "pending":
        return {
          label: "Pending",
          variant: "outline" as const,
          color: "text-blue-600",
          icon: Clock,
        };
      case "rejected":
        return {
          label: "Rejected",
          variant: "destructive" as const,
          color: "text-red-600",
          icon: XCircle,
        };
      case "error":
        return {
          label: "Error",
          variant: "destructive" as const,
          color: "text-red-600",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          color: "text-muted-foreground",
          icon: AlertCircle,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.first_name || user?.email || "Applicant"}
              </p>
            </div>

            <Button className="hover-lift" asChild>
              <Link to="/apply">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Approval Rate
                    </p>
                    <p className="text-2xl font-bold">{stats.approvalRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Processing
                    </p>
                    <p className="text-2xl font-bold">{stats.avgProcessing}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>
                Track the status and details of all your loan applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app, index) => {
                  const statusConfig = getStatusConfig(app.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={app.id || index}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="font-medium text-sm md:text-base">
                              {app.appName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Applied on{" "}
                              {new Date(app.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Amount
                            </p>
                            <p className="font-semibold">{app.amount}</p>
                          </div>

                          {app.score && (
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                Credit Score
                              </p>
                              <p className="font-semibold text-primary">
                                {app.score}
                              </p>
                            </div>
                          )}

                          {app.emi && (
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                EMI
                              </p>
                              <p className="font-semibold">{app.emi}</p>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <StatusIcon
                              className={`h-4 w-4 ${statusConfig.color}`}
                            />
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <div className="flex space-x-2">
                            {(app.status === "approved" || app.status === "rejected") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover-lift"
                                asChild
                              >
                                <Link to={`/result/${app.id}`}>View</Link>
                              </Button>
                            )}
                            
                            {/* Docs Link */}
                            {app.id && (
                                <Button
                                size="sm"
                                variant="outline"
                                className="hover-lift"
                                asChild
                                >
                                <Link to={`/documents/${app.id}`}>
                                    Docs
                                </Link>
                                </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {app.status === "under_review" && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Processing Progress
                            </span>
                            <span className="text-sm font-medium">75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Documents verified • Credit analysis in progress
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {!loading && applications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No applications yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by applying for your first loan with complete
                    transparency
                  </p>
                  <Button asChild>
                    <Link to="/apply">
                      <Plus className="mr-2 h-4 w-4" />
                      Apply for Loan
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}