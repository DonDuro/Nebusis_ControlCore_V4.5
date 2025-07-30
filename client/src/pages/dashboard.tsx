import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import AnalyticalCharts from "@/components/dashboard/AnalyticalCharts";
import { useTranslation } from "@/i18n";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Plus,
  Download
} from "lucide-react";
import { type User, type Institution } from "@shared/schema";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const { data: user, isLoading: userLoading } = useQuery({ 
    queryKey: ["/api/auth/user"],
    retry: false 
  });

  // Add default values to prevent errors with complete User type
  const userData: User = user || {
    id: 0,
    email: "",
    firstName: "Usuario",
    lastName: "",
    role: "user",
    supervisorId: null,
    institutionId: null,
    emailNotifications: true,
    createdAt: null,
    updatedAt: null,
  };
  
  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats", 1],
    queryFn: () => fetch(`/api/dashboard/stats?institutionId=1`).then(res => res.json()),
    enabled: !!user?.institutionId
  });

  const { data: workflows } = useQuery({
    queryKey: ["/api/workflows", 1],
    queryFn: () => fetch(`/api/workflows?institutionId=1`).then(res => res.json()),
    enabled: !!user?.institutionId
  });

  const { data: complianceScores } = useQuery({
    queryKey: ["/api/compliance-scores", 1],
    queryFn: () => fetch(`/api/compliance-scores?institutionId=1`).then(res => res.json()),
    enabled: !!user?.institutionId
  });

  // Add default values to prevent errors with complete types
  const institutionData: Institution = institution || {
    id: 0,
    name: "Institución",
    type: "",
    size: "",
    legalBasis: null,
    sectorRegulations: null,
    logoUrl: null,
    createdAt: null,
  };
  const statsData = stats || { activeWorkflows: 0, completedWorkflows: 0, underReview: 0, overallProgress: 0 };
  const workflowsData = workflows || [];
  const complianceData = complianceScores || [];

  // Function to determine gender-appropriate greeting
  const getWelcomeGreeting = (name: string) => {
    // Extract first name and determine gender based on name patterns
    // Handle cases where name might be "Celso Alvarado" or just "Celso"
    const firstName = name.split(' ')[0].toLowerCase().trim();
    
    // Common male names in Spanish-speaking context
    const maleNames = [
      'carlos', 'celso', 'david', 'miguel', 'jose', 'juan', 'pedro', 'luis', 'antonio', 
      'francisco', 'rafael', 'manuel', 'fernando', 'alberto', 'ricardo', 'roberto',
      'alejandro', 'daniel', 'andres', 'sergio', 'javier', 'oscar', 'eduardo', 'ramon'
    ];
    
    // Common female names
    const femaleNames = [
      'ana', 'maria', 'carmen', 'rosa', 'teresa', 'patricia', 'laura', 'sandra',
      'monica', 'claudia', 'andrea', 'gabriela', 'sofia', 'isabella', 'valentina',
      'yerardy'
    ];
    
    // Return appropriate greeting key based on gender and language
    if (maleNames.includes(firstName)) {
      return t('dashboard.welcomeMale');
    } else if (femaleNames.includes(firstName)) {
      return t('dashboard.welcomeFemale');
    } else {
      // Default to masculine form if unsure
      return t('dashboard.welcomeMale');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={userData} 
        institution={institutionData} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
        stats={statsData}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="p-6 space-y-6">
            
            {/* Enhanced Header with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('dashboard.welcomeGreeting', { 
                    greeting: getWelcomeGreeting((user as any)?.name || userData.firstName || ''),
                    name: (user as any)?.name?.split(' ')[0] || userData.firstName
                  })}
                </h1>
                <p className="text-gray-600">{t('dashboard.overview')}</p>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Button onClick={() => navigate("/workflows")} className="bg-primary hover:bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.createWorkflow')}
                </Button>
                <Button variant="outline" onClick={() => navigate("/reports")}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('dashboard.viewReports')}
                </Button>
              </div>
            </div>

            {/* TOP PRIORITY: Quick Actions and Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Quick Actions - COMPACT VERSION */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    {t('dashboard.quickActions')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => navigate('/workflows')}
                      className="group flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-primary/100 hover:bg-primary/10 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-primary/100 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold text-sm">{t('nav.workflows')}</div>
                        <div className="text-gray-600 text-xs">{t('workflows.subtitle')}</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/documents')}
                      className="group flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold text-sm">{t('nav.documents')}</div>
                        <div className="text-gray-600 text-xs">{t('documents.title')}</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/reports')}
                      className="group flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold text-sm">{t('nav.reports')}</div>
                        <div className="text-gray-600 text-xs">{t('reports.title')}</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/verification')}
                      className="group flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold text-sm">{t('nav.verification')}</div>
                        <div className="text-gray-600 text-xs">{t('verification.title')}</div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary - COMPACT VERSION */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {t('dashboard.performanceSummary')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.performanceMetrics')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-green-800">{t('dashboard.overallCompliance')}</div>
                        <div className="text-sm text-green-600">{t('dashboard.target')}: 85%</div>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{statsData.overallProgress}%</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div>
                        <div className="font-semibold text-primary">{t('dashboard.activeWorkflows')}</div>
                        <div className="text-sm text-primary">{t('dashboard.inProgress')}</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{statsData.activeWorkflows}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-purple-800">{t('dashboard.efficiency')}</div>
                        <div className="text-sm text-purple-600">{t('dashboard.monthlyAverage')}</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">92%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytical Charts Component - MOVED DOWN */}
            <AnalyticalCharts 
              stats={statsData} 
              workflows={workflowsData} 
              complianceScores={complianceData} 
            />





          </div>
        </main>
      </div>
    </div>
  );
}