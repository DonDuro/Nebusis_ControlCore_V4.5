import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TierIndicator, FeatureUnavailableMessage } from "./TierIndicator";
import { 
  Calendar, 
  Users, 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface StrategicPlan {
  id: number;
  title: string;
  description: string;
  cosoComponent: string;
  cosoPrinciple: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
}

interface StrategicPlanningProps {
  hasAdvancedLicense: boolean;
  plans: StrategicPlan[];
  onCreatePlan: (plan: Partial<StrategicPlan>) => void;
  onUpdatePlan: (id: number, plan: Partial<StrategicPlan>) => void;
  onDeletePlan: (id: number) => void;
}

export function StrategicPlanning({ 
  hasAdvancedLicense, 
  plans, 
  onCreatePlan, 
  onUpdatePlan, 
  onDeletePlan 
}: StrategicPlanningProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StrategicPlan | null>(null);

  const cosoComponents = [
    { value: 'ambiente_control', label: 'Ambiente de Control' },
    { value: 'evaluacion_riesgos', label: 'Evaluación de Riesgos' },
    { value: 'actividades_control', label: 'Actividades de Control' },
    { value: 'informacion_comunicacion', label: 'Información y Comunicación' },
    { value: 'supervision', label: 'Supervisión' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-primary/20 text-primary';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'delayed': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const CreatePlanForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Plan Estratégico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onCreatePlan({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            cosoComponent: formData.get('cosoComponent') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            status: 'planned'
          });
          setShowCreateForm(false);
        }} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título del Plan</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input name="title" required placeholder="Ej: Implementación de Controles de Acceso" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nombre descriptivo del plan estratégico</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea name="description" placeholder="Describe los objetivos y alcance del plan" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detalla los objetivos, alcance y metodología del plan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            <label className="text-sm font-medium">Componente COSO</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select name="cosoComponent" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un componente" />
                    </SelectTrigger>
                    <SelectContent>
                      {cosoComponents.map(comp => (
                        <SelectItem key={comp.value} value={comp.value}>
                          {comp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Componente COSO al que está vinculado este plan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha de Inicio</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input name="startDate" type="date" required />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fecha planificada de inicio del plan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de Fin</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input name="endDate" type="date" required />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fecha planificada de finalización del plan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit">
                    <Target className="h-4 w-4 mr-2" />
                    Crear Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Guardar el nuevo plan estratégico</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancelar la creación del plan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  // Tier 1: Basic Strategic Planning
  const BasicPlanning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Planificación Estratégica</h2>
        <div className="flex items-center space-x-2">
          <TierIndicator tier={1} featureName="Planificación Estratégica" />
          {!showCreateForm && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear un nuevo plan estratégico COSO</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {showCreateForm && <CreatePlanForm />}

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(plan.status)}>
                    {getStatusIcon(plan.status)}
                    <span className="ml-1 capitalize">{plan.status.replace('_', ' ')}</span>
                  </Badge>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingPlan(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar este plan estratégico</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => onDeletePlan(plan.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar este plan estratégico</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-primary/100" />
                  <span>{cosoComponents.find(c => c.value === plan.cosoComponent)?.label}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                  <span>{plan.startDate} - {plan.endDate}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{plan.assignedTo || 'Sin asignar'}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes estratégicos</h3>
              <p className="text-gray-500 mb-4">Crea tu primer plan estratégico para comenzar con la planificación COSO.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {!hasAdvancedLicense && (
        <FeatureUnavailableMessage 
          featureName="Planificación Estratégica Avanzada" 
          tier={2}
          description="Esta funcionalidad requiere una licencia de Nebusis® Business Suite"
          businessSuiteApp="PerformanceTracker + SmartBooks"
        />
      )}
    </div>
  );

  return <BasicPlanning />;
}

export default StrategicPlanning;