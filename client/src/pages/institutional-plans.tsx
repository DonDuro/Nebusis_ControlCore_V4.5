import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Calendar, CheckCircle, X, AlertCircle, Download } from "lucide-react";
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

interface InstitutionalPlan {
  id: number;
  planType: string;
  planName: string;
  fileName: string;
  status: string;
  validFrom: string;
  validTo: string;
  uploadedBy: string;
  createdAt: string;
}

export default function InstitutionalPlans() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [planType, setPlanType] = useState<string>("");
  const [planName, setPlanName] = useState<string>("");
  const [validFrom, setValidFrom] = useState<string>("");
  const [validTo, setValidTo] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: plans = [], isLoading } = useQuery<InstitutionalPlan[]>({
    queryKey: ["/api/institutional-plans", { institutionId: 1 }],
  });

  const uploadMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("/api/institutional-plans", {
        method: "POST",
        body: { ...planData, institutionId: 1 },
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan cargado exitosamente",
        description: "El plan institucional ha sido cargado y está disponible para consulta.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/institutional-plans"] });
      setIsUploadDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error al cargar plan",
        description: error.message || "Ocurrió un error al cargar el plan institucional.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedFile(null);
    setPlanType("");
    setPlanName("");
    setValidFrom("");
    setValidTo("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!planName) {
        setPlanName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !planType || !planName) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("planType", planType);
    formData.append("planName", planName);
    formData.append("validFrom", validFrom);
    formData.append("validTo", validTo);

    uploadMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "archived":
        return "bg-gray-500";
      case "draft":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "archived":
        return "Archivado";
      case "draft":
        return "Borrador";
      default:
        return "Desconocido";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planificación Institucional</h1>
          <p className="text-gray-600 mt-2">
            Gestione los planes estratégicos institucionales (PEI) y planes operativos anuales (POA)
          </p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Cargar Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cargar nuevo plan institucional (PEI o POA)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cargar Plan Institucional</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="planType">Tipo de Plan *</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEI">PEI - Plan Estratégico Institucional</SelectItem>
                    <SelectItem value="POA">POA - Plan Operativo Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="planName">Nombre del Plan *</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Nombre descriptivo del plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Válido desde</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="validTo">Válido hasta</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file">Archivo del Plan *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Cargando..." : "Cargar Plan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">No hay planes cargados</CardTitle>
            <CardDescription className="mb-6">
              Comience cargando su Plan Estratégico Institucional (PEI) o Plan Operativo Anual (POA)
            </CardDescription>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Cargar Primer Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={plan.planType === "PEI" ? "default" : "secondary"}>
                    {plan.planType}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
                    <span className="text-sm text-gray-600">{getStatusText(plan.status)}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{plan.planName}</CardTitle>
                <CardDescription>{plan.fileName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {plan.validFrom && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Desde: {new Date(plan.validFrom).toLocaleDateString()}</span>
                    </div>
                  )}
                  {plan.validTo && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Hasta: {new Date(plan.validTo).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Cargado: {new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Descargar archivo del plan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vincular con flujos COSO</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Information Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-primary/100" />
            Información sobre Planificación Institucional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Plan Estratégico Institucional (PEI)</h3>
              <p className="text-sm text-gray-600 mb-2">
                Documento que define la estrategia institucional a medio y largo plazo, establece objetivos estratégicos y prioridades.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Vinculación con COSO:</strong> Los objetivos del PEI deben estar alineados con los componentes de control interno.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Plan Operativo Anual (POA)</h3>
              <p className="text-sm text-gray-600 mb-2">
                Documento que detalla las actividades específicas, recursos y cronograma para el año fiscal.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Vinculación con COSO:</strong> Las actividades del POA deben incluir tareas específicas de control interno.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}