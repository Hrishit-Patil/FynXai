import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";

export default function LoanOfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Stats State
  const [stats, setStats] = useState({
    underReview: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // --- 1. Fetch Data from Database ---
  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB fields to UI expected format
        const formattedData = data.map((loan: any) => {
            
            // --- STATUS LOGIC START ---
            const decision = loan.officer_decision?.toLowerCase();
            const processStatus = loan.loan_status?.toLowerCase();
            
            let displayStatus = 'pending';
            
            // 1. Officer Decision takes precedence
            if (decision === 'approved' || decision === 'rejected') {
                displayStatus = decision;
            } 
            // 2. If no decision, check if user submitted (Under Review)
            else if (processStatus === 'under_review' || processStatus === 'submitted') {
                displayStatus = 'under_review';
            }
            // 3. Otherwise stays pending (e.g. draft)
            // --- STATUS LOGIC END ---

            return {
                id: loan.application_id || loan.id,
                name: `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Unknown Applicant',
                score: loan.credit_score, 
                loanAmount: loan.loan_amount || 0,
                
                status: displayStatus,
                
                modelStatus: loan.loan_status || "pending",
                lastActivity: loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A',
            };
        });

        setApplicants(formattedData);

        // Calculate Stats
        const total = data.length;
        const approved = formattedData.filter(d => d.status === 'approved').length;
        const rejected = formattedData.filter(d => d.status === 'rejected').length;
        const underReview = formattedData.filter(d => d.status === 'under_review').length;
        const pending = formattedData.filter(d => d.status === 'pending').length;

        setStats({
          pending,
          underReview,
          approved,
          rejected,
          total
        });
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Filter Logic ---
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalize filter string for comparison
    const filterKey = statusFilter.toLowerCase().replace(' ', '_'); 
    
    const matchesStatus =
      statusFilter === "All" || 
      applicant.status.toLowerCase() === filterKey || 
      (filterKey === 'under_review' && applicant.status === 'under_review');
      
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"; 
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"; 
      case "under_review":
      case "under review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"; 
      case "pending":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  if (loading) {
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Loan Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Review and process loan applications
          </p>
        </motion.div>

        {/* Stats Cards (Dynamic) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Under Review
                  </p>
                  <p className="text-2xl font-bold">{stats.underReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Approved
                  </p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Rejected
                  </p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
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

        {/* Filters */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Under Review", "Approved", "Rejected"].map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              )
            )}
          </div>
        </motion.div>

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Officer Decision</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredApplicants.length > 0 ? (
                      filteredApplicants.map((applicant, index) => (
                        <motion.tr
                          key={applicant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                ID: {applicant.id ? applicant.id.slice(0, 8) : '...'}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {applicant.score ? (
                              <Badge variant="outline" className="font-mono">
                                {applicant.score}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Pending AI</span>
                            )}
                          </TableCell>
                          <TableCell>
                            ₹{Number(applicant.loanAmount).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(applicant.status)} variant="outline">
                              {applicant.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{applicant.lastActivity}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:bg-primary/10 hover:text-primary"
                                asChild
                              >
                                <Link to={`/officer/application/${applicant.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No applications found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}