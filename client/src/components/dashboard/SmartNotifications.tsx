import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationItem {
  id: string;
  type: "success" | "warning" | "info" | "deadline";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: "high" | "medium" | "low";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SmartNotificationsProps {
  overallProgress: number;
  activeWorkflows: number;
  underReview: number;
}

export default function SmartNotifications({ 
  overallProgress, 
  activeWorkflows, 
  underReview 
}: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Generate smart notifications based on system state
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: NotificationItem[] = [];

      // Progress-based notifications
      if (overallProgress < 30) {
        newNotifications.push({
          id: "initial-setup",
          type: "info",
          title: "Configuración Inicial",
          description: "Completa la configuración básica para comenzar con COSO",
          timestamp: new Date(),
          read: false,
          priority: "high",
          action: {
            label: "Configurar",
            onClick: () => {
              setIsOpen(false);
              setLocation("/configuration");
            }
          }
        });
      }

      if (overallProgress >= 30 && overallProgress < 60) {
        newNotifications.push({
          id: "mid-progress",
          type: "warning",
          title: "Progreso Intermedio",
          description: "Continúa implementando los componentes COSO restantes",
          timestamp: new Date(),
          read: false,
          priority: "medium",
          action: {
            label: "Ver Flujos",
            onClick: () => {
              setIsOpen(false);
              setLocation("/workflows");
            }
          }
        });
      }

      if (overallProgress >= 80) {
        newNotifications.push({
          id: "near-completion",
          type: "success",
          title: "¡Excelente Progreso!",
          description: "Estás cerca de completar la implementación COSO",
          timestamp: new Date(),
          read: false,
          priority: "low"
        });
      }

      // Review notifications
      if (underReview > 0) {
        newNotifications.push({
          id: "pending-review",
          type: "deadline",
          title: "Revisión Pendiente",
          description: `${underReview} flujos de trabajo requieren revisión supervisora`,
          timestamp: new Date(),
          read: false,
          priority: "high",
          action: {
            label: "Revisar",
            onClick: () => {
              setIsOpen(false);
              setLocation("/workflows");
            }
          }
        });
      }

      // Active workflows notification
      if (activeWorkflows > 5) {
        newNotifications.push({
          id: "many-workflows",
          type: "info",
          title: "Múltiples Flujos Activos",
          description: `Tienes ${activeWorkflows} flujos activos. Considera priorizar`,
          timestamp: new Date(),
          read: false,
          priority: "medium"
        });
      }

      // Deadline notifications (simulated)
      newNotifications.push({
        id: "deadline-approaching",
        type: "deadline",
        title: "Fecha Límite Próxima",
        description: "El flujo 'Ambiente de Control' vence en 3 días",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: "high",
        action: {
          label: "Ver Detalle",
          onClick: () => {
            setIsOpen(false);
            setLocation("/workflows");
          }
        }
      });

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    };

    generateNotifications();
  }, [overallProgress, activeWorkflows, underReview]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "deadline":
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: NotificationItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return "ahora";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificaciones inteligentes ({unreadCount} nuevas)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar como leídas
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones nuevas` : 'Todas las notificaciones están al día'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 mt-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? "text-gray-900" : "text-gray-600"
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority === "high" ? "Alta" : 
                                 notification.priority === "medium" ? "Media" : "Baja"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                          </p>
                          {notification.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action?.onClick();
                              }}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}