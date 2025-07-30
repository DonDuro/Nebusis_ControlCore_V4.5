import React, { useState, useEffect } from "react";
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
import { Plus, Calendar, User, Target, Edit, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

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
    objectivesList: "Objectives List",
    performanceAnalytics: "Performance Analytics",
    statusDistribution: "Status Distribution",
    frameworkDistribution: "Framework Distribution",
    progressOverTime: "Progress Over Time",
    keyMetrics: "Key Metrics",
    totalObjectives: "Total Objectives",
    completedObjectives: "Completed",
    activeObjectives: "Active",
    averageProgress: "Avg Progress",
    updateStatus: "Update Status",
    notStarted: "Not Started",
    inProgress: "In Progress",
    completed: "Completed",
    onHold: "On Hold",
    createNewObjective: "Create New Objective",
    objectiveTitle: "Objective Title",
    description: "Detailed Description",
    frameworkComponent: "Framework Component",
    expectedOutcome: "Expected Outcome/Indicator",
    ownerResponsible: "Owner/Responsible Person",
    resourcesRequired: "Resources Required",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    save: "Save",
    cancel: "Cancel"
  },
  es: {
    title: "Planificación",
    subtitle: "Gestión de objetivos alineados con COSO & INTOSAI",
    addObjective: "Agregar Objetivo",
    objectivesList: "Lista de Objetivos",
    performanceAnalytics: "Análisis de Rendimiento",
    statusDistribution: "Distribución por Estado",
    frameworkDistribution: "Distribución por Marco",
    progressOverTime: "Progreso en el Tiempo",
    keyMetrics: "Métricas Clave",
    totalObjectives: "Total Objetivos",
    completedObjectives: "Completados",
    activeObjectives: "Activos",
    averageProgress: "Progreso Promedio",
    updateStatus: "Actualizar Estado",
    notStarted: "No Iniciado",
    inProgress: "En Progreso", 
    completed: "Completado",
    onHold: "En Espera",
    createNewObjective: "Crear Nuevo Objetivo",
    objectiveTitle: "Título del Objetivo",
    description: "Descripción Detallada",
    frameworkComponent: "Componente del Marco",
    expectedOutcome: "Resultado Esperado/Indicador",
    ownerResponsible: "Propietario/Responsable",
    resourcesRequired: "Recursos Requeridos",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Finalización",
    status: "Estado",
    save: "Guardar",
    cancel: "Cancelar"
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

export default function Planning() {
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language] = useState<'en' | 'es'>(getCurrentLanguage);
  const t = translations[language];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const statusColors = {
    'not_started': '#6B7280',
    'in_progress': '#3B82F6', 
    'completed': '#10B981',
    'on_hold': '#F59E0B'
  };

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

  // Fetch objectives
  const { data: objectives = [], isLoading: objectivesLoading, refetch } = useQuery({
    queryKey: ["/api/planning/objectives"],
    queryFn: async () => {
      const response = await fetch("/api/planning/objectives?institutionId=1");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  // Create objective mutation
  const createObjectiveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/planning/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create objective');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planning/objectives"] });
      setIsDialogOpen(false);
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
      toast({
        title: language === 'es' ? "Objetivo creado" : "Objective created",
        description: language === 'es' ? "El objetivo se ha creado exitosamente." : "The objective has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'es' ? "Error" : "Error",
        description: error.message || (language === 'es' ? "Hubo un error al crear el objetivo." : "There was an error creating the objective."),
        variant: "destructive"
      });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/planning/objectives/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planning/objectives"] });
      toast({
        title: language === 'es' ? "Estado actualizado" : "Status updated",
        description: language === 'es' ? "El estado del objetivo se ha actualizado." : "The objective status has been updated."
      });
    }
  });

  const handleSubmit = () => {
    if (!objectiveForm.title || !objectiveForm.description || !objectiveForm.frameworkComponent) {
      toast({
        title: language === 'es' ? "Error de validación" : "Validation error",
        description: language === 'es' ? "Por favor complete todos los campos obligatorios." : "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const dataToSend = {
      institutionId: 1,
      ...objectiveForm,
      startDate: objectiveForm.startDate,
      endDate: objectiveForm.endDate,
      createdById: (user as any)?.id || 1,
    };
    
    createObjectiveMutation.mutate(dataToSend);
  };

  // Calculate chart data
  const statusData = React.useMemo(() => {
    const statusCounts = objectives.reduce((acc: any, obj: PlanningObjective) => {
      acc[obj.status] = (acc[obj.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusOptions(language).find(s => s.value === status)?.label || status,
      value: count as number,
      color: statusColors[status as keyof typeof statusColors]
    }));
  }, [objectives, language]);

  const frameworkData = React.useMemo(() => {
    const frameworkCounts = objectives.reduce((acc: any, obj: PlanningObjective) => {
      const framework = obj.frameworkComponent.startsWith('coso_') ? 'COSO' : 'INTOSAI';
      acc[framework] = (acc[framework] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frameworkCounts).map(([framework, count]) => ({
      name: framework,
      value: count as number
    }));
  }, [objectives]);

  const keyMetrics = React.useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter((obj: PlanningObjective) => obj.status === 'completed').length;
    const active = objectives.filter((obj: PlanningObjective) => obj.status === 'in_progress').length;
    const avgProgress = total > 0 ? Math.round(objectives.reduce((sum: number, obj: PlanningObjective) => sum + (obj.progress || 0), 0) / total) : 0;

    return { total, completed, active, avgProgress };
  }, [objectives]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user || undefined} institution={{ id: 1, name: "Institution" }} />
      <div className="flex">
        <SidebarSimple isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 pt-20">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-gray-600 mt-1">{t.subtitle}</p>
              </div>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.addObjective}
              </Button>
            </div>
          </div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Objectives List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    {t.objectivesList}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {objectivesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : objectives.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No objectives created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {objectives.map((objective: PlanningObjective) => (
                        <div key={objective.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{objective.title}</h3>
                            <Select
                              value={objective.status}
                              onValueChange={(newStatus) => 
                                updateStatusMutation.mutate({ id: objective.id, status: newStatus })
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getStatusOptions(language).map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      <div 
                                        className={`w-2 h-2 rounded-full mr-2`}
                                        style={{ backgroundColor: statusColors[option.value as keyof typeof statusColors] }}
                                      />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {objective.ownerResponsible}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(objective.startDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge 
                              variant="outline"
                              className={getStatusOptions(language).find(s => s.value === objective.status)?.color}
                            >
                              {getStatusOptions(language).find(s => s.value === objective.status)?.label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Analytics */}
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{t.totalObjectives}</p>
                        <p className="text-2xl font-bold text-gray-900">{keyMetrics.total}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{t.completedObjectives}</p>
                        <p className="text-2xl font-bold text-green-600">{keyMetrics.completed}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{t.activeObjectives}</p>
                        <p className="text-2xl font-bold text-blue-600">{keyMetrics.active}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{t.averageProgress}</p>
                        <p className="text-2xl font-bold text-purple-600">{keyMetrics.avgProgress}%</p>
                      </div>
                      <PieChart className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.statusDistribution}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Framework Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.frameworkDistribution}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={frameworkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create Objective Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.createNewObjective}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.objectiveTitle} *</label>
                  <Input
                    value={objectiveForm.title}
                    onChange={(e) => setObjectiveForm({...objectiveForm, title: e.target.value})}
                    placeholder={t.objectiveTitle}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.description} *</label>
                  <Textarea
                    value={objectiveForm.description}
                    onChange={(e) => setObjectiveForm({...objectiveForm, description: e.target.value})}
                    placeholder={t.description}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.frameworkComponent} *</label>
                  <Select
                    value={objectiveForm.frameworkComponent}
                    onValueChange={(value) => setObjectiveForm({...objectiveForm, frameworkComponent: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.frameworkComponent} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFrameworkComponents(language).map(category => (
                        <div key={category.category}>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500">
                            {category.category}
                          </div>
                          {category.components.map(component => (
                            <SelectItem key={component.value} value={component.value}>
                              {component.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.expectedOutcome}</label>
                  <Textarea
                    value={objectiveForm.expectedOutcome}
                    onChange={(e) => setObjectiveForm({...objectiveForm, expectedOutcome: e.target.value})}
                    placeholder={t.expectedOutcome}
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.ownerResponsible}</label>
                  <Input
                    value={objectiveForm.ownerResponsible}
                    onChange={(e) => setObjectiveForm({...objectiveForm, ownerResponsible: e.target.value})}
                    placeholder={t.ownerResponsible}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.resourcesRequired}</label>
                  <Textarea
                    value={objectiveForm.resourcesRequired}
                    onChange={(e) => setObjectiveForm({...objectiveForm, resourcesRequired: e.target.value})}
                    placeholder={t.resourcesRequired}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">{t.startDate}</label>
                    <Input
                      type="date"
                      value={objectiveForm.startDate}
                      onChange={(e) => setObjectiveForm({...objectiveForm, startDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">{t.endDate}</label>
                    <Input
                      type="date"
                      value={objectiveForm.endDate}
                      onChange={(e) => setObjectiveForm({...objectiveForm, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{t.status}</label>
                  <Select
                    value={objectiveForm.status}
                    onValueChange={(value) => setObjectiveForm({...objectiveForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {getStatusOptions(language).map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createObjectiveMutation.isPending}
                >
                  {createObjectiveMutation.isPending ? "..." : t.save}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}