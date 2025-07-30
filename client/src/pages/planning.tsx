import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

import { PlanningObjective } from "@shared/schema";
import { ClipboardList, Plus, Calendar, User, Target, ChevronRight, Users, Edit } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Language detection from localStorage
const getCurrentLanguage = (): 'en' | 'es' => {
  const lang = localStorage.getItem('language');
  return (lang === 'es' || lang === 'en') ? lang : 'en';
};

// Translations
const translations = {
  en: {
    title: "Planning",
    subtitle: "Objective management aligned with COSO & INTOSAI",
    addObjective: "Add Objective",
    noObjectives: "No objectives created",
    startPlanning: "Start by creating your first planning objective",
    objectiveTitle: "Objective Title",
    description: "Detailed Description",
    specificPurpose: "Specific Purpose",
    frameworkComponent: "Framework Component",
    expectedOutcome: "Expected Outcome/Indicator",
    ownerResponsible: "Owner/Responsible Person",
    resourcesRequired: "Resources Required",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    progress: "Progress",
    save: "Save",
    cancel: "Cancel",
    notStarted: "Not Started",
    inProgress: "In Progress",
    completed: "Completed",
    onHold: "On Hold",
    controlEnvironment: "Control Environment",
    riskAssessment: "Risk Assessment",
    controlActivities: "Control Activities",
    informationCommunication: "Information & Communication",
    monitoring: "Monitoring Activities",
    createNewObjective: "Create New Objective",
    measurableOutcome: "Describe the measurable outcome or success indicator"
  },
  es: {
    title: "Planificación",
    subtitle: "Gestión de objetivos alineados con COSO & INTOSAI",
    addObjective: "Agregar Objetivo",
    noObjectives: "No hay objetivos creados",
    startPlanning: "Comience creando su primer objetivo de planificación",
    objectiveTitle: "Título del Objetivo",
    description: "Descripción Detallada",
    specificPurpose: "Propósito Específico",
    frameworkComponent: "Componente del Marco",
    expectedOutcome: "Resultado Esperado/Indicador",
    ownerResponsible: "Propietario/Responsable",
    resourcesRequired: "Recursos Requeridos",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Finalización",
    status: "Estado",
    progress: "Progreso",
    save: "Guardar",
    cancel: "Cancelar",
    notStarted: "No Iniciado",
    inProgress: "En Progreso",
    completed: "Completado",
    onHold: "En Espera",
    controlEnvironment: "Ambiente de Control",
    riskAssessment: "Evaluación de Riesgos",
    controlActivities: "Actividades de Control",
    informationCommunication: "Información y Comunicación",
    monitoring: "Monitoreo y Evaluación",
    createNewObjective: "Crear Nuevo Objetivo",
    measurableOutcome: "Describa el resultado medible o indicador de éxito"
  }
};

const getFrameworkComponents = (lang: string) => [
  // COSO Framework Components
  { 
    category: lang === 'es' ? 'Marco COSO' : 'COSO Framework',
    components: [
      { value: "coso_ambiente_control", label: lang === 'es' ? "COSO: Ambiente de Control" : "COSO: Control Environment" },
      { value: "coso_evaluacion_riesgos", label: lang === 'es' ? "COSO: Evaluación de Riesgos" : "COSO: Risk Assessment" },
      { value: "coso_actividades_control", label: lang === 'es' ? "COSO: Actividades de Control" : "COSO: Control Activities" },
      { value: "coso_informacion_comunicacion", label: lang === 'es' ? "COSO: Información y Comunicación" : "COSO: Information & Communication" },
      { value: "coso_supervision", label: lang === 'es' ? "COSO: Supervisión" : "COSO: Monitoring Activities" }
    ]
  },
  // INTOSAI Framework Components
  { 
    category: lang === 'es' ? 'Marco INTOSAI' : 'INTOSAI Framework',
    components: [
      { value: "intosai_organizacion", label: lang === 'es' ? "INTOSAI: Organización" : "INTOSAI: Organization" },
      { value: "intosai_planificacion", label: lang === 'es' ? "INTOSAI: Planificación" : "INTOSAI: Planning" },
      { value: "intosai_gestion_riesgos", label: lang === 'es' ? "INTOSAI: Gestión de Riesgos" : "INTOSAI: Risk Management" },
      { value: "intosai_control_actividades", label: lang === 'es' ? "INTOSAI: Control de Actividades" : "INTOSAI: Control Activities" },
      { value: "intosai_informacion_comunicacion", label: lang === 'es' ? "INTOSAI: Información y Comunicación" : "INTOSAI: Information & Communication" },
      { value: "intosai_supervision_evaluacion", label: lang === 'es' ? "INTOSAI: Supervisión y Evaluación" : "INTOSAI: Monitoring & Evaluation" }
    ]
  }
];

