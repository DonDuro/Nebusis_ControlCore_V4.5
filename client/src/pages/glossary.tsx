import { useState, useMemo } from "react";
import { Search, BookOpen, Filter, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { useTranslation } from "@/i18n";
import { glossaryTermsES } from "@/data/glossary-translations";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: "coso" | "intosai" | "internal_control" | "nebusis_app" | "compliance" | "risk_management" | "audit";
  synonyms?: string[];
  relatedTerms?: string[];
  source?: string;
  examples?: string[];
  applicationContext?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // COSO Framework Terms
  {
    id: "control-environment",
    term: "Control Environment",
    definition: "The overall tone, ethics, and control consciousness of an organization.",
    category: "coso",
    relatedTerms: ["COSO", "Internal Control"]
  },
  {
    id: "risk-assessment",
    term: "Risk Assessment",
    definition: "The process of identifying and analyzing risks that may affect achievement of objectives.",
    category: "coso",
    relatedTerms: ["COSO", "Internal Control"]
  },
  {
    id: "control-activities",
    term: "Control Activities",
    definition: "Actions established through policies and procedures to mitigate risk.",
    category: "coso",
    relatedTerms: ["COSO", "Internal Control"]
  },
  {
    id: "information-and-communication",
    term: "Information and Communication",
    definition: "Processes that support the identification, capture, and exchange of information.",
    category: "coso",
    relatedTerms: ["COSO", "Internal Control"]
  },
  {
    id: "monitoring-activities",
    term: "Monitoring Activities",
    definition: "Ongoing evaluations used to assess internal control performance over time.",
    category: "coso",
    relatedTerms: ["COSO", "Internal Control"]
  },
  {
    id: "objectives-setting",
    term: "Objectives Setting",
    definition: "The process of defining objectives to enable achievement of mission and vision.",
    category: "coso",
    relatedTerms: ["COSO"]
  },
  {
    id: "inherent-risk",
    term: "Inherent Risk",
    definition: "Risk present before controls are applied.",
    category: "coso",
    relatedTerms: ["COSO", "Risk Management"]
  },
  {
    id: "residual-risk",
    term: "Residual Risk",
    definition: "Risk remaining after controls are applied.",
    category: "coso",
    relatedTerms: ["COSO", "Risk Management"]
  },
  {
    id: "risk-appetite",
    term: "Risk Appetite",
    definition: "The amount of risk an entity is willing to accept.",
    category: "coso",
    relatedTerms: ["COSO", "Risk Management"]
  },
  {
    id: "fraud-risk",
    term: "Fraud Risk",
    definition: "Risk related to fraudulent activities that may impact objectives.",
    category: "coso",
    relatedTerms: ["COSO", "Audit & Assurance"]
  },
  {
    id: "governance",
    term: "Governance",
    definition: "The system of rules, practices, and processes by which an organization is directed.",
    category: "coso",
    relatedTerms: ["COSO", "Compliance"]
  },
  {
    id: "fraud-risk-management",
    term: "Fraud Risk Management",
    definition: "A set of coordinated activities to identify, assess, and mitigate the risk of fraud.",
    category: "coso"
  },
  {
    id: "coso-cube",
    term: "COSO Cube",
    definition: "A visual representation of the COSO framework that integrates objectives, components, and structure.",
    category: "coso"
  },
  {
    id: "reasonable-assurance",
    term: "Reasonable Assurance",
    definition: "A level of assurance that is acceptable under the circumstances, not absolute certainty.",
    category: "coso"
  },
  {
    id: "objective-setting",
    term: "Objective Setting",
    definition: "The process of defining specific goals aligned with the organization's mission.",
    category: "coso"
  },
  {
    id: "control-environment-coso",
    term: "Control Environment",
    definition: "The tone at the top and foundation for all other components of internal control.",
    category: "coso"
  },
  {
    id: "information-communication",
    term: "Information & Communication",
    definition: "Systems and processes that support the flow of relevant, timely, and reliable information.",
    category: "coso"
  },
  {
    id: "enterprise-risk-management",
    term: "Enterprise Risk Management (ERM)",
    definition: "A process to identify, assess, and manage risks across an organization holistically.",
    category: "coso"
  },
  {
    id: "monitoring-activities-coso",
    term: "Monitoring Activities",
    definition: "Ongoing evaluations or separate evaluations to ascertain whether components of internal control are present and functioning.",
    category: "coso"
  },
  // Internal Control Terms
  {
    id: "entity-level-controls",
    term: "Entity-Level Controls",
    definition: "Controls applied across the entire organization, not just individual processes.",
    category: "internal_control"
  },
  {
    id: "segregation-of-duties",
    term: "Segregation of Duties",
    definition: "Dividing responsibilities among different individuals to reduce risk of error or fraud.",
    category: "internal_control"
  },
  {
    id: "authorization-procedures",
    term: "Authorization Procedures",
    definition: "Mechanisms to ensure that transactions are approved by authorized personnel.",
    category: "internal_control"
  },
  {
    id: "documentation-control",
    term: "Documentation Control",
    definition: "Processes to control the creation, storage, and accessibility of records.",
    category: "internal_control",
    relatedTerms: ["Internal Control", "Compliance"]
  },
  {
    id: "preventive-controls",
    term: "Preventive Controls",
    definition: "Controls designed to prevent errors or irregularities before they occur.",
    category: "internal_control",
    relatedTerms: ["Internal Control", "Audit & Assurance"]
  },
  {
    id: "detective-controls",
    term: "Detective Controls",
    definition: "Controls designed to identify and alert management of errors or irregularities.",
    category: "internal_control",
    relatedTerms: ["Internal Control", "Audit & Assurance"]
  },
  {
    id: "corrective-actions",
    term: "Corrective Actions",
    definition: "Actions taken to correct identified control deficiencies.",
    category: "internal_control",
    relatedTerms: ["Internal Control", "Audit & Assurance"]
  },
  {
    id: "control-deficiency",
    term: "Control Deficiency",
    definition: "A shortcoming in the design or operation of a control that could allow for error or fraud.",
    category: "internal_control",
    relatedTerms: ["Internal Control", "Audit & Assurance"]
  },
  {
    id: "internal-audit",
    term: "Internal Audit",
    definition: "A function that provides independent assurance that internal controls are effective.",
    category: "internal_control",
    relatedTerms: ["Internal Control", "Audit & Assurance"]
  },
  {
    id: "segregation-of-duties-control",
    term: "Segregation of Duties",
    definition: "Dividing responsibilities among different people to reduce the risk of error or inappropriate actions.",
    category: "internal_control"
  },
  {
    id: "preventive-controls-ic",
    term: "Preventive Controls",
    definition: "Controls designed to avoid errors or irregularities from occurring.",
    category: "internal_control"
  },
  {
    id: "detective-controls-ic",
    term: "Detective Controls",
    definition: "Controls that identify and detect errors or irregularities that have occurred.",
    category: "internal_control"
  },
  {
    id: "corrective-action",
    term: "Corrective Action",
    definition: "Steps taken to fix problems identified by detective controls.",
    category: "internal_control"
  },
  {
    id: "key-control",
    term: "Key Control",
    definition: "A control that is crucial to preventing or detecting material misstatements.",
    category: "internal_control"
  },
  {
    id: "internal-control-deficiency",
    term: "Internal Control Deficiency",
    definition: "A shortcoming in internal control that reduces the likelihood of achieving control objectives.",
    category: "internal_control"
  },
  {
    id: "control-objective",
    term: "Control Objective",
    definition: "A specific aim or condition that internal control seeks to achieve.",
    category: "internal_control"
  },
  {
    id: "control-activities-ic",
    term: "Control Activities",
    definition: "Policies and procedures that help ensure directives are carried out and risks mitigated.",
    category: "internal_control"
  },
  {
    id: "monitoring-activities-ic",
    term: "Monitoring Activities",
    definition: "Processes that assess the performance of internal control over time.",
    category: "internal_control"
  },
  {
    id: "control-design",
    term: "Control Design",
    definition: "The planning and structuring of control activities to effectively address risks.",
    category: "internal_control"
  },
  {
    id: "organizational-structure",
    term: "Organizational Structure",
    definition: "How authority and responsibility are distributed within an organization.",
    category: "internal_control"
  },
  {
    id: "key-control-ic",
    term: "Key Control",
    definition: "A control that is critical to preventing or detecting a material misstatement or failure.",
    category: "internal_control"
  },
  {
    id: "preventive-control",
    term: "Preventive Control",
    definition: "A type of internal control designed to prevent errors or irregularities from occurring.",
    category: "internal_control"
  },
  {
    id: "key-performance-indicator",
    term: "Key Performance Indicator (KPI)",
    definition: "A measurable value that demonstrates how effectively an organization is achieving key objectives.",
    category: "internal_control"
  },
  // Compliance Terms
  {
    id: "compliance-obligation",
    term: "Compliance Obligation",
    definition: "Legal or regulatory duties with which an organization must comply.",
    category: "compliance"
  },
  {
    id: "regulatory-requirement",
    term: "Regulatory Requirement",
    definition: "Rules or standards set by external bodies that must be adhered to.",
    category: "compliance"
  },
  {
    id: "policy-enforcement",
    term: "Policy Enforcement",
    definition: "The enforcement of policies to ensure compliance.",
    category: "compliance"
  },
  {
    id: "control-framework",
    term: "Control Framework",
    definition: "A structured approach for managing and improving internal controls.",
    category: "compliance",
    relatedTerms: ["COSO", "Compliance"]
  },
  {
    id: "compliance-risk",
    term: "Compliance Risk",
    definition: "The risk of legal or regulatory sanctions, financial loss, or reputational damage from non-compliance.",
    category: "compliance"
  },
  {
    id: "code-of-ethics",
    term: "Code of Ethics",
    definition: "Formal documentation that outlines the principles and standards governing organizational behavior.",
    category: "compliance"
  },
  {
    id: "compliance-framework",
    term: "Compliance Framework",
    definition: "A structured set of guidelines that details an organization's processes for ensuring compliance.",
    category: "compliance"
  },
  {
    id: "nonconformity",
    term: "Nonconformity",
    definition: "Failure to meet a requirement stated in a standard or regulation.",
    category: "compliance"
  },
  {
    id: "whistleblower-policy",
    term: "Whistleblower Policy",
    definition: "A policy that protects individuals who report misconduct or violations.",
    category: "compliance"
  },
  {
    id: "compliance-officer",
    term: "Compliance Officer",
    definition: "The person responsible for overseeing and managing regulatory compliance issues.",
    category: "compliance"
  },
  {
    id: "whistleblower-protection",
    term: "Whistleblower Protection",
    definition: "Mechanisms to protect employees who report unethical or illegal activities.",
    category: "compliance"
  },
  {
    id: "system-of-record",
    term: "System of Record",
    definition: "The official data source for a given piece of information or record.",
    category: "compliance"
  },
  {
    id: "corrective-action-compliance",
    term: "Corrective Action",
    definition: "A response to eliminate the root cause of a detected nonconformity.",
    category: "compliance"
  },
  {
    id: "corrective-action-plan",
    term: "Corrective Action Plan",
    definition: "A plan developed to address and rectify identified nonconformities or deficiencies.",
    category: "compliance"
  },
  {
    id: "root-cause-analysis",
    term: "Root Cause Analysis",
    definition: "A method of problem solving used for identifying the root causes of faults or problems.",
    category: "compliance"
  },
  {
    id: "remediation-plan",
    term: "Remediation Plan",
    definition: "An action plan for correcting issues of noncompliance or internal control deficiencies.",
    category: "compliance"
  },
  {
    id: "nonconformity-compliance",
    term: "Nonconformity",
    definition: "A deviation from a specified requirement or standard.",
    category: "compliance"
  },
  // Risk Management Terms
  {
    id: "risk-tolerance",
    term: "Risk Tolerance",
    definition: "The acceptable variation in outcomes related to specific performance measures.",
    category: "risk_management"
  },
  {
    id: "key-risk-indicator",
    term: "Key Risk Indicator (KRI)",
    definition: "A metric used to signal increasing risk exposure in various areas of an organization.",
    category: "risk_management"
  },
  {
    id: "risk-heat-map",
    term: "Risk Heat Map",
    definition: "A visual tool for ranking and displaying risks by their likelihood and impact.",
    category: "risk_management"
  },
  {
    id: "residual-risk-rm",
    term: "Residual Risk",
    definition: "The level of risk remaining after controls have been applied.",
    category: "risk_management"
  },
  {
    id: "risk-appetite-rm",
    term: "Risk Appetite",
    definition: "The amount and type of risk that an organization is willing to take in order to meet its objectives.",
    category: "risk_management"
  },
  {
    id: "risk-heat-map-rm",
    term: "Risk Heat Map",
    definition: "A visual tool that shows the likelihood and impact of risks using a color-coded matrix.",
    category: "risk_management"
  },
  {
    id: "risk-register",
    term: "Risk Register",
    definition: "A tool used to document and track risks, including their likelihood, impact, and mitigation measures.",
    category: "risk_management"
  },
  // Audit & Assurance Terms
  {
    id: "due-diligence",
    term: "Due Diligence",
    definition: "The investigation and evaluation of a business or person before entering into an agreement.",
    category: "audit",
    relatedTerms: ["Compliance", "Audit & Assurance"]
  },
  {
    id: "assurance-engagement",
    term: "Assurance Engagement",
    definition: "An engagement in which a practitioner expresses a conclusion about subject matter for intended users.",
    category: "audit"
  },
  {
    id: "audit-trail",
    term: "Audit Trail",
    definition: "A step-by-step record by which data can be traced to its source.",
    category: "audit"
  },
  {
    id: "materiality",
    term: "Materiality",
    definition: "The threshold or magnitude of an omission or misstatement of information that influences decisions.",
    category: "audit"
  },
  {
    id: "external-audit",
    term: "External Audit",
    definition: "An independent review of an organization's financial statements and systems by an outside party.",
    category: "audit"
  },
  {
    id: "internal-audit-assurance",
    term: "Internal Audit",
    definition: "A function that evaluates and improves the effectiveness of risk management, control, and governance.",
    category: "audit"
  },
  {
    id: "audit-scope",
    term: "Audit Scope",
    definition: "The extent and boundaries of an audit, including subject matter and timeframe.",
    category: "audit"
  },
  {
    id: "sampling",
    term: "Sampling",
    definition: "The technique of selecting a subset of items for testing to draw conclusions.",
    category: "audit"
  },
  {
    id: "audit-plan",
    term: "Audit Plan",
    definition: "A document that outlines audit objectives, scope, and procedures.",
    category: "audit"
  },
  {
    id: "audit-evidence",
    term: "Audit Evidence",
    definition: "Information used by auditors to arrive at conclusions on which to base the audit opinion.",
    category: "audit"
  },
  {
    id: "audit-trail-assurance",
    term: "Audit Trail",
    definition: "A record that enables the tracing of a transaction through the system.",
    category: "audit"
  },
  {
    id: "materiality-assurance",
    term: "Materiality",
    definition: "The significance of an omission or misstatement that could influence users' decisions.",
    category: "audit"
  },
  {
    id: "substantive-procedures",
    term: "Substantive Procedures",
    definition: "Audit processes used to detect material misstatements at the assertion level.",
    category: "audit"
  },
  {
    id: "benchmarking",
    term: "Benchmarking",
    definition: "The practice of comparing performance metrics to industry bests or best practices.",
    category: "audit"
  },
  {
    id: "audit-opinion",
    term: "Audit Opinion",
    definition: "A statement issued by an auditor indicating the reliability and fairness of an organization's financial statements.",
    category: "audit"
  },
  {
    id: "third-line-of-defense",
    term: "Third Line of Defense",
    definition: "The internal audit function that provides independent assurance over governance, risk management, and control processes.",
    category: "audit"
  },
  {
    id: "material-weakness",
    term: "Material Weakness",
    definition: "A deficiency or combination of deficiencies in internal control that raises a reasonable possibility of a material misstatement.",
    category: "audit"
  },
  {
    id: "quality-assurance-review",
    term: "Quality Assurance Review",
    definition: "A structured process to assess the quality and effectiveness of the internal audit activity.",
    category: "audit"
  },
  // INTOSAI Terms
  {
    id: "oversight-body",
    term: "Oversight Body",
    definition: "An independent body responsible for supervising and evaluating internal control frameworks.",
    category: "intosai"
  },
  {
    id: "oversight-body-intosai",
    term: "Oversight Body",
    definition: "An organization responsible for supervising or auditing government operations.",
    category: "intosai"
  },
  {
    id: "performance-audit",
    term: "Performance Audit",
    definition: "An audit that assesses the economy, efficiency, and effectiveness of government programs.",
    category: "intosai"
  }
];

