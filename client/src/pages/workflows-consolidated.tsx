import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Copy, Save, Users, Calendar, FileText, Settings, Play, Pause, CheckCircle, Clock, Target } from "lucide-react";

// Framework Components
const COSO_COMPONENTS = [
  { id: "control_environment", name: "Control Environment", description: "Establishes the tone of the organization" },
  { id: "risk_assessment", name: "Risk Assessment", description: "Risk identification and analysis" },
  { id: "control_activities", name: "Control Activities", description: "Policies and procedures" },
  { id: "information_communication", name: "Information & Communication", description: "Effective communication" },
  { id: "monitoring", name: "Monitoring Activities", description: "Continuous evaluation" }
];

const INTOSAI_COMPONENTS = [
  { id: "governance", name: "Governance", description: "Institutional governance structure" },
  { id: "risk_management", name: "Risk Management", description: "Risk management framework" },
  { id: "internal_audit", name: "Internal Audit", description: "Internal audit function" },
  { id: "oversight", name: "Oversight", description: "Supervision and control" },
  { id: "transparency", name: "Transparency", description: "Accountability" }
];

const INTEGRATED_COMPONENTS = [
  { id: "strategic_planning", name: "Strategic Planning", description: "Long-term planning and objectives" },
  { id: "operational_control", name: "Operational Control", description: "Day-to-day operational controls" },
  { id: "compliance_monitoring", name: "Compliance Monitoring", description: "Regulatory compliance tracking" },
  { id: "performance_management", name: "Performance Management", description: "Performance measurement and improvement" }
];

interface WorkflowDefinition {
  id: number;
  name: string;
  description: string;
  framework: string;
  component: string;
  steps: WorkflowStep[];
  isTemplate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  responsible: string;
  estimatedDuration: number;
  requiresEvidence: boolean;
  order: number;
}

interface ActiveWorkflow {
  id: number;
  definitionId: number;
  name: string;
  currentStage: string;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  estimatedCompletion: string;
}

