import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TierIndicator, FeatureUnavailableMessage } from "./TierIndicator";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  FileText,
  Users,
  Target
} from "lucide-react";

interface COSOComponentStatus {
  name: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
  score: number;
  openAudits: number;
  openFindings: number;
  openActions: number;
}

interface ExecutiveDashboardProps {
  hasAdvancedLicense: boolean;
  components: COSOComponentStatus[];
}

export function ExecutiveDashboard({ hasAdvancedLicense, components }: ExecutiveDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'non_compliant': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  // Tier 1: Basic Executive Dashboard
  const BasicDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo COSO</h2>
        <TierIndicator tier={1} featureName="Dashboard Ejecutivo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map((component, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {component.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getStatusColor(component.status)}>
                        {getStatusIcon(component.status)}
                        <span className="ml-1 capitalize">{component.status.replace('_', ' ')}</span>
                      </Badge>
                      <span className="text-2xl font-bold text-gray-900">
                        {component.score}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center">
                              <FileText className="h-3 w-3 mx-auto mb-1" />
                              <div>{component.openAudits}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Auditorías abiertas</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center">
                              <AlertTriangle className="h-3 w-3 mx-auto mb-1" />
                              <div>{component.openFindings}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Hallazgos abiertos</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center">
                              <Target className="h-3 w-3 mx-auto mb-1" />
                              <div>{component.openActions}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Acciones pendientes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clic para ver detalles del componente {component.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Promedio de Cumplimiento:</span>
                <span className="font-semibold">
                  {Math.round(components.reduce((acc, c) => acc + c.score, 0) / components.length)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Componentes Completos:</span>
                <span className="font-semibold">
                  {components.filter(c => c.status === 'compliant').length}/{components.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Auditorías Abiertas:</span>
                <span className="font-semibold">
                  {components.reduce((acc, c) => acc + c.openAudits, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hallazgos Pendientes:</span>
                <span className="font-semibold">
                  {components.reduce((acc, c) => acc + c.openFindings, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Participación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Acciones en Progreso:</span>
                <span className="font-semibold">
                  {components.reduce((acc, c) => acc + c.openActions, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Áreas Involucradas:</span>
                <span className="font-semibold">{components.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Tier 2: Advanced Dashboard with PerformanceTracker
  const AdvancedDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo COSO</h2>
        <TierIndicator tier={2} featureName="Dashboard Ejecutivo Avanzado" />
      </div>

      {/* Advanced features would be implemented here */}
      <BasicDashboard />
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-amber-800 font-medium">
            Funciones avanzadas habilitadas por Nebusis® PerformanceTracker
          </span>
        </div>
        <p className="text-amber-700 text-sm mt-1">
          Incluye análisis de tendencias, filtros interactivos, y exportación de insights.
        </p>
      </div>
    </div>
  );

  if (!hasAdvancedLicense) {
    return <BasicDashboard />;
  }

  return <AdvancedDashboard />;
}

export default ExecutiveDashboard;