import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Download,
  MessageCircle,
  BarChart3,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicationResult() {
  const [counterfactualIncome, setCounterfactualIncome] = useState([55000]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const applicantData = {
    name: "Rahul Sharma",
    maskedPAN: "ABCDE****F",
    score: 720,
    decision: "Approved",
  };

  const shapFeatures = [
    {
      name: "Monthly Salary Credits",
      contribution: 45,
      direction: "positive",
      explanation: "Regular ₹50K monthly credits boost creditworthiness",
    },
    {
      name: "Account Balance Stability",
      contribution: 32,
      direction: "positive",
      explanation: "Consistent balance shows financial discipline",
    },
    {
      name: "Employment History",
      contribution: 28,
      direction: "positive",
      explanation: "3+ years at current employer indicates stability",
    },
    {
      name: "Credit Utilization",
      contribution: 18,
      direction: "positive",
      explanation: "Low credit card utilization (25%) is favorable",
    },
    {
      name: "Recent Credit Inquiries",
      contribution: -15,
      direction: "negative",
      explanation: "3 inquiries in last 6 months slightly reduce score",
    },
    {
      name: "Account Balance Volatility",
      contribution: -22,
      direction: "negative",
      explanation: "Some months show high expense volatility",
    },
  ];

  const limeFeatures = [
    { name: "Debt-to-Income Ratio", contribution: 38, direction: "positive" },
    { name: "Payment History", contribution: 35, direction: "positive" },
    { name: "Age of Credit Accounts", contribution: 22, direction: "positive" },
    {
      name: "Number of Credit Accounts",
      contribution: -12,
      direction: "negative",
    },
  ];

  const calculateCounterfactualScore = (income) => {
    const baseScore = 720;
    const incomeImpact = ((income - 50000) / 1000) * 0.8;
    return Math.min(850, Math.max(300, Math.round(baseScore + incomeImpact)));
  };

  const counterfactualScore = calculateCounterfactualScore(
    counterfactualIncome[0]
  );

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Credit Decision
          </h1>
          <p className="text-xl text-muted-foreground">
            Transparent AI analysis of your loan application
          </p>
        </motion.div>

        {/* Credit Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">{applicantData.name}</h2>
                    <p className="text-muted-foreground">
                      PAN: {applicantData.maskedPAN}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center bg-primary/10">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">
                        {applicantData.score}
                      </p>
                      <p className="text-sm text-muted-foreground">/850</p>
                    </div>
                  </div>
                </div>
                <p className="text-lg font-semibold">Credit Score</p>
              </div>

              <div className="text-center">
                <Badge
                  className={`mb-4 px-4 py-2 text-lg ${
                    applicantData.decision === "Approved"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {applicantData.decision}
                </Badge>
                <p className="text-muted-foreground">
                  {applicantData.decision === "Approved"
                    ? "Congratulations! Your loan has been approved."
                    : "Unfortunately, your application was not approved at this time."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Explainability Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                Why This Decision?
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Dialog
                  open={reviewModalOpen}
                  onOpenChange={setReviewModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Request Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Human Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Request a human loan officer to review your application
                        if you believe the AI decision needs reconsideration.
                      </p>
                      <Textarea
                        placeholder="Please explain why you think this decision should be reviewed..."
                        rows={4}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setReviewModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setReviewModalOpen(false)}>
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mb-6 p-4 glass rounded-lg">
              <p className="text-lg">
                <strong>Your score is {applicantData.score}</strong> because of
                timely salary deposits, moderate account balance volatility, and
                strong employment history. Recent credit inquiries slightly
                lowered the score.
              </p>
            </div>

            <Tabs defaultValue="shap">
              <TabsList className="mb-6">
                <TabsTrigger value="shap">SHAP Analysis</TabsTrigger>
                <TabsTrigger value="lime">LIME Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="shap">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Feature Contributions (SHAP Values)
                  </h3>
                  {shapFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{feature.name}</span>
                        <div className="flex items-center gap-2">
                          {feature.direction === "positive" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`font-bold ${
                              feature.direction === "positive"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {feature.direction === "positive" ? "+" : ""}
                            {feature.contribution}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="w-full h-8 bg-muted rounded-lg overflow-hidden">
                          <div
                            className={`h-full rounded-lg transition-all duration-500 ${
                              feature.direction === "positive"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.abs(feature.contribution)}%`,
                              marginLeft:
                                feature.direction === "negative"
                                  ? `${100 - Math.abs(feature.contribution)}%`
                                  : "0",
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                        {feature.explanation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="lime">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Local Feature Importance (LIME)
                  </h3>
                  {limeFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{feature.name}</span>
                        <div className="flex items-center gap-2">
                          {feature.direction === "positive" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`font-bold ${
                              feature.direction === "positive"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {feature.contribution}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-6 bg-muted rounded-lg overflow-hidden">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 ${
                            feature.direction === "positive"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.abs(feature.contribution)}%`,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Counterfactuals Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Suggestions to Improve Your Score
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 glass rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Improve Credit History</h4>
                  <p className="text-sm text-muted-foreground">
                    +25 points potential
                  </p>
                </div>
                <div className="p-4 glass rounded-lg text-center">
                  <h4 className="font-semibold mb-2">
                    Reduce Credit Utilization
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    +15 points potential
                  </p>
                </div>
                <div className="p-4 glass rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Avoid New Inquiries</h4>
                  <p className="text-sm text-muted-foreground">
                    +10 points potential
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
