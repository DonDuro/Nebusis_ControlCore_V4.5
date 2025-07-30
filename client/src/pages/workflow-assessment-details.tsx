import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, User, Activity, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { useState } from "react";
import { useTranslation } from "@/i18n";
import type { User as UserType, Institution } from "../../../shared/schema";

interface WorkflowAssessmentReport {
  id: number;
  workflowId: number;
  assessorId: number;
  assessmentDate: string;
  executionStatus: "in_progress" | "completed" | "delayed" | "cancelled";
  overallFidelityScore?: number;
  designComplianceScore?: number;
  timelineComplianceScore?: number;
  qualityScore?: number;
  overallFindings?: string;
  recommendations?: string;
  status: "draft" | "final" | "under_review";
  createdAt: string;
  workflow?: {
    name: string;
    componentType: string;
    status: string;
  };
}

export default function WorkflowAssessmentDetails() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/auth/user'],
  });

  const { data: institution } = useQuery<Institution>({
    queryKey: ['/api/institutions/1'],
  });

  const { data: assessment, isLoading } = useQuery<WorkflowAssessmentReport>({
    queryKey: ['/api/workflow-execution-assessments', id],
    queryFn: async () => {
      const response = await fetch(`/api/workflow-execution-assessments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch workflow assessment');
      return response.json();
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Activity className="h-5 w-5 text-blue-600" />;
      case "delayed":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workflow assessment details...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested workflow assessment could not be found.</p>
          <Button onClick={() => setLocation('/audit-reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user as UserType} 
        institution={institution as Institution} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
        stats={{
          activeWorkflows: 0,
          completedWorkflows: 0,
          underReview: 0,
          overallProgress: 0
        }}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/audit-reports')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Reports
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">WorkFlow Assessment Details</h1>
                    <p className="text-gray-600 mt-1">
                      Detailed view of workflow execution assessment #{assessment.id}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    window.open(`/api/workflow-execution-assessments/${assessment.id}/pdf`, '_blank');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              {/* Assessment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Overall Fidelity Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      <Badge className={getScoreColor(assessment.overallFidelityScore || 0)} variant="secondary">
                        {assessment.overallFidelityScore || 0}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Execution Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assessment.executionStatus)}
                      <span className="font-medium capitalize">
                        {assessment.executionStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Assessment Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>{format(new Date(assessment.assessmentDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Detailed breakdown of workflow execution assessment scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {assessment.designComplianceScore || 0}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Design Compliance</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {assessment.timelineComplianceScore || 0}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Timeline Compliance</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {assessment.qualityScore || 0}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Quality Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Information</CardTitle>
                  <CardDescription>
                    Details about the assessed workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Workflow Name</label>
                      <p className="font-medium">{assessment.workflow?.name || `Workflow ${assessment.workflowId}`}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Component Type</label>
                      <p className="font-medium">
                        {assessment.workflow?.componentType?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Findings and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Findings</CardTitle>
                    <CardDescription>
                      Key observations from the assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {assessment.overallFindings || 'No findings recorded.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Suggested improvements and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {assessment.recommendations || 'No recommendations provided.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}