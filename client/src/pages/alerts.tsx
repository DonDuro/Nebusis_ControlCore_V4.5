import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AlertsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts", { institutionId: 1 }],
    enabled: !!user,
  });

  const checkAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/alerts/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: 1 }),
      });
      if (!response.ok) throw new Error("Error ejecutando chequeo de alertas");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Chequeo Completado",
        description: "Se ejecutó la revisión automática de alertas",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error ejecutando chequeo de alertas",
        variant: "destructive",
      });
    },
  });



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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-dr-blue bg-opacity-10 text-dr-blue border-dr-blue';
      case 'baja': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'deadline_approaching': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'review_required': return <CheckCircle className="h-4 w-4 text-primary/100" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-dr-bg">
      <Header 
        user={user} 
        institution={institution} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
        stats={{}}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Alertas</h1>
              <p className="text-dr-neutral mt-1">Configuración y gestión de notificaciones automáticas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Chequeo Manual de Alertas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-dr-blue" />
                    Chequeo Manual
                  </CardTitle>
                  <CardDescription>
                    Ejecuta una revisión manual de alertas automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    El sistema revisa automáticamente los flujos de trabajo para detectar:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Fechas límite próximas o vencidas</li>
                    <li>Flujos de trabajo sin actividad por más de 15 días</li>
                    <li>Múltiples pasos pendientes (más de 5)</li>
                  </ul>
                  
                  <Button 
                    onClick={() => checkAlertsMutation.mutate()}
                    disabled={checkAlertsMutation.isPending}
                    className="w-full bg-dr-blue hover:bg-dr-blue/90"
                  >
                    {checkAlertsMutation.isPending ? "Ejecutando..." : "Ejecutar Chequeo de Alertas"}
                  </Button>
                </CardContent>
              </Card>

              {/* Alertas Activas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-dr-blue" />
                    Alertas Activas
                  </CardTitle>
                  <CardDescription>
                    Alertas actuales que requieren atención
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts && alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((alert: any) => (
                        <div key={alert.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              {getAlertIcon(alert.type)}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={getPriorityColor(alert.priority)}>
                                    {alert.priority.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(alert.createdAt).toLocaleDateString('es-DO')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-600">No hay alertas activas</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Todos los flujos de trabajo están al día
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}