const getStatusOptions = (lang: string) => [
  { value: "not_started", label: lang === 'es' ? "No Iniciado" : "Not Started", color: "bg-gray-100 text-gray-800" },
  { value: "in_progress", label: lang === 'es' ? "En Progreso" : "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: lang === 'es' ? "Completado" : "Completed", color: "bg-green-100 text-green-800" },
  { value: "on_hold", label: lang === 'es' ? "En Espera" : "On Hold", color: "bg-yellow-100 text-yellow-800" }
];

interface ObjectiveFormData {
  title: string;
  description: string;
  frameworkComponent: string;
  expectedOutcome: string;
  ownerResponsible: string;
  resourcesRequired: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ResourceFormData {
  resourceType: string;
  resourceName: string;
  roleDescription: string;
}

export default function Planning() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<PlanningObjective | null>(null);
  const [currentLang, setCurrentLang] = useState<'en' | 'es'>(getCurrentLanguage());
  const [objectiveForm, setObjectiveForm] = useState<ObjectiveFormData>({
    title: "",
    description: "",
    frameworkComponent: "",
    expectedOutcome: "",
    ownerResponsible: "",
    resourcesRequired: "",
    startDate: "",
    endDate: "",
    status: "not_started"
  });
  const [resourceForm, setResourceForm] = useState<ResourceFormData>({
    resourceType: "person",
    resourceName: "",
    roleDescription: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user,
  });

  const { data: objectives = [] } = useQuery<PlanningObjective[]>({
    queryKey: ["/api/planning/objectives", { institutionId: 1 }],
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["/api/planning/resources", selectedObjective?.id],
    enabled: !!selectedObjective,
  });



  const createObjectiveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/planning/objectives", data);
    },
    onSuccess: () => {
      toast({
        title: "Objetivo creado",
        description: "El objetivo ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/planning/objectives"] });
      setIsCreateModalOpen(false);
      setObjectiveForm({
        title: "",
        description: "",
        frameworkComponent: "",
        expectedOutcome: "",
        ownerResponsible: "",
        resourcesRequired: "",
        startDate: "",
        endDate: "",
        status: "not_started"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al crear el objetivo",
        variant: "destructive",
      });
    },
  });

  const addResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/planning/resources", data);
    },
    onSuccess: () => {
      toast({
        title: "Recurso asignado",
        description: "El recurso ha sido asignado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/planning/resources"] });
      setIsResourceModalOpen(false);
      setResourceForm({
        resourceType: "person",
        resourceName: "",
        roleDescription: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al asignar el recurso",
        variant: "destructive",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: number; progress: number }) => {
      return apiRequest("PATCH", `/api/planning/objectives/${id}/progress`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planning/objectives"] });
    },
  });

  const handleCreateObjective = () => {
    if (!objectiveForm.title || !objectiveForm.description || !objectiveForm.frameworkComponent || 
        !objectiveForm.expectedOutcome || !objectiveForm.ownerResponsible || 
        !objectiveForm.startDate || !objectiveForm.endDate) {
      toast({
        title: "Error",
        description: currentLang === 'es' ? "Por favor complete todos los campos requeridos" : "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    const dataToSend = {
      institutionId: 1,
      ...objectiveForm,
      startDate: objectiveForm.startDate, // Send as string, schema will handle conversion
      endDate: objectiveForm.endDate, // Send as string, schema will handle conversion
      createdById: (user as any)?.id || 1,
    };
    
    console.log("Sending objective data:", dataToSend);
    createObjectiveMutation.mutate(dataToSend);
  };

  const handleAddResource = () => {
    if (!selectedObjective || !resourceForm.resourceName) {
      toast({
        title: currentLang === 'es' ? "Error" : "Error",
        description: currentLang === 'es' ? "Por favor complete todos los campos requeridos" : "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    addResourceMutation.mutate({
      objectiveId: selectedObjective.id,
      ...resourceForm,
      assignedById: (user as any)?.id || 1,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusOptions = getStatusOptions(currentLang);
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getFrameworkComponentLabel = (component: string) => {
    const frameworks = getFrameworkComponents(currentLang);
    // Search through all framework categories to find the component
    for (const framework of frameworks) {
      const componentConfig = framework.components.find(c => c.value === component);
      if (componentConfig) {
        return componentConfig.label;
      }
    }
    return component;
  };

  // Language change effect
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage());
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-nebusis-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nebusis-blue mx-auto"></div>
          <p className="mt-4 text-nebusis-muted">{translations[currentLang].title === "Planificación" ? "Cargando..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nebusis-bg">
      <Header 
        user={user as any} 
        institution={institution as any} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="p-4 sm:p-6 max-w-full">
            <div className="mb-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-nebusis-slate flex items-center">
                  <ClipboardList className="w-6 h-6 mr-2 text-nebusis-blue" />
                  {translations[currentLang].title}
                </h1>
                <p className="text-nebusis-muted mt-1">{translations[currentLang].subtitle}</p>
              </div>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    {translations[currentLang].addObjective}
                  </Button>
                </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{translations[currentLang].createNewObjective}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {/* Objective Title */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].objectiveTitle} *</label>
                        <Input
                          value={objectiveForm.title}
                          onChange={(e) => setObjectiveForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder={currentLang === 'es' ? "Ej: Implementar controles de acceso" : "Ex: Implement access controls"}
                        />
                      </div>
                      
                      {/* Detailed Description */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].description} ({translations[currentLang].specificPurpose}) *</label>
                        <Textarea
                          value={objectiveForm.description}
                          onChange={(e) => setObjectiveForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={currentLang === 'es' ? "Descripción detallada del propósito específico del objetivo" : "Detailed description of the objective's specific purpose"}
                          rows={3}
                        />
                      </div>

                      {/* Framework Component */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].frameworkComponent} *</label>
                        <Select value={objectiveForm.frameworkComponent} onValueChange={(value) => setObjectiveForm(prev => ({ ...prev, frameworkComponent: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={currentLang === 'es' ? "Seleccione el componente del marco" : "Select framework component"} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {getFrameworkComponents(currentLang).map((framework) => (
                              <div key={framework.category}>
                                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                                  {framework.category}
                                </div>
                                {framework.components.map((component) => (
                                  <SelectItem key={component.value} value={component.value}>
                                    {component.label}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Expected Outcome */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].expectedOutcome} *</label>
                        <Textarea
                          value={objectiveForm.expectedOutcome}
                          onChange={(e) => setObjectiveForm(prev => ({ ...prev, expectedOutcome: e.target.value }))}
                          placeholder={translations[currentLang].measurableOutcome}
                          rows={2}
                        />
                      </div>

                      {/* Owner/Responsible Person */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].ownerResponsible} *</label>
                        <Input
                          value={objectiveForm.ownerResponsible}
                          onChange={(e) => setObjectiveForm(prev => ({ ...prev, ownerResponsible: e.target.value }))}
                          placeholder={currentLang === 'es' ? "Nombre del responsable principal" : "Name of the main responsible person"}
                        />
                      </div>

                      {/* Resources Required */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].resourcesRequired} *</label>
                        <Textarea
                          value={objectiveForm.resourcesRequired}
                          onChange={(e) => setObjectiveForm(prev => ({ ...prev, resourcesRequired: e.target.value }))}
                          placeholder={currentLang === 'es' ? "Describe los recursos humanos, técnicos y financieros necesarios" : "Describe the human, technical and financial resources needed"}
                          rows={3}
                        />
                      </div>

                      {/* Start and End Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].startDate} *</label>
                          <Input
                            type="date"
                            value={objectiveForm.startDate}
                            onChange={(e) => setObjectiveForm(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].endDate} *</label>
                          <Input
                            type="date"
                            value={objectiveForm.endDate}
                            onChange={(e) => setObjectiveForm(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{translations[currentLang].status} *</label>
                        <Select value={objectiveForm.status} onValueChange={(value) => setObjectiveForm(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={currentLang === 'es' ? "Seleccione el estado" : "Select status"} />
                          </SelectTrigger>
                          <SelectContent>
                            {getStatusOptions(currentLang).map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="flex-1"
                        >
                          {translations[currentLang].cancel}
                        </Button>
                        <Button 
                          onClick={handleCreateObjective}
                          disabled={createObjectiveMutation.isPending}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {createObjectiveMutation.isPending ? 
                            (currentLang === 'es' ? 'Guardando...' : 'Saving...') : 
                            translations[currentLang].save
                          }
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
            </div>

            {/* Objectives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {objectives.map((objective) => (
                <Card key={objective.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg truncate">{objective.title}</CardTitle>
                      {getStatusBadge(objective.status)}
                    </div>
                    <p className="text-sm text-nebusis-muted">
                      {getFrameworkComponentLabel(objective.frameworkComponent)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {objective.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{objective.description}</p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{translations[currentLang].progress}</span>
                          <span>{objective.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-nebusis-blue h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${objective.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedObjective(objective);
                            setIsResourceModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Users className="w-3 h-3 mr-1" />
{currentLang === 'es' ? 'Recursos' : 'Resources'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newProgress = Math.min(100, (objective.progress || 0) + 10);
                            updateProgressMutation.mutate({ id: objective.id, progress: newProgress });
                          }}
                          className="flex-1"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          +10%
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {objectives.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{translations[currentLang].noObjectives}</h3>
                <p className="text-gray-500 mb-4">{translations[currentLang].startPlanning}</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-nebusis-blue text-white hover:bg-nebusis-blue/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {translations[currentLang].addObjective}
                </Button>
              </div>
            )}

            {/* Resource Assignment Modal */}
            <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{currentLang === 'es' ? 'Asignar Recursos' : 'Assign Resources'}</DialogTitle>
                  <p className="text-sm text-gray-600">
                    {currentLang === 'es' ? 'Objetivo' : 'Objective'}: {selectedObjective?.title}
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-nebusis-slate">{currentLang === 'es' ? 'Tipo de Recurso' : 'Resource Type'}</label>
                    <Select value={resourceForm.resourceType} onValueChange={(value) => setResourceForm(prev => ({ ...prev, resourceType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="person">{currentLang === 'es' ? 'Persona' : 'Person'}</SelectItem>
                        <SelectItem value="department">{currentLang === 'es' ? 'Departamento' : 'Department'}</SelectItem>
                        <SelectItem value="external_consultant">{currentLang === 'es' ? 'Consultor Externo' : 'External Consultant'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-nebusis-slate">{currentLang === 'es' ? 'Nombre del Recurso' : 'Resource Name'} *</label>
                    <Input
                      value={resourceForm.resourceName}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, resourceName: e.target.value }))}
                      placeholder="Ej: María González, Departamento de TI, Consultor ABC"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-nebusis-slate">{currentLang === 'es' ? 'Descripción del Rol' : 'Role Description'}</label>
                    <Textarea
                      value={resourceForm.roleDescription}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, roleDescription: e.target.value }))}
                      placeholder="Descripción de las responsabilidades"
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleAddResource}
                    disabled={addResourceMutation.isPending}
                    className="w-full bg-nebusis-blue text-white hover:bg-nebusis-blue/90"
                  >
{addResourceMutation.isPending ? 
                      (currentLang === 'es' ? 'Asignando...' : 'Assigning...') : 
                      (currentLang === 'es' ? 'Asignar Recurso' : 'Assign Resource')
                    }
                  </Button>
                </div>

                {/* Current Resources */}
                {Array.isArray(resources) && resources.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">{currentLang === 'es' ? 'Recursos Asignados' : 'Assigned Resources'}</h4>
                    <div className="space-y-2">
                      {resources.map((resource: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{resource.resourceName}</p>
                            <p className="text-xs text-gray-500">{resource.resourceType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}