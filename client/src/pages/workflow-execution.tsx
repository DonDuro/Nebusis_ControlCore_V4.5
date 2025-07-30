import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  MessageSquare, 
  Calendar,
  User,
  FileText,
  Activity,
  RefreshCw,
  Filter
} from "lucide-react";

interface WorkflowExecution {
  id: number;
  workflowDefinitionId: number;
  name: string;
  description: string;
  framework: string;
  component: string;
  status: "not_started" | "in_progress" | "paused" | "completed" | "overdue";
  progress: number;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  assignedTo: string;
  steps: ExecutionStep[];
  createdBy: string;
  createdAt: string;
}

interface ExecutionStep {
  id: string;
  name: string;
  description: string;
  responsible: string;
  estimatedDuration: number;
  requiresEvidence: boolean;
  order: number;
  status: "pending" | "in_progress" | "completed" | "overdue";
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  comments: string;
  evidence: string[];
  actualDuration?: number;
}

const STATUS_COLORS = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800", 
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  pending: "bg-gray-100 text-gray-600"
};

const STATUS_LABELS = {
  not_started: "No Iniciado",
  in_progress: "En Progreso",
  paused: "Pausado", 
  completed: "Completado",
  overdue: "Vencido",
  pending: "Pendiente"
};

export default function WorkflowExecutionPage() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [launchForm, setLaunchForm] = useState({
    workflowDefinitionId: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  // Fetch workflow definitions from API
  const { data: availableDefinitions = [], isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ["/api/workflow-definitions", { institutionId: 1 }],
  });

  // Mock workflow executions for demo (remove when API is ready)
  const mockWorkflowExecutions: WorkflowExecution[] = [
    {
      id: 1,
      workflowDefinitionId: 1,
      name: "Evaluación de Ambiente de Control - Q1 2025",
      description: "Evaluación trimestral del ambiente de control",
      framework: "coso",
      component: "control_environment",
      status: "in_progress",
      progress: 35,
      startedAt: "2025-01-20",
      dueDate: "2025-02-15",
      assignedTo: "Ana Rodríguez",
      steps: [
        {
          id: "1",
          name: "Análisis de Estructura Organizacional",
          description: "Revisar organigrama y definición de roles",
          responsible: "Analista de Control",
          estimatedDuration: 3,
          requiresEvidence: true,
          order: 1,
          status: "completed",
          startedAt: "2025-01-20",
          completedAt: "2025-01-22",
          dueDate: "2025-01-23",
          comments: "Estructura organizacional revisada. Se identificaron 3 áreas sin clara definición de responsabilidades.",
          evidence: ["organigrama_2025.pdf", "matriz_responsabilidades.xlsx"],
          actualDuration: 2
        },
        {
          id: "2",
          name: "Evaluación de Políticas",
          description: "Revisar políticas institucionales vigentes", 
          responsible: "Especialista Legal",
          estimatedDuration: 5,
          requiresEvidence: true,
          order: 2,
          status: "in_progress",
          startedAt: "2025-01-23",
          dueDate: "2025-01-28",
          comments: "En proceso de revisión de 15 políticas principales. Completado 60%.",
          evidence: ["politicas_vigentes.pdf"],
          actualDuration: 3
        },
        {
          id: "3",
          name: "Entrevistas con Personal Clave",
          description: "Realizar entrevistas con directivos y personal clave",
          responsible: "Auditor Senior",
          estimatedDuration: 4,
          requiresEvidence: true,
          order: 3,
          status: "pending",
          dueDate: "2025-02-01",
          comments: "",
          evidence: []
        }
      ],
      createdBy: "Celso Alvarado",
      createdAt: "2025-01-20"
    },
    {
      id: 2,
      workflowDefinitionId: 2,
      name: "Análisis de Riesgos Q1 2025",
      description: "Análisis trimestral de riesgos operacionales",
      framework: "coso",
      component: "risk_assessment", 
      status: "overdue",
      progress: 15,
      startedAt: "2025-01-15",
      dueDate: "2025-01-25",
      assignedTo: "Carlos Mendoza",
      steps: [
        {
          id: "1",
          name: "Identificación de Riesgos",
          description: "Mapeo inicial de riesgos operacionales",
          responsible: "Analista de Riesgos",
          estimatedDuration: 2,
          requiresEvidence: true,
          order: 1,
          status: "overdue",
          startedAt: "2025-01-15",
          dueDate: "2025-01-17",
          comments: "Proceso retrasado por falta de información de algunas áreas.",
          evidence: [],
          actualDuration: 5
        }
      ],
      createdBy: "Ana Rodríguez",
      createdAt: "2025-01-15"
    }
  ];

  const filteredExecutions = mockWorkflowExecutions.filter(execution => 
    selectedStatus === "all" || execution.status === selectedStatus
  );

  const handleLaunchWorkflow = () => {
    console.log("Launching workflow:", launchForm);
    toast({
      title: "Flujo de trabajo iniciado",
      description: "El flujo de trabajo se ha lanzado exitosamente"
    });
    setIsLaunchModalOpen(false);
    setLaunchForm({
      workflowDefinitionId: "",
      assignedTo: "",
      dueDate: "",
      priority: "medium"
    });
  };

  const handleUpdateStepStatus = (executionId: number, stepId: string, newStatus: string) => {
    console.log("Updating step status:", { executionId, stepId, newStatus });
    toast({
      title: "Estado actualizado",
      description: "El estado del paso se ha actualizado exitosamente"
    });
  };

  const handleUploadEvidence = (executionId: number, stepId: string) => {
    console.log("Uploading evidence for:", { executionId, stepId });
    toast({
      title: "Evidencia subida",
      description: "La evidencia se ha subido exitosamente"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
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
      />
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Ejecución de Flujos de Trabajo</h1>
            <p className="mt-2 text-gray-600">
              Ejecuta, monitorea y gestiona instancias activas de flujos de trabajo
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="status-filter">Filtrar por estado:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="not_started">No Iniciado</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isLaunchModalOpen} onOpenChange={setIsLaunchModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Lanzar Nuevo Flujo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Lanzar Flujo de Trabajo</DialogTitle>
                  <DialogDescription>
                    Inicia una nueva ejecución de un flujo de trabajo definido
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-select">Flujo de Trabajo *</Label>
                    <Select 
                      value={launchForm.workflowDefinitionId} 
                      onValueChange={(value) => setLaunchForm(prev => ({ ...prev, workflowDefinitionId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un flujo de trabajo" />
                      </SelectTrigger>
                      <SelectContent>
                        {(availableDefinitions as any[]).map((def: any) => (
                          <SelectItem key={def.id} value={def.id.toString()}>
                            {def.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned-to">Asignado a *</Label>
                    <Input
                      id="assigned-to"
                      value={launchForm.assignedTo}
                      onChange={(e) => setLaunchForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="Nombre del responsable"
                    />
                  </div>

                  <div>
                    <Label htmlFor="due-date">Fecha límite</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={launchForm.dueDate}
                      onChange={(e) => setLaunchForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select 
                      value={launchForm.priority} 
                      onValueChange={(value: "low" | "medium" | "high") => setLaunchForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsLaunchModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleLaunchWorkflow}
                      disabled={!launchForm.workflowDefinitionId || !launchForm.assignedTo}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Lanzar Flujo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Workflow Executions */}
          <div className="space-y-6">
            {filteredExecutions.map((execution) => (
              <Card key={execution.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl">{execution.name}</CardTitle>
                        <Badge className={STATUS_COLORS[execution.status]}>
                          {STATUS_LABELS[execution.status]}
                        </Badge>
                      </div>
                      <CardDescription className="mb-3">
                        {execution.description}
                      </CardDescription>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          Asignado: {execution.assignedTo}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Fecha límite: {execution.dueDate || "Sin definir"}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Activity className="w-4 h-4 mr-2" />
                          Progreso: {execution.progress}%
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          {execution.steps.length} pasos
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progreso general</span>
                          <span>{execution.progress}%</span>
                        </div>
                        <Progress value={execution.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {execution.status === "overdue" && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Este flujo de trabajo está vencido. Revisa los pasos atrasados y actualiza el cronograma.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Pasos del Flujo de Trabajo</h4>
                    
                    {execution.steps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(step.status)}
                            <div>
                              <h5 className="font-medium">{step.order}. {step.name}</h5>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                          <Badge className={STATUS_COLORS[step.status]} variant="secondary">
                            {STATUS_LABELS[step.status]}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>Responsable: {step.responsible}</div>
                          <div>Estimado: {step.estimatedDuration} días</div>
                          <div>Fecha límite: {step.dueDate || "Sin definir"}</div>
                          <div>
                            {step.actualDuration ? `Real: ${step.actualDuration} días` : "En progreso"}
                          </div>
                        </div>

                        {step.comments && (
                          <div className="mb-3">
                            <div className="flex items-center text-sm text-gray-700 mb-1">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Comentarios:
                            </div>
                            <p className="text-sm text-gray-600 pl-5">{step.comments}</p>
                          </div>
                        )}

                        {step.evidence.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center text-sm text-gray-700 mb-1">
                              <FileText className="w-4 h-4 mr-1" />
                              Evidencia:
                            </div>
                            <div className="flex flex-wrap gap-2 pl-5">
                              {step.evidence.map((file, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {file}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Select
                            value={step.status}
                            onValueChange={(value) => handleUpdateStepStatus(execution.id, step.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="in_progress">En Progreso</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                            </SelectContent>
                          </Select>

                          {step.requiresEvidence && (
                            <Button
                              onClick={() => handleUploadEvidence(execution.id, step.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Subir Evidencia
                            </Button>
                          )}

                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Comentar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExecutions.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay flujos de trabajo {selectedStatus !== "all" ? `con estado "${STATUS_LABELS[selectedStatus as keyof typeof STATUS_LABELS]}"` : "ejecutándose"}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedStatus !== "all" 
                  ? "Cambia el filtro para ver flujos de trabajo con otros estados"
                  : "Lanza tu primer flujo de trabajo para comenzar"
                }
              </p>
              {selectedStatus === "all" && (
                <Button onClick={() => setIsLaunchModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Lanzar Primer Flujo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}