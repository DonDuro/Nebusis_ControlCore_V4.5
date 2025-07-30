import { Workflow, WorkflowStep } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowDetailsProps {
  workflow: Workflow;
  steps: WorkflowStep[];
}

export default function WorkflowDetails({ workflow, steps }: WorkflowDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
          <p className="text-dr-neutral mt-1">{workflow.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge>{workflow.status}</Badge>
          <Button variant="outline">
            <i className="fas fa-edit mr-2"></i>
            Editar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="steps">Pasos</TabsTrigger>
          <TabsTrigger value="evidence">Evidencias</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-dr-blue">{workflow.progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-dr-blue h-2 rounded-full" 
                    style={{ width: `${workflow.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-base px-3 py-1">{workflow.status}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fecha Límite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-gray-900">
                  {workflow.dueDate 
                    ? new Date(workflow.dueDate).toLocaleDateString("es-DO")
                    : "Sin fecha límite"
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === "completed" 
                        ? "bg-dr-success text-white" 
                        : step.status === "in_progress"
                        ? "bg-dr-warning text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}>
                      {step.status === "completed" ? (
                        <i className="fas fa-check text-sm"></i>
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{step.name}</h3>
                    <p className="text-sm text-dr-neutral mt-1">{step.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-dr-neutral">
                      <span>Estado: {step.status}</span>
                      {step.dueDate && (
                        <span>Vence: {new Date(step.dueDate).toLocaleDateString("es-DO")}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-chevron-right"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Evidencias Subidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dr-neutral">No hay evidencias disponibles aún.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dr-neutral">No hay historial disponible aún.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
