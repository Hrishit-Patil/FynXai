import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

interface ExtractedField {
  value: string;
  confidence: number;
  verified: boolean;
}

interface ExtractedFields {
  [key: string]: ExtractedField;
}

interface DocumentData {
  id: number;
  name: string;
  status: string;
  confidence: number;
  pages: number;
  extractedFields: ExtractedFields;
  errors?: string[];
}

export default function DocumentVerification() {
  const [documents, setDocuments] = useState<DocumentData[]>([
    {
      id: 1,
      name: "Aadhaar Card",
      status: "extracted",
      confidence: 0.98,
      pages: 2,
      extractedFields: {
        name: { value: "Rahul Sharma", confidence: 0.98, verified: true },
        aadhaarNumber: {
          value: "XXXX-XXXX-1234",
          confidence: 0.99,
          verified: true,
        },
        dob: { value: "15/08/1990", confidence: 0.95, verified: false },
        address: {
          value: "123 MG Road, Bangalore - 560001",
          confidence: 0.92,
          verified: false,
        },
      },
    },
    {
      id: 2,
      name: "PAN Card",
      status: "extracted",
      confidence: 0.94,
      pages: 1,
      extractedFields: {
        name: { value: "RAHUL SHARMA", confidence: 0.96, verified: true },
        panNumber: { value: "ABCDE1234F", confidence: 0.98, verified: true },
        fatherName: {
          value: "SURESH SHARMA",
          confidence: 0.94,
          verified: true,
        },
        dob: { value: "15/08/1990", confidence: 0.95, verified: true },
      },
    },
    {
      id: 3,
      name: "Bank Statement",
      status: "processing",
      confidence: 0,
      pages: 24,
      extractedFields: {},
    },
    {
      id: 4,
      name: "Salary Slip",
      status: "failed",
      confidence: 0.65,
      pages: 3,
      extractedFields: {},
      errors: ["Low image quality", "Incomplete salary details"],
    },
  ]);

  const [extractedFields, setExtractedFields] = useState<ExtractedFields>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "extracted":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "extracted":
        return "Extraction Complete";
      case "processing":
        return "Processing...";
      case "failed":
        return "Extraction Failed";
      default:
        return "Pending";
    }
  };

  const documentHealth = Math.round(
    documents.reduce((acc, doc) => {
      if (doc.status === "extracted") {
        const verifiedFields = Object.values(doc.extractedFields).filter(
          (field) => field.verified
        ).length;
        const totalFields = Object.values(doc.extractedFields).length;
        return (
          acc + (totalFields > 0 ? (verifiedFields / totalFields) * 100 : 0)
        );
      }
      return acc;
    }, 0) / documents.length
  );

  const startEdit = (
    docId: number,
    fieldName: string,
    currentValue: string
  ) => {
    setEditingField(`${docId}-${fieldName}`);
    setEditValue(currentValue);
  };

  const saveEdit = (docId: number, fieldName: string) => {
    setDocuments((docs) =>
      docs.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            extractedFields: {
              ...doc.extractedFields,
              [fieldName]: {
                ...doc.extractedFields[fieldName],
                value: editValue,
                verified: true,
              },
            },
          };
        }
        return doc;
      })
    );
    setEditingField(null);
    setEditValue("");
  };

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
            Document Verification
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            OCR extraction complete. Please verify and correct the extracted
            information.
          </p>
        </motion.div>

        {/* Document Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Document Health
              </h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {documentHealth}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Verification Complete
                </p>
              </div>
            </div>
            <Progress value={documentHealth} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {documentHealth >= 80
                ? "✅ Ready for processing"
                : "⚠️ Please verify more fields"}
            </p>
          </Card>
        </motion.div>

        {/* Documents Grid */}
        <div className="space-y-6">
          {documents.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{document.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {document.pages} pages
                      </p>
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusText(document.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    {document.status === "extracted" && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {document.status === "failed" && (
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Re-upload
                      </Button>
                    )}
                  </div>
                </div>

                {/* Processing State */}
                {document.status === "processing" && (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Reading and extracting key fields...
                    </p>
                    <Progress value={65} className="mt-4 max-w-md mx-auto" />
                  </div>
                )}

                {/* Failed State */}
                {document.status === "failed" && document.errors && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">
                      Extraction Issues Found
                    </h4>
                    <div className="space-y-1 mb-4">
                      {document.errors.map((error, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          • {error}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline">Retry OCR</Button>
                      <Button>Enter Manually</Button>
                    </div>
                  </div>
                )}

                {/* Extracted Fields */}
                {document.status === "extracted" &&
                  Object.keys(document.extractedFields).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg mb-4">
                        Extracted Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(document.extractedFields).map(
                          ([fieldName, field]) => (
                            <div
                              key={fieldName}
                              className="p-4 glass rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Label className="font-semibold capitalize">
                                  {fieldName.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      field.confidence >= 0.9
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {Math.round(field.confidence * 100)}%
                                  </Badge>
                                  <Switch
                                    checked={field.verified}
                                    onCheckedChange={(checked) => {
                                      setDocuments((docs) =>
                                        docs.map((doc) => {
                                          if (doc.id === document.id) {
                                            return {
                                              ...doc,
                                              extractedFields: {
                                                ...doc.extractedFields,
                                                [fieldName]: {
                                                  ...field,
                                                  verified: checked,
                                                },
                                              },
                                            };
                                          }
                                          return doc;
                                        })
                                      );
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {editingField ===
                                `${document.id}-${fieldName}` ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input
                                      value={editValue}
                                      onChange={(e) =>
                                        setEditValue(e.target.value)
                                      }
                                      className="flex-1"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        saveEdit(document.id, fieldName)
                                      }
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingField(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="flex-1 font-mono text-sm p-2 bg-background rounded border">
                                      {field.value}
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        startEdit(
                                          document.id,
                                          fieldName,
                                          field.value
                                        )
                                      }
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>

                              {field.verified ? (
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Verified
                                </p>
                              ) : (
                                <p className="text-xs text-orange-600 mt-1">
                                  Please verify this field
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      {/* Historical Data Visualization */}
                      {document.name === "Bank Statement" &&
                        document.status === "extracted" && (
                          <div className="mt-6 p-4 glass rounded-lg">
                            <h5 className="font-semibold mb-3">
                              Monthly Salary Trend
                            </h5>
                            <div className="h-20 flex items-end justify-between gap-1">
                              {[48000, 52000, 51000, 50000, 49000, 47000].map(
                                (amount, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col items-center"
                                  >
                                    <div
                                      className="bg-primary w-8 rounded-t"
                                      style={{
                                        height: `${(amount / 52000) * 60}px`,
                                      }}
                                    />
                                    <span className="text-xs mt-1">
                                      {amount / 1000}K
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center mt-8"
        >
          <Button
            size="lg"
            className="hover-lift"
            disabled={documentHealth < 80}
          >
            Submit Application
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 text-center">
            <h3 className="font-semibold mb-2">
              Need Help with Document Verification?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our AI extracted the information above. Please verify each field
              for accuracy before proceeding.
            </p>
            <Button variant="outline">Contact Support</Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
