import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, User, Calendar, Award, Download, Search, Filter, BookOpen, Users, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TrainingRecord {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  trainingTitle: string;
  trainingType: string;
  trainingTopic: string;
  provider: string;
  duration: number;
  completionDate: string;
  certificateFileName: string;
  status: string;
  createdAt: string;
}

interface TrainingStats {
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  totalHours: number;
  topicDistribution: { [key: string]: number };
}

export default function TrainingManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterType, setFilterType] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    trainingTitle: "",
    trainingType: "",
    trainingTopic: "",
    provider: "",
    duration: "",
    completionDate: "",
    status: "completed"
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: trainings = [], isLoading } = useQuery<TrainingRecord[]>({
    queryKey: ["/api/training-records", { institutionId: 1 }],
  });

  const { data: stats } = useQuery<TrainingStats>({
    queryKey: ["/api/training-stats", { institutionId: 1 }],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const addTrainingMutation = useMutation({
    mutationFn: async (trainingData: any) => {
      return await apiRequest("/api/training-records", {
        method: "POST",
        body: { ...trainingData, institutionId: 1 },
      });
    },
    onSuccess: () => {
      toast({
        title: "Capacitación registrada",
        description: "El registro de capacitación ha sido guardado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-stats"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error al registrar capacitación",
        description: error.message || "Ocurrió un error al guardar el registro.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      userId: "",
      trainingTitle: "",
      trainingType: "",
      trainingTopic: "",
      provider: "",
      duration: "",
      completionDate: "",
      status: "completed"
    });
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.userId || !formData.trainingTitle || !formData.trainingType || !formData.trainingTopic) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    
    if (selectedFile) {
      submitData.append("certificate", selectedFile);
    }

    addTrainingMutation.mutate(submitData);
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !filterTopic || training.trainingTopic === filterTopic;
    const matchesType = !filterType || training.trainingType === filterType;
    return matchesSearch && matchesTopic && matchesType;
  });

  const getTopicColor = (topic: string) => {
    const colors = {
      "control_interno": "bg-primary/20 text-primary",
      "auditoria": "bg-green-100 text-green-800",
      "riesgos": "bg-yellow-100 text-yellow-800",
      "compliance": "bg-purple-100 text-purple-800",
      "otros": "bg-gray-100 text-gray-800"
    };
    return colors[topic as keyof typeof colors] || colors.otros;
  };

  const getTopicLabel = (topic: string) => {
    const labels = {
      "control_interno": "Control Interno",
      "auditoria": "Auditoría",
      "riesgos": "Gestión de Riesgos",
      "compliance": "Cumplimiento",
      "otros": "Otros"
    };
    return labels[topic as keyof typeof labels] || "Otros";
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      "curso": "Curso",
      "taller": "Taller",
      "seminario": "Seminario",
      "certificacion": "Certificación"
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Capacitaciones</h1>
          <p className="text-gray-600 mt-2">
            Registro y seguimiento de capacitaciones en control interno y cumplimiento
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Capacitación
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Registrar nueva capacitación completada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Capacitación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">Personal *</Label>
                  <Select value={formData.userId} onValueChange={(value) => setFormData({...formData, userId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trainingType">Tipo de Capacitación *</Label>
                  <Select value={formData.trainingType} onValueChange={(value) => setFormData({...formData, trainingType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curso">Curso</SelectItem>
                      <SelectItem value="taller">Taller</SelectItem>
                      <SelectItem value="seminario">Seminario</SelectItem>
                      <SelectItem value="certificacion">Certificación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="trainingTitle">Título de la Capacitación *</Label>
                <Input
                  value={formData.trainingTitle}
                  onChange={(e) => setFormData({...formData, trainingTitle: e.target.value})}
                  placeholder="Nombre completo de la capacitación"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trainingTopic">Tema Principal *</Label>
                  <Select value={formData.trainingTopic} onValueChange={(value) => setFormData({...formData, trainingTopic: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="control_interno">Control Interno</SelectItem>
                      <SelectItem value="auditoria">Auditoría</SelectItem>
                      <SelectItem value="riesgos">Gestión de Riesgos</SelectItem>
                      <SelectItem value="compliance">Cumplimiento</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="provider">Proveedor/Institución</Label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    placeholder="Institución que impartió la capacitación"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duración (horas)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="Número de horas"
                  />
                </div>
                <div>
                  <Label htmlFor="completionDate">Fecha de Finalización</Label>
                  <Input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="certificate">Certificado</Label>
                <Input
                  id="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={addTrainingMutation.isPending}>
                  {addTrainingMutation.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary/100" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Capacitaciones</p>
                  <p className="text-2xl font-bold">{stats.totalTrainings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Completadas</p>
                  <p className="text-2xl font-bold">{stats.completedTrainings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">En Progreso</p>
                  <p className="text-2xl font-bold">{stats.inProgressTrainings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Horas</p>
                  <p className="text-2xl font-bold">{stats.totalHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar capacitaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTopic} onValueChange={setFilterTopic}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los temas</SelectItem>
                <SelectItem value="control_interno">Control Interno</SelectItem>
                <SelectItem value="auditoria">Auditoría</SelectItem>
                <SelectItem value="riesgos">Gestión de Riesgos</SelectItem>
                <SelectItem value="compliance">Cumplimiento</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="curso">Curso</SelectItem>
                <SelectItem value="taller">Taller</SelectItem>
                <SelectItem value="seminario">Seminario</SelectItem>
                <SelectItem value="certificacion">Certificación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Training Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={getTopicColor(training.trainingTopic)}>
                  {getTopicLabel(training.trainingTopic)}
                </Badge>
                <Badge variant="outline">{getTypeLabel(training.trainingType)}</Badge>
              </div>
              <CardTitle className="text-lg">{training.trainingTitle}</CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{training.userName || training.userEmail}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                {training.provider && (
                  <div>
                    <strong>Proveedor:</strong> {training.provider}
                  </div>
                )}
                {training.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{training.duration} horas</span>
                  </div>
                )}
                {training.completionDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Finalizado: {new Date(training.completionDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {training.certificateFileName && (
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>Certificado disponible</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Descargar certificado</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrainings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">No hay capacitaciones registradas</CardTitle>
            <CardDescription className="mb-6">
              Comience registrando las capacitaciones completadas por su equipo
            </CardDescription>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primera Capacitación
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}