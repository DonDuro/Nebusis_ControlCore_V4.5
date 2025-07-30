import { Link, useLocation } from "wouter";
import { Workflow, ComplianceScore } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useFramework } from "@/hooks/useFramework";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { 
  Home, 
  Workflow as WorkflowIcon, 
  FolderOpen, 
  CheckCircle, 
  BarChart3, 
  Bell, 
  Book, 
  Users,
  Shield,
  AlertTriangle,
  ListChecks,
  MessageSquare,
  Eye,
  LogOut,
  X,
  FileText,
  Award,
  Calendar,
  Target,
  FileSearch,
  Crown,
  TrendingUp,
  Settings
} from "lucide-react";

interface SidebarProps {
  workflows: Workflow[];
  complianceScores: ComplianceScore[];
  overallProgress: number;
  isOpen?: boolean;
  onClose?: () => void;
}

// Define component mapping function that returns names based on current translations
const getComponentMap = (t: any) => ({
  ambiente_control: { 
    name: t('coso.components.controlEnvironment'), 
    icon: Shield,
    tooltip: t('coso.principles.p1')
  },
  evaluacion_riesgos: { 
    name: t('coso.components.riskAssessment'), 
    icon: AlertTriangle,
    tooltip: t('coso.principles.p6')
  },
  actividades_control: { 
    name: t('coso.components.controlActivities'), 
    icon: ListChecks,
    tooltip: t('coso.principles.p10')
  },
  informacion_comunicacion: { 
    name: t('coso.components.informationCommunication'), 
    icon: MessageSquare,
    tooltip: t('coso.principles.p13')
  },
  supervision: { 
    name: t('coso.components.monitoringActivities'), 
    icon: Eye,
    tooltip: t('coso.principles.p16')
  },
});

