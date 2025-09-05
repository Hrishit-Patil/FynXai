import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  User,
  CreditCard,
  Building2,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ApplicationTimeline,
  getApplicationTimeline,
} from "@/components/ui/ApplicationTimeline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockApplication = {
  id: "APP001",
  applicant: {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    pan: "ABCDE****F",
    aadhaar: "****-****-5678",
    address: "Mumbai, Maharashtra",
    employment: "Software Engineer",
    employer: "Tech Solutions Pvt Ltd",
    experience: "5 years",
    salary: 85000,
  },
  loan: {
    amount: 1500000,
    tenure: 240, // months
    purpose: "Home Purchase",
    emi: 11230,
  },
  documents: [
    { type: "PAN Card", status: "verified", confidence: 0.98, url: "#" },
    { type: "Aadhaar Card", status: "verified", confidence: 0.95, url: "#" },
    { type: "Bank Statement", status: "verified", confidence: 0.92, url: "#" },
    {
      type: "Salary Slips",
      status: "needs_review",
      confidence: 0.78,
      url: "#",
    },
  ],
  ocrData: {
    name: { value: "Rahul Sharma", confidence: 0.98, verified: true },
    pan: { value: "ABCDE1234F", confidence: 0.97, verified: true },
    salary: { value: "85000", confidence: 0.78, verified: false },
    employer: {
      value: "Tech Solutions Pvt Ltd",
      confidence: 0.85,
      verified: true,
    },
    bankBalance: { value: "125000", confidence: 0.92, verified: true },
  },
  creditScore: {
    score: 720,
    recommendation: "approved",
    explanation:
      "Strong payment history and stable income with moderate credit utilization.",
    shapData: [
      { feature: "Payment History", impact: 45, value: "Excellent" },
      { feature: "Credit Utilization", impact: 35, value: "35%" },
      { feature: "Length of Credit", impact: 25, value: "3 years" },
      { feature: "Income Stability", impact: 40, value: "High" },
      { feature: "Debt-to-Income", impact: -15, value: "28%" },
      { feature: "Recent Inquiries", impact: -10, value: "2 recent" },
    ],
    limeExplanation: [
      "High salary (₹85,000) contributes positively to approval likelihood",
      "Consistent bank deposits show income stability",
      "Low credit utilization (35%) is favorable",
      "Recent credit inquiries slightly reduce score",
    ],
  },
  status: "officer_action",
  officerComments: [],
  submittedAt: "2025-01-15T10:30:00Z",
  lastUpdated: "2025-01-16T14:20:00Z",
};

