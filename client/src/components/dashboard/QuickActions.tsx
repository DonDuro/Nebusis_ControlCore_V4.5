import { Plus, FileText, AlertTriangle, BarChart3, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionsProps {
  onCreateWorkflow?: () => void;
  onViewDocuments?: () => void;
  onViewAlerts?: () => void;
  onViewReports?: () => void;
  overallProgress?: number;
}

export default function QuickActions({ 
  onCreateWorkflow, 
  onViewDocuments, 
  onViewAlerts, 
  onViewReports,
  overallProgress = 0
}: QuickActionsProps) {
  
  const nextActions = [
    {
      id: 1,
      title: "Crear Nuevo Flujo COSO",
      description: "Iniciar implementación de componente",
      icon: <Plus className="w-5 h-5" />,
      color: "bg-primary",
      priority: "high",
      action: onCreateWorkflow
    },
    {
      id: 2,
      title: "Cargar Documentos",
      description: "Subir documentos institucionales",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-green-500",
      priority: "medium",
      action: onViewDocuments
    },
    {
      id: 3,
      title: "Revisar Alertas",
      description: "Atender notificaciones pendientes",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "bg-yellow-500",
      priority: "high",
      action: onViewAlerts
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Progreso General COSO
          </CardTitle>
          <CardDescription>
            Estado actual de implementación de control interno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray={`${overallProgress * 0.88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{overallProgress}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                <p className="text-sm text-gray-600">Cumplimiento COSO</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewReports}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Ver Informe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Próximas Acciones
          </CardTitle>
          <CardDescription>
            Tareas importantes que requieren tu atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextActions.map((action) => (
              <TooltipProvider key={action.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={action.action}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                          {action.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.title}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getPriorityColor(action.priority)}>
                          {action.priority === "high" ? "Alta" : action.priority === "medium" ? "Media" : "Baja"}
                        </Badge>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clic para acceder: {action.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Enfoque de Hoy
          </CardTitle>
          <CardDescription>
            Recomendaciones basadas en tu progreso actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallProgress < 30 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm text-primary">
                  <strong>Prioridad:</strong> Completa la configuración inicial y carga los documentos base de tu institución
                </p>
              </div>
            )}
            {overallProgress >= 30 && overallProgress < 70 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-yellow-800">
                  <strong>Enfoque:</strong> Continúa con la implementación de los flujos de trabajo COSO en progreso
                </p>
              </div>
            )}
            {overallProgress >= 70 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-green-800">
                  <strong>Excelente:</strong> Revisa y prepara los informes finales para la Entidad de Auditoría
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}