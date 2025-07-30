import { Workflow, ComplianceScore } from "@shared/schema";

interface WorkflowProgressProps {
  workflows: Workflow[];
  complianceScores: ComplianceScore[];
}

const componentNames = {
  ambiente_control: "Ambiente de Control",
  evaluacion_riesgos: "Evaluación de Riesgos",
  actividades_control: "Actividades de Control",
  informacion_comunicacion: "Información y Comunicación",
  supervision: "Supervisión",
};

export default function WorkflowProgress({ workflows, complianceScores }: WorkflowProgressProps) {
  const getProgressColor = (progress: number, status: string) => {
    if (status === "completed") return "bg-dr-success";
    if (progress >= 75) return "bg-dr-warning";
    if (progress > 0) return "bg-dr-light-blue";
    return "bg-gray-300";
  };

  const getStatusColor = (status: string, progress: number) => {
    if (status === "completed") return "text-dr-success";
    if (status === "in_progress" && progress >= 75) return "text-dr-warning";
    if (status === "in_progress") return "text-dr-light-blue";
    return "text-gray-500";
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "Sin fecha límite";
    return new Date(dueDate).toLocaleDateString("es-DO", { 
      day: "numeric", 
      month: "short" 
    });
  };

  const getCompletedTasks = (workflow: Workflow) => {
    // Simple calculation based on progress
    const totalTasks = workflow.componentType === "evaluacion_riesgos" ? 8 : 5;
    const completed = Math.round((workflow.progress / 100) * totalTasks);
    return { completed, total: totalTasks };
  };

  return (
    <div className="bg-dr-surface rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Panel de Control</h2>
          <button className="text-dr-light-blue hover:text-dr-blue text-sm font-medium">
            Ver Todos
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {workflows.map((workflow) => {
            const tasks = getCompletedTasks(workflow);
            const progressColor = getProgressColor(workflow.progress, workflow.status);
            const statusColor = getStatusColor(workflow.status, workflow.progress);
            const componentName = componentNames[workflow.componentType as keyof typeof componentNames] || workflow.name;

            return (
              <div key={workflow.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{componentName}</h3>
                  <span className={`text-sm font-semibold ${statusColor}`}>
                    {workflow.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${workflow.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm text-dr-neutral">
                  <span>{tasks.completed} de {tasks.total} tareas completadas</span>
                  <span>Vencimiento: {formatDueDate(workflow.dueDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
