import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import ReportEditor from "@/components/reports/ReportEditor";
import { useTranslation } from "../i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

const getReportTypes = (t: any) => [
  {
    id: "compliance",
    name: t('reports.cosoComplianceReport'),
    description: t('reports.cosoComplianceDesc'),
    icon: Target,
    color: "bg-primary/100"
  },
  {
    id: "progress",
    name: t('reports.workflowProgressReport'),
    description: t('reports.workflowProgressDesc'),
    icon: TrendingUp,
    color: "bg-gray-500"
  },
  {
    id: "performance",
    name: t('reports.performanceReport'),
    description: t('reports.performanceDesc'),
    icon: BarChart3,
    color: "bg-primary/100"
  },
  {
    id: "risk",
    name: t('reports.riskManagementReport'),
    description: t('reports.riskManagementDesc'),
    icon: AlertTriangle,
    color: "bg-gray-500"
  }
];

const getComponentNames = (t: any) => ({
  ambiente_control: t('reports.controlEnvironment'),
  evaluacion_riesgos: t('reports.riskAssessment'), 
  actividades_control: t('reports.controlActivities'),
  informacion_comunicacion: t('reports.informationCommunication'),
  supervision: t('reports.supervision'),
  environment_control: t('reports.controlEnvironment'),
  risk_assessment: t('reports.riskAssessment'),
  control_activities: t('reports.controlActivities'), 
  information_communication: t('reports.informationCommunication'),
  monitoring: t('reports.supervision')
});

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState("compliance");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<any>(null);
  
  const { t } = useTranslation();
  const reportTypes = getReportTypes(t);
  const componentNames = getComponentNames(t);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user,
  });

  const { data: workflows } = useQuery({
    queryKey: ["/api/workflows", 1],
    queryFn: () => fetch(`/api/workflows?institutionId=1`).then(res => res.json()),
    enabled: !!user,
  });

  const { data: complianceScores } = useQuery({
    queryKey: ["/api/compliance-scores", 1],
    queryFn: () => fetch(`/api/compliance-scores?institutionId=1`).then(res => res.json()),
    enabled: !!user,
  });

  const generateReport = async (reportType: string) => {
    setIsGenerating(true);
    
    try {
      console.log('Generating report:', reportType);
      const response = await fetch(`/api/reports/${reportType}?institutionId=1`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`${t('reports.generate')} error: ${response.status}`);
      }
      
      const reportData = await response.json();
      console.log('Report data received:', reportData);
      
      // Abrir el editor de informes con los datos generados
      setCurrentReportData(reportData);
      setShowEditor(true);
      console.log('Editor should open now');
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`${t('reports.generate')} error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatReportContent = (data: any, reportType: string) => {
    switch (reportType) {
      case 'compliance':
        return `${t('reports.cosoComplianceReport').toUpperCase()}
${t('common.institution')}: ${data.institution?.name}
${t('common.date')}: ${new Date(data.generatedAt).toLocaleDateString()}

${t('reports.executiveSummary').toUpperCase()}:
- ${t('reports.overallCompliance')}: ${data.summary?.overallCompliance}%
- ${t('reports.totalWorkflows')}: ${data.summary?.totalWorkflows}
- ${t('reports.completed')}: ${data.summary?.completedWorkflows}
- ${t('reports.activeWorkflows')}: ${data.summary?.activeWorkflows}

${t('reports.componentCompliance').toUpperCase()}:
${data.componentCompliance?.map((comp: any) => 
  `- ${componentNames[comp.component as keyof typeof componentNames]}: ${comp.score}%`
).join('\n')}`;

      case 'progress':
        return `${t('reports.workflowProgressReport').toUpperCase()}
${t('common.date')}: ${new Date(data.generatedAt).toLocaleDateString()}

${t('reports.workflows').toUpperCase()}:
${data.workflows?.map((w: any) => 
  `- ${w.name}: ${w.progress}% (${w.status})`
).join('\n')}`;

      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const calculateOverallCompliance = () => {
    if (!complianceScores || complianceScores.length === 0) return 0;
    const total = complianceScores.reduce((sum: number, score: any) => sum + score.score, 0);
    return Math.round(total / complianceScores.length);
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { level: t('common.excellent'), color: "bg-green-500" };
    if (score >= 75) return { level: t('common.good'), color: "bg-primary/100" };
    if (score >= 60) return { level: t('common.regular'), color: "bg-yellow-500" };
    return { level: t('reports.deficient'), color: "bg-red-500" };
  };

  if (!user || !institution) {
    return (
      <div className="min-h-screen bg-dr-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dr-blue mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  const overallCompliance = calculateOverallCompliance();
  const complianceInfo = getComplianceLevel(overallCompliance);

  return (
    <div className="min-h-screen bg-dr-bg">
      <Header 
        user={user as any} 
        institution={institution as any} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
        stats={{ activeWorkflows: 0, completedWorkflows: 0, underReview: 0, overallProgress: 0 }}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
              <p className="text-dr-neutral mt-1">
                {t('reports.subtitle')}
              </p>
            </div>

            {/* Reporting Activities Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-dr-blue" />
                    Report Generation Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-blue-900">Recent Reports</span>
                          <Badge className="bg-blue-100 text-blue-800">3 New</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-blue-700">• COSO Compliance Report - Q4 2024</div>
                          <div className="text-xs text-blue-700">• Risk Assessment Summary - Dec 2024</div>
                          <div className="text-xs text-blue-700">• Control Effectiveness Report - Dec 2024</div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-green-900">Scheduled Reports</span>
                          <Badge className="bg-green-100 text-green-800">5 Pending</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-green-700">• Monthly Progress Report - Due Jan 5</div>
                          <div className="text-xs text-green-700">• Audit Findings Report - Due Jan 10</div>
                          <div className="text-xs text-green-700">• Executive Summary - Due Jan 15</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Report Generation Trends</span>
                        <span className="text-xs text-gray-500">Last 30 days</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">12</div>
                          <div className="text-xs text-gray-600">Compliance</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">8</div>
                          <div className="text-xs text-gray-600">Progress</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">6</div>
                          <div className="text-xs text-gray-600">Risk</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">4</div>
                          <div className="text-xs text-gray-600">Executive</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Generated This Month</span>
                    </div>
                    <span className="font-bold text-blue-600">24</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Downloads</span>
                    </div>
                    <span className="font-bold text-green-600">187</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Shared Reports</span>
                    </div>
                    <span className="font-bold text-purple-600">15</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Pending Generation</span>
                    </div>
                    <span className="font-bold text-orange-600">3</span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-2">Report Formats</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>PDF</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Excel</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Word</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generador de Informes */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.reportGenerator')}</CardTitle>
                <CardDescription>
                  {t('reports.reportGeneratorDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Controles de Generación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('reports.reportPeriod')}</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">{t('reports.currentPeriod')}</SelectItem>
                          <SelectItem value="monthly">{t('reports.lastMonth')}</SelectItem>
                          <SelectItem value="quarterly">{t('reports.lastQuarter')}</SelectItem>
                          <SelectItem value="yearly">{t('reports.lastYear')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Report Types */}
                  <div>
                    <h3 className="font-medium mb-4">Available Report Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportTypes.map((report) => {
                        const IconComponent = report.icon;
                        return (
                          <Card 
                            key={report.id} 
                            className={`cursor-pointer transition-all border-2 ${
                              selectedReportType === report.id 
                                ? 'border-dr-blue bg-primary/10' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedReportType(report.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${report.color} bg-opacity-10`}>
                                  <IconComponent className={`h-5 w-5 text-gray-700`} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{report.name}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                                </div>
                                {selectedReportType === report.id && (
                                  <CheckCircle className="h-5 w-5 text-dr-blue" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generate Report Button */}
                  <div className="pt-6 border-t bg-gray-50 -mx-6 px-6 pb-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Ready to generate your {selectedReportType} report for the {selectedPeriod} period
                      </div>
                      <Button 
                        onClick={() => generateReport(selectedReportType)}
                        disabled={isGenerating}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Generating Report...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Download className="h-5 w-5" />
                            <span>Generate Report</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Report Editor Modal */}
      {showEditor && currentReportData && (
        <ReportEditor
          reportData={currentReportData}
          reportType={selectedReportType}
          institution={institution}
          onClose={() => {
            setShowEditor(false);
            setCurrentReportData(null);
          }}
        />
      )}
    </div>
  );
}