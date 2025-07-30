import { Link, useLocation } from "wouter";
import { X, Home, FileText, CheckSquare, BarChart3, Settings, LogOut, User, ClipboardList, Workflow, Clipboard, FileBarChart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";

interface SidebarSimpleProps {
  open: boolean;
  onClose: () => void;
}

export default function SidebarSimple({ open, onClose }: SidebarSimpleProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const menuItems = [
    { path: "/", label: t('nav.dashboard'), icon: Home, tooltip: t('dashboard.title') },
    { path: "/documents", label: t('nav.documents'), icon: FileText, tooltip: t('documents.title') },
    { path: "/planning", label: t('nav.planning'), icon: ClipboardList, tooltip: t('planning.title') },
    { path: "/workflows", label: t('nav.workflows'), icon: Workflow, tooltip: t('workflows.consolidated.tooltip') },
    { path: "/verification", label: t('nav.verification'), icon: CheckSquare, tooltip: t('verification.title') },
    { path: "/self-assessment", label: t('nav.selfAssessment'), icon: Clipboard, tooltip: t('selfAssessment.title') },
    { path: "/audit-reports", label: t('nav.auditReports'), icon: FileBarChart, tooltip: t('auditReports.title') },
    { path: "/reports", label: t('nav.reports'), icon: BarChart3, tooltip: t('reports.title') },
    { path: "/glossary", label: t('nav.glossary'), icon: BookOpen, tooltip: t('glossary.title') },
  ];

  // Advanced Menu Items - removed since no advanced features are currently active

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto lg:h-screen
      `}>
        
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('common.close')}</p>
            </TooltipContent>
          </Tooltip>
        </div>



        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Standard Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link href={item.path}>
                    <div
                      className={`
                        flex items-center px-4 py-3 text-sm rounded-lg transition-colors cursor-pointer
                        ${isActive 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}


        </nav>

        {/* Configuration and Logout at bottom */}
        {user && (
          <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/configuration">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('nav.settings')}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('configuration.title')}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="w-full justify-start ml-4">
                    <User className="h-4 w-4 mr-2" />
                    {t('common.profile')}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('common.profile')}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    try {
                      const sessionToken = localStorage.getItem('sessionToken');
                      
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionToken }),
                        credentials: 'include'
                      });
                      
                      // Clear session token and auto-login
                      localStorage.removeItem('sessionToken');
                      localStorage.removeItem('controlcore-auto-login-email');
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout failed:', error);
                      // Force redirect even if logout API fails
                      localStorage.removeItem('sessionToken');
                      localStorage.removeItem('controlcore-auto-login-email');
                      window.location.href = '/';
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.logout')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('auth.logout')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

      </aside>
    </>
  );
}