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
  FileSearch, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  User,
  Flag
} from "lucide-react";

interface InternalAudit {
  id: number;
  title: string;
  description: string;
  auditType: 'compliance' | 'operational' | 'financial' | 'it' | 'risk';
  cosoComponent: string;
  auditor: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'fieldwork' | 'reporting' | 'follow_up' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  findings: AuditFinding[];
}

interface AuditFinding {
  id: number;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  managementResponse: string;
  actionPlan: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed' | 'overdue';
}

interface InternalAuditModuleProps {
  hasAdvancedLicense: boolean;
  audits: InternalAudit[];
  onCreateAudit: (audit: Partial<InternalAudit>) => void;
  onUpdateAudit: (id: number, audit: Partial<InternalAudit>) => void;
  onDeleteAudit: (id: number) => void;
  onAddFinding: (auditId: number, finding: Partial<AuditFinding>) => void;
}

export function InternalAuditModule({ 
  hasAdvancedLicense, 
  audits, 
  onCreateAudit, 
  onUpdateAudit, 
  onDeleteAudit,
  onAddFinding 
}: InternalAuditModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFindingForm, setShowFindingForm] = useState<number | null>(null);

  const auditTypes = [
    { value: 'compliance', label: 'Auditoría de Cumplimiento' },
    { value: 'operational', label: 'Auditoría Operacional' },
    { value: 'financial', label: 'Auditoría Financiera' },
    { value: 'it', label: 'Auditoría de TI' },
    { value: 'risk', label: 'Auditoría de Riesgos' }
  ];

  const cosoComponents = [
    { value: 'ambiente_control', label: 'Ambiente de Control' },
    { value: 'evaluacion_riesgos', label: 'Evaluación de Riesgos' },
    { value: 'actividades_control', label: 'Actividades de Control' },
    { value: 'informacion_comunicacion', label: 'Información y Comunicación' },
    { value: 'supervision', label: 'Supervisión' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-green-100 text-green-800';
      case 'fieldwork': return 'bg-primary/20 text-primary';
      case 'reporting': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const CreateAuditForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Auditoría Interna
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onCreateAudit({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            auditType: formData.get('auditType') as any,
            cosoComponent: formData.get('cosoComponent') as string,
            auditor: formData.get('auditor') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            priority: formData.get('priority') as any,
            status: 'planning',
            findings: []
          });
          setShowCreateForm(false);
        }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Título de la Auditoría</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input name="title" required placeholder="Ej: Auditoría de Controles de Acceso" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nombre descriptivo de la auditoría interna</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de Auditoría</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select name="auditType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {auditTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Categoría de la auditoría a realizar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea name="description" placeholder="Describe el objetivo y alcance de la auditoría" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detalla los objetivos, alcance y metodología de la auditoría</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Componente COSO</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select name="cosoComponent" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar componente" />
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
                    <p>Componente COSO principal que se auditará</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div>
              <label className="text-sm font-medium">Prioridad</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select name="priority" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nivel de prioridad de la auditoría</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Auditor Responsable</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input name="auditor" required placeholder="Nombre del auditor" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Auditor principal responsable de la auditoría</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de Inicio</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input name="startDate" type="date" required />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fecha de inicio de la auditoría</p>
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
                    <p>Fecha estimada de finalización</p>
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
                    <FileSearch className="h-4 w-4 mr-2" />
                    Crear Auditoría
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear la nueva auditoría interna</p>
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
                  <p>Cancelar la creación de la auditoría</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  // Tier 1: Basic Internal Audit
  const BasicAuditModule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Auditoría Interna</h2>
        <div className="flex items-center space-x-2">
          <TierIndicator hasAdvancedLicense={false} productName="AuditCore + SmartBooks" />
          {!showCreateForm && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Auditoría
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear nueva auditoría interna</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {showCreateForm && <CreateAuditForm />}

      <div className="grid gap-4">
        {audits.map((audit) => (
          <Card key={audit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{audit.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(audit.status)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {audit.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(audit.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {audit.priority}
                  </Badge>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar auditoría</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteAudit(audit.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar auditoría</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{audit.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary/100" />
                  <span>{auditTypes.find(t => t.value === audit.auditType)?.label}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                  <span>{audit.startDate} - {audit.endDate}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{audit.auditor}</span>
                </div>

                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  <span>{audit.findings.length} hallazgos</span>
                </div>
              </div>

              {audit.findings.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Hallazgos Recientes:</h4>
                  <div className="space-y-2">
                    {audit.findings.slice(0, 2).map((finding) => (
                      <div key={finding.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <Badge className={getRiskColor(finding.riskLevel)}>
                            {finding.riskLevel}
                          </Badge>
                          <span className="ml-2 text-sm">{finding.title}</span>
                        </div>
                        <Badge variant="outline">
                          {finding.status}
                        </Badge>
                      </div>
                    ))}
                    {audit.findings.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{audit.findings.length - 2} hallazgos adicionales
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">
                  Componente: {cosoComponents.find(c => c.value === audit.cosoComponent)?.label}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFindingForm(audit.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar Hallazgo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {audits.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay auditorías internas</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primera auditoría interna para fortalecer el control interno.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Auditoría
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {!hasAdvancedLicense && (
        <FeatureUnavailableMessage productName="AuditCore + SmartBooks" />
      )}
    </div>
  );

  return <BasicAuditModule />;
}

export default InternalAuditModule;