export default function Sidebar({ workflows, complianceScores, overallProgress, isOpen = false, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const { t } = useTranslation();
  const { framework } = useFramework();
  
  // Get component map with current translations
  const componentMap = getComponentMap(t);

  // Track which component is currently selected based on URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const componentParam = urlParams.get('component');
    setActiveComponent(componentParam);
  }, [location]);

  const getComponentProgress = (componentType: string): number => {
    const workflow = workflows.find(w => w.componentType === componentType);
    return workflow?.progress ?? 0;
  };

  const getComponentStatus = (componentType: string): string => {
    const workflow = workflows.find(w => w.componentType === componentType);
    if (!workflow) return "not_started";
    return workflow.status ?? "not_started";
  };

  const getStatusColor = (status: string, progress: number, componentKey: string): string => {
    // Only show white text if this component is currently active
    if (activeComponent === componentKey) return "text-white";
    
    // Otherwise, use default text color
    return "text-nebusis-slate";
  };

  const getStatusBg = (status: string, progress: number, componentKey: string): string => {
    // Only show blue background if this component is currently active
    if (activeComponent === componentKey) return "bg-nebusis-blue";
    
    // Otherwise, use default background regardless of status
    return "bg-nebusis-surface hover:bg-nebusis-surface";
  };

  const getStatusIcon = (status: string, progress: number): string => {
    if (status === "completed") return "fa-check-circle";
    if (status === "in_progress") return "fa-clock";
    return "fa-circle";
  };

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
        credentials: 'include'
      });
      
      // Clear session token
      localStorage.removeItem('sessionToken');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout API fails
      localStorage.removeItem('sessionToken');
      window.location.href = '/';
    }
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: t('nav.dashboard'),
      tooltip: t('dashboard.overview')
    },
    // VERSION 4 NAVIGATION ITEMS
    {
      href: "/executive-dashboard",
      icon: Crown,
      label: "Dashboard Ejecutivo",
      tooltip: "Vista ejecutiva del estado del control interno con alertas y tendencias"
    },
    {
      href: "/strategic-planning",
      icon: Target,
      label: "Planificación Estratégica",
      tooltip: "Gestión de planes estratégicos de control interno alineados con COSO"
    },
    {
      href: "/cultural-surveys",
      icon: Users,
      label: "Encuestas Culturales",
      tooltip: "Evaluación de la cultura organizacional y percepción del control interno"
    },
    {
      href: "/internal-audit",
      icon: FileSearch,
      label: "Auditoría Interna",
      tooltip: "Gestión de auditorías internas, hallazgos y seguimiento de acciones correctivas"
    },
    // WORKFLOW NAVIGATION ITEMS - SEPARATED DEFINITION AND EXECUTION
    {
      href: "/workflow-definition",
      icon: Settings,
      label: "Definición de Flujos",
      tooltip: "Diseñar y configurar plantillas de flujos de trabajo para controles COSO e INTOSAI"
    },
    {
      href: "/workflow-execution", 
      icon: WorkflowIcon,
      label: "Ejecución de Flujos",
      tooltip: "Ejecutar, monitorear y gestionar instancias activas de flujos de trabajo"
    },
    {
      href: "/documents",
      icon: FolderOpen,
      label: t('nav.documents'),
      tooltip: t('documents.title')
    },
    {
      href: "/verification",
      icon: CheckCircle,
      label: t('nav.verification'),
      tooltip: t('nav.verification')
    },
    {
      href: "/institutional-plans",
      icon: Calendar,
      label: "Institutional Plans",
      tooltip: "Manage strategic institutional plans (PEI) and annual operational plans (POA)"
    },
    {
      href: "/training-management",
      icon: Award,
      label: "Training",
      tooltip: "Record and manage staff training in internal control and compliance"
    },
    {
      href: "/informes",
      icon: BarChart3,
      label: t('nav.reports'),
      tooltip: t('reports.title')
    },
    {
      href: "/cgr-reporting",
      icon: FileText,
      label: "Official Reports",
      tooltip: "Generate and send official reports to oversight authorities"
    },
    {
      href: "/alertas",
      icon: Bell,
      label: t('nav.alerts'),
      tooltip: t('nav.alerts')
    },
    {
      href: "/glossary",
      icon: Book,
      label: t('nav.glossary'),
      tooltip: t('nav.glossary')
    }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full bg-sidebar-background border-r border-sidebar-border overflow-y-auto flex flex-col z-40 transition-all duration-300 ease-in-out",
        "w-64 sm:w-72 lg:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:relative lg:z-10"
      )}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">{t('common.nav')}</h2>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        <div className="p-4 pt-4 lg:pt-8 space-y-4 flex-1">
          {/* COSO Components Section */}
          <div className="mb-6">
            <div className="bg-sidebar-primary px-3 py-2 rounded-lg mb-3">
              <h3 className="text-sm font-semibold text-sidebar-primary-foreground">{framework === 'coso' ? 'COSO Components' : framework === 'intosai' ? 'INTOSAI Standards' : 'Control Components'}</h3>
            </div>
            <TooltipProvider>
              <div className="space-y-2">
                {Object.entries(componentMap).map(([key, component]) => {
                  const progress = getComponentProgress(key);
                  const status = getComponentStatus(key);
                  const statusColor = getStatusColor(status, progress, key);
                  const statusBg = getStatusBg(status, progress, key);
                  const isActive = activeComponent === key;

                  const IconComponent = component.icon;
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all touch-target",
                            statusBg,
                            isActive ? "bg-sidebar-primary" : "hover:bg-sidebar-accent"
                          )}
                          onClick={() => {
                            setLocation(`/workflows?component=${key}`);
                            handleNavClick();
                          }}
                        >
                          <div className="flex items-center">
                            <IconComponent className={cn("w-4 h-4 mr-3", 
                              isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
                            )} />
                            <span className={cn("text-sm font-medium", 
                              isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground hover:text-sidebar-primary"
                            )}>{component.name}</span>
                          </div>
                          <span className={cn("text-xs font-bold", statusColor)}>{progress}%</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm">{component.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
          
          {/* Separator */}
          <div className="border-t border-sidebar-border my-4"></div>
          
          {/* Navigation Items */}
          <TooltipProvider>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.href} 
                      className={cn(
                        "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-target",
                        location === item.href 
                          ? "text-sidebar-primary-foreground bg-sidebar-primary" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                      )}
                      onClick={handleNavClick}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-sm">{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Special navigation items */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    href="/documents"
                    className={cn(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-target",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                    )}
                    onClick={() => {
                      sessionStorage.setItem('scrollToAnalysis', 'true');
                      handleNavClick();
                    }}
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    Análisis de Documentos
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-sm">Analiza documentos institucionales para identificar requisitos COSO faltantes</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-nebusis-slate hover:bg-nebusis-surface rounded-lg transition-colors touch-target"
                    disabled
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Usuarios
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-sm">Gestiona usuarios y permisos del sistema (próximamente)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        
        {/* Logout button at the bottom */}
        <div className="p-4 border-t border-nebusis-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-nebusis-error hover:bg-red-50 rounded-lg transition-colors touch-target"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-sm">Terminar sesión y salir del sistema</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>
    </>
  );
}