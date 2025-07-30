import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye, Calendar, User as UserIcon, BarChart3, Activity, Target, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

import { useState } from "react";
import { useTranslation } from "@/i18n";
import type { User, Institution } from "../../../shared/schema";

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

interface WorkflowAssessmentReport {
  id: number;
  workflowId: number;
  assessorId: number;
  assessmentDate: string;
  executionStatus: "in_progress" | "completed" | "delayed" | "cancelled";
  overallFidelityScore?: number;
  designComplianceScore?: number;
  timelineComplianceScore?: number;
  qualityScore?: number;
  overallFindings?: string;
  recommendations?: string;
  status: "draft" | "final" | "under_review";
  createdAt: string;
  workflow?: {
    name: string;
    componentType: string;
    status: string;
  };
}

export default function AuditReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("framework");
  const { t } = useTranslation();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const { data: institution } = useQuery<Institution>({
    queryKey: ['/api/institutions/1'],
  });

  const { data: frameworkReports, isLoading: isLoadingFramework, error: frameworkError } = useQuery<AssessmentReport[]>({
    queryKey: ['/api/assessment-reports', 1],
    queryFn: async () => {
      console.log('Fetching framework reports...');
      const response = await fetch(`/api/assessment-reports?institutionId=1`);
      if (!response.ok) throw new Error('Failed to fetch framework reports');
      const data = await response.json();
      console.log('Framework reports loaded:', data.length);
      return data;
    },
  });

  const { data: workflowReports, isLoading: isLoadingWorkflow, error: workflowError } = useQuery<WorkflowAssessmentReport[]>({
    queryKey: ['/api/workflow-execution-assessments', 1],
    queryFn: async () => {
      console.log('Fetching workflow reports...');
      const response = await fetch(`/api/workflow-execution-assessments?institutionId=1`);
      if (!response.ok) throw new Error('Failed to fetch workflow assessment reports');
      const data = await response.json();
      console.log('Workflow reports loaded:', data.length);
      return data;
    },
  });



  const isLoading = isLoadingFramework || isLoadingWorkflow;
  
  // Debug logging
  console.log('Assessment Reports Debug:', {
    isLoadingFramework,
    isLoadingWorkflow,
    frameworkReportsCount: frameworkReports?.length || 0,
    workflowReportsCount: workflowReports?.length || 0,
    frameworkError: frameworkError?.message,
    workflowError: workflowError?.message
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
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
          <p className="mt-4 text-gray-600">Loading {t('auditReports.title').toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user as User} 
        institution={institution as Institution} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
        stats={{
          activeWorkflows: 0,
          completedWorkflows: 0,
          underReview: 0,
          overallProgress: 0
        }}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('auditReports.title')}</h1>
                  <p className="text-gray-600 mt-2">
                    View and manage all internal control assessment reports generated by your organization.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Reports
                  </Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{(frameworkReports?.length || 0) + (workflowReports?.length || 0)}</p>
                        <p className="text-gray-600 text-sm">Total Reports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{frameworkReports?.length || 0}</p>
                        <p className="text-gray-600 text-sm">Framework Reports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{workflowReports?.length || 0}</p>
                        <p className="text-gray-600 text-sm">Workflow Reports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">
                          {frameworkReports?.filter(r => r.overallScore >= 80).length || 0}
                        </p>
                        <p className="text-gray-600 text-sm">High Scores</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabbed Reports Interface */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="framework" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Framework Assessment Reports
                  </TabsTrigger>
                  <TabsTrigger value="workflow" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    WorkFlow Assessment Reports
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="framework" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Framework Assessment Reports</CardTitle>
                      <CardDescription>
                        COSO and INTOSAI framework compliance assessment reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {frameworkReports && frameworkReports.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Report Title</TableHead>
                          <TableHead>Framework</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Conducted By</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {frameworkReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{report.reportTitle}</p>
                                <p className="text-sm text-gray-500">
                                  ID: {report.id}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getFrameworkBadge(report.framework)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{format(new Date(report.assessmentDate), 'MMM dd, yyyy')}</p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(report.assessmentDate), 'h:mm a')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {report.conductedBy 
                                    ? `${report.conductedBy.firstName} ${report.conductedBy.lastName}`
                                    : 'Unknown'
                                  }
                                </p>
                                <p className="text-sm text-gray-500">
                                  {report.conductedBy?.email || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getScoreColor(report.overallScore)}>
                                {report.overallScore}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span>{report.compliantItems} Compliant</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span>{report.partiallyCompliantItems} Partial</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span>{report.nonCompliantItems} Non-compliant</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Show detailed report view
                                    window.open(`/framework-assessment-details/${report.id}`, '_blank');
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Generate and download PDF
                                    window.open(`/api/assessment-reports/${report.id}/pdf`, '_blank');
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Reports</h3>
                      <p className="text-gray-500 mb-4">
                        No assessment reports have been generated yet. Complete a self-assessment to create your first audit report.
                      </p>
                      <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Start Assessment
                      </Button>
                    </div>
                  )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>WorkFlow Assessment Reports</CardTitle>
                      <CardDescription>
                        Workflow execution fidelity assessment reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {workflowReports && workflowReports.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Workflow</TableHead>
                              <TableHead>Assessment Date</TableHead>
                              <TableHead>Execution Status</TableHead>
                              <TableHead>Fidelity Score</TableHead>
                              <TableHead>Quality Score</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workflowReports.map((report) => (
                              <TableRow key={report.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{report.workflow?.name || `Workflow ${report.workflowId}`}</p>
                                    <p className="text-sm text-gray-500">
                                      {report.workflow?.componentType?.replace('_', ' ') || 'N/A'}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                    {format(new Date(report.assessmentDate), 'dd/MM/yyyy')}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={
                                    report.executionStatus === 'completed' ? 'default' :
                                    report.executionStatus === 'in_progress' ? 'secondary' :
                                    report.executionStatus === 'delayed' ? 'destructive' : 'outline'
                                  }>
                                    {report.executionStatus.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Badge className={
                                      (report.overallFidelityScore || 0) >= 80 ? "bg-green-100 text-green-800" :
                                      (report.overallFidelityScore || 0) >= 60 ? "bg-yellow-100 text-yellow-800" :
                                      "bg-red-100 text-red-800"
                                    }>
                                      {report.overallFidelityScore || 0}%
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Badge className={
                                      (report.qualityScore || 0) >= 80 ? "bg-green-100 text-green-800" :
                                      (report.qualityScore || 0) >= 60 ? "bg-yellow-100 text-yellow-800" :
                                      "bg-red-100 text-red-800"
                                    }>
                                      {report.qualityScore || 0}%
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={report.status === 'final' ? 'default' : 'secondary'}>
                                    {report.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        // Show detailed workflow assessment view
                                        window.open(`/workflow-assessment-details/${report.id}`, '_blank');
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Details
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        // Generate and download PDF
                                        window.open(`/api/workflow-execution-assessments/${report.id}/pdf`, '_blank');
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      PDF
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No WorkFlow Assessment Reports</h3>
                          <p className="text-gray-500 mb-4">
                            No workflow execution assessment reports have been generated yet. Create workflow assessments to see reports here.
                          </p>
                          <Button>
                            <Activity className="h-4 w-4 mr-2" />
                            Create Assessment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}