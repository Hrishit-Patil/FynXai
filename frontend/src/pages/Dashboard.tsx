import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Mock data - in real app, fetch from API
  const applications = [
    {
      id: "app_001",
      amount: "₹5,00,000",
      status: "approved",
      score: 720,
      date: "2025-01-15",
      emi: "₹15,234",
    },
    {
      id: "app_002",
      amount: "₹2,50,000",
      status: "under_review",
      score: 650,
      date: "2025-01-20",
      emi: "₹7,890",
    },
    {
      id: "app_003",
      amount: "₹1,00,000",
      status: "pending",
      score: null,
      date: "2025-01-22",
      emi: null,
    },
    {
      id: "app_004",
      amount: "₹1,00,000",
      status: "error",
      score: null,
      date: "2025-01-25",
      emi: null,
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          variant: "default" as const,
          color: "text-success",
          icon: CheckCircle,
        };
      case "under_review":
        return {
          label: "Under Review",
          variant: "secondary" as const,
          color: "text-warning",
          icon: Clock,
        };
      case "pending":
        return {
          label: "Pending",
          variant: "outline" as const,
          color: "text-muted-foreground",
          icon: AlertCircle,
        };
      case "error":
        return {
          label: "Error",
          variant: "destructive" as const,
          color: "text-destructive",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          color: "text-muted-foreground",
          icon: AlertCircle,
        };
    }
  };

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
                Manage your loan applications and track your progress
              </p>
            </div>

            <Button className="hover-lift" asChild>
              <a href="/apply">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </a>
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
                    <p className="text-2xl font-bold">{applications.length}</p>
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
                  <div className="p-3 bg-success/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Approval Rate
                    </p>
                    <p className="text-2xl font-bold">95%</p>
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
                  <div className="p-3 bg-warning/10 rounded-full">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Processing
                    </p>
                    <p className="text-2xl font-bold">2 mins</p>
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
                      key={app.id}
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
                            <p className="font-medium">{app.id}</p>
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
                            {app.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover-lift"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                <Link to="/result/:appId">View</Link>
                              </Button>
                            )}
                            {app.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover-lift"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Report
                              </Button>
                            )}

                            {app.status === "error" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover-lift"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                <Link to="/documents/:appId">
                                  View Documents
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

              {applications.length === 0 && (
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
                    <a href="/apply">
                      <Plus className="mr-2 h-4 w-4" />
                      Apply for Loan
                    </a>
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
