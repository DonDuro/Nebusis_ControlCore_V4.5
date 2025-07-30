import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, FileText, PlusCircle, Clipboard, Download, BarChart, Shield, Eye, Target, Award, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n";
import { format } from "date-fns";
import { ChecklistItem, AssessmentReport, AssessmentResponse } from "@shared/schema";

export default function SelfAssessment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedFramework, setSelectedFramework] = useState<"coso" | "intosai">("coso");
  const [currentReport, setCurrentReport] = useState<AssessmentReport | null>(null);
  const [responses, setResponses] = useState<Record<number, { response: string; observations: string }>>({});
  const [conductorName, setConductorName] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);

  // COSO Component types
  const cosoComponentTypes = [
    { id: "ambiente_control", name: t('verification.components.ambiente_control.name'), description: t('verification.components.ambiente_control.description') },
    { id: "evaluacion_riesgos", name: t('verification.components.evaluacion_riesgos.name'), description: t('verification.components.evaluacion_riesgos.description') },
    { id: "actividades_control", name: t('verification.components.actividades_control.name'), description: t('verification.components.actividades_control.description') },
    { id: "informacion_comunicacion", name: t('verification.components.informacion_comunicacion.name'), description: t('verification.components.informacion_comunicacion.description') },
    { id: "supervision", name: t('verification.components.supervision.name'), description: t('verification.components.supervision.description') }
  ];

  // INTOSAI Component types
  const intosaiComponentTypes = [
    { id: "audit_standards", name: t('verification.components.audit_standards.name'), description: t('verification.components.audit_standards.description') },
    { id: "independence", name: t('verification.components.independence.name'), description: t('verification.components.independence.description') },
    { id: "quality_control", name: t('verification.components.quality_control.name'), description: t('verification.components.quality_control.description') },
    { id: "performance_audit", name: t('verification.components.performance_audit.name'), description: t('verification.components.performance_audit.description') },
    { id: "financial_audit", name: t('verification.components.financial_audit.name'), description: t('verification.components.financial_audit.description') },
    { id: "compliance_audit", name: t('verification.components.compliance_audit.name'), description: t('verification.components.compliance_audit.description') }
  ];

  const currentComponentTypes = selectedFramework === 'coso' ? cosoComponentTypes : intosaiComponentTypes;

  // Fetch checklist items by framework
  const { data: checklistItems = [] } = useQuery<ChecklistItem[]>({
    queryKey: ['/api/checklist-items', selectedFramework],
    queryFn: async () => {
      const response = await fetch(`/api/checklist-items/${selectedFramework}`);
      return response.json();
    }
  });

  // Fetch assessment reports
  const { data: assessmentReports = [] } = useQuery<AssessmentReport[]>({
    queryKey: ['/api/assessment-reports', user?.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/assessment-reports/${user?.institutionId}`);
      return response.json();
    },
    enabled: !!user?.institutionId
  });

  // Create assessment report mutation
  const createReportMutation = useMutation({
    mutationFn: async () => {
      if (!assessmentTitle || !conductorName) {
        throw new Error("Título y conductor son requeridos");
      }

      // Calculate compliance scores
      const totalItems = checklistItems.length;
      const compliantItems = Object.values(responses).filter(r => r.response === 'cumple').length;
      const partialItems = Object.values(responses).filter(r => r.response === 'parcialmente').length;
      const nonCompliantItems = Object.values(responses).filter(r => r.response === 'no_cumple').length;
      const overallScore = Math.round(((compliantItems + partialItems * 0.5) / totalItems) * 100);

      // Generate findings based on responses
      const findings: string[] = [];
      checklistItems.forEach(item => {
        const resp = responses[item.id];
        if (resp?.response === 'no_cumple') {
          findings.push(`No cumple: ${item.requirement}`);
        } else if (resp?.response === 'parcialmente') {
          findings.push(`Cumple parcialmente: ${item.requirement}`);
        }
      });

      const reportData = {
        institutionId: user!.institutionId,
        framework: selectedFramework,
        componentType: "all_components",
        title: assessmentTitle,
        conductedBy: conductorName,
        conductedById: user!.id,
        totalItems,
        compliantItems,
        partialItems,
        nonCompliantItems,
        overallScore,
        findings,
        recommendations: ["Implementar mejoras en elementos no conformes", "Realizar seguimiento a elementos parcialmente conformes"],
        status: "draft"
      };

      const reportResponse = await fetch('/api/assessment-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const report = await reportResponse.json();

      // Save individual responses
      for (const item of checklistItems) {
        const resp = responses[item.id];
        if (resp) {
          await fetch('/api/assessment-responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assessmentReportId: report.id,
              checklistItemId: item.id,
              response: resp.response,
              observations: resp.observations,
              evidenceDocuments: []
            })
          });
        }
      }

      return report;
    },
    onSuccess: (report) => {
      setCurrentReport(report);
      setShowReportDialog(true);
      queryClient.invalidateQueries({ queryKey: ['/api/assessment-reports'] });
      toast({
        title: "Evaluación completada",
        description: "El informe de auditoría interna ha sido generado exitosamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al generar el informe",
        variant: "destructive"
      });
    }
  });

  const handleResponseChange = (itemId: number, field: 'response' | 'observations', value: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'cumple':
        return <Badge className="bg-green-100 text-green-800 border-green-200 shadow-sm"><CheckCircle className="w-3 h-3 mr-1" />{t('verification.responses.cumple')}</Badge>;
      case 'no_cumple':
        return <Badge className="bg-red-100 text-red-800 border-red-200 shadow-sm"><XCircle className="w-3 h-3 mr-1" />{t('verification.responses.no_cumple')}</Badge>;
      case 'parcialmente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm"><Clock className="w-3 h-3 mr-1" />{t('verification.responses.parcialmente')}</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-300 text-slate-600">{t('selfAssessment.pending', 'Pending')}</Badge>;
    }
  };

  const completedResponses = Array.isArray(checklistItems) ? checklistItems.filter(item => responses[item.id]?.response).length : 0;
  const progress = Array.isArray(checklistItems) && checklistItems.length > 0 ? Math.round((completedResponses / checklistItems.length) * 100) : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header user={user} institution={{ id: user?.institutionId || 0, name: t('common.institution', 'Institution') }} />
      <div className="flex">
        <SidebarSimple open={true} />
        <main className="flex-1 p-6 pt-20">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">{t('selfAssessment.title')}</h1>
                      <p className="text-slate-600">{t('selfAssessment.description', 'Conduct comprehensive framework assessments using COSO and INTOSAI standards.')}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowReportDialog(true)} 
                  disabled={completedResponses === 0}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  {t('selfAssessment.generateReport', 'Generate Assessment Report')}
                </Button>
              </div>
            </div>

            {/* PROMINENT Framework Selection - Most Colorful Section */}
            <div className="relative">
              <Card className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white shadow-2xl border-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                <CardHeader className="relative pb-6">
                  <CardTitle className="flex items-center gap-4 text-white text-2xl font-bold">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Target className="w-7 h-7" />
                    </div>
                    {t('selfAssessment.frameworkReference', 'Framework Selection')}
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    {t('selfAssessment.selectFrameworkDescription', 'Choose your regulatory framework for comprehensive assessment')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative pb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedFramework("coso")}
                      className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedFramework === "coso"
                          ? "bg-white/95 border-white text-slate-900 shadow-2xl scale-105"
                          : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-xl ${
                          selectedFramework === "coso" 
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                            : "bg-white/20 text-white"
                        }`}>
                          <Shield className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">COSO Framework</h3>
                          <p className="text-sm opacity-80">Committee of Sponsoring Organizations</p>
                          <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            17 {t('selfAssessment.elements', 'elements')}
                          </div>
                        </div>
                      </div>
                      {selectedFramework === "coso" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedFramework("intosai")}
                      className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedFramework === "intosai"
                          ? "bg-white/95 border-white text-slate-900 shadow-2xl scale-105"
                          : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-xl ${
                          selectedFramework === "intosai" 
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white" 
                            : "bg-white/20 text-white"
                        }`}>
                          <Award className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">INTOSAI Framework</h3>
                          <p className="text-sm opacity-80">International Organization of Supreme Audit Institutions</p>
                          <div className="mt-3 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            12 {t('selfAssessment.elements', 'elements')}
                          </div>
                        </div>
                      </div>
                      {selectedFramework === "intosai" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subdued Progress Card */}
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                  <div className="p-1.5 bg-slate-200 rounded-lg text-slate-600">
                    <BarChart className="w-4 h-4" />
                  </div>
                  {t('selfAssessment.assessmentProgress', 'Assessment Progress')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {completedResponses} {t('selfAssessment.of', 'of')} {checklistItems.length} {t('selfAssessment.completed', 'completed')}
                      </span>
                      <span className="text-slate-700 font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" />
                  </div>
                </div>
                {progress === 100 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50/80 border border-green-200/60 rounded-lg">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-sm font-medium">{t('selfAssessment.assessmentComplete', 'Assessment Complete! Ready to generate report.')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subdued Assessment Items */}
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200/30 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                  <div className="p-1.5 bg-slate-200 rounded-lg text-slate-600">
                    <Eye className="w-4 h-4" />
                  </div>
                  {t('selfAssessment.assessmentElements', 'Assessment Elements')} - {selectedFramework.toUpperCase()}
                </CardTitle>
                <CardDescription className="text-slate-500 text-sm">
                  {t('selfAssessment.respondToElements', 'Respond to each element according to the implementation status in your institution')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-3">
                    {checklistItems.map((item, index) => (
                      <div key={item.id} className="bg-white/40 border border-slate-200/40 rounded-lg p-4 hover:bg-white/60 hover:border-slate-300/50 transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-shrink-0 w-6 h-6 bg-slate-300 rounded-md flex items-center justify-center text-slate-700 text-xs font-medium">
                                {index + 1}
                              </div>
                              <h4 className="font-medium text-slate-800 text-base">
                                {item.code}: {item.requirement}
                              </h4>
                            </div>
                            <p className="text-sm text-slate-600 ml-10 leading-relaxed">
                              {item.verificationQuestion}
                            </p>
                          </div>
                          {responses[item.id]?.response && (
                            <div className="ml-4">
                              {getResponseBadge(responses[item.id].response)}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-10 space-y-4">
                          <div>
                            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                              {t('selfAssessment.complianceStatus', 'Compliance Status')}
                            </Label>
                            <RadioGroup
                              value={responses[item.id]?.response || ""}
                              onValueChange={(value) => handleResponseChange(item.id, 'response', value)}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <RadioGroupItem value="cumple" id={`${item.id}-cumple`} className="border-green-400" />
                                <Label htmlFor={`${item.id}-cumple`} className="text-sm font-medium text-green-800">
                                  {t('verification.responses.cumple')}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                <RadioGroupItem value="parcialmente" id={`${item.id}-parcialmente`} className="border-yellow-400" />
                                <Label htmlFor={`${item.id}-parcialmente`} className="text-sm font-medium text-yellow-800">
                                  {t('verification.responses.parcialmente')}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <RadioGroupItem value="no_cumple" id={`${item.id}-no_cumple`} className="border-red-400" />
                                <Label htmlFor={`${item.id}-no_cumple`} className="text-sm font-medium text-red-800">
                                  {t('verification.responses.no_cumple')}
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label htmlFor={`observations-${item.id}`} className="text-sm font-semibold text-slate-700 mb-2 block">
                              {t('selfAssessment.observations', 'Observations')}
                            </Label>
                            <Textarea
                              id={`observations-${item.id}`}
                              placeholder={t('selfAssessment.observationsPlaceholder', 'Describe the current situation, evidence or additional comments...')}
                              value={responses[item.id]?.observations || ""}
                              onChange={(e) => handleResponseChange(item.id, 'observations', e.target.value)}
                              className="bg-white/70 border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Subdued Previous Reports */}
            {assessmentReports.length > 0 && (
              <Card className="bg-white/40 backdrop-blur-sm border-slate-200/30 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                    <div className="p-1.5 bg-slate-200 rounded-lg text-slate-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    {t('selfAssessment.previousReports', 'Previous Reports')}
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm">
                    {t('selfAssessment.assessmentHistory', 'History of completed assessments')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-white/80 border border-slate-200/60 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{report.title}</h4>
                          <div className="space-y-1">
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">{t('selfAssessment.conductedBy', 'Conducted by')}:</span> {report.conductedBy} • {format(new Date(report.assessmentDate!), 'dd/MM/yyyy')}
                            </p>
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">{t('selfAssessment.score', 'Score')}:</span> {report.overallScore}% • <span className="font-medium">{t('selfAssessment.framework', 'Framework')}:</span> {report.framework?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Badge 
                            variant={report.status === 'final' ? 'default' : 'secondary'}
                            className={report.status === 'final' 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm' 
                              : 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                            }
                          >
                            {report.status === 'final' ? t('selfAssessment.finalized', 'Finalized') : t('selfAssessment.draft', 'Draft')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-sm border-slate-200/60">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {t('selfAssessment.generateInternalAuditReport', 'Generate Internal Audit Report')}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label htmlFor="assessment-title" className="text-sm font-semibold text-slate-700 mb-2 block">
                {t('selfAssessment.reportTitle', 'Report Title')}
              </Label>
              <Input
                id="assessment-title"
                placeholder={t('selfAssessment.reportTitlePlaceholder', 'E.g: Internal Control Assessment Q1 2025')}
                value={assessmentTitle}
                onChange={(e) => setAssessmentTitle(e.target.value)}
                className="bg-white/70 border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div>
              <Label htmlFor="conductor-name" className="text-sm font-semibold text-slate-700 mb-2 block">
                {t('selfAssessment.conductedBy', 'Conducted by')}
              </Label>
              <Input
                id="conductor-name"
                placeholder={t('selfAssessment.conductorNamePlaceholder', 'Name of the assessment responsible person')}
                value={conductorName}
                onChange={(e) => setConductorName(e.target.value)}
                className="bg-white/70 border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">{t('selfAssessment.assessmentProgress', 'Assessment Progress')}</span>
              </div>
              <p className="text-sm text-blue-700">
                {completedResponses} {t('selfAssessment.of', 'of')} {checklistItems.length} {t('selfAssessment.elementsEvaluated', 'elements evaluated')} ({progress}%)
              </p>
              <Progress value={progress} className="mt-2 h-2 bg-blue-100" />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowReportDialog(false)} 
                variant="outline" 
                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={() => createReportMutation.mutate()} 
                disabled={createReportMutation.isPending || !assessmentTitle || !conductorName}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {createReportMutation.isPending 
                  ? t('selfAssessment.generating', 'Generating...') 
                  : t('selfAssessment.generateReport', 'Generate Report')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}