export default function WorkflowsConsolidatedPage() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<"coso" | "intosai" | "integrated">("coso");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<WorkflowDefinition | null>(null);
  
  const [workflowForm, setWorkflowForm] = useState({
    name: "",
    description: "",
    framework: "coso" as "coso" | "intosai" | "integrated",
    component: "",
    steps: [] as WorkflowStep[]
  });

  // Get components based on selected framework
  const getComponents = () => {
    switch (selectedFramework) {
      case "coso": return COSO_COMPONENTS;
      case "intosai": return INTOSAI_COMPONENTS;
      case "integrated": return INTEGRATED_COMPONENTS;
      default: return COSO_COMPONENTS;
    }
  };

  const components = getComponents();

  // Mock data for demonstration
  const workflowDefinitions: WorkflowDefinition[] = [
    {
      id: 1,
      name: "Control Environment Assessment",
      description: "Process to evaluate and document institutional control environment",
      framework: "coso",
      component: "control_environment",
      steps: [
        {
          id: "1",
          name: "Structure Analysis",
          description: "Analyze organizational structure",
          responsible: "Control Analyst",
          estimatedDuration: 3,
          requiresEvidence: true,
          order: 1
        }
      ],
      isTemplate: true,
      createdBy: "Celso Alvarado",
      createdAt: "2025-01-20",
      updatedAt: "2025-01-26"
    }
  ];

  const activeWorkflows: ActiveWorkflow[] = [
    {
      id: 1,
      definitionId: 1,
      name: "Control Environment Assessment",
      currentStage: "Structure Analysis",
      progress: 35,
      status: 'active',
      startedAt: "2025-01-25",
      estimatedCompletion: "2025-02-15"
    },
    {
      id: 2,
      definitionId: 1,
      name: "Risk Assessment Review",
      currentStage: "Risk Identification",
      progress: 65,
      status: 'active',
      startedAt: "2025-01-20",
      estimatedCompletion: "2025-02-10"
    }
  ];

  const resetForm = () => {
    setWorkflowForm({
      name: "",
      description: "",
      framework: selectedFramework,
      component: "",
      steps: []
    });
    setEditingDefinition(null);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      name: "",
      description: "",
      responsible: "",
      estimatedDuration: 1,
      requiresEvidence: false,
      order: workflowForm.steps.length + 1
    };
    
    setWorkflowForm(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, field: keyof WorkflowStep, value: any) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const handleCreateWorkflow = () => {
    if (!workflowForm.name || !workflowForm.component) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Workflow definition created successfully",
    });
    
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleLaunchWorkflow = (definition: WorkflowDefinition) => {
    toast({
      title: "Workflow Launched",
      description: `${definition.name} has been started successfully`,
    });
  };

  const handlePauseWorkflow = (workflowId: number) => {
    toast({
      title: "Workflow Paused",
      description: "Workflow has been paused",
    });
  };

  const handleResumeWorkflow = (workflowId: number) => {
    toast({
      title: "Workflow Resumed",
      description: "Workflow has been resumed",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={{ 
          id: 3, 
          email: "calvarado@nebusis.com", 
          firstName: "Celso", 
          lastName: "Alvarado", 
          role: "admin", 
          supervisorId: null, 
          institutionId: 1, 
          emailNotifications: true, 
          createdAt: null, 
          updatedAt: null 
        }}
        institution={{ 
          id: 1, 
          name: "Ministerio de Administración Pública", 
          createdAt: null, 
          type: "government", 
          size: "large", 
          legalBasis: null, 
          sectorRegulations: null, 
          logoUrl: null 
        }}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <SidebarSimple isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900">Workflows</h1>
            <p className="text-sm text-gray-600">
              Create, manage, and track workflow execution for COSO, INTOSAI, and Integrated controls
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Workflow</TabsTrigger>
              <TabsTrigger value="manage">View & Launch Workflows</TabsTrigger>
              <TabsTrigger value="track">Track Active Workflows</TabsTrigger>
            </TabsList>

            {/* CREATE WORKFLOW SECTION */}
            <TabsContent value="create" className="space-y-2">
              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Target className="w-4 h-4" />
                    Create New Workflow
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Select a framework and control component to create a new workflow definition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-2">
                  {/* Framework Selection */}
                  <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded">
                    <Label htmlFor="framework-select" className="text-sm font-medium">Framework:</Label>
                    <Select value={selectedFramework} onValueChange={(value: "coso" | "intosai" | "integrated") => setSelectedFramework(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coso">COSO</SelectItem>
                        <SelectItem value="intosai">INTOSAI</SelectItem>
                        <SelectItem value="integrated">Integrated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Components Grid */}
                  <div>
                    <h3 className="text-base font-medium mb-2">{selectedFramework.toUpperCase()} Components</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {components.map((component) => (
                        <Card key={component.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{component.name}</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              {component.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <Button 
                              onClick={() => {
                                setWorkflowForm(prev => ({ 
                                  ...prev, 
                                  framework: selectedFramework, 
                                  component: component.id 
                                }));
                                setIsCreateModalOpen(true);
                              }}
                              size="sm" 
                              className="w-full"
                            >
                              Create Workflow
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* VIEW & LAUNCH WORKFLOWS SECTION */}
            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Registered Workflows
                  </CardTitle>
                  <CardDescription>
                    View and launch previously defined workflow templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workflowDefinitions.length === 0 ? (
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow definitions found</h3>
                      <p className="text-gray-600 mb-4">Create your first workflow definition to get started.</p>
                      <Button onClick={() => {
                        const createTab = document.querySelector('[data-tabs-value="create"]') as HTMLElement;
                        createTab?.click();
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Workflow
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {workflowDefinitions.map((definition) => {
                        const component = components.find(c => c.id === definition.component);
                        return (
                          <Card key={definition.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-2">{definition.name}</CardTitle>
                                  <CardDescription className="mb-3">
                                    {definition.description}
                                  </CardDescription>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge variant="outline">{component?.name}</Badge>
                                    <Badge variant="secondary">{definition.framework.toUpperCase()}</Badge>
                                    {definition.isTemplate && (
                                      <Badge className="bg-green-100 text-green-800">Template</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent>
                              <div className="space-y-3 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <FileText className="w-4 h-4 mr-2" />
                                  {definition.steps.length} steps defined
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-4 h-4 mr-2" />
                                  Created by {definition.createdBy}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Updated {definition.updatedAt}
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleLaunchWorkflow(definition)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Launch
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TRACK ACTIVE WORKFLOWS SECTION */}
            <TabsContent value="track" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Active Workflows
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage currently executing workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeWorkflows.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No active workflows</h3>
                      <p className="text-gray-600 mb-4">Launch a workflow to start tracking its progress.</p>
                      <Button onClick={() => {
                        const manageTab = document.querySelector('[data-tabs-value="manage"]') as HTMLElement;
                        manageTab?.click();
                      }}>
                        View Available Workflows
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeWorkflows.map((workflow) => (
                        <Card key={workflow.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">{workflow.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">Current Stage: {workflow.currentStage}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Started: {workflow.startedAt}</span>
                                  <span>Est. Completion: {workflow.estimatedCompletion}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                                  {workflow.status}
                                </Badge>
                                {workflow.status === 'active' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePauseWorkflow(workflow.id)}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResumeWorkflow(workflow.id)}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-gray-600">{workflow.progress}%</span>
                              </div>
                              <Progress value={workflow.progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Workflow Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDefinition ? "Edit" : "Create"} Workflow Definition
            </DialogTitle>
            <DialogDescription>
              Define the steps and configuration of the workflow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name *</Label>
                <Input
                  id="workflow-name"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g.: Control Environment Assessment"
                />
              </div>
              <div>
                <Label htmlFor="workflow-framework">Framework *</Label>
                <Select 
                  value={workflowForm.framework} 
                  onValueChange={(value: "coso" | "intosai" | "integrated") => setWorkflowForm(prev => ({ ...prev, framework: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coso">COSO</SelectItem>
                    <SelectItem value="intosai">INTOSAI</SelectItem>
                    <SelectItem value="integrated">Integrated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and scope of this workflow"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="workflow-component">Component *</Label>
              <Select 
                value={workflowForm.component} 
                onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, component: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a component" />
                </SelectTrigger>
                <SelectContent>
                  {getComponents().map((component) => (
                    <SelectItem key={component.id} value={component.id}>
                      {component.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Workflow Steps */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Workflow Steps</h3>
                <Button onClick={addStep} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {workflowForm.steps.map((step, index) => (
                  <Card key={step.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Step {index + 1}</h4>
                      <Button
                        onClick={() => removeStep(step.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Step Name *</Label>
                        <Input
                          value={step.name}
                          onChange={(e) => updateStep(step.id, "name", e.target.value)}
                          placeholder="e.g.: Structure Analysis"
                        />
                      </div>
                      <div>
                        <Label>Responsible *</Label>
                        <Input
                          value={step.responsible}
                          onChange={(e) => updateStep(step.id, "responsible", e.target.value)}
                          placeholder="e.g.: Control Analyst"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Description</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => updateStep(step.id, "description", e.target.value)}
                        placeholder="Describe what should be done in this step"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Estimated Duration (days)</Label>
                        <Input
                          type="number"
                          value={step.estimatedDuration}
                          onChange={(e) => updateStep(step.id, "estimatedDuration", parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          id={`evidence-${step.id}`}
                          checked={step.requiresEvidence}
                          onChange={(e) => updateStep(step.id, "requiresEvidence", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`evidence-${step.id}`}>Requires evidence</Label>
                      </div>
                    </div>
                  </Card>
                ))}

                {workflowForm.steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No steps defined. Click "Add Step" to get started.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={!workflowForm.name || !workflowForm.component}>
                <Save className="w-4 h-4 mr-2" />
                {editingDefinition ? "Update" : "Create"} Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}