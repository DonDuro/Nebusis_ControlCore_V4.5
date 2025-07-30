import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, Calendar, BarChart3, CheckCircle, AlertCircle, XCircle, Download } from "lucide-react";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { useTranslation } from "@/i18n";
import type { User as UserType, Institution } from "../../../shared/schema";

interface AssessmentReport {
  id: number;
  institutionId: number;
  conductedById: number;
  reportTitle: string;
  assessmentDate: string;
  framework: string;
  totalItems: number;
  compliantItems: number;
  partiallyCompliantItems: number;
  nonCompliantItems: number;
  overallScore: number;
  findings: string;
  recommendations: string;
  createdAt: string;
  conductedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AssessmentResponse {
  id: number;
  assessmentReportId: number;
  checklistItemId: number;
  response: "complies" | "partially_complies" | "does_not_comply";
  observations?: string;
  checklistItem: {
    code: string;
    requirement: string;
    verificationQuestion: string;
    componentType: string;
  };
}

export default function FrameworkAssessmentDetails() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/auth/user'],
  });

  const { data: institution } = useQuery<Institution>({
    queryKey: ['/api/institutions/1'],
  });

  const { data: report, isLoading: isLoadingReport } = useQuery<AssessmentReport>({
    queryKey: ['/api/assessment-report', id],
    queryFn: async () => {
      const response = await fetch(`/api/assessment-report/${id}`);
      if (!response.ok) throw new Error('Failed to fetch report details');
      return response.json();
    },
    enabled: !!id,
  });

  const { data: responses = [], isLoading: isLoadingResponses } = useQuery<AssessmentResponse[]>({
    queryKey: ['/api/assessment-responses', id],
    queryFn: async () => {
      const response = await fetch(`/api/assessment-responses?reportId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch assessment responses');
      return response.json();
    },
    enabled: !!id,
  });

  const isLoading = isLoadingReport || isLoadingResponses;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case "complies":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "partially_complies":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "does_not_comply":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getResponseBadge = (response: string) => {
    switch (response) {
      case "complies":
        return <Badge className="bg-green-100 text-green-800">Complies</Badge>;
      case "partially_complies":
        return <Badge className="bg-yellow-100 text-yellow-800">Partially Complies</Badge>;
      case "does_not_comply":
        return <Badge className="bg-red-100 text-red-800">Does Not Comply</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getFrameworkBadge = (framework: string) => {
    return framework === "coso" ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800">COSO</Badge>
    ) : (
      <Badge variant="secondary" className="bg-purple-100 text-purple-800">INTOSAI</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
          <p className="text-gray-500 mb-4">The requested assessment report could not be found.</p>
          <Button onClick={() => setLocation('/audit-reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Generate comprehensive content based on report data
  const executiveSummary = `This comprehensive ${report.framework.toUpperCase()} framework assessment evaluated ${report.totalItems} control elements across ${institution?.name || 'the organization'}. The assessment achieved an overall compliance score of ${report.overallScore}%, with ${report.compliantItems} elements fully compliant, ${report.partiallyCompliantItems} partially compliant, and ${report.nonCompliantItems} non-compliant. This assessment provides critical insights into the organization's internal control effectiveness and identifies key areas for improvement to enhance governance and risk management capabilities.`;

  const findingsDetail = responses.length > 0 ? 
    `Detailed analysis of ${responses.length} assessed control elements reveals significant strengths in areas with full compliance, while identifying specific gaps requiring immediate attention. The assessment methodology utilized structured verification questions aligned with ${report.framework.toUpperCase()} standards, ensuring comprehensive coverage of all framework components. Critical findings indicate that ${Math.round((report.compliantItems / report.totalItems) * 100)}% of controls are operating effectively, with ${Math.round((report.partiallyCompliantItems / report.totalItems) * 100)}% requiring enhancement and ${Math.round((report.nonCompliantItems / report.totalItems) * 100)}% needing complete remediation.` :
    'Comprehensive analysis of control elements reveals varying levels of implementation across framework components, with detailed findings documented for each assessed area.';

  const conclusions = `Based on this ${report.framework.toUpperCase()} framework assessment, ${institution?.name || 'the organization'} demonstrates ${report.overallScore >= 80 ? 'strong' : report.overallScore >= 60 ? 'adequate' : 'developing'} internal control capabilities. The overall compliance score of ${report.overallScore}% indicates ${report.overallScore >= 80 ? 'a mature control environment with minor gaps' : report.overallScore >= 60 ? 'a functional control environment requiring targeted improvements' : 'significant opportunities for control enhancement'}. Priority should be given to addressing non-compliant areas while maintaining strengths in well-performing control areas.`;

  const followUpActions = [
    'Develop detailed remediation plans for all non-compliant control elements',
    'Establish monitoring procedures for partially compliant areas to track improvement progress',
    'Implement regular review cycles to maintain compliance levels in well-performing areas',
    'Assign specific ownership and timelines for each identified improvement initiative',
    'Schedule follow-up assessment within 6-12 months to measure improvement progress'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user as UserType} 
        institution={institution as Institution} 
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        stats={{
          activeWorkflows: 0,
          completedWorkflows: 0,
          underReview: 0,
          overallProgress: 0
        }}
      />
      <SidebarSimple open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 pt-16">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation('/audit-reports')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('nav.back')}
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{report.reportTitle}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-gray-600">Assessment ID: {report.id}</p>
                  {getFrameworkBadge(report.framework)}
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(report.assessmentDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-lg font-semibold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}% Overall Score
                </div>
                <Button
                  onClick={() => window.open(`/api/assessment-reports/${report.id}/pdf`, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{executiveSummary}</p>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{report.totalItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Compliant</p>
                    <p className="text-2xl font-bold text-green-600">{report.compliantItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Partially Compliant</p>
                    <p className="text-2xl font-bold text-yellow-600">{report.partiallyCompliantItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                    <p className="text-2xl font-bold text-red-600">{report.nonCompliantItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Findings Detail */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Findings Detail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{findingsDetail}</p>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Compliance Status of Each Control Element */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status of Each Control Element</CardTitle>
                  <CardDescription>
                    Detailed compliance status for each {report.framework.toUpperCase()} framework element
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {responses.length > 0 ? (
                    <div className="space-y-4">
                      {responses.map((response) => (
                        <div key={response.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline">{response.checklistItem.code}</Badge>
                                {getResponseIcon(response.response)}
                                {getResponseBadge(response.response)}
                              </div>
                              <h4 className="font-medium text-gray-900">
                                {response.checklistItem.requirement}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {response.checklistItem.verificationQuestion}
                              </p>
                            </div>
                          </div>
                          {response.observations && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm font-medium text-gray-700 mb-1">Observations:</p>
                              <p className="text-sm text-gray-600">{response.observations}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No detailed compliance data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Key Findings & Recommendations */}
            <div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {report.findings || "Information quality standards well established. Communication channels effective for operations. External communication protocols need enhancement."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>  
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {report.recommendations || "Upgrade stakeholder communication platforms. Implement real-time management reporting dashboards."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Conclusions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Conclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{conclusions}</p>
            </CardContent>
          </Card>

          {/* Follow-up Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Follow-up Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {followUpActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}