export default function ApplicationDetail() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState(mockApplication);
  const [comment, setComment] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleApprove = () => {
    if (!approvalReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for approval.",
        variant: "destructive",
      });
      return;
    }

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast({
      title: "Application Approved! 🎉",
      description: "The applicant will be notified of the approval.",
    });

    setIsApproveModalOpen(false);
    setApprovalReason("");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Application Rejected",
      description:
        "The applicant will be notified with improvement suggestions.",
    });

    setIsRejectModalOpen(false);
    setRejectionReason("");
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      text: comment,
      author: "Current Officer",
      timestamp: new Date().toISOString(),
    };

    setApplication((prev) => ({
      ...prev,
      officerComments: [...prev.officerComments, newComment],
    }));

    setComment("");
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the application.",
    });
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = (field: string) => {
    // Update the OCR data
    setApplication((prev) => ({
      ...prev,
      ocrData: {
        ...prev.ocrData,
        [field]: {
          ...prev.ocrData[field as keyof typeof prev.ocrData],
          value: editValue,
          verified: true,
        },
      },
    }));

    setEditingField(null);
    setEditValue("");

    toast({
      title: "Field Updated",
      description: `${field} has been updated and marked as verified.`,
    });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-success";
    if (score >= 650) return "text-warning";
    return "text-destructive";
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "approved":
        return (
          <Badge className="bg-success text-success-foreground">
            Recommended for Approval
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Not Recommended</Badge>;
      default:
        return <Badge variant="secondary">Needs Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/officer")}
              className="hover-lift"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Application Review</h1>
              <p className="text-muted-foreground">
                Application ID: {application.id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Application Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationTimeline
              stages={getApplicationTimeline(application.status, "officer")}
              vertical={false}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="applicant" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="applicant">Applicant Info</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="scoring">AI Scoring</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              {/* Applicant Information */}
              <TabsContent value="applicant">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Name</Label>
                          <p className="text-sm text-muted-foreground">
                            {application.applicant.name}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <p className="text-sm text-muted-foreground">
                            {application.applicant.email}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <p className="text-sm text-muted-foreground">
                            {application.applicant.phone}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">PAN</Label>
                          <p className="text-sm text-muted-foreground">
                            {application.applicant.pan}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Loan Request
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Amount</Label>
                          <p className="text-lg font-semibold">
                            ₹{application.loan.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tenure</Label>
                          <p className="text-sm text-muted-foreground">
                            {application.loan.tenure} months
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Purpose</Label>
                          <p className="text-sm text-muted-foreground">
                            {application.loan.purpose}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">EMI</Label>
                          <p className="text-lg font-semibold text-primary">
                            ₹{application.loan.emi.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents & OCR */}
              <TabsContent value="documents">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {application.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  Confidence:{" "}
                                  {(doc.confidence * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  doc.status === "verified"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {doc.status === "verified"
                                  ? "Verified"
                                  : "Needs Review"}
                              </Badge>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Extracted Data (OCR)</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Click the edit icon to make corrections
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(application.ocrData).map(
                          ([field, data]) => (
                            <div
                              key={field}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-1">
                                  <Label className="text-sm font-medium capitalize">
                                    {field.replace(/([A-Z])/g, " $1")}
                                  </Label>
                                  {editingField === field ? (
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Input
                                        value={editValue}
                                        onChange={(e) =>
                                          setEditValue(e.target.value)
                                        }
                                        className="h-8"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => saveEdit(field)}
                                      >
                                        <Save className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelEdit}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <p className="text-sm">{data.value}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    data.confidence > 0.9
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {(data.confidence * 100).toFixed(0)}%
                                </Badge>
                                {data.verified ? (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-warning" />
                                )}
                                {editingField !== field && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEdit(field, data.value)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Scoring */}
              <TabsContent value="scoring">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Score Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div
                          className={`text-6xl font-bold ${getScoreColor(
                            application.creditScore.score
                          )}`}
                        >
                          {application.creditScore.score}
                        </div>
                        <p className="text-muted-foreground">out of 850</p>
                        <div className="mt-4">
                          {getRecommendationBadge(
                            application.creditScore.recommendation
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-medium mb-2">AI Explanation</h4>
                        <p className="text-sm text-muted-foreground">
                          {application.creditScore.explanation}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-medium mb-4">
                          SHAP Feature Importance
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={application.creditScore.shapData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="feature"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(
                                value: any,
                                name: any,
                                props: any
                              ) => [
                                `${value > 0 ? "+" : ""}${value}`,
                                "Impact",
                              ]}
                              labelFormatter={(label: any, payload: any) => {
                                const data = payload?.[0]?.payload;
                                return data ? `${label}: ${data.value}` : label;
                              }}
                            />
                            <Bar dataKey="impact" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">LIME Explanations</h4>
                        <ul className="space-y-2">
                          {application.creditScore.limeExplanation.map(
                            (explanation, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start"
                              >
                                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                                {explanation}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Comments */}
              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle>Officer Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {application.officerComments.length > 0 ? (
                        application.officerComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {comment.author}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No comments yet.
                        </p>
                      )}

                      <div className="border-t pt-4">
                        <Label htmlFor="comment">Add Comment</Label>
                        <div className="flex space-x-2 mt-2">
                          <Textarea
                            id="comment"
                            placeholder="Add your review comments here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleAddComment}
                            disabled={!comment.trim()}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Officer Actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review the application and make a decision
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog
                  open={isApproveModalOpen}
                  onOpenChange={setIsApproveModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full button-glow">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="approval-reason">
                          Reason for Approval
                        </Label>
                        <Textarea
                          id="approval-reason"
                          placeholder="Provide justification for approval..."
                          value={approvalReason}
                          onChange={(e) => setApprovalReason(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleApprove} className="flex-1">
                          Confirm Approval
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsApproveModalOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isRejectModalOpen}
                  onOpenChange={setIsRejectModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rejection-reason">
                          Reason for Rejection
                        </Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Provide reason for rejection and improvement suggestions..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          className="flex-1"
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsRejectModalOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Clarification
                </Button>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Application Details
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <span>
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>
                        {new Date(application.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="secondary">
                        {application.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
