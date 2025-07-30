import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import WorkflowList from "@/components/workflows/WorkflowList";
import WorkflowBuilder from "@/components/workflows/WorkflowBuilder";
import FloatingChatbot from "@/components/common/FloatingChatbot";
import AIToolsModal from "@/components/common/AIToolsModal";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Download,
  Upload,
  AlertCircle,
  Target,
  Plus
} from "lucide-react";
import { cosoWorkflows, getWorkflowsByComponent, type COSOWorkflow, type WorkflowStep } from "@/data/coso-workflows";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { type User, type Institution } from "@shared/schema";
import { useTranslation } from "@/i18n";

// Component types will be generated from translation keys
const getComponentTypes = (t: any) => [
  { 
    id: "ambiente_control", 
    name: t('workflows.components.controlEnvironment.name'), 
    color: "bg-blue-500",
    description: t('workflows.components.controlEnvironment.description'),
    subcomponents: [
      t('workflows.components.controlEnvironment.sub1'),
      t('workflows.components.controlEnvironment.sub2'), 
      t('workflows.components.controlEnvironment.sub3'),
      t('workflows.components.controlEnvironment.sub4'),
      t('workflows.components.controlEnvironment.sub5')
    ]
  },
  { 
    id: "evaluacion_riesgos", 
    name: t('workflows.components.riskAssessment.name'), 
    color: "bg-orange-500",
    description: t('workflows.components.riskAssessment.description'),
    subcomponents: [
      t('workflows.components.riskAssessment.sub1'),
      t('workflows.components.riskAssessment.sub2'),
      t('workflows.components.riskAssessment.sub3'),
      t('workflows.components.riskAssessment.sub4')
    ]
  },
  { 
    id: "actividades_control", 
    name: t('workflows.components.controlActivities.name'), 
    color: "bg-green-500",
    description: t('workflows.components.controlActivities.description'),
    subcomponents: [
      t('workflows.components.controlActivities.sub1'),
      t('workflows.components.controlActivities.sub2'),
      t('workflows.components.controlActivities.sub3'),
      t('workflows.components.controlActivities.sub4')
    ]
  },
  { 
    id: "informacion_comunicacion", 
    name: t('workflows.components.informationCommunication.name'), 
    color: "bg-purple-500",
    description: t('workflows.components.informationCommunication.description'),
    subcomponents: [
      t('workflows.components.informationCommunication.sub1'),
      t('workflows.components.informationCommunication.sub2'), 
      t('workflows.components.informationCommunication.sub3'),
      t('workflows.components.informationCommunication.sub4')
    ]
  },
  { 
    id: "supervision", 
    name: t('workflows.components.monitoring.name'), 
    color: "bg-red-500",
    description: t('workflows.components.monitoring.description'),
    subcomponents: [
      t('workflows.components.monitoring.sub1'),
      t('workflows.components.monitoring.sub2'),
      t('workflows.components.monitoring.sub3'),
      t('workflows.components.monitoring.sub4')
    ]
  }
];

