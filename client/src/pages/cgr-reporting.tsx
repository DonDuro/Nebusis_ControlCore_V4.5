import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Download, Send, Plus, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CgrReport {
  id: number;
  reportType: string;
  reportPeriod: string;
  reportData: any;
  generatedBy: string;
  status: string;
  submittedAt: string;
  createdAt: string;
}

interface ReportTemplate {
  type: string;
  name: string;
  description: string;
  fields: string[];
  frequency: string;
}

export default function CgrReporting() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState({
    reportType: "",
    reportPeriod: "",
    reportData: {}
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reports = [], isLoading } = useQuery<CgrReport[]>({
    queryKey: ["/api/cgr-reports", { institutionId: 1 }],
  });

  const { data: templates = [] } = useQuery<ReportTemplate[]>({
    queryKey: ["/api/cgr-templates"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/cgr-reports", {
        method: "POST",
        body: { ...data, institutionId: 1 },
      });
    },
    onSuccess: () => {
      toast({
        title: "Informe creado",
        description: "El informe de auditoría ha sido creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cgr-reports"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error al crear informe",
        description: error.message || "Ocurrió un error al crear el informe.",
        variant: "destructive",
      });
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      return await apiRequest(`/api/cgr-reports/${reportId}/submit`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Informe enviado",
        description: "El informe ha sido enviado a la Entidad de Auditoría correspondiente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cgr-reports"] });
    },
    onError: (error) => {
      toast({
        title: "Error al enviar informe",
        description: error.message || "Ocurrió un error al enviar el informe.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      reportType: "",
      reportPeriod: "",
      reportData: {}
    });
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      reportType: template.type,
      reportPeriod: "",
      reportData: {}
    });
  };

  const handleCreateReport = () => {
    if (!formData.reportType || !formData.reportPeriod) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-primary/20 text-primary";
      case "approved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Borrador";
      case "submitted":
        return "Enviado";
      case "approved":
        return "Aprobado";
      default:
        return "Desconocido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "submitted":
        return <Send className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      "cumplimiento": "Informe de Cumplimiento",
      "autoevaluacion": "Autoevaluación COSO",
      "seguimiento": "Seguimiento de Recomendaciones"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const defaultTemplates: ReportTemplate[] = [
    {
      type: "cumplimiento",
      name: "Informe de Cumplimiento COSO",
      description: "Informe trimestral sobre el cumplimiento de las normas básicas de control interno",
      fields: ["ambiente_control", "evaluacion_riesgos", "actividades_control", "informacion_comunicacion", "supervision"],
      frequency: "trimestral"
    },
    {
      type: "autoevaluacion",
      name: "Autoevaluación del Sistema de Control Interno",
      description: "Evaluación anual del sistema de control interno institucional",
      fields: ["fortalezas", "debilidades", "plan_mejoras", "recursos_necesarios"],
      frequency: "anual"
    },
    {
      type: "seguimiento",
      name: "Seguimiento de Recomendaciones",
      description: "Informe de seguimiento a recomendaciones de auditoría interna y externa",
      fields: ["recomendaciones_pendientes", "recomendaciones_implementadas", "cronograma_implementacion"],
      frequency: "semestral"
    }
  ];

  const templatesData = templates.length > 0 ? templates : defaultTemplates;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes de Auditoría</h1>
          <p className="text-gray-600 mt-2">
            Generación y envío de informes a la Entidad de Auditoría institucional
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Informe
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear nuevo informe de auditoría</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Informe de Auditoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo de Informe *</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {templatesData.map((template) => (
                    <Card
                      key={template.type}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate?.type === template.type
                          ? "ring-2 ring-primary/100 bg-primary/10"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {template.frequency}
                            </Badge>
                          </div>
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <>
                  <div>
                    <Label htmlFor="reportPeriod">Período del Informe *</Label>
                    <Select value={formData.reportPeriod} onValueChange={(value) => setFormData({...formData, reportPeriod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-Q1">2024 - Primer Trimestre</SelectItem>
                        <SelectItem value="2024-Q2">2024 - Segundo Trimestre</SelectItem>
                        <SelectItem value="2024-Q3">2024 - Tercer Trimestre</SelectItem>
                        <SelectItem value="2024-Q4">2024 - Cuarto Trimestre</SelectItem>
                        <SelectItem value="2024-Annual">2024 - Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Campos del Informe</Label>
                    <div className="space-y-2 mt-2">
                      {selectedTemplate.fields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{field.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateReport} 
                  disabled={createReportMutation.isPending || !selectedTemplate}
                >
                  {createReportMutation.isPending ? "Creando..." : "Crear Informe"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Informes Generados</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No hay informes generados</CardTitle>
                <CardDescription className="mb-6">
                  Comience creando su primer informe para la Entidad de Auditoría institucional
                </CardDescription>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Informe
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(report.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(report.status)}
                          <span>{getStatusText(report.status)}</span>
                        </div>
                      </Badge>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{report.reportPeriod}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{getTypeLabel(report.reportType)}</CardTitle>
                    <CardDescription>
                      Generado: {new Date(report.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.submittedAt && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <Send className="h-4 w-4" />
                          <span>Enviado: {new Date(report.submittedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Descargar informe en PDF</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {report.status === "draft" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => submitReportMutation.mutate(report.id)}
                                  disabled={submitReportMutation.isPending}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enviar informe de auditoría</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesData.map((template) => (
              <Card key={template.type} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <FileText className="h-6 w-6 text-primary/100" />
                    <Badge variant="outline">{template.frequency}</Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Campos incluidos:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => {
                      handleTemplateSelect(template);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    Usar Plantilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Information Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-primary/100" />
            Información sobre Informes de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Tipos de Informes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Cumplimiento:</strong> Informe trimestral sobre implementación COSO</li>
                <li>• <strong>Autoevaluación:</strong> Evaluación anual del sistema de control interno</li>
                <li>• <strong>Seguimiento:</strong> Progreso en implementación de recomendaciones</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Proceso de Envío</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Los informes se crean en estado "Borrador"</li>
                <li>• Pueden ser editados antes del envío</li>
                <li>• Una vez enviados, no pueden ser modificados</li>
                <li>• La Entidad de Auditoría confirmará la recepción del informe</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}