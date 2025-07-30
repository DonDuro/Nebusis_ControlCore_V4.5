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
  BarChart3, TrendingUp, Target, AlertCircle, Plus, Eye, Edit
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
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false);
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
    queryKey: ["/api/workflow-execution-assessments"],
    queryFn: async () => {
      const response = await fetch(`/api/workflow-execution-assessments?institutionId=${user?.institutionId}`);
      if (!response.ok) throw new Error("Failed to fetch workflow execution assessments");
      return response.json();
    },
    enabled: !!user?.institutionId,
  });

  // Create new assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      return apiRequest("/api/workflow-execution-assessments", "POST", assessmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-execution-assessments"] });
      toast({ title: "Assessment created successfully" });
      setIsCreateAssessmentOpen(false);
    },
    onError: () => {
      toast({ title: "Error creating assessment", variant: "destructive" });
    },
  });

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
                <Dialog open={isCreateAssessmentOpen} onOpenChange={setIsCreateAssessmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Workflow Execution Assessment</DialogTitle>
                    </DialogHeader>
                    <CreateAssessmentForm 
                      workflows={workflows}
                      onSubmit={(data) => createAssessmentMutation.mutate(data)}
                      isLoading={createAssessmentMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
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
                        <p className="text-gray-600 mb-4">Start by creating your first workflow execution assessment</p>
                        <Button onClick={() => setIsCreateAssessmentOpen(true)}>
                          Create Assessment
                        </Button>
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
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Assessment
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

function CreateAssessmentForm({ workflows, onSubmit, isLoading }: {
  workflows: Workflow[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [findings, setFindings] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflowId) return;

    const assessmentData = {
      workflowId: parseInt(selectedWorkflowId),
      assessorId: user?.id,
      executionStatus: "in_progress",
      overallFindings: findings,
      recommendations: recommendations,
      status: "draft"
    };

    onSubmit(assessmentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="workflow">Select Workflow to Assess</Label>
        <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a workflow..." />
          </SelectTrigger>
          <SelectContent>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id.toString()}>
                {workflow.name} - {workflow.componentType.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="findings">Initial Findings</Label>
        <Textarea
          id="findings"
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Document initial observations about workflow execution..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="recommendations">Initial Recommendations</Label>
        <Textarea
          id="recommendations"
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Provide initial recommendations for improvement..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" disabled={!selectedWorkflowId || isLoading}>
          {isLoading ? "Creating..." : "Create Assessment"}
        </Button>
      </div>
    </form>
  );
}