export default function Glossary() {
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Use appropriate glossary terms based on language
  const currentGlossaryTerms = language === 'es' ? glossaryTermsES : glossaryTerms;

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "coso", label: "COSO Framework" },
    { value: "intosai", label: "INTOSAI Standards" },
    { value: "internal_control", label: "Internal Control" },
    { value: "nebusis_app", label: "Nebusis® ControlCore" },
    { value: "compliance", label: "Compliance" },
    { value: "risk_management", label: "Risk Management" },
    { value: "audit", label: "Audit & Assurance" }
  ];

  const filteredTerms = useMemo(() => {
    return currentGlossaryTerms.filter(term => {
      const matchesSearch = searchTerm === "" || 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.synonyms?.some(synonym => synonym.toLowerCase().includes(searchTerm.toLowerCase())) ||
        term.examples?.some(example => example.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, currentGlossaryTerms]);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      coso: "bg-blue-100 text-blue-800",
      intosai: "bg-green-100 text-green-800",
      internal_control: "bg-purple-100 text-purple-800",
      nebusis_app: "bg-indigo-100 text-indigo-800",
      compliance: "bg-orange-100 text-orange-800",
      risk_management: "bg-red-100 text-red-800",
      audit: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "coso": return "🏢";
      case "intosai": return "🌍";
      case "internal_control": return "🛡️";
      case "nebusis_app": return "⚡";
      case "compliance": return "✅";
      case "risk_management": return "⚠️";
      case "audit": return "🔍";
      default: return "📖";
    }
  };

  const categoryStats = categories.slice(1).map(cat => ({
    ...cat,
    count: currentGlossaryTerms.filter(term => term.category === cat.value).length
  }));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header 
        user={user} 
        institution={{ id: user?.institutionId || 0, name: t('common.institution', 'Institution') }}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex pt-16">
        <SidebarSimple open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0 transition-all duration-300 ease-in-out">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('glossary.title', 'Glossary')}</h1>
                    <p className="text-slate-600">
                      {t('glossary.description', 'Comprehensive reference for internal control, COSO, INTOSAI, and Nebusis® ControlCore terminology.')}
                    </p>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="browse">Browse Terms</TabsTrigger>
                  <TabsTrigger value="categories">By Category</TabsTrigger>
                </TabsList>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search terms, definitions, examples..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>

                <TabsContent value="browse" className="space-y-6">
                  {/* Search Results Summary */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {filteredTerms.length} of {currentGlossaryTerms.length} terms
                      {searchTerm && ` for "${searchTerm}"`}
                      {selectedCategory !== "all" && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
                    </p>
                  </div>

                  {/* Terms List */}
                  <div className="space-y-4">
                    {filteredTerms.map(term => (
                      <Card key={term.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-xl text-gray-900 mb-2">
                                {term.term}
                              </CardTitle>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getCategoryBadgeColor(term.category)}>
                                  {getCategoryIcon(term.category)} {categories.find(c => c.value === term.category)?.label}
                                </Badge>
                                {term.source && (
                                  <Badge variant="outline" className="text-xs">
                                    {term.source}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-700 leading-relaxed">{term.definition}</p>
                          
                          {term.synonyms && term.synonyms.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Also known as:</h4>
                              <div className="flex flex-wrap gap-2">
                                {term.synonyms.map(synonym => (
                                  <Badge key={synonym} variant="secondary" className="text-xs">
                                    {synonym}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {term.examples && term.examples.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Examples:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {term.examples.map((example, index) => (
                                  <li key={index}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {term.applicationContext && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                                <span className="text-lg">⚡</span>
                                Application in Nebusis® ControlCore:
                              </h4>
                              <p className="text-sm text-blue-800">{term.applicationContext}</p>
                            </div>
                          )}

                          {term.relatedTerms && term.relatedTerms.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Related Terms:</h4>
                              <div className="flex flex-wrap gap-2">
                                {term.relatedTerms.map(relatedTerm => (
                                  <Badge key={relatedTerm} variant="outline" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {relatedTerm}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryStats.map(category => (
                      <Card key={category.value} className="hover:shadow-lg transition-shadow cursor-pointer" 
                            onClick={() => { setSelectedCategory(category.value); setActiveTab("browse"); }}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <span className="text-2xl">{getCategoryIcon(category.value)}</span>
                            <div>
                              <div className="text-lg">{category.label}</div>
                              <div className="text-sm text-gray-500 font-normal">{category.count} terms</div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {currentGlossaryTerms
                              .filter(term => term.category === category.value)
                              .slice(0, 3)
                              .map(term => (
                              <div key={term.id} className="text-sm text-blue-600 hover:text-blue-800">
                                • {term.term}
                              </div>
                            ))}
                            {currentGlossaryTerms.filter(term => term.category === category.value).length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{currentGlossaryTerms.filter(term => term.category === category.value).length - 3} more terms
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}