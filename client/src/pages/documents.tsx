import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import FloatingChatbot from "@/components/common/FloatingChatbot";
import AIToolsModal from "@/components/common/AIToolsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InstitutionDocument } from "@shared/schema";
import { AlertTriangle, FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Document types will be generated from translation keys
const getDocumentTypes = (t: any) => ({
  creation_law: { name: t('documents.types.creationLaw'), icon: "fa-gavel", color: "bg-primary/20 text-primary" },
  regulations: { name: t('documents.types.regulations'), icon: "fa-book", color: "bg-gray-100 text-gray-800" },
  sector_regulations: { name: t('documents.types.sectorRegulations'), icon: "fa-industry", color: "bg-gray-100 text-gray-800" },
  organigram: { name: t('documents.types.organigram'), icon: "fa-sitemap", color: "bg-primary/20 text-primary" },
  control_reports: { name: t('documents.types.controlReports'), icon: "fa-chart-line", color: "bg-primary/20 text-primary" },
  instructions: { name: t('documents.types.instructions'), icon: "fa-file-text", color: "bg-purple-100 text-purple-800" },
  policies: { name: t('documents.types.policies'), icon: "fa-clipboard-list", color: "bg-gray-100 text-gray-800" },
  procedures: { name: t('documents.types.procedures'), icon: "fa-list-ol", color: "bg-green-100 text-green-800" },
  other_documents: { name: t('documents.types.otherDocuments'), icon: "fa-file", color: "bg-gray-100 text-gray-800" },
});

// COSO Requirements Data
const nobaciRequirements = {
  ambiente_control: [
    "Código de Ética institucional",
    "Manual de funciones y responsabilidades",
    "Estructura organizacional definida",
    "Políticas de recursos humanos",
    "Comité de Ética establecido",
    "Procedimientos disciplinarios",
    "Manual de competencias laborales"
  ],
  evaluacion_riesgos: [
    "Metodología de identificación de riesgos",
    "Matriz de riesgos institucional",
    "Procedimientos de evaluación de riesgos",
    "Plan de tratamiento de riesgos",
    "Indicadores de riesgo",
    "Procedimientos de monitoreo de riesgos"
  ],
  actividades_control: [
    "Manual de procedimientos operativos",
    "Controles de autorización",
    "Políticas de segregación de funciones",
    "Controles de acceso físico y lógico",
    "Procedimientos de documentación",
    "Controles de supervisión"
  ],
  informacion_comunicacion: [
    "Política de gestión de información",
    "Procedimientos de comunicación interna",
    "Sistema de reportes institucionales",
    "Canales de comunicación ciudadana",
    "Política de transparencia",
    "Procedimientos de archivo y custodia"
  ],
  supervision: [
    "Plan de auditoría interna",
    "Procedimientos de seguimiento",
    "Sistema de indicadores de gestión",
    "Procedimientos de evaluación continua",
    "Plan de mejoramiento institucional",
    "Sistema de quejas y sugerencias"
  ]
};

export default function Documents() {
  const { t } = useTranslation();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isPolicyGeneratorOpen, setIsPolicyGeneratorOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [policyOptions, setPolicyOptions] = useState({
    generatePolicy: false,
    generateProcedure: false
  });
  const [selectedDocumentForAnalysis, setSelectedDocumentForAnalysis] = useState<any>(null);
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    fileName: "",
    documentType: "",
    description: "",
    file: null as File | null,
  });
  const [logoForm, setLogoForm] = useState({
    fileName: "",
  });
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const documentTypes = getDocumentTypes(t);

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

  const { data: documents = [] } = useQuery<InstitutionDocument[]>({
    queryKey: ["/api/documents", { institutionId: 1 }],
    enabled: !!user,
  });

  // Check for scroll intent when component mounts
  useEffect(() => {
    // Check if we should scroll to analysis section
    const shouldScrollToAnalysis = sessionStorage.getItem('scrollToAnalysis');
    if (shouldScrollToAnalysis === 'true') {
      sessionStorage.removeItem('scrollToAnalysis');
      setTimeout(() => {
        const element = document.getElementById('analysis');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (documentData: any) => {
      console.log('Sending API request with data:', documentData);
      const result = await apiRequest("POST", "/api/documents/upload", documentData);
      console.log('API response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      toast({
        title: "Document Uploaded",
        description: "Document uploaded and analysis started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsUploadModalOpen(false);
      setUploadForm({ fileName: "", documentType: "", description: "", file: null });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t('documents.documentDeleted'),
        description: t('documents.documentDeletedSuccess'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: () => {
      toast({
        title: t('documents.error'),
        description: t('documents.errorDelete'),
        variant: "destructive",
      });
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/institutions/${(institution as any)?.id}/logo`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/institutions/1"] });
      setIsLogoModalOpen(false);
      setLogoForm({ fileName: "" });
      toast({
        title: t('documents.logoUpdated'),
        description: t('documents.logoUpdatedSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('documents.error'),
        description: t('documents.errorLogo'),
        variant: "destructive",
      });
    },
  });

  const analyzeDocumentsMutation = useMutation({
    mutationFn: async (documentId?: number) => {
      // Enhanced document analysis with COSO/INTOSAI framework mapping
      const selectedFramework = localStorage.getItem('selectedFramework') || 'coso';
      
      if (!documentId) {
        throw new Error('Document ID is required for analysis');
      }
      
      // Call the backend API for document analysis
      const response = await fetch(`/api/documents/${documentId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ framework: selectedFramework }),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }
      
      const analysisResult = await response.json();
      return analysisResult;
    },
    onSuccess: (analysisResult) => {
      setAnalysisResults(analysisResult);
      setIsDetailedAnalysisOpen(true);
      toast({
        title: t('documents.analysisCompleted'),
        description: t('documents.analysisCompletedSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('documents.error'),
        description: t('documents.errorAnalysis'),
        variant: "destructive",
      });
    },
  });

  const generatePolicyMutation = useMutation({
    mutationFn: async ({ requirement, options }: { requirement: string, options: { generatePolicy: boolean, generateProcedure: boolean } }) => {
      // Simulate policy/procedure generation
      const mockGeneration = {
        requirement,
        policy: options.generatePolicy ? `POLICY: ${requirement}\n\n1. OBJECTIVE\nEstablish guidelines and frameworks for implementing ${requirement.toLowerCase()} within the institution.\n\n2. SCOPE\nThis policy applies to all public servants within the institution.\n\n3. RESPONSIBILITIES\n- Executive Management: Approve and communicate the policy\n- Human Resources: Implement and monitor compliance\n- Public servants: Comply with all provisions\n\n4. GENERAL PROVISIONS\n4.1 The institution commits to maintaining high standards of ${requirement.toLowerCase()}\n4.2 Periodic reviews of this policy will be conducted\n4.3 Non-compliance will be sanctioned according to current regulations` : null,
        procedure: options.generateProcedure ? `PROCEDURE: ${requirement}\n\nSTEP 1: PREPARATION\n- Review existing documentation\n- Identify necessary resources\n- Define responsible parties\n\nSTEP 2: IMPLEMENTATION\n- Execute planned activities\n- Document all processes\n- Communicate to stakeholders\n\nSTEP 3: MONITORING\n- Monitor compliance\n- Conduct periodic evaluations\n- Implement continuous improvements\n\nSTEP 4: REVIEW\n- Evaluate effectiveness\n- Update as necessary\n- Report results to management` : null
      };
      
      return new Promise(resolve => {
        setTimeout(() => resolve(mockGeneration), 1500);
      });
    },
    onSuccess: (data: any) => {
      // Create downloadable content
      let content = "";
      if (data.policy) content += data.policy + "\n\n";
      if (data.procedure) content += data.procedure;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.requirement.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsPolicyGeneratorOpen(false);
      setPolicyOptions({ generatePolicy: false, generateProcedure: false });
      setSelectedRequirement(null);
      
      toast({
        title: t('documents.documentGenerated'),
        description: t('documents.documentGeneratedSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('documents.error'),
        description: t('documents.errorGenerate'),
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleUpload = () => {
    console.log('Upload button clicked!', uploadForm);
    
    if (!uploadForm.file || !uploadForm.documentType) {
      toast({
        title: "Error",
        description: "Please select a file and document type",
        variant: "destructive",
      });
      return;
    }

    // Create the upload data
    const uploadData = {
      institutionId: 1,
      fileName: uploadForm.file.name,
      originalName: uploadForm.file.name,
      documentType: uploadForm.documentType,
      description: uploadForm.description || "",
      fileSize: uploadForm.file.size,
      mimeType: uploadForm.file.type,
    };
    
    console.log('Sending upload data:', uploadData);
    uploadMutation.mutate(uploadData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return t('documents.noDate') || "No date";
    // Use current language for date formatting
    const locale = t('lang') === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user || !institution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dr-blue mx-auto"></div>
          <p className="mt-4 text-dr-neutral">{t('documents.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nebusis-bg">
      <Header 
        user={user as any} 
        institution={institution as any} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="p-4 sm:p-6 max-w-full">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-nebusis-slate">Organizational Documents</h1>
                  <p className="text-nebusis-muted mt-1">Contextual document management for COSO personalization</p>
                </div>
                <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                  <DialogTrigger asChild>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => {
                              console.log('Upload button clicked - opening modal');
                              setIsUploadModalOpen(true);
                            }}
                            className="bg-nebusis-blue text-white hover:bg-nebusis-blue/90 text-sm w-full sm:w-auto shadow-lg border-2 border-nebusis-blue font-semibold px-6 py-2"
                          >
                            <i className="fas fa-cloud-upload-alt mr-2"></i>
                            Upload Document
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload documents for intelligent context analysis</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2 text-lg">
                        <i className="fas fa-brain text-nebusis-blue"></i>
                        <span>Upload Organizational Document</span>
                      </DialogTitle>
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border-l-4 border-nebusis-blue">
                        <p className="text-sm text-nebusis-blue">
                          <i className="fas fa-info-circle mr-2"></i>
                          The system will automatically analyze this document to personalize your workflows and improve regulatory compliance accuracy.
                        </p>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{t('documents.selectFile')} *</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-nebusis-blue file:text-white hover:file:bg-nebusis-blue/90"
                          />
                        </div>
                        {uploadForm.file && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t('documents.selectedFile')}: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{t('documents.type')} *</label>
                        <Select value={uploadForm.documentType} onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('documents.selectType')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(documentTypes).map(([key, type]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center space-x-2">
                                  <i className={`fas ${type.icon}`}></i>
                                  <span>{type.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-nebusis-slate">{t('documents.description')}</label>
                        <Textarea
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={t('documents.optionalDescription')}
                          rows={3}
                        />
                      </div>
                      <Button 
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending}
                        className="w-full bg-nebusis-blue text-white hover:bg-nebusis-blue/90 shadow-lg font-semibold py-3"
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Uploading and analyzing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt mr-2"></i>
                            Upload and Analyze Document
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Context Analysis Explanation Banner */}
            <div className="mb-6 bg-white rounded-lg p-6 shadow-lg border-l-4 border-nebusis-blue">
              <div className="flex items-start space-x-4">
                <div className="bg-nebusis-blue rounded-full p-3 flex-shrink-0">
                  <i className="fas fa-brain text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Intelligent Context Analysis</h3>
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    Upload key organizational documents so the system automatically analyzes your organizational context. 
                    AI personalizes workflows, identifies compliance gaps, and suggests specific improvements based on:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span>Creation laws and regulations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span>Organizational structure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span>Policies and procedures</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span>Audit reports</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-nebusis-blue text-xs italic">
                        <i className="fas fa-lightbulb text-nebusis-blue mr-2"></i>
                        Tip: The more documents you upload, the more accurate the system's analysis and recommendations will be.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsAnalysisModalOpen(true)}
                      className="bg-nebusis-blue text-white hover:bg-nebusis-blue/90 text-sm"
                      size="sm"
                    >
                      <i className="fas fa-chart-line mr-2"></i>
                      View Current Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(documentTypes).map(([key, type]) => {
                const categoryDocs = documents?.filter((doc: InstitutionDocument) => doc.documentType === key) || [];
                
                return (
                  <Card key={key} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <i className={`fas ${type.icon} text-dr-blue`}></i>
                          <CardTitle className="text-lg">{type.name}</CardTitle>
                        </div>
                        <Badge variant="secondary">{categoryDocs.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {categoryDocs.length === 0 ? (
                        <p className="text-sm text-dr-neutral">{t('documents.noDocumentsUploadedYet')}</p>
                      ) : (
                        <div className="space-y-2">
                          {categoryDocs.slice(0, 2).map((doc: InstitutionDocument) => (
                            <div key={doc.id} className="text-sm">
                              <p className="font-medium text-gray-900 truncate">{doc.originalName}</p>
                              <p className="text-xs text-dr-neutral">{formatDate(doc.createdAt || "")}</p>
                            </div>
                          ))}
                          {categoryDocs.length > 2 && (
                            <p className="text-xs text-dr-blue">+{categoryDocs.length - 2} {t('documents.more')}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* All Documents List */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t('documents.allDocuments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {!documents || documents.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-file-upload text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('documents.noDocumentsUploaded')}</h3>
                    <p className="text-gray-500 mb-6">
                      {t('documents.uploadKeyDocuments')}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-nebusis-blue text-white hover:bg-nebusis-blue/90 shadow-lg font-semibold px-6 py-2"
                          >
                            <i className="fas fa-cloud-upload-alt mr-2"></i>
                            Upload Document for Analysis
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload documents for intelligent analysis and automatic personalization</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc: InstitutionDocument) => {
                      const docType = documentTypes[doc.documentType as keyof typeof documentTypes];
                      
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-dr-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                              <i className={`fas ${docType?.icon || "fa-file"} text-dr-blue`}></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.originalName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-dr-neutral">
                                <Badge className={docType?.color}>{docType?.name}</Badge>
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>{formatDate(doc.createdAt || "")}</span>
                              </div>
                              {doc.description && (
                                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {doc.analyzedAt ? (
                              <Badge className="bg-green-100 text-green-800">
                                <i className="fas fa-check mr-1"></i>
{t('documents.analyzed')}
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <i className="fas fa-clock mr-1"></i>
{t('documents.pending')}
                              </Badge>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDocumentForAnalysis(doc);
                                      analyzeDocumentsMutation.mutate(doc.id);
                                    }}
                                    disabled={analyzeDocumentsMutation.isPending}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <i className="fas fa-brain"></i>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Analyze Document with COSO/INTOSAI Framework</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMutation.mutate(doc.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <i className="fas fa-trash text-red-500"></i>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('documents.deleteDocument')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Framework Analysis Section */}
            <Card id="analysis" className="mb-8 border-2 border-dr-blue bg-gradient-to-r from-dr-blue/5 to-dr-light-blue/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-dr-blue" />
                    <div>
                      <CardTitle className="text-xl text-dr-blue">Framework Document Analysis</CardTitle>
                      <p className="text-sm text-dr-neutral mt-1">
                        Comprehensive COSO/INTOSAI framework-based document analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Select 
                      value={localStorage.getItem('selectedFramework') || 'coso'} 
                      onValueChange={(value) => localStorage.setItem('selectedFramework', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coso">COSO</SelectItem>
                        <SelectItem value="intosai">INTOSAI</SelectItem>
                      </SelectContent>
                    </Select>
                    <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => analyzeDocumentsMutation.mutate(undefined)}
                          disabled={analyzeDocumentsMutation.isPending || !documents || documents.length === 0}
                          className="bg-dr-blue hover:bg-dr-blue/90 text-white"
                        >
                          {analyzeDocumentsMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>{t('documents.analyzing')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>{t('documents.startAnalysis')}</span>
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('documents.cosoAnalysisDescription')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/50 rounded-lg p-4">
                  <h4 className="font-semibold text-dr-blue mb-2">{t('documents.analysisTitle')}</h4>
                  <ul className="text-sm text-dr-neutral space-y-1">
                    <li>• {t('documents.analysisPoint1')}</li>
                    <li>• {t('documents.analysisPoint2')}</li>
                    <li>• {t('documents.analysisPoint3')}</li>
                    <li>• {t('documents.analysisPoint4')}</li>
                  </ul>
                  {!documents || documents.length === 0 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t('documents.uploadAtLeastOne')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <FloatingChatbot onClick={() => setIsAIModalOpen(true)} />
      <AIToolsModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      {/* COSO Analysis Results Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-dr-blue" />
              <span>{t('documents.analysisResults')}</span>
            </DialogTitle>
          </DialogHeader>
          
          {analysisResults && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-dr-blue/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dr-blue">{t('documents.analysisSummary')}</h3>
                  <Badge variant="outline" className="text-dr-blue border-dr-blue">
                    {analysisResults.coveragePercentage}% {t('documents.coverage')}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-dr-blue">{analysisResults.totalRequirements}</div>
                    <div className="text-sm text-dr-neutral">{t('documents.totalRequirements')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysisResults.coveredRequirements}</div>
                    <div className="text-sm text-dr-neutral">{t('documents.covered')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analysisResults.totalRequirements - analysisResults.coveredRequirements}</div>
                    <div className="text-sm text-dr-neutral">{t('documents.missing')}</div>
                  </div>
                </div>
                <Progress value={analysisResults.coveragePercentage} className="h-3" />
              </div>

              {/* Missing Requirements by Component */}
              <div>
                <h3 className="text-lg font-semibold text-dr-blue mb-4">{t('documents.missingRequirementsByComponent')}</h3>
                <Tabs defaultValue={analysisResults.missingRequirements[0]?.component} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    {analysisResults.missingRequirements.map((component: any) => (
                      <TabsTrigger key={component.component} value={component.component} className="text-xs">
                        {component.componentName.split(' ')[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {analysisResults.missingRequirements.map((component: any) => (
                    <TabsContent key={component.component} value={component.component} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{component.componentName}</h4>
                        <Badge variant="destructive">{component.missing.length} {t('documents.missingCount')}</Badge>
                      </div>
                      
                      <div className="grid gap-3">
                        {component.missing.map((requirement: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-3">
                              <XCircle className="w-5 h-5 text-red-500" />
                              <span className="text-sm font-medium text-gray-900">{requirement}</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequirement({ component: component.component, requirement });
                                setIsPolicyGeneratorOpen(true);
                              }}
                              className="bg-dr-blue hover:bg-dr-blue/90 text-white"
                            >
                              {t('documents.generateDocument')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Generator Modal */}
      <Dialog open={isPolicyGeneratorOpen} onOpenChange={setIsPolicyGeneratorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-dr-blue" />
              <span>Generar Documento COSO</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequirement && (
            <div className="space-y-6">
              <div className="bg-dr-blue/5 rounded-lg p-4">
                <h4 className="font-semibold text-dr-blue mb-2">Requisito Seleccionado</h4>
                <p className="text-sm text-gray-900">{selectedRequirement.requirement}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">¿Qué deseas generar?</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="policy"
                      checked={policyOptions.generatePolicy}
                      onCheckedChange={(checked) => 
                        setPolicyOptions(prev => ({ ...prev, generatePolicy: checked as boolean }))
                      }
                    />
                    <label htmlFor="policy" className="text-sm font-medium">
                      Política institucional
                    </label>
                  </div>
                  <div className="text-xs text-dr-neutral ml-6">
                    Documento que establece las directrices y lineamientos generales
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="procedure"
                      checked={policyOptions.generateProcedure}
                      onCheckedChange={(checked) => 
                        setPolicyOptions(prev => ({ ...prev, generateProcedure: checked as boolean }))
                      }
                    />
                    <label htmlFor="procedure" className="text-sm font-medium">
                      Procedimiento operativo
                    </label>
                  </div>
                  <div className="text-xs text-dr-neutral ml-6">
                    Documento con pasos específicos para implementar la política
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPolicyGeneratorOpen(false);
                    setPolicyOptions({ generatePolicy: false, generateProcedure: false });
                    setSelectedRequirement(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (policyOptions.generatePolicy || policyOptions.generateProcedure) {
                      generatePolicyMutation.mutate({
                        requirement: selectedRequirement.requirement,
                        options: policyOptions
                      });
                    }
                  }}
                  disabled={(!policyOptions.generatePolicy && !policyOptions.generateProcedure) || generatePolicyMutation.isPending}
                  className="flex-1 bg-dr-blue hover:bg-dr-blue/90 text-white"
                >
                  {generatePolicyMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Generar</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comprehensive Document Analysis Modal */}
      <Dialog open={isDetailedAnalysisOpen} onOpenChange={setIsDetailedAnalysisOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="bg-nebusis-blue rounded-full p-2">
                <i className="fas fa-brain text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Document Analysis Report</h2>
                <p className="text-sm text-gray-600 font-normal">
                  Comprehensive COSO/INTOSAI Framework Analysis
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {analysisResults && (
            <div className="space-y-6">
              {/* Summary Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-nebusis-blue mb-1">
                      {analysisResults.coverageScore}%
                    </div>
                    <div className="text-sm text-gray-600">Coverage Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {analysisResults.controlFrameworkMapping?.detectedElements?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Detected Elements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {analysisResults.improvementRecommendations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Recommendations</div>
                  </div>
                </div>
                <Progress value={analysisResults.coverageScore} className="mt-4" />
              </div>

              <Tabs defaultValue="framework-mapping" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="framework-mapping">Framework Mapping</TabsTrigger>
                  <TabsTrigger value="relevance-tags">Relevance Tags</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="gaps">Gaps Analysis</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                  <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
                </TabsList>

                {/* 1. Control Framework Mapping */}
                <TabsContent value="framework-mapping" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-sitemap text-nebusis-blue mr-2"></i>
                    Control Framework Mapping
                  </h3>
                  {analysisResults.controlFrameworkMapping?.detectedElements?.map((element: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-nebusis-blue">
                      <CardHeader>
                        <CardTitle className="text-lg text-nebusis-blue">
                          {element.componentName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {element.principles?.map((principle: any, pIndex: number) => (
                          <div key={pIndex} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{principle.name}</h4>
                              <Badge 
                                className={`${
                                  principle.coverageLevel === 'strong' ? 'bg-green-100 text-green-800' :
                                  principle.coverageLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  principle.coverageLevel === 'weak' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {principle.coverageLevel}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {principle.mappedSections?.map((section: any, sIndex: number) => (
                                <div key={sIndex} className="bg-gray-50 p-3 rounded border-l-2 border-l-gray-300">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">Page {section.page} - {section.section}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 italic">{section.excerpt}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* 2. Control Relevance Tagging */}
                <TabsContent value="relevance-tags" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-tags text-nebusis-blue mr-2"></i>
                    Control Relevance Tags
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analysisResults.controlRelevanceTags?.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="p-3 text-center bg-blue-50 border-blue-200">
                        <i className="fas fa-tag text-nebusis-blue mr-2"></i>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <i className="fas fa-info-circle text-nebusis-blue mr-2"></i>
                      These tags categorize the document's primary function within your control framework. 
                      You can edit or confirm these classifications to ensure accurate workflow integration.
                    </p>
                  </div>
                </TabsContent>

                {/* 3. Improvement Recommendations */}
                <TabsContent value="recommendations" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-lightbulb text-nebusis-blue mr-2"></i>
                    Improvement Recommendations
                  </h3>
                  {analysisResults.improvementRecommendations?.map((rec: any, index: number) => (
                    <Card key={index} className={`border-l-4 ${
                      rec.priority === 'high' ? 'border-l-red-500' :
                      rec.priority === 'medium' ? 'border-l-yellow-500' :
                      'border-l-green-500'
                    }`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{rec.category}</CardTitle>
                          <Badge className={`${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-3">{rec.recommendation}</p>
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Suggested Actions:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {rec.suggestedActions?.map((action: string, aIndex: number) => (
                              <li key={aIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* 4. Gaps Analysis */}
                <TabsContent value="gaps" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-exclamation-triangle text-nebusis-blue mr-2"></i>
                    Detected Gaps
                  </h3>
                  {analysisResults.detectedGaps?.map((gap: any, index: number) => (
                    <Alert key={index} className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-orange-900">{gap.elementName}</h4>
                            <Badge className="bg-orange-100 text-orange-800">{gap.impact} impact</Badge>
                          </div>
                          <p className="text-orange-800">{gap.description}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </TabsContent>

                {/* 5. Integration Actions */}
                <TabsContent value="integration" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-link text-nebusis-blue mr-2"></i>
                    Integration Actions
                  </h3>
                  <div className="grid gap-4">
                    {analysisResults.integrationActions?.map((action: any, index: number) => (
                      <Card key={index} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {action.action === 'link_to_workflow' ? 'Link to Workflow' :
                                 action.action === 'attach_to_element' ? 'Attach to Control Element' :
                                 'Add to Planning'}
                              </h4>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                            <Button size="sm" className="bg-nebusis-blue hover:bg-nebusis-blue/90">
                              <i className="fas fa-plus mr-2"></i>
                              Execute
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* 6. Audit Trail Metadata */}
                <TabsContent value="audit-trail" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-history text-nebusis-blue mr-2"></i>
                    Audit Trail Metadata
                  </h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Analysis Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Upload Date:</span>
                              <span className="font-medium">
                                {new Date(analysisResults.auditTrail?.uploadDate).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Uploaded By:</span>
                              <span className="font-medium">{analysisResults.auditTrail?.uploadedBy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Framework:</span>
                              <span className="font-medium uppercase">{analysisResults.auditTrail?.frameworkSelected}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Processing Info</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Analysis Engine:</span>
                              <span className="font-medium">{analysisResults.auditTrail?.analysisEngine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Processing Time:</span>
                              <span className="font-medium">{analysisResults.auditTrail?.processingTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Version Number:</span>
                              <span className="font-medium">1</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailedAnalysisOpen(false)}
                >
                  Close
                </Button>
                <Button className="bg-nebusis-blue hover:bg-nebusis-blue/90">
                  <i className="fas fa-download mr-2"></i>
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}