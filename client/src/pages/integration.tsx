import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import FloatingChatbot from "@/components/common/FloatingChatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NebusisIntegration, SyncLog } from "@shared/schema";
import { Settings, RefreshCw, Users, FileText, Building, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

export default function Integration() {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedSyncType, setSelectedSyncType] = useState<string>("");
  const [setupForm, setSetupForm] = useState({
    apiEndpoint: "",
    apiKey: "",
    organizationId: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user,
  });

  const { data: workflows } = useQuery({
    queryKey: ["/api/workflows", { institutionId: 1 }],
    enabled: !!user,
  });

  const { data: complianceScores } = useQuery({
    queryKey: ["/api/compliance-scores", { institutionId: 1 }],
    enabled: !!user,
  });

  const { data: integration } = useQuery<NebusisIntegration>({
    queryKey: ["/api/integrations/nebusis", { institutionId: 1 }],
    enabled: !!user,
  });

  const { data: syncLogs = [] } = useQuery<SyncLog[]>({
    queryKey: ["/api/integrations/nebusis/sync-logs", { integrationId: integration?.id }],
    enabled: !!integration,
  });

  const setupMutation = useMutation({
    mutationFn: async (integrationData: any) => {
      return apiRequest("POST", "/api/integrations/nebusis", integrationData);
    },
    onSuccess: () => {
      toast({
        title: "Integración configurada",
        description: "La integración con Nebusis® ControlCore ha sido configurada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/nebusis"] });
      setIsSetupModalOpen(false);
      setSetupForm({ apiEndpoint: "", apiKey: "", organizationId: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo configurar la integración.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/integrations/nebusis/test-connection", {});
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Conexión exitosa",
          description: "La conexión con Nebusis® ControlCore es válida.",
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con Nebusis® ControlCore.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo probar la conexión.",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async ({ syncType, direction }: { syncType: string; direction: string }) => {
      return apiRequest("POST", "/api/integrations/nebusis/sync", { syncType, direction });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Sincronización completada",
          description: `Se sincronizaron ${data.recordsSucceeded} de ${data.recordsProcessed} registros exitosamente.`,
        });
      } else {
        toast({
          title: "Sincronización con errores",
          description: `Se procesaron ${data.recordsProcessed} registros con ${data.recordsFailed} errores.`,
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/nebusis/sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsSyncModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo completar la sincronización.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest("PUT", `/api/integrations/nebusis/${integration?.id}`, { syncSettings: settings });
    },
    onSuccess: () => {
      toast({
        title: "Configuración actualizada",
        description: "Las configuraciones de sincronización han sido actualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/nebusis"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    },
  });

  const handleSetup = () => {
    if (!setupForm.apiEndpoint || !setupForm.apiKey || !setupForm.organizationId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate({
      institutionId: 1,
      apiEndpoint: setupForm.apiEndpoint,
      apiKey: setupForm.apiKey,
      organizationId: setupForm.organizationId,
    });
  };

  const handleSync = (syncType: string, direction: string) => {
    setSelectedSyncType(syncType);
    syncMutation.mutate({ syncType, direction });
  };

  const handleSettingsUpdate = (key: string, value: any) => {
    if (!integration) return;
    
    const updatedSettings = {
      ...(integration?.syncSettings || {}),
      [key]: value
    };
    
    updateSettingsMutation.mutate(updatedSettings);
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
      case 'started':
        return <Clock className="w-4 h-4 text-primary/100" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user || !institution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dr-blue mx-auto"></div>
          <p className="mt-4 text-dr-neutral">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dr-bg">
      <Header user={user || {} as any} institution={institution || {} as any} />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          workflows={workflows || []} 
          complianceScores={complianceScores || []}
          overallProgress={70}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Integración NEBUSIS®</h1>
              <p className="text-dr-neutral mt-1">Gestión de integración con NEBUSIS® Management System Wizard</p>
            </div>

            {/* Integration Status */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-6 h-6 text-dr-blue" />
                    <div>
                      <CardTitle>Estado de Integración</CardTitle>
                      <p className="text-sm text-dr-neutral mt-1">
                        Conexión con NEBUSIS® Management System Wizard
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {integration ? (
                      <>
                        <Badge className={integration.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {integration.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                        <Button
                          onClick={() => testConnectionMutation.mutate()}
                          disabled={testConnectionMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          {testConnectionMutation.isPending ? "Probando..." : "Probar Conexión"}
                        </Button>
                      </>
                    ) : (
                      <Dialog open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-dr-blue text-white hover:bg-dr-blue/90">
                            <Settings className="w-4 h-4 mr-2" />
                            Configurar Integración
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Configurar Integración NEBUSIS®</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Endpoint API *</Label>
                              <Input
                                value={setupForm.apiEndpoint}
                                onChange={(e) => setSetupForm(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                                placeholder="https://api.nebusis.com"
                              />
                            </div>
                            <div>
                              <Label>API Key *</Label>
                              <Input
                                type="password"
                                value={setupForm.apiKey}
                                onChange={(e) => setSetupForm(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder="Tu API Key de NEBUSIS®"
                              />
                            </div>
                            <div>
                              <Label>ID de Organización *</Label>
                              <Input
                                value={setupForm.organizationId}
                                onChange={(e) => setSetupForm(prev => ({ ...prev, organizationId: e.target.value }))}
                                placeholder="ID de tu organización en NEBUSIS®"
                              />
                            </div>
                            <Button 
                              onClick={handleSetup}
                              disabled={setupMutation.isPending}
                              className="w-full bg-dr-blue text-white hover:bg-dr-blue/90"
                            >
                              {setupMutation.isPending ? "Configurando..." : "Configurar Integración"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              {integration && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Última Sincronización</p>
                      <p className="text-sm text-dr-neutral">{formatDate(integration.lastSyncAt || "")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estado</p>
                      <p className="text-sm text-dr-neutral capitalize">{integration.syncStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Organización</p>
                      <p className="text-sm text-dr-neutral">{integration.organizationId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Auto-Sync</p>
                      <p className="text-sm text-dr-neutral">
                        {integration.syncSettings?.autoSync ? "Habilitado" : "Deshabilitado"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {integration && (
              <Tabs defaultValue="sync" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sync">Sincronización</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                  <TabsTrigger value="logs">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="sync" className="space-y-6">
                  {/* Sync Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-dr-blue" />
                          <CardTitle className="text-lg">Documentos</CardTitle>
                        </div>
                        <p className="text-sm text-dr-neutral">
                          Sincronizar documentos institucionales, políticas y procedimientos
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          onClick={() => handleSync('documents', 'import')}
                          disabled={syncMutation.isPending}
                          className="w-full bg-dr-light-blue text-white hover:bg-dr-blue"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Importar desde NEBUSIS®
                        </Button>
                        <Button
                          onClick={() => handleSync('documents', 'export')}
                          disabled={syncMutation.isPending}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Exportar a NEBUSIS®
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-dr-blue" />
                          <CardTitle className="text-lg">Personal</CardTitle>
                        </div>
                        <p className="text-sm text-dr-neutral">
                          Sincronizar usuarios, roles y perfiles del personal
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          onClick={() => handleSync('personnel', 'import')}
                          disabled={syncMutation.isPending}
                          className="w-full bg-dr-light-blue text-white hover:bg-dr-blue"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Importar desde NEBUSIS®
                        </Button>
                        <Button
                          onClick={() => handleSync('personnel', 'export')}
                          disabled={syncMutation.isPending}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Exportar a NEBUSIS®
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Building className="w-5 h-5 text-dr-blue" />
                          <CardTitle className="text-lg">Estructura Organizacional</CardTitle>
                        </div>
                        <p className="text-sm text-dr-neutral">
                          Sincronizar áreas, departamentos y organigrama
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          onClick={() => handleSync('organizational_structure', 'import')}
                          disabled={syncMutation.isPending}
                          className="w-full bg-dr-light-blue text-white hover:bg-dr-blue"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Importar desde NEBUSIS®
                        </Button>
                        <Button
                          onClick={() => handleSync('organizational_structure', 'export')}
                          disabled={syncMutation.isPending}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Exportar a NEBUSIS®
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {syncMutation.isPending && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Sincronizando {selectedSyncType}... Por favor espera mientras se completa el proceso.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuraciones de Sincronización</CardTitle>
                      <p className="text-sm text-dr-neutral">
                        Personaliza qué datos sincronizar y con qué frecuencia
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Sincronizar Documentos</Label>
                            <p className="text-sm text-dr-neutral">Documentos institucionales y políticas</p>
                          </div>
                          <Switch
                            checked={integration.syncSettings?.syncDocuments}
                            onCheckedChange={(checked) => handleSettingsUpdate('syncDocuments', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Sincronizar Personal</Label>
                            <p className="text-sm text-dr-neutral">Usuarios, roles y perfiles</p>
                          </div>
                          <Switch
                            checked={integration.syncSettings?.syncPersonnel}
                            onCheckedChange={(checked) => handleSettingsUpdate('syncPersonnel', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Sincronizar Estructura Organizacional</Label>
                            <p className="text-sm text-dr-neutral">Áreas, departamentos y organigramas</p>
                          </div>
                          <Switch
                            checked={integration.syncSettings?.syncOrganizationalStructure}
                            onCheckedChange={(checked) => handleSettingsUpdate('syncOrganizationalStructure', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Sincronización Automática</Label>
                            <p className="text-sm text-dr-neutral">Ejecutar sincronización de forma automática</p>
                          </div>
                          <Switch
                            checked={integration.syncSettings?.autoSync}
                            onCheckedChange={(checked) => handleSettingsUpdate('autoSync', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Sincronización</CardTitle>
                      <p className="text-sm text-dr-neutral">
                        Registro de todas las sincronizaciones realizadas
                      </p>
                    </CardHeader>
                    <CardContent>
                      {syncLogs.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sincronizaciones</h3>
                          <p className="text-gray-500">
                            Las sincronizaciones realizadas aparecerán aquí
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {syncLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-4">
                                {getSyncStatusIcon(log.status)}
                                <div>
                                  <h4 className="font-medium text-gray-900 capitalize">
                                    {log.syncType.replace('_', ' ')} - {log.direction === 'import' ? 'Importación' : 'Exportación'}
                                  </h4>
                                  <p className="text-sm text-dr-neutral">
                                    {log.recordsSucceeded} de {log.recordsProcessed} registros exitosos
                                  </p>
                                  {log.recordsFailed > 0 && (
                                    <p className="text-sm text-red-600">
                                      {log.recordsFailed} errores
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-dr-neutral">{formatDate(log.startedAt || "")}</p>
                                <Badge variant={log.status === 'completed' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                                  {log.status === 'completed' ? 'Completado' : 
                                   log.status === 'failed' ? 'Fallido' : 
                                   log.status === 'in_progress' ? 'En Progreso' : 'Iniciado'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>

      <FloatingChatbot />
    </div>
  );
}