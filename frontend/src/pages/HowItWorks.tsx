import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Upload,
  Brain,
  CheckCircle,
  FileText,
  Shield,
  Zap,
  Users,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: "Register",
      description: "Create your secure FynXai account and verify your identity",
      details:
        "Our platform uses simple KYC steps to confirm your details while ensuring bank-grade encryption and data privacy.",
    },
    {
      icon: Upload,
      title: "Upload Documents",
      description:
        "Submit your PDFs - Aadhaar, PAN, bank statements, and salary slips",
      details:
        "Our OCR technology automatically extracts key information while maintaining complete security and encryption.",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Get a transparent credit score with SHAP/LIME explanations",
      details:
        "Our AI analyzes your financial data using regression-based models and provides clear explanations for every decision factor.",
    },
    {
      icon: Eye,
      title: "Transparent Results",
      description: "Instantly view your credit score and loan eligibility",
      details:
        "See your score, approval status, and the main factors that influenced your results. Download a detailed explainability report (PDF) anytime.",
    },
    {
      icon: CheckCircle,
      title: "Officer Review",
      description: "Every decision is validated by a loan officer",
      details:
        "Human oversight ensures fairness, accountability, and compliance. Officers can approve, reject, or request clarification before final approval.",
    },
  ];

  const features = [
    {
      icon: FileText,
      title: "Document Processing",
      description:
        "Advanced OCR extracts data from your financial documents with high accuracy and confidence scores.",
    },
    {
      icon: Shield,
      title: "Explainable AI",
      description:
        "Every credit decision comes with clear explanations of contributing factors and improvement suggestions.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description:
        "Get your credit score and loan offers in minutes, not days, with our automated processing.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              How FynXai Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience transparent, AI-powered lending that puts fairness and
              explainability at the center of every decision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A transparent 5-step process from application to approval with
              full explainability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center relative group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mb-4 shadow-glow group-hover:animate-pulse">
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.details}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          ></motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 glass">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose FynXai?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with transparent processes
              to deliver fair, explainable lending decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="p-8 h-full hover-lift">
                  <feature.icon className="w-12 h-12 text-primary mb-6" />
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Fair Lending?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of applicants who have experienced transparent,
              AI-powered loan decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="hover-lift">
                <Link to="/apply">Apply for Loan</Link>
              </Button>
              <Button variant="outline" size="lg" className="hover-lift">
                <Link to="/calculator">Try Calculator</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Secure • Explainable • Fair
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
