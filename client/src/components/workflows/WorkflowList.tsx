import { Workflow } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowListProps {
  workflows: Workflow[];
}

const componentNames = {
  ambiente_control: "Ambiente de Control",
  evaluacion_riesgos: "Evaluación de Riesgos",
  actividades_control: "Actividades de Control",
  informacion_comunicacion: "Información y Comunicación",
  supervision: "Supervisión",
};

const statusConfig = {
  not_started: { label: "No Iniciado", color: "bg-gray-100 text-gray-800" },
  in_progress: { label: "En Progreso", color: "bg-primary/20 text-primary" },
  under_review: { label: "En Revisión", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completado", color: "bg-green-100 text-green-800" },
  observed: { label: "Observado", color: "bg-red-100 text-red-800" },
};

export default function WorkflowList({ workflows }: WorkflowListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === "completed") return "bg-dr-success";
    if (progress >= 75) return "bg-dr-warning";
    if (progress > 0) return "bg-dr-light-blue";
    return "bg-gray-300";
  };

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-project-diagram text-gray-400 text-6xl mb-4"></i>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay flujos de trabajo</h3>
        <p className="text-gray-500 mb-6">Comienza creando tu primer flujo de trabajo COSO</p>
        <Button className="bg-dr-light-blue text-white hover:bg-dr-blue">
          <i className="fas fa-plus mr-2"></i>
          Crear Flujo de Trabajo
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => {
        const componentName = componentNames[workflow.componentType as keyof typeof componentNames] || workflow.name;
        const statusInfo = statusConfig[workflow.status as keyof typeof statusConfig];
        const progressColor = getProgressColor(workflow.progress, workflow.status);

        return (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    {componentName}
                  </CardTitle>
                  <p className="text-sm text-dr-neutral">{workflow.description}</p>
                </div>
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso</span>
                    <span className="text-sm font-bold text-gray-900">{workflow.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${workflow.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-dr-neutral">Creado:</span>
                    <p className="font-medium">{formatDate(workflow.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-dr-neutral">Vencimiento:</span>
                    <p className="font-medium">{formatDate(workflow.dueDate)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-eye mr-2"></i>
                    Ver Detalles
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-download"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
