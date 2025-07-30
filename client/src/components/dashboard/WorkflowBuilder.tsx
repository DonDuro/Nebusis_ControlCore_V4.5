import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const workflowTemplates = [
  {
    id: "ambiente_control",
    name: "Ambiente de Control",
    description: "Plantilla estándar para ministerios",
    steps: 8,
    duration: "3-4 semanas",
    icon: "fa-shield-alt",
    color: "bg-dr-success bg-opacity-10 text-dr-success"
  },
  {
    id: "evaluacion_riesgos",
    name: "Evaluación de Riesgos",
    description: "Identificación y análisis de riesgos",
    steps: 12,
    duration: "4-6 semanas",
    icon: "fa-exclamation-triangle",
    color: "bg-dr-warning bg-opacity-10 text-dr-warning"
  },
  {
    id: "actividades_control",
    name: "Actividades de Control",
    description: "Establecimiento de controles operativos",
    steps: 10,
    duration: "5-7 semanas",
    icon: "fa-tasks",
    color: "bg-dr-light-blue bg-opacity-10 text-dr-light-blue"
  }
];

const previewSteps = [
  {
    id: 1,
    name: "Definición de Valores Éticos",
    description: "Establecer código de ética y conducta institucional",
    status: "completed",
    responsible: "Ana Rodríguez",
    date: "15 Feb 2024"
  },
  {
    id: 2,
    name: "Estructura Organizacional",
    description: "Revisar y actualizar organigrama y líneas de autoridad",
    status: "in_progress",
    progress: 75,
    responsible: "Carlos Martínez",
    date: "28 Feb 2024"
  },
  {
    id: 3,
    name: "Políticas de Recursos Humanos",
    description: "Desarrollo de políticas de contratación y capacitación",
    status: "pending",
    responsible: "Por asignar",
    date: "15 Mar 2024"
  }
];

export default function WorkflowBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [institutionSize, setInstitutionSize] = useState<string>("large");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWorkflowMutation = useMutation({
    mutationFn: async (template: any) => {
      return apiRequest("POST", "/api/workflows", {
        name: template.name,
        description: template.description,
        componentType: template.id,
        institutionId: 1,
        assignedToId: 1,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });
    },
    onSuccess: () => {
      toast({
        title: "Flujo de trabajo creado",
        description: "El flujo de trabajo ha sido creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el flujo de trabajo.",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkflow = (template: any) => {
    createWorkflowMutation.mutate(template);
  };

  const generateAIWorkflow = async () => {
    toast({
      title: "Generando flujo con IA...",
      description: "El asistente está personalizando el flujo según tu institución.",
    });
    
    // Simulate AI generation
    setTimeout(() => {
      toast({
        title: "Flujo generado",
        description: "El flujo de trabajo ha sido personalizado según las características de tu institución.",
      });
    }, 2000);
  };

  return (
    <div className="mt-6 bg-dr-surface rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Constructor de Flujos de Trabajo</h2>
          <div className="flex items-center space-x-3">
            <Select value={institutionSize} onValueChange={setInstitutionSize}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tamaño de institución" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Ministerio (Grande)</SelectItem>
                <SelectItem value="medium">Dirección (Mediana)</SelectItem>
                <SelectItem value="small">Departamento (Pequeña)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={generateAIWorkflow}
              className="bg-dr-light-blue text-white hover:bg-dr-blue"
            >
              <i className="fas fa-magic mr-2"></i>
              Generar Flujo IA
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Custom Workflow */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-dr-light-blue transition-colors cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-dr-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-plus text-dr-blue text-lg"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Crear Flujo Personalizado</h3>
              <p className="text-sm text-dr-neutral">Diseña un flujo de trabajo desde cero</p>
            </div>
          </div>

          {/* Template Workflows */}
          {workflowTemplates.map((template) => (
            <div 
              key={template.id}
              className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleCreateWorkflow(template)}
            >
              <div className="text-center">
                <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <i className={`fas ${template.icon} text-lg`}></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-dr-neutral mb-3">{template.description}</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-dr-neutral">
                  <span>{template.steps} pasos</span>
                  <span>•</span>
                  <span>{template.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Preview */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa: Ambiente de Control</h3>
          <div className="space-y-4">
            {previewSteps.map((step) => {
              const getStepColor = () => {
                if (step.status === "completed") return "bg-dr-success bg-opacity-5 border-dr-success border-opacity-20";
                if (step.status === "in_progress") return "bg-dr-warning bg-opacity-5 border-dr-warning border-opacity-20";
                return "bg-gray-50 border-gray-200";
              };

              const getStepIcon = () => {
                if (step.status === "completed") return { icon: "fa-check", color: "bg-dr-success text-white" };
                if (step.status === "in_progress") return { icon: step.id.toString(), color: "bg-dr-warning text-white" };
                return { icon: step.id.toString(), color: "bg-gray-400 text-white" };
              };

              const getStatusText = () => {
                if (step.status === "completed") return { text: "Completado", color: "text-dr-success" };
                if (step.status === "in_progress") return { text: `En Progreso (${step.progress}%)`, color: "text-dr-warning" };
                return { text: "Pendiente", color: "text-gray-500" };
              };

              const iconInfo = getStepIcon();
              const statusInfo = getStatusText();

              return (
                <div key={step.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${getStepColor()}`}>
                  <div className={`w-8 h-8 ${iconInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {step.status === "completed" ? (
                      <i className={`fas ${iconInfo.icon} text-sm`}></i>
                    ) : (
                      <span className="text-sm font-bold">{iconInfo.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                    <p className="text-sm text-dr-neutral">{step.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                      <span className="text-dr-neutral">Responsable: {step.responsible}</span>
                      <span className="text-dr-neutral">
                        {step.status === "completed" ? "Fecha: " : "Vence: "}{step.date}
                      </span>
                    </div>
                  </div>
                  <button className="text-dr-neutral hover:text-dr-blue">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
