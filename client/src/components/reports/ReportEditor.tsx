import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  Calendar,
  Building,
  Hash
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from "../../i18n";

interface ReportEditorProps {
  reportData: any;
  reportType: string;
  institution: any;
  onClose: () => void;
}

export default function ReportEditor({ reportData, reportType, institution, onClose }: ReportEditorProps) {
  const { t } = useTranslation();
  const [editableContent, setEditableContent] = useState("");
  const [reportNumber, setReportNumber] = useState(`RPT-${Date.now().toString().slice(-6)}`);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize content when component mounts
  useEffect(() => {
    const content = formatReportContent(reportData, reportType);
    setEditableContent(content);
  }, [reportData, reportType]);

  function formatReportContent(data: any, type: string): string {
    switch (type) {
      case 'compliance':
        return `${t('reports.cosoComplianceDesc').toUpperCase()}

${t('reports.executiveSummary').toUpperCase()}
${t('reportEditor.complianceExecutiveSummary')}

${t('reportEditor.generalComplianceLevel').toUpperCase()}
${t('reportEditor.generalComplianceLevelDesc')} ${data.overallScore || 0}%, ${t('reportEditor.cosoProgressReflection')}

${t('reportEditor.componentAnalysis').toUpperCase()}

1. ${t('reports.controlEnvironment').toUpperCase()}
${t('common.status')}: ${getComponentStatus(data.componentScores?.ambiente_control)}
${t('common.description')}: ${t('reportEditor.controlEnvironmentDesc')}

2. ${t('reports.riskAssessment').toUpperCase()}
${t('common.status')}: ${getComponentStatus(data.componentScores?.evaluacion_riesgos)}
${t('common.description')}: ${t('reportEditor.riskAssessmentDesc')}

3. ${t('reports.controlActivities').toUpperCase()}
${t('common.status')}: ${getComponentStatus(data.componentScores?.actividades_control)}
${t('common.description')}: ${t('reportEditor.controlActivitiesDesc')}

4. ${t('reports.informationCommunication').toUpperCase()}
${t('common.status')}: ${getComponentStatus(data.componentScores?.informacion_comunicacion)}
${t('common.description')}: ${t('reportEditor.informationCommunicationDesc')}

5. ${t('reportEditor.supervisionActivities').toUpperCase()}
${t('common.status')}: ${getComponentStatus(data.componentScores?.supervision)}
${t('common.description')}: ${t('reportEditor.supervisionActivitiesDesc')}

${t('reportEditor.priorityRecommendations').toUpperCase()}
${data.recommendations?.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') || t('reportEditor.noSpecificRecommendations')}

${t('reportEditor.nextSteps').toUpperCase()}
${t('reportEditor.nextStepsDesc')}

${t('reportEditor.conclusions').toUpperCase()}
${t('reportEditor.conclusionsDesc')}`;

      case 'progress':
        return `${t('reportEditor.currentWorkflowsStatus').toUpperCase()}

${t('reports.executiveSummary').toUpperCase()}
${t('reportEditor.progressExecutiveSummary')}

${t('reportEditor.generalWorkflowsStatus').toUpperCase()}
${t('reports.totalWorkflows')}: ${data.totalWorkflows || 0}
${t('reports.completed')}: ${data.completedWorkflows || 0}
${t('reports.inProgress')}: ${data.inProgressWorkflows || 0}
${t('reportEditor.pendingWorkflows')}: ${data.pendingWorkflows || 0}

${t('reportEditor.cosoComponentProgress').toUpperCase()}
${data.workflowsByComponent ? Object.entries(data.workflowsByComponent).map(([comp, workflows]: [string, any]) => {
  return `${comp.replace('_', ' ').toUpperCase()}: ${workflows.length} ${t('reports.activeWorkflows')}`;
}).join('\n') : t('reportEditor.noComponentDataAvailable')}

${t('reportEditor.performanceAnalysis').toUpperCase()}
${t('reportEditor.performanceAnalysisDesc')}

${t('reportEditor.priorityWorkflows').toUpperCase()}
${t('reportEditor.priorityWorkflowsDesc')}

${t('reportEditor.recommendations').toUpperCase()}
1. ${t('reportEditor.recommendation1')}
2. ${t('reportEditor.recommendation2')}
3. ${t('reportEditor.recommendation3')}
4. ${t('reportEditor.recommendation4')}

${t('reportEditor.nextSteps').toUpperCase()}
${t('reportEditor.progressNextStepsDesc')}`;

      case 'performance':
        return `${t('reportEditor.efficiencyAnalysisTitle').toUpperCase()}

${t('reports.executiveSummary').toUpperCase()}
${t('reportEditor.performanceExecutiveSummary')}

${t('reportEditor.keyPerformanceMetrics').toUpperCase()}
- ${t('reportEditor.averageExecutionTime')}: ${data.averageExecutionTime || t('reportEditor.notAvailable')}
- ${t('reportEditor.onTimeCompletionRate')}: ${data.onTimeCompletion || t('reportEditor.notAvailable')}%
- ${t('reportEditor.operationalEfficiency')}: ${data.operationalEfficiency || t('reportEditor.notAvailable')}%
- ${t('reportEditor.teamProductivity')}: ${data.teamProductivity || t('reportEditor.notAvailable')}%

${t('reportEditor.trendAnalysis').toUpperCase()}
${t('reportEditor.trendAnalysisDesc')}

${t('reportEditor.institutionalBenchmarking').toUpperCase()}
${t('reportEditor.institutionalBenchmarkingDesc')}

${t('reportEditor.bottleneckIdentification').toUpperCase()}
${t('reportEditor.bottleneckIdentificationDesc')}

${t('reportEditor.improvementRecommendations').toUpperCase()}
1. ${t('reportEditor.performanceRecommendation1')}
2. ${t('reportEditor.performanceRecommendation2')}
3. ${t('reportEditor.performanceRecommendation3')}
4. ${t('reportEditor.performanceRecommendation4')}

${t('reportEditor.optimizationPlan').toUpperCase()}
${t('reportEditor.optimizationPlanDesc')}`;

      case 'risk':
        return `${t('reportEditor.riskEvaluationTitle').toUpperCase()}

${t('reports.executiveSummary').toUpperCase()}
${t('reportEditor.riskExecutiveSummary')}

${t('reportEditor.institutionalRiskProfile').toUpperCase()}
${t('reportEditor.generalRiskLevel')}: ${data.riskLevel || t('reportEditor.medium')}
${t('reportEditor.highImpactRisks')}: ${data.highRiskCount || 0}
${t('reportEditor.mitigatedRisks')}: ${data.mitigatedRiskCount || 0}
${t('reportEditor.implementedControls')}: ${data.controlsImplemented || 0}

${t('reportEditor.highRiskAreasIdentified').toUpperCase()}
${data.riskAssessment?.highRiskAreas?.map((area: any, index: number) => 
  `${index + 1}. ${area.component}: ${t('reportEditor.riskLevel')} ${area.riskLevel} (${t('reportEditor.score')}: ${area.score})`
).join('\n') || t('reportEditor.noCriticalHighRiskAreas')}

${t('reportEditor.existingControlsAnalysis').toUpperCase()}
${t('reportEditor.existingControlsAnalysisDesc')}

${t('reportEditor.riskControlMatrix').toUpperCase()}
${t('reportEditor.riskControlMatrixDesc')}

${t('reportEditor.strategicRecommendations').toUpperCase()}
${data.recommendations?.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') || t('reportEditor.needSpecificRecommendations')}

${t('reportEditor.riskManagementPlan').toUpperCase()}
${t('reportEditor.riskManagementPlanDesc')}

${t('reportEditor.implementationSchedule').toUpperCase()}
${t('reportEditor.implementationScheduleDesc')}`;

      default:
        return t('reportEditor.contentNotAvailable');
    }
  }

  function getComponentStatus(score: number | undefined): string {
    if (!score) return t('reportEditor.notEvaluated');
    if (score >= 90) return t('common.excellent');
    if (score >= 80) return t('common.good');
    if (score >= 70) return t('reportEditor.satisfactory');
    if (score >= 60) return t('reportEditor.needsImprovement');
    return t('reportEditor.critical');
  }

  const getReportTitle = (type: string): string => {
    const titles = {
      compliance: t('reports.cosoComplianceReport'),
      progress: t('reports.workflowProgressReport'),
      performance: t('reports.performanceReport'),
      risk: t('reports.riskManagementReport')
    };
    return titles[type as keyof typeof titles] || t('reportEditor.institutionalReport');
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const lineHeight = 6;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with automatic page breaks
      const addTextWithPageBreaks = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.setFontSize(fontSize);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines[i], margin, yPosition);
          yPosition += lineHeight;
        }
      };

      // Header section
      addTextWithPageBreaks(institution?.name || 'Institución', 16, true);
      yPosition += 5;
      addTextWithPageBreaks(institution?.type || 'Entidad Gubernamental', 12);
      yPosition += 10;
      
      // Title
      addTextWithPageBreaks(getReportTitle(reportType), 14, true);
      yPosition += 5;
      
      // Report metadata
      addTextWithPageBreaks(`Número: ${reportNumber}`, 10);
      addTextWithPageBreaks(`Fecha: ${new Date(reportDate).toLocaleDateString('es-ES')}`, 10);
      yPosition += 10;
      
      // Add a line separator
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Content
      addTextWithPageBreaks(t('reportEditor.reportContent').toUpperCase(), 12, true);
      yPosition += 5;
      
      // Process the editable content line by line to maintain formatting
      const contentLines = editableContent.split('\n');
      for (const line of contentLines) {
        if (line.trim() === '') {
          yPosition += lineHeight / 2; // Add space for empty lines
          continue;
        }
        
        // Check if line is a title (all caps or starts with numbers)
        const isTitle = line === line.toUpperCase() && line.length > 10;
        const isSection = /^\d+\./.test(line.trim());
        
        if (isTitle) {
          yPosition += 5;
          addTextWithPageBreaks(line, 11, true);
          yPosition += 3;
        } else if (isSection) {
          yPosition += 3;
          addTextWithPageBreaks(line, 10, true);
        } else {
          addTextWithPageBreaks(line, 10, false);
        }
      }
      
      // Footer
      yPosition += 15;
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      addTextWithPageBreaks(`${t('reportEditor.generatedBy')} - ${new Date().toLocaleDateString(t('common.language') === 'en' ? 'en-US' : 'es-ES')}`, 8);
      addTextWithPageBreaks(t('reportEditor.confidentialNotice'), 8);
      
      const filename = `${getReportTitle(reportType).replace(/ /g, '_')}_${reportNumber}_${reportDate}_${Date.now()}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('reportEditor.pdfGenerationError'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">{t('reportEditor.title')}</h2>
            <Badge variant="outline">{getReportTitle(reportType)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-primary hover:bg-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? t('reportEditor.generatingPDF') : t('reportEditor.generatePDF')}
            </Button>
            <Button variant="outline" onClick={onClose}>
{t('reportEditor.close')}
            </Button>
          </div>
        </div>

        {/* Report Editor */}
        <div className="p-6 space-y-6">
          {/* Report Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
{t('reportEditor.reportInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reportNumber" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
{t('reportEditor.reportNumber')}
                  </Label>
                  <Input
                    id="reportNumber"
                    value={reportNumber}
                    onChange={(e) => setReportNumber(e.target.value)}
                    placeholder="RPT-000001"
                  />
                </div>
                <div>
                  <Label htmlFor="reportDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
{t('reportEditor.reportDate')}
                  </Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
{t('reportEditor.institution')}
                  </Label>
                  <Input
                    value={institution?.name || t('reportEditor.institutionNotSpecified')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('reportEditor.reportPreview')}</CardTitle>
              <p className="text-sm text-gray-600">
                {t('reportEditor.modify')}
              </p>
            </CardHeader>
            <CardContent>
              <div ref={reportRef} className="bg-white p-8 border rounded-lg space-y-6">
                {/* Report Header */}
                <div className="text-center border-b pb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {institution?.logoUrl ? (
                      <img 
                        src={institution.logoUrl} 
                        alt={t('reportEditor.institutionalLogo')} 
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Building className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="text-left">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {institution?.name || t('reportEditor.institution')}
                      </h1>
                      <p className="text-gray-600">{institution?.type || t('reportEditor.governmentalEntity')}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    {getReportTitle(reportType)}
                  </h2>
                  
                  <div className="flex justify-center gap-8 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{t('reportEditor.reportNumberLabel')}:</span> {reportNumber}
                    </div>
                    <div>
                      <span className="font-medium">{t('reportEditor.reportDateLabel')}:</span> {new Date(reportDate).toLocaleDateString(t('common.language') === 'en' ? 'en-US' : 'es-ES')}
                    </div>
                  </div>
                </div>

                {/* Editable Content */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-medium">
  {t('reportEditor.reportContent')}
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
{isEditing ? t('reportEditor.previewButton') : t('reportEditor.editButton')}
                    </Button>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      id="reportContent"
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="min-h-[600px] font-mono text-sm leading-relaxed"
                      placeholder={t('reportEditor.contentPlaceholder')}
                    />
                  ) : (
                    <div 
                      className="min-h-[600px] p-4 border rounded-lg bg-gray-50 whitespace-pre-wrap text-sm leading-relaxed"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {editableContent || t('reportEditor.noContentAvailable')}
                    </div>
                  )}
                </div>

                {/* Report Footer */}
                <div className="border-t pt-6 text-center text-sm text-gray-600">
                  <p>
                    {t('reportEditor.generatedBy')} - {new Date().toLocaleDateString(t('common.language') === 'en' ? 'en-US' : 'es-ES')}
                  </p>
                  <p className="text-xs mt-1">
                    {t('reportEditor.confidentialNotice')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}