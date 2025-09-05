import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  BarChart3,
  User,
  Calendar,
  MapPin,
  Coins,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Mock data
const applicants = [
  {
    id: "APP001",
    name: "Rahul Sharma",
    score: 675,
    loanAmount: 500000,
    status: "Under Review",
    lastActivity: "2025-01-15",
    region: "Mumbai",
    documents: ["Aadhaar", "PAN", "Bank Statement", "Salary Slip"],
    ocrData: {
      name: "Rahul Sharma",
      pan: "ABCDE1234F",
      income: 75000,
      employer: "Tech Corp",
      address: "Mumbai, Maharashtra",
    },
    shapData: [
      { feature: "Monthly Income", value: 32, type: "positive" },
      { feature: "Credit History", value: 28, type: "positive" },
      { feature: "Employment Stability", value: 15, type: "positive" },
      { feature: "Recent Inquiries", value: -12, type: "negative" },
      { feature: "Debt Ratio", value: -8, type: "negative" },
    ],
  },
  {
    id: "APP002",
    name: "Priya Patel",
    score: 720,
    loanAmount: 750000,
    status: "Pending",
    lastActivity: "2025-01-14",
    region: "Delhi",
    documents: ["Aadhaar", "PAN", "Bank Statement", "Form 16"],
    ocrData: {
      name: "Priya Patel",
      pan: "FGHIJ5678K",
      income: 95000,
      employer: "Finance Ltd",
      address: "New Delhi, Delhi",
    },
    shapData: [
      { feature: "Monthly Income", value: 45, type: "positive" },
      { feature: "Credit History", value: 35, type: "positive" },
      { feature: "Savings Balance", value: 22, type: "positive" },
      { feature: "Age Factor", value: -5, type: "negative" },
    ],
  },
];

export default function LoanOfficerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [comment, setComment] = useState("");

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (applicant) => {
    setSelectedApplicant(applicant);
    setIsApproveModalOpen(true);
  };

  const handleReject = (applicant) => {
    setSelectedApplicant(applicant);
    setIsRejectModalOpen(true);
  };

  const confirmApproval = () => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(
      `Application ${selectedApplicant?.id} approved successfully!`
    );
    setIsApproveModalOpen(false);
    setApprovalReason("");
  };

  const confirmRejection = () => {
    toast.error(`Application ${selectedApplicant?.id} rejected.`);
    setIsRejectModalOpen(false);
    setRejectionReason("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success text-success-foreground";
      case "Rejected":
        return "bg-destructive text-destructive-foreground";
      case "Under Review":
        return "bg-warning text-warning-foreground";
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
          <h1 className="text-3xl font-bold mb-2">Loan Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Review and process loan applications
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Approved Today
                  </p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Rejected Today
                  </p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Processing
                  </p>
                  <p className="text-2xl font-bold">2.5h</p>
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
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Pending", "Under Review", "Approved", "Rejected"].map(
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
                    <TableHead>Score</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredApplicants.map((applicant, index) => (
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
                            <p className="text-sm text-muted-foreground">
                              {applicant.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {applicant.score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ₹{applicant.loanAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(applicant.status)}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{applicant.lastActivity}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplicant(applicant)}
                            >
                              <Link to="/officer/application/:appId">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
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
