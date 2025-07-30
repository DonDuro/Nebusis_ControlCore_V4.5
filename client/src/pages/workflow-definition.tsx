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
import { Plus, Edit2, Trash2, Copy, Save, Users, Calendar, FileText, Settings } from "lucide-react";

// COSO Components
const COSO_COMPONENTS = [
  { id: "control_environment", name: "Control Environment", description: "Establishes the tone of the organization" },
  { id: "risk_assessment", name: "Risk Assessment", description: "Risk identification and analysis" },
  { id: "control_activities", name: "Control Activities", description: "Policies and procedures" },
  { id: "information_communication", name: "Information & Communication", description: "Effective communication" },
  { id: "monitoring", name: "Monitoring Activities", description: "Continuous evaluation" }
];

// INTOSAI Components
const INTOSAI_COMPONENTS = [
  { id: "governance", name: "Governance", description: "Institutional governance structure" },
  { id: "risk_management", name: "Risk Management", description: "Risk management framework" },
  { id: "internal_audit", name: "Internal Audit", description: "Internal audit function" },
  { id: "oversight", name: "Oversight", description: "Supervision and control" },
  { id: "transparency", name: "Transparency", description: "Accountability" }
];

interface WorkflowDefinition {
  id: number;
  name: string;
  description: string;
  framework: string; // "coso" or "intosai"
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
  estimatedDuration: number; // in days
  requiresEvidence: boolean;
  order: number;
}

export default function WorkflowDefinitionPage() {
  const { toast } = useToast();
  const [selectedFramework, setSelectedFramework] = useState<"coso" | "intosai">("coso");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<WorkflowDefinition | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflowForm, setWorkflowForm] = useState({
    name: "",
    description: "",
    framework: "coso" as "coso" | "intosai",
    component: "",
    steps: [] as WorkflowStep[]
  });

  // Mock data for now - in real implementation this would come from API
  const workflowDefinitions: WorkflowDefinition[] = [
    {
      id: 1,
      name: "Control Environment Assessment",
      description: "Proceso para evaluar y documentar el ambiente de control institucional",
      framework: "coso",
      component: "control_environment",
      steps: [
        {
          id: "1",
          name: "Análisis de Estructura Organizacional",
          description: "Revisar organigrama y definición de roles",
          responsible: "Analista de Control",
          estimatedDuration: 3,
          requiresEvidence: true,
          order: 1
        },
        {
          id: "2", 
          name: "Evaluación de Políticas",
          description: "Revisar políticas institucionales vigentes",
          responsible: "Especialista Legal",
          estimatedDuration: 5,
          requiresEvidence: true,
          order: 2
        }
      ],
      isTemplate: true,
      createdBy: "Celso Alvarado",
      createdAt: "2025-01-20",
      updatedAt: "2025-01-25"
    }
  ];

  const components = selectedFramework === "coso" ? COSO_COMPONENTS : INTOSAI_COMPONENTS;

  const handleCreateWorkflow = () => {
    console.log("Creating workflow:", workflowForm);
    toast({
      title: "Flujo de trabajo creado",
      description: "La definición del flujo de trabajo se ha guardado exitosamente"
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditWorkflow = (definition: WorkflowDefinition) => {
    setEditingDefinition(definition);
    setWorkflowForm({
      name: definition.name,
      description: definition.description,
      framework: definition.framework as "coso" | "intosai",
      component: definition.component,
      steps: definition.steps
    });
    setIsCreateModalOpen(true);
  };

  const handleDuplicateWorkflow = (definition: WorkflowDefinition) => {
    setWorkflowForm({
      name: `${definition.name} - Copia`,
      description: definition.description,
      framework: definition.framework as "coso" | "intosai",
      component: definition.component,
      steps: definition.steps
    });
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setWorkflowForm({
      name: "",
      description: "",
      framework: "coso",
      component: "",
      steps: []
    });
    setEditingDefinition(null);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={{ 
          id: 3, 
          name: "Celso Alvarado", 
          email: "calvarado@nebusis.com", 
          role: "admin" as any, 
          institutionId: 1 
        }}
        institution={{ 
          id: 1, 
          name: "Ministerio de Administración Pública", 
          logoUrl: null 
        }}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <SidebarSimple isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Workflow Definition</h1>
            <p className="mt-2 text-gray-600">
              Design and configure workflow templates for COSO and INTOSAI controls
            </p>
          </div>

          {/* Framework Selection & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="framework-select">Framework:</Label>
              <Select value={selectedFramework} onValueChange={(value: "coso" | "intosai") => setSelectedFramework(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coso">COSO</SelectItem>
                  <SelectItem value="intosai">INTOSAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
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
                        onValueChange={(value: "coso" | "intosai") => setWorkflowForm(prev => ({ ...prev, framework: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coso">COSO</SelectItem>
                          <SelectItem value="intosai">INTOSAI</SelectItem>
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
                        {(workflowForm.framework === "coso" ? COSO_COMPONENTS : INTOSAI_COMPONENTS).map(comp => (
                          <SelectItem key={comp.id} value={comp.id}>
                            {comp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

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
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary">Paso {index + 1}</Badge>
                            <Button
                              onClick={() => removeStep(step.id)}
                              variant="ghost"
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

          {/* Workflow Definitions Grid */}
          {workflowDefinitions.filter(def => def.framework === selectedFramework).length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow definitions found</h3>
              <p className="text-gray-600 mb-4">Start creating your first {selectedFramework.toUpperCase()} workflow definition.</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Workflow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowDefinitions
                .filter(def => def.framework === selectedFramework)
                .map((definition) => {
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
                            {definition.isTemplate && (
                              <Badge className="bg-green-100 text-green-800">Template</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
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

                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => handleEditWorkflow(definition)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDuplicateWorkflow(definition)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Duplicate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}