export default function Workflows() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("ambiente_control");
  const [selectedWorkflow, setSelectedWorkflow] = useState<COSOWorkflow | null>(null);
  const [executionDialog, setExecutionDialog] = useState(false);
  const [createWorkflowDialog, setCreateWorkflowDialog] = useState(false);
  const [newWorkflowData, setNewWorkflowData] = useState({
    componentType: "",
    subcomponent: "",
    name: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  // Handle component parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const componentParam = urlParams.get('component');
    if (componentParam && componentTypes.some(c => c.id === componentParam)) {
      setSelectedComponent(componentParam);
    }
  }, [location, setSelectedComponent]);

  // Get workflows for selected component
  const getWorkflowsForComponent = (componentType: string) => {
    return getWorkflowsByComponent(componentType);
  };

  // Handle creating new workflow for subcomponent
  const handleCreateWorkflow = (componentType: string, subcomponent: string) => {
    setNewWorkflowData({
      componentType,
      subcomponent,
      name: `Flujo de ${subcomponent}`,
      description: `Proceso de implementación para ${subcomponent}`,
      priority: "medium"
    });
    setCreateWorkflowDialog(true);
  };

  // Handle saving workflow from builder
  const handleSaveWorkflow = async (workflowData: {
    name: string;
    description: string;
    componentType: string;
    steps: any[];
  }) => {
    try {
      await createWorkflowMutation.mutateAsync(workflowData);
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const selectedComponentWorkflows = getWorkflowsForComponent(selectedComponent);
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user,
  });

  const { data: workflows } = useQuery({
    queryKey: ["/api/workflows", (user as any)?.institutionId || 1],
    enabled: !!(user as any)?.institutionId,
  });

  // Dashboard data queries
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats", 1],
    queryFn: () => fetch(`/api/dashboard/stats?institutionId=1`).then(res => res.json()),
    enabled: !!user?.institutionId
  });

  const { data: complianceScores } = useQuery({
    queryKey: ["/api/compliance-scores", 1],
    queryFn: () => fetch(`/api/compliance-scores?institutionId=1`).then(res => res.json()),
    enabled: !!user?.institutionId
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflowData.name,
          description: workflowData.description,
          componentType: workflowData.componentType || newWorkflowData.componentType,
          institutionId: (user as any)?.institutionId || 1,
          assignedToId: (user as any)?.id || 1,
          priority: workflowData.priority || "medium",
          subcomponent: workflowData.subcomponent || newWorkflowData.subcomponent,
          steps: workflowData.steps || [] // Include steps in the request
        }),
      });
      if (!response.ok) {
        throw new Error('Error al crear el flujo de trabajo');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Flujo creado exitosamente",
        description: "El nuevo flujo de trabajo ha sido creado y está listo para usar.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      setCreateWorkflowDialog(false);
      setNewWorkflowData({
        componentType: "",
        subcomponent: "",
        name: "",
        description: "",
        priority: "medium"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear flujo",
        description: error.message || "No se pudo crear el flujo de trabajo.",
        variant: "destructive",
      });
    },
  });

  // Add default values to prevent errors with complete User type
  const userData: User = (user as User) || {
    id: 0,
    email: "",
    firstName: "Usuario",
    lastName: "",
    role: "user",
    supervisorId: null,
    institutionId: null,
    emailNotifications: true,
    createdAt: null,
    updatedAt: null,
  };

  // Add default values to prevent errors with complete Institution type
  const institutionData: Institution = (institution as Institution) || {
    id: 0,
    name: t('common.institution'),
    type: "",
    size: "",
    sector: null,
    address: null,
    email: null,
    phone: null,
    website: null,
    legalBasis: null,
    sectorRegulations: null,
    logoUrl: null,
    isActive: true,
    createdAt: null,
    updatedAt: null
  };

  const componentTypes = getComponentTypes(t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Header 
        user={userData} 
        institution={institutionData}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex pt-16">
        <SidebarSimple open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-64 transition-all duration-300 ease-in-out">
          <div className="px-4 pt-2 pb-6">
            {/* Compact Header Section */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                      <Target className="w-5 h-5" />
                    </div>
                    {t('workflows.title')}
                  </h1>
                  <p className="text-slate-600 text-sm">
                    {t('workflows.subtitle')}
                  </p>
                </div>
                <Button 
                  onClick={() => setCreateWorkflowDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('workflows.create')}
                </Button>
              </div>
            </div>

            {/* Component Navigation Cards */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {componentTypes.map((component) => (
                <button
                  key={component.id}
                  onClick={() => setSelectedComponent(component.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-200 text-left",
                    selectedComponent === component.id
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400 shadow-lg scale-105"
                      : "bg-white/80 border-slate-200/60 hover:border-blue-300 hover:shadow-md text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      selectedComponent === component.id ? "bg-white/30" : component.color
                    )}></div>
                    <span className="text-xs font-semibold truncate">
                      {component.name}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-75 leading-tight">
                    {component.subcomponents.length} {t('workflows.subcomponents')}
                  </div>
                </button>
              ))}
            </div>

            <Tabs value={selectedComponent} onValueChange={setSelectedComponent} className="w-full">
              
              {componentTypes.map((component) => (
                <TabsContent key={component.id} value={component.id} className="mt-0">
                  <div className="space-y-3">
                    {/* Compact Component Overview */}
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold", component.color)}>
                              {component.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-lg text-slate-800">{component.name}</CardTitle>
                              <CardDescription className="text-sm text-slate-600">{component.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {component.subcomponents.length} {t('workflows.subcomponents')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {component.subcomponents.map((subcomponent, index) => (
                            <button
                              key={index}
                              onClick={() => handleCreateWorkflow(component.id, subcomponent)}
                              className="flex items-center gap-2 p-2 bg-gradient-to-r from-slate-50/50 to-white/80 border border-slate-200/60 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                            >
                              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", component.color)}></div>
                              <span className="text-xs text-slate-700 truncate">{subcomponent}</span>
                              <Plus className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Active Workflows */}
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          {t('workflows.workflowsTitle')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {getWorkflowsByComponent(component.id).length > 0 ? (
                          <div className="space-y-3">
                            {getWorkflowsByComponent(component.id).map((workflow) => (
                              <div key={workflow.id} className="bg-gradient-to-r from-slate-50/50 to-white/80 border border-slate-200/60 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", component.color)}></div>
                                    <h4 className="font-semibold text-slate-900 text-sm">{workflow.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {workflow.priority}
                                    </Badge>
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedWorkflow(workflow);
                                      setExecutionDialog(true);
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    {t('workflows.execute')}
                                  </Button>
                                </div>
                                <p className="text-xs text-slate-600 mb-3">{workflow.description}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {workflow.estimatedDuration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <UserIcon className="h-3 w-3" />
                                      {workflow.responsibleRole}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {workflow.steps.length} {t('workflows.steps')}
                                    </span>
                                  </div>
                                  <span>0% {t('workflows.progress')}</span>
                                </div>
                                <Progress value={0} className="h-1.5 mt-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">{t('workflows.noWorkflows')}</p>
                            <p className="text-xs mt-1">{t('workflows.createFirst')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Workflow Execution Dialog */}
            <Dialog open={executionDialog} onOpenChange={setExecutionDialog}>
              <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-600" />
                    {t('workflows.execute')}: {selectedWorkflow?.name}
                  </DialogTitle>
                </DialogHeader>
                {selectedWorkflow && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-medium text-slate-700">{t('workflows.estimatedDuration')}</div>
                        <div className="text-lg font-bold text-slate-900">{selectedWorkflow.estimatedDuration}</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <UserIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-sm font-medium text-slate-700">{t('workflows.responsible')}</div>
                        <div className="text-lg font-bold text-slate-900">{selectedWorkflow.responsibleRole}</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-sm font-medium text-slate-700">{t('workflows.totalSteps')}</div>
                        <div className="text-lg font-bold text-slate-900">{selectedWorkflow.steps.length}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-slate-800">{t('workflows.workflowSteps')}</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedWorkflow.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50/50 to-white/80 border border-slate-200/60 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{step.name}</h4>
                              <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setExecutionDialog(false)}
                        className="border-slate-200 text-slate-700"
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Play className="h-4 w-4 mr-2" />
                        {t('workflows.execute')}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Create Workflow Dialog */}
            <Dialog open={createWorkflowDialog} onOpenChange={setCreateWorkflowDialog}>
              <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm !fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !transform">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    {t('workflows.create')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name" className="text-sm font-semibold text-slate-700">
                      {t('workflows.title')}
                    </Label>
                    <Input
                      id="workflow-name"
                      value={newWorkflowData.name}
                      onChange={(e) => setNewWorkflowData({ ...newWorkflowData, name: e.target.value })}
                      className="bg-white/70 border-slate-200/60 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-description" className="text-sm font-semibold text-slate-700">
                      {t('workflows.description')}
                    </Label>
                    <Input
                      id="workflow-description"
                      value={newWorkflowData.description}
                      onChange={(e) => setNewWorkflowData({ ...newWorkflowData, description: e.target.value })}
                      className="bg-white/70 border-slate-200/60 focus:border-blue-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setCreateWorkflowDialog(false)}
                      className="flex-1 border-slate-200 text-slate-700"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      onClick={() => createWorkflowMutation.mutate(newWorkflowData)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {t('workflows.create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>

      <FloatingChatbot onClick={() => setIsAIModalOpen(true)} />
      
      <AIToolsModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}