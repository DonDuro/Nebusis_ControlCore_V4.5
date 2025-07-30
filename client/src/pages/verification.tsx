import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, XCircle, AlertTriangle, Clock, Activity, FileText, 
  BarChart3, TrendingUp, Target, AlertCircle, Plus, Eye, Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n";

interface WorkflowExecutionAssessment {
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
  nextAssessmentDate?: string;
  status: "draft" | "final" | "under_review";
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStepAssessment {
  id: number;
  executionAssessmentId: number;
  workflowStepId: number;
  stepName: string;
  plannedDuration?: string;
  actualDuration?: string;
  plannedStartDate?: string;
  actualStartDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  designAdherence: "fully_compliant" | "partially_compliant" | "non_compliant" | "not_applicable";
  executionQuality: "excellent" | "good" | "satisfactory" | "needs_improvement";
  outputCompliance: "meets_requirements" | "partially_meets" | "does_not_meet";
  deviationReasons?: string;
  improvementAreas?: string;
  stepFindings?: string;
  evidenceReview?: string;
  createdAt: string;
}

interface WorkflowDeviation {
  id: number;
  executionAssessmentId: number;
  workflowStepId?: number;
  deviationType: "timeline" | "process" | "quality" | "resource" | "responsibility";
  severity: "critical" | "major" | "minor" | "informational";
  description: string;
  impactAnalysis?: string;
  correctionTaken?: string;
  preventiveMeasures?: string;
  identifiedBy: number;
  identifiedAt: string;
  status: "open" | "under_review" | "resolved" | "closed";
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: number;
}

interface Workflow {
  id: number;
  name: string;
  description?: string;
  componentType: string;
  status: string;
  progress: number;
  institutionId: number;
  assignedToId?: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowExecutionAssessments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAutoAssessmentOpen, setIsAutoAssessmentOpen] = useState(false);
  const [selectedWorkflowsForAuto, setSelectedWorkflowsForAuto] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user,
  });

  // Get workflows for assessment selection
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    queryFn: async () => {
      const response = await fetch(`/api/workflows?institutionId=${user?.institutionId}`);
      if (!response.ok) throw new Error("Failed to fetch workflows");
      return response.json();
    },
    enabled: !!user?.institutionId,
  });

  // Get workflow execution assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<WorkflowExecutionAssessment[]>({
    queryKey: ["/api/workflow-execution-assessments", user?.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/workflow-execution-assessments?institutionId=${user?.institutionId}`);
      if (!response.ok) throw new Error("Failed to fetch workflow execution assessments");
      return response.json();
    },
    enabled: !!user?.institutionId,
  });



  // Automatic assessment generation mutation
  const generateAutoAssessmentMutation = useMutation({
    mutationFn: async (workflowIds: number[]) => {
      return apiRequest("/api/workflow-execution-assessments/auto-generate", "POST", { workflowIds, institutionId: user?.institutionId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-execution-assessments"] });
      toast({ 
        title: "Automatic assessments generated", 
        description: `Successfully created ${Array.isArray(data) ? data.length : 1} workflow execution assessments`
      });
      setIsAutoAssessmentOpen(false);
      setSelectedWorkflowsForAuto([]);
    },
    onError: () => {
      toast({ title: "Error generating automatic assessments", variant: "destructive" });
    },
  });

  const generatePDFReport = (assessmentId: number) => {
    try {
      // Open PDF in new window for download
      window.open(`/api/workflow-execution-assessments/${assessmentId}/pdf`, '_blank');
      
      // Show success message
      toast({ title: "PDF report is being generated and downloaded" });
      
      // Invalidate assessment reports to show the new PDF in the reports page
      queryClient.invalidateQueries({ queryKey: ["/api/assessment-reports"] });
    } catch (error) {
      toast({ title: "Error generating PDF report", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "delayed": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "major": return "bg-orange-100 text-orange-800";
      case "minor": return "bg-yellow-100 text-yellow-800";
      case "informational": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getComplianceIcon = (level: string) => {
    switch (level) {
      case "fully_compliant": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "partially_compliant": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "non_compliant": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (workflowsLoading || assessmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user as any} 
          institution={institution as any} 
          onMobileMenuToggle={() => setSidebarOpen(true)}
        />
        <div className="flex pt-16">
          <SidebarSimple open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 p-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user as any} 
        institution={institution as any} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
      />
      <div className="flex pt-16">
        <SidebarSimple open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 p-8 pt-20">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">WorkFlow Assessments</h1>
                  <p className="text-gray-600">
                    Evaluate workflow execution fidelity by comparing actual performance against defined specifications
                  </p>
                </div>
                <div className="flex gap-3">
                  <Dialog open={isAutoAssessmentOpen} onOpenChange={setIsAutoAssessmentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Activity className="h-4 w-4 mr-2" />
                        Generate Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Generate Automatic Workflow Assessments</DialogTitle>
                      </DialogHeader>
                      <AutoAssessmentForm 
                        workflows={workflows}
                        selectedWorkflows={selectedWorkflowsForAuto}
                        onWorkflowSelection={setSelectedWorkflowsForAuto}
                        onSubmit={() => generateAutoAssessmentMutation.mutate(selectedWorkflowsForAuto)}
                        onCancel={() => setIsAutoAssessmentOpen(false)}
                        isLoading={generateAutoAssessmentMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                      <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.filter(a => a.executionStatus === "completed").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.filter(a => a.executionStatus === "in_progress").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg. Fidelity Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.length > 0 
                          ? Math.round(assessments.reduce((sum, a) => sum + (a.overallFidelityScore || 0), 0) / assessments.length)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Assessment Overview</TabsTrigger>
                <TabsTrigger value="execution">Execution Analysis</TabsTrigger>
                <TabsTrigger value="deviations">Deviations & Issues</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6">
                  {assessments.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
                        <p className="text-gray-600 mb-4">Start by generating automatic workflow execution assessments</p>
                        <div className="flex gap-3 justify-center">
                          <Button 
                            onClick={() => setIsAutoAssessmentOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Generate Assessment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    assessments.map((assessment) => {
                      const workflow = workflows.find(w => w.id === assessment.workflowId);
                      return (
                        <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  {workflow?.name || `Workflow ${assessment.workflowId}`}
                                </CardTitle>
                                <CardDescription>
                                  Assessment conducted on {new Date(assessment.assessmentDate).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getStatusColor(assessment.executionStatus)}>
                                  {assessment.executionStatus.replace('_', ' ')}
                                </Badge>
                                <Badge variant={assessment.status === 'final' ? 'default' : 'secondary'}>
                                  {assessment.status}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Overall Fidelity</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={assessment.overallFidelityScore || 0} className="flex-1" />
                                  <span className="text-sm font-semibold">{assessment.overallFidelityScore || 0}%</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Design Compliance</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={assessment.designComplianceScore || 0} className="flex-1" />
                                  <span className="text-sm font-semibold">{assessment.designComplianceScore || 0}%</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Timeline Compliance</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={assessment.timelineComplianceScore || 0} className="flex-1" />
                                  <span className="text-sm font-semibold">{assessment.timelineComplianceScore || 0}%</span>
                                </div>
                              </div>
                            </div>
                            
                            {assessment.overallFindings && (
                              <div className="mb-4">
                                <Label className="text-sm font-medium text-gray-600">Key Findings</Label>
                                <p className="text-sm text-gray-700 mt-1">{assessment.overallFindings}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Navigate to detailed results view
                                  setActiveTab("execution");
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Results
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => generatePDFReport(assessment.id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Generate PDF Report
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="execution" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Analysis</CardTitle>
                    <CardDescription>
                      Detailed analysis of workflow step execution vs. planned specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Select an assessment to view detailed execution analysis</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deviations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deviations & Issues</CardTitle>
                    <CardDescription>
                      Track and manage deviations from planned workflow execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>No deviations to display</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}



function AutoAssessmentForm({ workflows, selectedWorkflows, onWorkflowSelection, onSubmit, onCancel, isLoading }: {
  workflows: Workflow[];
  selectedWorkflows: number[];
  onWorkflowSelection: (workflowIds: number[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [assessmentScope, setAssessmentScope] = useState<"completed" | "active" | "all">("completed");
  const [includeStepAnalysis, setIncludeStepAnalysis] = useState(true);
  const [includeDeviationDetection, setIncludeDeviationDetection] = useState(true);
  const [timeframeDays, setTimeframeDays] = useState("30");

  // Filter workflows based on assessment scope
  const filteredWorkflows = workflows.filter(workflow => {
    switch (assessmentScope) {
      case "completed": return workflow.status === "completed";
      case "active": return workflow.status === "in_progress" || workflow.status === "under_review";
      case "all": return true;
      default: return true;
    }
  });

  const handleWorkflowToggle = (workflowId: number) => {
    if (selectedWorkflows.includes(workflowId)) {
      onWorkflowSelection(selectedWorkflows.filter(id => id !== workflowId));
    } else {
      onWorkflowSelection([...selectedWorkflows, workflowId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === filteredWorkflows.length) {
      onWorkflowSelection([]);
    } else {
      onWorkflowSelection(filteredWorkflows.map(w => w.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkflows.length === 0) return;
    onSubmit();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-600" />;
      case "under_review": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Assessment Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scope">Assessment Scope</Label>
          <Select value={assessmentScope} onValueChange={(value: any) => setAssessmentScope(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed Workflows Only</SelectItem>
              <SelectItem value="active">Active Workflows Only</SelectItem>
              <SelectItem value="all">All Workflows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="timeframe">Analysis Timeframe (Days)</Label>
          <Select value={timeframeDays} onValueChange={setTimeframeDays}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assessment Options */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Assessment Features</Label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={includeStepAnalysis}
              onChange={(e) => setIncludeStepAnalysis(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Include step-by-step execution analysis</span>
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={includeDeviationDetection}
              onChange={(e) => setIncludeDeviationDetection(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Automatic deviation detection and categorization</span>
          </label>
        </div>
      </div>

      {/* Workflow Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">
            Select Workflows for Assessment ({selectedWorkflows.length}/{filteredWorkflows.length})
          </Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedWorkflows.length === filteredWorkflows.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <ScrollArea className="h-64 border rounded-md p-4">
          <div className="space-y-2">
            {filteredWorkflows.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No workflows found for the selected scope
              </p>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div 
                  key={workflow.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkflows.includes(workflow.id)}
                    onChange={() => handleWorkflowToggle(workflow.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      <span className="font-medium">{workflow.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{workflow.componentType.replace('_', ' ')}</span>
                      <span>Progress: {workflow.progress}%</span>
                      {workflow.dueDate && (
                        <span>Due: {new Date(workflow.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
                    {workflow.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Assessment Preview */}
      {selectedWorkflows.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Assessment Preview</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• {selectedWorkflows.length} workflows will be assessed automatically</p>
              <p>• Analysis will cover the last {timeframeDays} days of execution data</p>
              {includeStepAnalysis && <p>• Step-by-step execution fidelity will be evaluated</p>}
              {includeDeviationDetection && <p>• Deviations will be automatically detected and categorized</p>}
              <p>• Comprehensive execution reports will be generated for each workflow</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={selectedWorkflows.length === 0 || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Generating Assessments...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              Generate {selectedWorkflows.length} Assessment{selectedWorkflows.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}