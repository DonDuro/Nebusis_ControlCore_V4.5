import { 
  users, institutions, workflows, workflowSteps, evidence, activities, complianceScores, institutionDocuments,
  checklistItems, checklistResponses, alertNotifications, nebusisIntegrations, syncLogs,
  institutionalPlans, trainingRecords, cgrReports, strategicPlans,
  // V4 tables
  planningObjectives, objectiveResources, culturalSurveys, surveyResponses, internalAudits, auditFindings, nebusisLicenses,
  // Assessment tables
  assessmentReports, assessmentResponses,
  // Workflow Execution Assessment tables
  workflowExecutionAssessments, workflowStepAssessments, workflowDeviations,
  type User, type InsertUser, type Institution, type InsertInstitution,
  type Workflow, type InsertWorkflow, type WorkflowStep, type InsertWorkflowStep,
  type Evidence, type InsertEvidence, type Activity, type InsertActivity,
  type ComplianceScore, type InstitutionDocument, type InsertInstitutionDocument,
  type ChecklistItem, type InsertChecklistItem, type ChecklistResponse, type InsertChecklistResponse,
  type AlertNotification, type InsertAlertNotification, type NebusisIntegration, type InsertNebusisIntegration,
  type SyncLog, type InsertSyncLog, type InstitutionalPlan, type InsertInstitutionalPlan,
  type TrainingRecord, type InsertTrainingRecord, type CgrReport, type InsertCgrReport,
  type StrategicPlan, type InsertStrategicPlan,
  // V4 types
  type PlanningObjective, type InsertPlanningObjective, type ObjectiveResource, type InsertObjectiveResource,
  type CulturalSurvey, type InsertCulturalSurvey,
  type SurveyResponse, type InsertSurveyResponse, type InternalAudit, type InsertInternalAudit,
  type AuditFinding, type InsertAuditFinding, type NebusisLicense, type InsertNebusisLicense,
  // Assessment types
  type AssessmentReport, type InsertAssessmentReport, type AssessmentResponse, type InsertAssessmentResponse,
  // Workflow Execution Assessment types
  type WorkflowExecutionAssessment, type InsertWorkflowExecutionAssessment,
  type WorkflowStepAssessment, type InsertWorkflowStepAssessment,
  type WorkflowDeviation, type InsertWorkflowDeviation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Institutions
  getInstitution(id: number): Promise<Institution | undefined>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;
  
  // Workflows
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByInstitution(institutionId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined>;
  
  // Workflow Steps
  getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]>;
  createWorkflowStep(step: InsertWorkflowStep): Promise<WorkflowStep>;
  updateWorkflowStep(id: number, updates: Partial<WorkflowStep>): Promise<WorkflowStep | undefined>;
  
  // Evidence
  getEvidenceByStep(stepId: number): Promise<Evidence[]>;
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  
  // Activities
  getRecentActivities(institutionId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Compliance Scores
  getComplianceScores(institutionId: number): Promise<ComplianceScore[]>;
  updateComplianceScore(institutionId: number, componentType: string, score: number): Promise<ComplianceScore>;
  
  // Dashboard Stats
  getDashboardStats(institutionId: number): Promise<{
    activeWorkflows: number;
    completedWorkflows: number;
    underReview: number;
    overallProgress: number;
  }>;

  // Institution Documents
  getInstitutionDocuments(institutionId: number): Promise<InstitutionDocument[]>;
  getInstitutionDocument(id: number): Promise<InstitutionDocument | undefined>;
  createInstitutionDocument(document: InsertInstitutionDocument): Promise<InstitutionDocument>;
  deleteInstitutionDocument(id: number): Promise<boolean>;
  getInstitutionDocumentsByType(institutionId: number, documentType: string): Promise<InstitutionDocument[]>;

  // Checklist Items
  getChecklistItems(): Promise<ChecklistItem[]>;
  getChecklistItemsByComponent(componentType: string): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;

  // Checklist Responses
  getChecklistResponses(workflowId: number): Promise<ChecklistResponse[]>;
  getChecklistResponse(checklistItemId: number, workflowId: number): Promise<ChecklistResponse | undefined>;
  createChecklistResponse(response: InsertChecklistResponse): Promise<ChecklistResponse>;
  updateChecklistResponse(id: number, updates: Partial<ChecklistResponse>): Promise<ChecklistResponse | undefined>;

  // Alert Notifications
  getActiveAlerts(institutionId: number, workflowId?: number): Promise<AlertNotification[]>;
  createAlertNotification(alert: InsertAlertNotification): Promise<AlertNotification>;
  markAlertEmailSent(alertId: number): Promise<void>;
  getUsersByInstitution(institutionId: number): Promise<User[]>;
  getAllInstitutions(): Promise<Institution[]>;

  // NEBUSIS® Management System Wizard Integration
  getNebusisIntegration(institutionId: number): Promise<NebusisIntegration | undefined>;
  createNebusisIntegration(integration: InsertNebusisIntegration): Promise<NebusisIntegration>;
  updateNebusisIntegration(id: number, updates: Partial<NebusisIntegration>): Promise<NebusisIntegration | undefined>;
  deleteNebusisIntegration(id: number): Promise<boolean>;
  getSyncLogs(integrationId: number, limit?: number): Promise<SyncLog[]>;
  createSyncLog(log: InsertSyncLog): Promise<SyncLog>;
  updateSyncLog(id: number, updates: Partial<SyncLog>): Promise<SyncLog | undefined>;

  // Institutional Plans
  getInstitutionalPlans(institutionId: number): Promise<InstitutionalPlan[]>;
  createInstitutionalPlan(plan: InsertInstitutionalPlan): Promise<InstitutionalPlan>;
  updateInstitutionalPlan(id: number, updates: Partial<InstitutionalPlan>): Promise<InstitutionalPlan | undefined>;
  deleteInstitutionalPlan(id: number): Promise<boolean>;

  // Training Records
  getTrainingRecords(institutionId: number): Promise<TrainingRecord[]>;
  createTrainingRecord(record: InsertTrainingRecord): Promise<TrainingRecord>;
  updateTrainingRecord(id: number, updates: Partial<TrainingRecord>): Promise<TrainingRecord | undefined>;
  deleteTrainingRecord(id: number): Promise<boolean>;
  getTrainingStats(institutionId: number): Promise<{
    totalTrainings: number;
    completedTrainings: number;
    inProgressTrainings: number;
    totalHours: number;
    topicDistribution: { [key: string]: number };
  }>;

  // Audit Reports
  getCgrReports(institutionId: number): Promise<CgrReport[]>;
  createCgrReport(report: InsertCgrReport): Promise<CgrReport>;
  updateCgrReport(id: number, updates: Partial<CgrReport>): Promise<CgrReport | undefined>;
  deleteCgrReport(id: number): Promise<boolean>;
  submitCgrReport(id: number): Promise<CgrReport | undefined>;

  // V4 CONTROLCORE FUNCTIONALITY - TIER 1 METHODS
  
  // Planning Module
  getPlanningObjectives(institutionId: number): Promise<PlanningObjective[]>;
  createPlanningObjective(objective: InsertPlanningObjective): Promise<PlanningObjective>;
  updatePlanningObjectiveProgress(id: number, progress: number): Promise<PlanningObjective | undefined>;
  getObjectiveResources(objectiveId: number): Promise<ObjectiveResource[]>;
  createObjectiveResource(resource: InsertObjectiveResource): Promise<ObjectiveResource>;
  
  // Cultural Surveys (Encuestas)
  getCulturalSurveys(institutionId: number): Promise<CulturalSurvey[]>;
  createCulturalSurvey(survey: InsertCulturalSurvey): Promise<CulturalSurvey>;
  updateCulturalSurvey(id: number, updates: Partial<CulturalSurvey>): Promise<CulturalSurvey | undefined>;
  deleteCulturalSurvey(id: number): Promise<boolean>;
  getSurveyResponses(surveyId: number): Promise<SurveyResponse[]>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  
  // Internal Audit (Auditoría Interna)
  getInternalAudits(institutionId: number): Promise<InternalAudit[]>;
  createInternalAudit(audit: InsertInternalAudit): Promise<InternalAudit>;
  updateInternalAudit(id: number, updates: Partial<InternalAudit>): Promise<InternalAudit | undefined>;
  deleteInternalAudit(id: number): Promise<boolean>;
  
  // Findings Management (Gestión de Hallazgos)
  getAuditFindings(institutionId: number, auditId?: number): Promise<AuditFinding[]>;
  createAuditFinding(finding: InsertAuditFinding): Promise<AuditFinding>;
  updateAuditFinding(id: number, updates: Partial<AuditFinding>): Promise<AuditFinding | undefined>;
  deleteAuditFinding(id: number): Promise<boolean>;
  
  // License Management
  getNebusisLicenses(institutionId: number): Promise<NebusisLicense[]>;
  createNebusisLicense(license: InsertNebusisLicense): Promise<NebusisLicense>;
  updateNebusisLicense(id: number, updates: Partial<NebusisLicense>): Promise<NebusisLicense | undefined>;
  deleteNebusisLicense(id: number): Promise<boolean>;
  
  // Executive Dashboard Data
  getExecutiveDashboardData(institutionId: number): Promise<{
    components: Array<{
      name: string;
      status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
      score: number;
      openAudits: number;
      openFindings: number;
      openActions: number;
    }>;
    trendData: Array<{
      date: string;
      value: number;
    }>;
  }>;

  // Assessment Reports and Responses
  getAssessmentReports(institutionId: number): Promise<AssessmentReport[]>;
  getAssessmentReportsByFramework(institutionId: number, framework: string): Promise<AssessmentReport[]>;
  getAssessmentReportDetails(id: number): Promise<AssessmentReport | undefined>;
  createAssessmentReport(report: InsertAssessmentReport): Promise<AssessmentReport>;
  updateAssessmentReport(id: number, updates: Partial<AssessmentReport>): Promise<AssessmentReport | undefined>;
  getAssessmentResponses(reportId: number): Promise<AssessmentResponse[]>;
  upsertAssessmentResponse(response: InsertAssessmentResponse): Promise<AssessmentResponse>;

  // Workflow Execution Assessments - New methods for workflow execution fidelity evaluation
  getWorkflowExecutionAssessments(institutionId: number): Promise<WorkflowExecutionAssessment[]>;
  getWorkflowExecutionAssessment(id: number): Promise<WorkflowExecutionAssessment | undefined>;
  createWorkflowExecutionAssessment(assessment: InsertWorkflowExecutionAssessment): Promise<WorkflowExecutionAssessment>;
  updateWorkflowExecutionAssessment(id: number, updates: Partial<WorkflowExecutionAssessment>): Promise<WorkflowExecutionAssessment | undefined>;
  getWorkflowStepAssessments(executionAssessmentId: number): Promise<WorkflowStepAssessment[]>;
  createWorkflowStepAssessment(stepAssessment: InsertWorkflowStepAssessment): Promise<WorkflowStepAssessment>;
  getWorkflowDeviations(executionAssessmentId: number): Promise<WorkflowDeviation[]>;
  createWorkflowDeviation(deviation: InsertWorkflowDeviation): Promise<WorkflowDeviation>;
  updateWorkflowDeviation(id: number, updates: Partial<WorkflowDeviation>): Promise<WorkflowDeviation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private institutions: Map<number, Institution> = new Map();
  private workflows: Map<number, Workflow> = new Map();
  private workflowSteps: Map<number, WorkflowStep> = new Map();
  private evidence: Map<number, Evidence> = new Map();
  private activities: Map<number, Activity> = new Map();
  private complianceScores: Map<number, ComplianceScore> = new Map();
  private institutionDocuments: Map<number, InstitutionDocument> = new Map();
  private workflowExecutionAssessments: Map<number, WorkflowExecutionAssessment> = new Map();
  private workflowStepAssessments: Map<number, WorkflowStepAssessment> = new Map();
  private workflowDeviations: Map<number, WorkflowDeviation> = new Map();
  
  private currentUserId = 1;
  private currentInstitutionId = 1;
  private currentWorkflowId = 1;
  private currentStepId = 1;
  private currentEvidenceId = 1;
  private currentActivityId = 1;
  private currentScoreId = 1;
  private currentDocumentId = 1;
  private currentWorkflowExecutionAssessmentId = 1;
  private currentWorkflowStepAssessmentId = 1;
  private currentWorkflowDeviationId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create demo institution
    const institution: Institution = {
      id: this.currentInstitutionId++,
      name: "Ministerio de Hacienda",
      type: "ministry",
      legalBasis: "Ley 10-07",
      sectorRegulations: ["COSO", "COSO 2013"],
      size: "large",
      createdAt: new Date(),
    };
    this.institutions.set(institution.id, institution);

    // Create demo user
    const user: User = {
      id: this.currentUserId++,
      email: "ana.rodriguez@hacienda.gob.do",
      firstName: "Ana",
      lastName: "Rodríguez",
      role: "admin",
      institutionId: institution.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);

    // Create comprehensive English demo workflows with varied execution stages
    const workflows: Workflow[] = [
      // COMPLETED WORKFLOWS
      {
        id: this.currentWorkflowId++,
        name: "Control Environment Assessment Q4 2024",
        description: "Comprehensive evaluation of organizational control environment including ethics, governance, and organizational structure",
        componentType: "control_environment",
        status: "completed",
        progress: 100,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2024-12-30"),
        completedAt: new Date("2024-12-28"),
        createdAt: new Date("2024-12-01"),
        updatedAt: new Date("2024-12-28"),
      },
      {
        id: this.currentWorkflowId++,
        name: "IT General Controls Review",
        description: "Assessment of information technology general controls including access management, change management, and backup procedures",
        componentType: "control_activities",
        status: "completed",
        progress: 100,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-01-15"),
        completedAt: new Date("2025-01-14"),
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2025-01-14"),
      },
      {
        id: this.currentWorkflowId++,
        name: "Financial Reporting Controls Documentation",
        description: "Documentation and testing of key financial reporting controls for quarterly compliance verification",
        componentType: "control_activities",
        status: "completed",
        progress: 100,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-01-10"),
        completedAt: new Date("2025-01-08"),
        createdAt: new Date("2024-12-20"),
        updatedAt: new Date("2025-01-08"),
      },
      // IN PROGRESS WORKFLOWS
      {
        id: this.currentWorkflowId++,
        name: "Enterprise Risk Assessment Q1 2025",
        description: "Quarterly enterprise-wide risk assessment including operational, financial, compliance, and strategic risks",
        componentType: "risk_assessment",
        status: "in_progress",
        progress: 85,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-02-15"),
        completedAt: null,
        createdAt: new Date("2025-01-05"),
        updatedAt: new Date("2025-01-25"),
      },
      {
        id: this.currentWorkflowId++,
        name: "Internal Communication Systems Review",
        description: "Evaluation of internal communication channels, procedures, and effectiveness across all organizational levels",
        componentType: "information_communication",
        status: "in_progress",
        progress: 60,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-02-28"),
        completedAt: null,
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date("2025-01-26"),
      },
      {
        id: this.currentWorkflowId++,
        name: "Vendor Management Controls Implementation",
        description: "Implementation of enhanced vendor management controls including due diligence, contract management, and performance monitoring",
        componentType: "control_activities",
        status: "in_progress",
        progress: 45,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-03-15"),
        completedAt: null,
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-26"),
      },
      // DELAYED/OVERDUE WORKFLOWS
      {
        id: this.currentWorkflowId++,
        name: "Data Privacy Compliance Assessment",
        description: "Comprehensive assessment of data privacy controls and compliance with applicable regulations",
        componentType: "monitoring",
        status: "delayed",
        progress: 30,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-01-20"),
        completedAt: null,
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2025-01-22"),
      },
      {
        id: this.currentWorkflowId++,
        name: "Fraud Risk Assessment and Prevention",
        description: "Annual fraud risk assessment including identification of fraud schemes, assessment of fraud risks, and evaluation of anti-fraud controls",
        componentType: "risk_assessment",
        status: "delayed",
        progress: 20,
        institutionId: institution.id,
        assignedToId: user.id,
        dueDate: new Date("2025-01-15"),
        completedAt: null,
        createdAt: new Date("2024-12-01"),
        updatedAt: new Date("2025-01-20"),
      },
      // NOT STARTED WORKFLOWS
      {
        id: this.currentWorkflowId++,
        name: "Continuous Monitoring Program Enhancement",
        description: "Enhancement of continuous monitoring capabilities including automated controls testing and real-time risk monitoring",
        componentType: "monitoring",
        status: "not_started",
        progress: 0,
        institutionId: institution.id,
        assignedToId: null,
        dueDate: new Date("2025-04-30"),
        completedAt: null,
        createdAt: new Date("2025-01-20"),
        updatedAt: new Date("2025-01-20"),
      },
      {
        id: this.currentWorkflowId++,
        name: "Board Reporting Enhancement Initiative",
        description: "Enhancement of board reporting processes including governance dashboards, risk reporting, and compliance updates",
        componentType: "information_communication",
        status: "not_started",
        progress: 0,
        institutionId: institution.id,
        assignedToId: null,
        dueDate: new Date("2025-05-15"),
        completedAt: null,
        createdAt: new Date("2025-01-25"),
        updatedAt: new Date("2025-01-25"),
      },
    ];

    workflows.forEach(workflow => this.workflows.set(workflow.id, workflow));

    // Create demo activities in English
    const activities: Activity[] = [
      {
        id: this.currentActivityId++,
        type: "workflow_completed",
        description: "completed workflow \"Control Environment Assessment Q4 2024\"",
        userId: user.id,
        workflowId: 1,
        institutionId: institution.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: this.currentActivityId++,
        type: "workflow_completed",
        description: "completed workflow \"IT General Controls Review\"",
        userId: user.id,
        workflowId: 2,
        institutionId: institution.id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: this.currentActivityId++,
        type: "workflow_completed",
        description: "completed workflow \"Financial Reporting Controls Documentation\"",
        userId: user.id,
        workflowId: 3,
        institutionId: institution.id,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: this.currentActivityId++,
        type: "workflow_updated",
        description: "updated progress on \"Enterprise Risk Assessment Q1 2025\" to 85%",
        userId: user.id,
        workflowId: 4,
        institutionId: institution.id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: this.currentActivityId++,
        type: "evidence_uploaded",
        description: "uploaded evidence for \"Internal Communication Systems Review\"",
        userId: user.id,
        workflowId: 5,
        institutionId: institution.id,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: this.currentActivityId++,
        type: "workflow_delayed",
        description: "workflow \"Data Privacy Compliance Assessment\" is overdue",
        userId: user.id,
        workflowId: 7,
        institutionId: institution.id,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      }
    ];

    activities.forEach(activity => this.activities.set(activity.id, activity));

    // Create compliance scores for English component types
    const scores: ComplianceScore[] = [
      {
        id: this.currentScoreId++,
        institutionId: institution.id,
        componentType: "control_environment",
        score: 92,
        calculatedAt: new Date(),
      },
      {
        id: this.currentScoreId++,
        institutionId: institution.id,
        componentType: "risk_assessment",
        score: 78,
        calculatedAt: new Date(),
      },
      {
        id: this.currentScoreId++,
        institutionId: institution.id,
        componentType: "control_activities",
        score: 85,
        calculatedAt: new Date(),
      },
      {
        id: this.currentScoreId++,
        institutionId: institution.id,
        componentType: "information_communication",
        score: 71,
        calculatedAt: new Date(),
      },
      {
        id: this.currentScoreId++,
        institutionId: institution.id,
        componentType: "monitoring",
        score: 65,
        calculatedAt: new Date(),
      },
    ];

    scores.forEach(score => this.complianceScores.set(score.id, score));

    // Create sample workflow execution assessments for completed workflows
    const workflowAssessments = [
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 1, // Control Environment Assessment Q4 2024
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 88,
        designComplianceScore: 92,
        timelineComplianceScore: 85,
        qualityScore: 87,
        overallFindings: "Control Environment Assessment Q4 2024 was executed with high fidelity to the designed workflow. All major steps were completed within acceptable timeframes with quality deliverables.",
        recommendations: "Continue leveraging the structured approach demonstrated in this assessment. Consider incorporating additional stakeholder feedback mechanisms for future assessments.",
        status: "final" as const,
        assessmentDate: new Date("2024-12-29").toISOString(),
        createdAt: new Date("2024-12-29"),
        updatedAt: new Date("2024-12-29")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 2, // IT General Controls Review
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 95,
        designComplianceScore: 97,
        timelineComplianceScore: 93,
        qualityScore: 95,
        overallFindings: "IT General Controls Review executed exceptionally well with near-perfect adherence to workflow design. All control testing procedures were followed precisely and documentation quality exceeded expectations.",
        recommendations: "This workflow serves as an excellent template for future IT control reviews. Consider sharing methodologies with other assessment teams.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-15").toISOString(),
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 3, // Financial Reporting Controls Documentation
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 82,
        designComplianceScore: 85,
        timelineComplianceScore: 80,
        qualityScore: 81,
        overallFindings: "Financial Reporting Controls Documentation completed successfully with good workflow adherence. Some minor deviations from standard procedures were noted but did not materially impact outcomes.",
        recommendations: "Implement additional quality checkpoints during the documentation phase. Consider expanding the review process for complex control procedures.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-09").toISOString(),
        createdAt: new Date("2025-01-09"),
        updatedAt: new Date("2025-01-09")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 5, // Internal Communication Systems Review
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 76,
        designComplianceScore: 80,
        timelineComplianceScore: 73,
        qualityScore: 75,
        overallFindings: "Internal Communication Systems Review workflow was completed with adequate adherence to design specifications. Several timeline delays were experienced due to stakeholder availability issues.",
        recommendations: "Improve scheduling coordination with key stakeholders. Consider implementing parallel review processes where feasible to reduce overall timeline impact.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-18").toISOString(),
        createdAt: new Date("2025-01-18"),
        updatedAt: new Date("2025-01-18")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 6, // Vendor Management Control Framework
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 91,
        designComplianceScore: 93,
        timelineComplianceScore: 89,
        qualityScore: 91,
        overallFindings: "Vendor Management Control Framework workflow demonstrated excellent execution fidelity with comprehensive documentation and timely completion of all major milestones.",
        recommendations: "Continue using this workflow as a best practice model. Consider developing similar structured approaches for other third-party management processes.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-22").toISOString(),
        createdAt: new Date("2025-01-22"),
        updatedAt: new Date("2025-01-22")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 8, // Business Continuity Assessment
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 79,
        designComplianceScore: 82,
        timelineComplianceScore: 77,
        qualityScore: 78,
        overallFindings: "Business Continuity Assessment workflow completed within acceptable parameters. Some gaps in documentation quality and minor timeline slippages were observed.",
        recommendations: "Enhance documentation templates and provide additional training on business continuity assessment methodologies. Implement periodic checkpoint reviews.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-25").toISOString(),
        createdAt: new Date("2025-01-25"),
        updatedAt: new Date("2025-01-25")
      }
    ];

    workflowAssessments.forEach(assessment => this.workflowExecutionAssessments.set(assessment.id, assessment));

    // Create sample assessment reports that would appear in Assessment Reports page
    const assessmentReports = [
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "workflow_assessment" as const,
        title: "Workflow Assessment Report - Control Environment Assessment Q4 2024",
        description: "Comprehensive execution fidelity assessment for Control Environment Assessment Q4 2024 workflow",
        generatedAt: new Date("2024-12-30"),
        generatedById: user.id,
        fileName: "workflow_assessment_1_20241230.pdf",
        filePath: "/reports/workflow_assessments/assessment_1.pdf",
        fileSize: 387520,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q4 2024",
        reportScope: "control_environment",
        complianceScore: 88,
        findings: "Control Environment Assessment Q4 2024 was executed with high fidelity to the designed workflow. All major steps were completed within acceptable timeframes with quality deliverables.",
        recommendations: "Continue leveraging the structured approach demonstrated in this assessment. Consider incorporating additional stakeholder feedback mechanisms for future assessments."
      },
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "workflow_assessment" as const,
        title: "Workflow Assessment Report - IT General Controls Review",
        description: "Comprehensive execution fidelity assessment for IT General Controls Review workflow",
        generatedAt: new Date("2025-01-16"),
        generatedById: user.id,
        fileName: "workflow_assessment_2_20250116.pdf",
        filePath: "/reports/workflow_assessments/assessment_2.pdf",
        fileSize: 445120,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q1 2025",
        reportScope: "control_activities",
        complianceScore: 95,
        findings: "IT General Controls Review executed exceptionally well with near-perfect adherence to workflow design. All control testing procedures were followed precisely and documentation quality exceeded expectations.",
        recommendations: "This workflow serves as an excellent template for future IT control reviews. Consider sharing methodologies with other assessment teams."
      },
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "workflow_assessment" as const,
        title: "Workflow Assessment Report - Financial Reporting Controls Documentation",
        description: "Comprehensive execution fidelity assessment for Financial Reporting Controls Documentation workflow",
        generatedAt: new Date("2025-01-10"),
        generatedById: user.id,
        fileName: "workflow_assessment_3_20250110.pdf",
        filePath: "/reports/workflow_assessments/assessment_3.pdf",
        fileSize: 392680,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q1 2025",
        reportScope: "control_activities",
        complianceScore: 82,
        findings: "Financial Reporting Controls Documentation completed successfully with good workflow adherence. Some minor deviations from standard procedures were noted but did not materially impact outcomes.",
        recommendations: "Implement additional quality checkpoints during the documentation phase. Consider expanding the review process for complex control procedures."
      },
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "workflow_assessment" as const,
        title: "Workflow Assessment Report - Internal Communication Systems Review",
        description: "Comprehensive execution fidelity assessment for Internal Communication Systems Review workflow",
        generatedAt: new Date("2025-01-19"),
        generatedById: user.id,
        fileName: "workflow_assessment_5_20250119.pdf",
        filePath: "/reports/workflow_assessments/assessment_5.pdf",
        fileSize: 364420,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q1 2025",
        reportScope: "information_communication",
        complianceScore: 76,
        findings: "Internal Communication Systems Review workflow was completed with adequate adherence to design specifications. Several timeline delays were experienced due to stakeholder availability issues.",
        recommendations: "Improve scheduling coordination with key stakeholders. Consider implementing parallel review processes where feasible to reduce overall timeline impact."
      },
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "workflow_assessment" as const,
        title: "Workflow Assessment Report - Vendor Management Control Framework",
        description: "Comprehensive execution fidelity assessment for Vendor Management Control Framework workflow",
        generatedAt: new Date("2025-01-23"),
        generatedById: user.id,
        fileName: "workflow_assessment_6_20250123.pdf",
        filePath: "/reports/workflow_assessments/assessment_6.pdf",
        fileSize: 471230,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q1 2025",
        reportScope: "control_environment",
        complianceScore: 91,
        findings: "Vendor Management Control Framework workflow demonstrated excellent execution fidelity with comprehensive documentation and timely completion of all major milestones.",
        recommendations: "Continue using this workflow as a best practice model. Consider developing similar structured approaches for other third-party management processes."
      },
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "workflow_assessment" as const,
        title: "Workflow Assessment Report - Business Continuity Assessment",
        description: "Comprehensive execution fidelity assessment for Business Continuity Assessment workflow",
        generatedAt: new Date("2025-01-26"),
        generatedById: user.id,
        fileName: "workflow_assessment_8_20250126.pdf",
        filePath: "/reports/workflow_assessments/assessment_8.pdf",
        fileSize: 398750,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q1 2025",
        reportScope: "risk_assessment",
        complianceScore: 79,
        findings: "Business Continuity Assessment workflow completed within acceptable parameters. Some gaps in documentation quality and minor timeline slippages were observed.",
        recommendations: "Enhance documentation templates and provide additional training on business continuity assessment methodologies. Implement periodic checkpoint reviews."
      },
      {
        id: this.currentAssessmentReportId++,
        institutionId: institution.id,
        reportType: "framework_assessment" as const,
        title: "COSO Framework Compliance Assessment - Q4 2024",
        description: "Quarterly assessment of COSO framework compliance across all control components",
        generatedAt: new Date("2025-01-05"),
        generatedById: user.id,
        fileName: "coso_framework_assessment_q4_2024.pdf",
        filePath: "/reports/framework_assessments/coso_q4_2024.pdf",
        fileSize: 672340,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "Q4 2024",
        reportScope: "all_components",
        complianceScore: 84,
        findings: "Overall COSO framework compliance remains strong with Control Environment and Control Activities showing highest compliance levels. Information & Communication and Monitoring components require additional attention.",
        recommendations: "Focus improvement efforts on communication procedures and continuous monitoring capabilities. Implement quarterly review cycles for all framework components."
      }
    ];

    assessmentReports.forEach(report => this.assessmentReports.set(report.id, report));

    // Create sample workflow execution assessments with comprehensive English data
    const workflowExecutionAssessments: WorkflowExecutionAssessment[] = [
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 1,
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 88,
        designComplianceScore: 92,
        timelineComplianceScore: 85,
        qualityScore: 87,
        overallFindings: "Control Environment Assessment Q4 2024 was executed with high fidelity to the designed workflow. All major steps were completed within acceptable timeframes with quality deliverables.",
        recommendations: "Continue leveraging the structured approach demonstrated in this assessment. Consider incorporating additional stakeholder feedback mechanisms for future assessments.",
        status: "final" as const,
        assessmentDate: new Date("2024-12-29").toISOString(),
        createdAt: new Date("2024-12-29"),
        updatedAt: new Date("2024-12-29")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 2,
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 95,
        designComplianceScore: 97,
        timelineComplianceScore: 93,
        qualityScore: 95,
        overallFindings: "IT General Controls Review executed exceptionally well with near-perfect adherence to workflow design. All control testing procedures were followed precisely and documentation quality exceeded expectations.",
        recommendations: "This workflow serves as an excellent template for future IT control reviews. Consider sharing methodologies with other assessment teams.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-15").toISOString(),
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 3,
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 82,
        designComplianceScore: 85,
        timelineComplianceScore: 80,
        qualityScore: 81,
        overallFindings: "Financial Reporting Controls Documentation completed successfully with good workflow adherence. Some minor deviations from standard procedures were noted but did not materially impact outcomes.",
        recommendations: "Implement additional quality checkpoints during the documentation phase. Consider expanding the review process for complex control procedures.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-09").toISOString(),
        createdAt: new Date("2025-01-09"),
        updatedAt: new Date("2025-01-09")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 5,
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 76,
        designComplianceScore: 80,
        timelineComplianceScore: 73,
        qualityScore: 75,
        overallFindings: "Internal Communication Systems Review workflow was completed with adequate adherence to design specifications. Several timeline delays were experienced due to stakeholder availability issues.",
        recommendations: "Improve scheduling coordination with key stakeholders. Consider implementing parallel review processes where feasible to reduce overall timeline impact.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-18").toISOString(),
        createdAt: new Date("2025-01-18"),
        updatedAt: new Date("2025-01-18")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 6,
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 91,
        designComplianceScore: 93,
        timelineComplianceScore: 89,
        qualityScore: 91,
        overallFindings: "Vendor Management Control Framework workflow demonstrated excellent execution fidelity with comprehensive documentation and timely completion of all major milestones.",
        recommendations: "Continue using this workflow as a best practice model. Consider developing similar structured approaches for other third-party management processes.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-22").toISOString(),
        createdAt: new Date("2025-01-22"),
        updatedAt: new Date("2025-01-22")
      },
      {
        id: this.currentWorkflowExecutionAssessmentId++,
        workflowId: 8,
        assessorId: user.id,
        executionStatus: "completed" as const,
        overallFidelityScore: 79,
        designComplianceScore: 82,
        timelineComplianceScore: 77,
        qualityScore: 78,
        overallFindings: "Business Continuity Assessment workflow completed within acceptable parameters. Some gaps in documentation quality and minor timeline slippages were observed.",
        recommendations: "Enhance documentation templates and provide additional training on business continuity assessment methodologies. Implement periodic checkpoint reviews.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-25").toISOString(),
        createdAt: new Date("2025-01-25"),
        updatedAt: new Date("2025-01-25")
      }
    ];

    workflowExecutionAssessments.forEach(assessment => this.workflowExecutionAssessments.set(assessment.id, assessment));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getInstitution(id: number): Promise<Institution | undefined> {
    return this.institutions.get(id);
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const institution: Institution = {
      ...insertInstitution,
      id: this.currentInstitutionId++,
      createdAt: new Date(),
    };
    this.institutions.set(institution.id, institution);
    return institution;
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getWorkflowsByInstitution(institutionId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      workflow => workflow.institutionId === institutionId
    );
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const workflow: Workflow = {
      ...insertWorkflow,
      id: this.currentWorkflowId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updated = { ...workflow, ...updates, updatedAt: new Date() };
    this.workflows.set(id, updated);
    return updated;
  }

  async getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]> {
    return Array.from(this.workflowSteps.values())
      .filter(step => step.workflowId === workflowId)
      .sort((a, b) => a.order - b.order);
  }

  async createWorkflowStep(insertStep: InsertWorkflowStep): Promise<WorkflowStep> {
    const step: WorkflowStep = {
      ...insertStep,
      id: this.currentStepId++,
      createdAt: new Date(),
    };
    this.workflowSteps.set(step.id, step);
    return step;
  }

  async updateWorkflowStep(id: number, updates: Partial<WorkflowStep>): Promise<WorkflowStep | undefined> {
    const step = this.workflowSteps.get(id);
    if (!step) return undefined;
    
    const updated = { ...step, ...updates };
    this.workflowSteps.set(id, updated);
    return updated;
  }

  async getEvidenceByStep(stepId: number): Promise<Evidence[]> {
    return Array.from(this.evidence.values()).filter(
      evidence => evidence.workflowStepId === stepId
    );
  }

  async createEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const evidence: Evidence = {
      ...insertEvidence,
      id: this.currentEvidenceId++,
      createdAt: new Date(),
    };
    this.evidence.set(evidence.id, evidence);
    return evidence;
  }

  async getRecentActivities(institutionId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.institutionId === institutionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      ...insertActivity,
      id: this.currentActivityId++,
      createdAt: new Date(),
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  async getComplianceScores(institutionId: number): Promise<ComplianceScore[]> {
    return Array.from(this.complianceScores.values()).filter(
      score => score.institutionId === institutionId
    );
  }

  async updateComplianceScore(institutionId: number, componentType: string, score: number): Promise<ComplianceScore> {
    const existing = Array.from(this.complianceScores.values()).find(
      s => s.institutionId === institutionId && s.componentType === componentType
    );

    if (existing) {
      const updated = { ...existing, score, calculatedAt: new Date() };
      this.complianceScores.set(existing.id, updated);
      return updated;
    } else {
      const newScore: ComplianceScore = {
        id: this.currentScoreId++,
        institutionId,
        componentType,
        score,
        calculatedAt: new Date(),
      };
      this.complianceScores.set(newScore.id, newScore);
      return newScore;
    }
  }

  async getDashboardStats(institutionId: number): Promise<{
    activeWorkflows: number;
    completedWorkflows: number;
    underReview: number;
    overallProgress: number;
  }> {
    const workflows = await this.getWorkflowsByInstitution(institutionId);
    
    const activeWorkflows = workflows.filter(w => w.status === "in_progress").length;
    const completedWorkflows = workflows.filter(w => w.status === "completed").length;
    const underReview = workflows.filter(w => w.status === "under_review").length;
    
    const totalProgress = workflows.reduce((sum, w) => sum + w.progress, 0);
    const overallProgress = workflows.length > 0 ? Math.round(totalProgress / workflows.length) : 0;

    return {
      activeWorkflows,
      completedWorkflows,
      underReview,
      overallProgress,
    };
  }

  async getInstitutionDocuments(institutionId: number): Promise<InstitutionDocument[]> {
    return Array.from(this.institutionDocuments.values())
      .filter(doc => doc.institutionId === institutionId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getInstitutionDocument(id: number): Promise<InstitutionDocument | undefined> {
    return this.institutionDocuments.get(id);
  }

  async createInstitutionDocument(insertDocument: InsertInstitutionDocument): Promise<InstitutionDocument> {
    const document: InstitutionDocument = {
      ...insertDocument,
      id: this.currentDocumentId++,
      createdAt: new Date(),
      analyzedAt: null,
      analysisResult: null,
    };
    this.institutionDocuments.set(document.id, document);
    return document;
  }

  async deleteInstitutionDocument(id: number): Promise<boolean> {
    return this.institutionDocuments.delete(id);
  }

  async getInstitutionDocumentsByType(institutionId: number, documentType: string): Promise<InstitutionDocument[]> {
    return Array.from(this.institutionDocuments.values())
      .filter(doc => doc.institutionId === institutionId && doc.documentType === documentType)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  // Workflow Execution Assessment implementations for MemStorage
  async getWorkflowExecutionAssessments(institutionId: number): Promise<WorkflowExecutionAssessment[]> {
    return Array.from(this.workflowExecutionAssessments.values());
  }

  async getWorkflowExecutionAssessment(id: number): Promise<WorkflowExecutionAssessment | undefined> {
    return this.workflowExecutionAssessments.get(id);
  }

  async createWorkflowExecutionAssessment(assessment: InsertWorkflowExecutionAssessment): Promise<WorkflowExecutionAssessment> {
    const newAssessment: WorkflowExecutionAssessment = {
      id: this.currentWorkflowExecutionAssessmentId++,
      ...assessment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workflowExecutionAssessments.set(newAssessment.id, newAssessment);
    return newAssessment;
  }

  async updateWorkflowExecutionAssessment(id: number, updates: Partial<WorkflowExecutionAssessment>): Promise<WorkflowExecutionAssessment | undefined> {
    const existing = this.workflowExecutionAssessments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.workflowExecutionAssessments.set(id, updated);
    return updated;
  }

  async getWorkflowStepAssessments(executionAssessmentId: number): Promise<WorkflowStepAssessment[]> {
    return Array.from(this.workflowStepAssessments.values())
      .filter(step => step.executionAssessmentId === executionAssessmentId);
  }

  async createWorkflowStepAssessment(stepAssessment: InsertWorkflowStepAssessment): Promise<WorkflowStepAssessment> {
    const newStepAssessment: WorkflowStepAssessment = {
      id: this.currentWorkflowStepAssessmentId++,
      ...stepAssessment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workflowStepAssessments.set(newStepAssessment.id, newStepAssessment);
    return newStepAssessment;
  }

  async getWorkflowDeviations(executionAssessmentId: number): Promise<WorkflowDeviation[]> {
    return Array.from(this.workflowDeviations.values())
      .filter(deviation => deviation.executionAssessmentId === executionAssessmentId);
  }

  async createWorkflowDeviation(deviation: InsertWorkflowDeviation): Promise<WorkflowDeviation> {
    const newDeviation: WorkflowDeviation = {
      id: this.currentWorkflowDeviationId++,
      ...deviation,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workflowDeviations.set(newDeviation.id, newDeviation);
    return newDeviation;
  }

  async updateWorkflowDeviation(id: number, updates: Partial<WorkflowDeviation>): Promise<WorkflowDeviation | undefined> {
    return undefined;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getInstitution(id: number): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution || undefined;
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const [institution] = await db
      .insert(institutions)
      .values(insertInstitution)
      .returning();
    return institution;
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async getWorkflowsByInstitution(institutionId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.institutionId, institutionId));
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db
      .insert(workflows)
      .values(insertWorkflow)
      .returning();
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const [workflow] = await db
      .update(workflows)
      .set(updates)
      .where(eq(workflows.id, id))
      .returning();
    return workflow || undefined;
  }

  async getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]> {
    return await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, workflowId));
  }

  async createWorkflowStep(insertStep: InsertWorkflowStep): Promise<WorkflowStep> {
    const [step] = await db
      .insert(workflowSteps)
      .values(insertStep)
      .returning();
    return step;
  }

  async updateWorkflowStep(id: number, updates: Partial<WorkflowStep>): Promise<WorkflowStep | undefined> {
    const [step] = await db
      .update(workflowSteps)
      .set(updates)
      .where(eq(workflowSteps.id, id))
      .returning();
    return step || undefined;
  }

  async getEvidenceByStep(stepId: number): Promise<Evidence[]> {
    return await db.select().from(evidence).where(eq(evidence.workflowStepId, stepId));
  }

  async createEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const [evidenceRecord] = await db
      .insert(evidence)
      .values(insertEvidence)
      .returning();
    return evidenceRecord;
  }

  async getRecentActivities(institutionId: number, limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.institutionId, institutionId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getComplianceScores(institutionId: number): Promise<ComplianceScore[]> {
    return await db.select().from(complianceScores).where(eq(complianceScores.institutionId, institutionId));
  }

  async updateComplianceScore(institutionId: number, componentType: string, score: number): Promise<ComplianceScore> {
    const existing = await db
      .select()
      .from(complianceScores)
      .where(eq(complianceScores.institutionId, institutionId));

    const existingScore = existing.find(s => s.componentType === componentType);

    if (existingScore) {
      const [updated] = await db
        .update(complianceScores)
        .set({ score, calculatedAt: new Date() })
        .where(eq(complianceScores.id, existingScore.id))
        .returning();
      return updated;
    } else {
      const [newScore] = await db
        .insert(complianceScores)
        .values({
          institutionId,
          componentType,
          score,
          calculatedAt: new Date(),
        })
        .returning();
      return newScore;
    }
  }

  async getDashboardStats(institutionId: number): Promise<{
    activeWorkflows: number;
    completedWorkflows: number;
    underReview: number;
    overallProgress: number;
  }> {
    const institutionWorkflows = await this.getWorkflowsByInstitution(institutionId);
    
    const activeWorkflows = institutionWorkflows.filter(w => w.status === "in_progress").length;
    const completedWorkflows = institutionWorkflows.filter(w => w.status === "completed").length;
    const underReview = institutionWorkflows.filter(w => w.status === "under_review").length;
    
    const totalProgress = institutionWorkflows.reduce((sum, w) => sum + (w.progress || 0), 0);
    const overallProgress = institutionWorkflows.length > 0 ? Math.round(totalProgress / institutionWorkflows.length) : 0;

    return {
      activeWorkflows,
      completedWorkflows,
      underReview,
      overallProgress,
    };
  }

  async getInstitutionDocuments(institutionId: number): Promise<InstitutionDocument[]> {
    return await db
      .select()
      .from(institutionDocuments)
      .where(eq(institutionDocuments.institutionId, institutionId))
      .orderBy(desc(institutionDocuments.createdAt));
  }

  async createInstitutionDocument(insertDocument: InsertInstitutionDocument): Promise<InstitutionDocument> {
    const [document] = await db
      .insert(institutionDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteInstitutionDocument(id: number): Promise<boolean> {
    const result = await db.delete(institutionDocuments).where(eq(institutionDocuments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInstitutionDocumentsByType(institutionId: number, documentType: string): Promise<InstitutionDocument[]> {
    return await db
      .select()
      .from(institutionDocuments)
      .where(eq(institutionDocuments.institutionId, institutionId));
  }

  // Checklist Items
  async getChecklistItems(): Promise<ChecklistItem[]> {
    return await db.select().from(checklistItems);
  }

  async getChecklistItemsByComponent(componentType: string): Promise<ChecklistItem[]> {
    return await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.componentType, componentType));
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db
      .insert(checklistItems)
      .values(insertItem)
      .returning();
    return item;
  }

  // Checklist Responses
  async getChecklistResponses(workflowId: number): Promise<ChecklistResponse[]> {
    return await db
      .select()
      .from(checklistResponses)
      .where(eq(checklistResponses.workflowId, workflowId));
  }

  async getChecklistResponse(checklistItemId: number, workflowId: number): Promise<ChecklistResponse | undefined> {
    const responses = await db
      .select()
      .from(checklistResponses)
      .where(and(
        eq(checklistResponses.checklistItemId, checklistItemId),
        eq(checklistResponses.workflowId, workflowId)
      ));
    return responses[0] || undefined;
  }

  async createChecklistResponse(insertResponse: InsertChecklistResponse): Promise<ChecklistResponse> {
    const [response] = await db
      .insert(checklistResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async updateChecklistResponse(id: number, updates: Partial<ChecklistResponse>): Promise<ChecklistResponse | undefined> {
    const [updated] = await db
      .update(checklistResponses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(checklistResponses.id, id))
      .returning();
    return updated || undefined;
  }

  // Alert Notifications
  async getActiveAlerts(institutionId: number, workflowId?: number): Promise<AlertNotification[]> {
    let whereConditions = and(
      eq(alertNotifications.institutionId, institutionId),
      eq(alertNotifications.isActive, true)
    );
    
    if (workflowId) {
      whereConditions = and(
        whereConditions,
        eq(alertNotifications.workflowId, workflowId)
      );
    }
    
    return await db
      .select()
      .from(alertNotifications)
      .where(whereConditions);
  }

  async createAlertNotification(insertAlert: InsertAlertNotification): Promise<AlertNotification> {
    const [alert] = await db
      .insert(alertNotifications)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async markAlertEmailSent(alertId: number): Promise<void> {
    await db
      .update(alertNotifications)
      .set({ 
        emailSent: true, 
        emailSentAt: new Date() 
      })
      .where(eq(alertNotifications.id, alertId));
  }

  async getUsersByInstitution(institutionId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.institutionId, institutionId));
  }

  async getAllInstitutions(): Promise<Institution[]> {
    return await db.select().from(institutions);
  }

  // Nebusis® ControlCore Integration
  async getNebusisIntegration(institutionId: number): Promise<NebusisIntegration | undefined> {
    const results = await db
      .select()
      .from(nebusisIntegrations)
      .where(eq(nebusisIntegrations.institutionId, institutionId))
      .limit(1);
    return results[0];
  }

  async createNebusisIntegration(insertIntegration: InsertNebusisIntegration): Promise<NebusisIntegration> {
    const [integration] = await db
      .insert(nebusisIntegrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateNebusisIntegration(id: number, updates: Partial<NebusisIntegration>): Promise<NebusisIntegration | undefined> {
    const [integration] = await db
      .update(nebusisIntegrations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(nebusisIntegrations.id, id))
      .returning();
    return integration;
  }

  async deleteNebusisIntegration(id: number): Promise<boolean> {
    const result = await db
      .delete(nebusisIntegrations)
      .where(eq(nebusisIntegrations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSyncLogs(integrationId: number, limit = 20): Promise<SyncLog[]> {
    return await db
      .select()
      .from(syncLogs)
      .where(eq(syncLogs.integrationId, integrationId))
      .orderBy(desc(syncLogs.startedAt))
      .limit(limit);
  }

  async createSyncLog(insertLog: InsertSyncLog): Promise<SyncLog> {
    const [log] = await db
      .insert(syncLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async updateSyncLog(id: number, updates: Partial<SyncLog>): Promise<SyncLog | undefined> {
    const [log] = await db
      .update(syncLogs)
      .set(updates)
      .where(eq(syncLogs.id, id))
      .returning();
    return log;
  }

  // Institutional Plans
  async getInstitutionalPlans(institutionId: number): Promise<InstitutionalPlan[]> {
    return await db
      .select()
      .from(institutionalPlans)
      .where(eq(institutionalPlans.institutionId, institutionId))
      .orderBy(desc(institutionalPlans.createdAt));
  }

  async createInstitutionalPlan(plan: InsertInstitutionalPlan): Promise<InstitutionalPlan> {
    const [newPlan] = await db
      .insert(institutionalPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateInstitutionalPlan(id: number, updates: Partial<InstitutionalPlan>): Promise<InstitutionalPlan | undefined> {
    const [updatedPlan] = await db
      .update(institutionalPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(institutionalPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteInstitutionalPlan(id: number): Promise<boolean> {
    const result = await db
      .delete(institutionalPlans)
      .where(eq(institutionalPlans.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Training Records
  async getTrainingRecords(institutionId: number): Promise<TrainingRecord[]> {
    return await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.institutionId, institutionId))
      .orderBy(desc(trainingRecords.createdAt));
  }

  async createTrainingRecord(record: InsertTrainingRecord): Promise<TrainingRecord> {
    const [newRecord] = await db
      .insert(trainingRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async updateTrainingRecord(id: number, updates: Partial<TrainingRecord>): Promise<TrainingRecord | undefined> {
    const [updatedRecord] = await db
      .update(trainingRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trainingRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteTrainingRecord(id: number): Promise<boolean> {
    const result = await db
      .delete(trainingRecords)
      .where(eq(trainingRecords.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getTrainingStats(institutionId: number): Promise<{
    totalTrainings: number;
    completedTrainings: number;
    inProgressTrainings: number;
    totalHours: number;
    topicDistribution: { [key: string]: number };
  }> {
    const records = await this.getTrainingRecords(institutionId);
    
    const totalTrainings = records.length;
    const completedTrainings = records.filter(r => r.status === "completed").length;
    const inProgressTrainings = records.filter(r => r.status === "in_progress").length;
    const totalHours = records.reduce((sum, r) => sum + (r.duration || 0), 0);
    
    const topicDistribution: { [key: string]: number } = {};
    records.forEach(record => {
      topicDistribution[record.trainingTopic] = (topicDistribution[record.trainingTopic] || 0) + 1;
    });

    return {
      totalTrainings,
      completedTrainings,
      inProgressTrainings,
      totalHours,
      topicDistribution
    };
  }

  // Audit Reports
  async getCgrReports(institutionId: number): Promise<CgrReport[]> {
    return await db
      .select()
      .from(cgrReports)
      .where(eq(cgrReports.institutionId, institutionId))
      .orderBy(desc(cgrReports.createdAt));
  }

  async createCgrReport(report: InsertCgrReport): Promise<CgrReport> {
    const [newReport] = await db
      .insert(cgrReports)
      .values(report)
      .returning();
    return newReport;
  }

  async updateCgrReport(id: number, updates: Partial<CgrReport>): Promise<CgrReport | undefined> {
    const [updatedReport] = await db
      .update(cgrReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cgrReports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteCgrReport(id: number): Promise<boolean> {
    const result = await db
      .delete(cgrReports)
      .where(eq(cgrReports.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async submitCgrReport(id: number): Promise<CgrReport | undefined> {
    const [report] = await db
      .update(cgrReports)
      .set({ 
        status: "submitted", 
        submittedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(cgrReports.id, id))
      .returning();
    return report;
  }

  // V4 CONTROLCORE FUNCTIONALITY - TIER 1 IMPLEMENTATIONS
  
  // Strategic Planning (Planificación)
  async getStrategicPlans(institutionId: number): Promise<StrategicPlan[]> {
    return await db
      .select()
      .from(strategicPlans)
      .where(eq(strategicPlans.institutionId, institutionId))
      .orderBy(desc(strategicPlans.createdAt));
  }

  async createStrategicPlan(insertPlan: InsertStrategicPlan): Promise<StrategicPlan> {
    const [plan] = await db
      .insert(strategicPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateStrategicPlan(id: number, updates: Partial<StrategicPlan>): Promise<StrategicPlan | undefined> {
    const [plan] = await db
      .update(strategicPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(strategicPlans.id, id))
      .returning();
    return plan;
  }

  async deleteStrategicPlan(id: number): Promise<boolean> {
    const result = await db
      .delete(strategicPlans)
      .where(eq(strategicPlans.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Cultural Surveys (Encuestas)
  async getCulturalSurveys(institutionId: number): Promise<CulturalSurvey[]> {
    return await db
      .select()
      .from(culturalSurveys)
      .where(eq(culturalSurveys.institutionId, institutionId))
      .orderBy(desc(culturalSurveys.createdAt));
  }

  async createCulturalSurvey(insertSurvey: InsertCulturalSurvey): Promise<CulturalSurvey> {
    const [survey] = await db
      .insert(culturalSurveys)
      .values(insertSurvey)
      .returning();
    return survey;
  }

  async updateCulturalSurvey(id: number, updates: Partial<CulturalSurvey>): Promise<CulturalSurvey | undefined> {
    const [survey] = await db
      .update(culturalSurveys)
      .set(updates)
      .where(eq(culturalSurveys.id, id))
      .returning();
    return survey;
  }

  async deleteCulturalSurvey(id: number): Promise<boolean> {
    const result = await db
      .delete(culturalSurveys)
      .where(eq(culturalSurveys.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    return await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
      .orderBy(desc(surveyResponses.submittedAt));
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const [response] = await db
      .insert(surveyResponses)
      .values(insertResponse)
      .returning();
    return response;
  }
  
  // Internal Audit (Auditoría Interna)
  async getInternalAudits(institutionId: number): Promise<InternalAudit[]> {
    return await db
      .select()
      .from(internalAudits)
      .where(eq(internalAudits.institutionId, institutionId))
      .orderBy(desc(internalAudits.createdAt));
  }

  async createInternalAudit(insertAudit: InsertInternalAudit): Promise<InternalAudit> {
    const [audit] = await db
      .insert(internalAudits)
      .values(insertAudit)
      .returning();
    return audit;
  }

  async updateInternalAudit(id: number, updates: Partial<InternalAudit>): Promise<InternalAudit | undefined> {
    const [audit] = await db
      .update(internalAudits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(internalAudits.id, id))
      .returning();
    return audit;
  }

  async deleteInternalAudit(id: number): Promise<boolean> {
    const result = await db
      .delete(internalAudits)
      .where(eq(internalAudits.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Findings Management (Gestión de Hallazgos)
  async getAuditFindings(institutionId: number, auditId?: number): Promise<AuditFinding[]> {
    let query = db
      .select()
      .from(auditFindings)
      .where(eq(auditFindings.institutionId, institutionId));
    
    if (auditId) {
      query = query.where(eq(auditFindings.auditId, auditId));
    }
    
    return await query.orderBy(desc(auditFindings.createdAt));
  }

  async createAuditFinding(insertFinding: InsertAuditFinding): Promise<AuditFinding> {
    const [finding] = await db
      .insert(auditFindings)
      .values(insertFinding)
      .returning();
    return finding;
  }

  async updateAuditFinding(id: number, updates: Partial<AuditFinding>): Promise<AuditFinding | undefined> {
    const [finding] = await db
      .update(auditFindings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(auditFindings.id, id))
      .returning();
    return finding;
  }

  async deleteAuditFinding(id: number): Promise<boolean> {
    const result = await db
      .delete(auditFindings)
      .where(eq(auditFindings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // License Management
  async getNebusisLicenses(institutionId: number): Promise<NebusisLicense[]> {
    return await db
      .select()
      .from(nebusisLicenses)
      .where(eq(nebusisLicenses.institutionId, institutionId))
      .orderBy(desc(nebusisLicenses.createdAt));
  }

  async createNebusisLicense(insertLicense: InsertNebusisLicense): Promise<NebusisLicense> {
    const [license] = await db
      .insert(nebusisLicenses)
      .values(insertLicense)
      .returning();
    return license;
  }

  async updateNebusisLicense(id: number, updates: Partial<NebusisLicense>): Promise<NebusisLicense | undefined> {
    const [license] = await db
      .update(nebusisLicenses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nebusisLicenses.id, id))
      .returning();
    return license;
  }

  async deleteNebusisLicense(id: number): Promise<boolean> {
    const result = await db
      .delete(nebusisLicenses)
      .where(eq(nebusisLicenses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Executive Dashboard Data
  async getExecutiveDashboardData(institutionId: number): Promise<{
    components: Array<{
      name: string;
      status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
      score: number;
      openAudits: number;
      openFindings: number;
      openActions: number;
    }>;
    trendData: Array<{
      date: string;
      value: number;
    }>;
  }> {
    // Get compliance scores
    const complianceData = await this.getComplianceScores(institutionId);
    const audits = await this.getInternalAudits(institutionId);
    const findings = await this.getAuditFindings(institutionId);
    
    // Component names mapping
    const componentMap = {
      'ambiente_control': 'Ambiente de Control',
      'evaluacion_riesgos': 'Evaluación de Riesgos', 
      'actividades_control': 'Actividades de Control',
      'informacion_comunicacion': 'Información y Comunicación',
      'supervision': 'Supervisión'
    };
    
    const components = Object.entries(componentMap).map(([key, name]) => {
      const score = complianceData.find(c => c.componentType === key)?.score || 0;
      const openAudits = audits.filter(a => a.cosoComponent === key && a.status !== 'completed').length;
      const openFindings = findings.filter(f => f.status === 'open').length;
      
      let status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed' = 'not_assessed';
      if (score >= 90) status = 'compliant';
      else if (score >= 70) status = 'partial';  
      else if (score > 0) status = 'non_compliant';
      
      return {
        name,
        status,
        score,
        openAudits,
        openFindings,
        openActions: openFindings // For now, findings = actions
      };
    });
    
    // Generate trend data for the last 6 months
    const trendData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        date: date.toISOString().slice(0, 7), // YYYY-MM format
        value: Math.floor(Math.random() * 20) + 70 + i * 2 // Simulate improvement over time
      };
    });
    
    return { components, trendData };
  }

  // Planning Module methods
  async getPlanningObjectives(institutionId: number): Promise<PlanningObjective[]> {
    return await db
      .select()
      .from(planningObjectives)
      .where(eq(planningObjectives.institutionId, institutionId))
      .orderBy(desc(planningObjectives.createdAt));
  }

  async createPlanningObjective(objective: InsertPlanningObjective): Promise<PlanningObjective> {
    const [newObjective] = await db
      .insert(planningObjectives)
      .values(objective)
      .returning();
    return newObjective;
  }

  async updatePlanningObjectiveProgress(id: number, progress: number): Promise<PlanningObjective | undefined> {
    const [updatedObjective] = await db
      .update(planningObjectives)
      .set({ progress, updatedAt: new Date() })
      .where(eq(planningObjectives.id, id))
      .returning();
    return updatedObjective;
  }

  async updatePlanningObjectiveStatus(id: number, status: string): Promise<PlanningObjective | undefined> {
    const [updatedObjective] = await db
      .update(planningObjectives)
      .set({ status, updatedAt: new Date() })
      .where(eq(planningObjectives.id, id))
      .returning();
    return updatedObjective;
  }

  async getObjectiveResources(objectiveId: number): Promise<ObjectiveResource[]> {
    return await db
      .select()
      .from(objectiveResources)
      .where(eq(objectiveResources.objectiveId, objectiveId))
      .orderBy(desc(objectiveResources.createdAt));
  }

  async createObjectiveResource(resource: InsertObjectiveResource): Promise<ObjectiveResource> {
    const [newResource] = await db
      .insert(objectiveResources)
      .values(resource)
      .returning();
    return newResource;
  }

  // Assessment Reports and Responses
  async getAssessmentReports(institutionId: number): Promise<AssessmentReport[]> {
    return await db
      .select()
      .from(assessmentReports)
      .where(eq(assessmentReports.institutionId, institutionId))
      .orderBy(desc(assessmentReports.createdAt));
  }

  async getAssessmentReportsByFramework(institutionId: number, framework: string): Promise<AssessmentReport[]> {
    return await db
      .select()
      .from(assessmentReports)
      .where(and(
        eq(assessmentReports.institutionId, institutionId),
        eq(assessmentReports.framework, framework)
      ))
      .orderBy(desc(assessmentReports.createdAt));
  }

  async getAssessmentReportDetails(id: number): Promise<AssessmentReport | undefined> {
    const [report] = await db
      .select()
      .from(assessmentReports)
      .where(eq(assessmentReports.id, id));
    return report || undefined;
  }

  async createAssessmentReport(insertReport: InsertAssessmentReport): Promise<AssessmentReport> {
    const [report] = await db
      .insert(assessmentReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateAssessmentReport(id: number, updates: Partial<AssessmentReport>): Promise<AssessmentReport | undefined> {
    const [report] = await db
      .update(assessmentReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assessmentReports.id, id))
      .returning();
    return report;
  }

  async getAssessmentResponses(reportId: number): Promise<AssessmentResponse[]> {
    return await db
      .select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.assessmentReportId, reportId))
      .orderBy(asc(assessmentResponses.checklistItemId));
  }

  async createAssessmentResponse(insertResponse: InsertAssessmentResponse): Promise<AssessmentResponse> {
    const [response] = await db
      .insert(assessmentResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async upsertAssessmentResponse(insertResponse: InsertAssessmentResponse): Promise<AssessmentResponse> {
    // Check if response already exists
    const existing = await db
      .select()
      .from(assessmentResponses)
      .where(and(
        eq(assessmentResponses.assessmentReportId, insertResponse.assessmentReportId!),
        eq(assessmentResponses.checklistItemId, insertResponse.checklistItemId!)
      ));

    if (existing.length > 0) {
      // Update existing response
      const [updated] = await db
        .update(assessmentResponses)
        .set(insertResponse)
        .where(eq(assessmentResponses.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new response
      return this.createAssessmentResponse(insertResponse);
    }
  }

  async getChecklistItemsByFramework(framework: string): Promise<ChecklistItem[]> {
    if (framework === 'coso') {
      return await db
        .select()
        .from(checklistItems)
        .where(
          or(
            eq(checklistItems.componentType, 'ambiente_control'),
            eq(checklistItems.componentType, 'evaluacion_riesgos'),
            eq(checklistItems.componentType, 'actividades_control'),
            eq(checklistItems.componentType, 'informacion_comunicacion'),
            eq(checklistItems.componentType, 'supervision')
          )
        )
        .orderBy(asc(checklistItems.code));
    } else if (framework === 'intosai') {
      return await db
        .select()
        .from(checklistItems)
        .where(
          or(
            eq(checklistItems.componentType, 'audit_standards'),
            eq(checklistItems.componentType, 'independence'),
            eq(checklistItems.componentType, 'quality_control'),
            eq(checklistItems.componentType, 'performance_audit'),
            eq(checklistItems.componentType, 'financial_audit'),
            eq(checklistItems.componentType, 'compliance_audit')
          )
        )
        .orderBy(asc(checklistItems.code));
    }
    return [];
  }

  // Workflow Execution Assessment Methods Implementation
  async getWorkflowExecutionAssessments(institutionId: number): Promise<WorkflowExecutionAssessment[]> {
    try {
      // Debug: check total count first
      const count = await db
        .select({ count: sql`COUNT(*)` })
        .from(workflowExecutionAssessments);
      
      console.log("Total workflow assessments in database:", count[0]?.count);
      
      // Return all assessments for now, since we seed with default data
      const assessments = await db
        .select()
        .from(workflowExecutionAssessments)
        .orderBy(desc(workflowExecutionAssessments.assessmentDate));
        
      console.log("Query returned assessments:", assessments.length);
      return assessments;
    } catch (error) {
      console.error("Database query error:", error);
      return [];
    }
  }

  async getWorkflowExecutionAssessment(id: number): Promise<WorkflowExecutionAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(workflowExecutionAssessments)
      .where(eq(workflowExecutionAssessments.id, id));
    return assessment;
  }

  async createWorkflowExecutionAssessment(assessment: InsertWorkflowExecutionAssessment): Promise<WorkflowExecutionAssessment> {
    const [created] = await db
      .insert(workflowExecutionAssessments)
      .values(assessment)
      .returning();
    return created;
  }

  async updateWorkflowExecutionAssessment(id: number, updates: Partial<WorkflowExecutionAssessment>): Promise<WorkflowExecutionAssessment | undefined> {
    const [updated] = await db
      .update(workflowExecutionAssessments)
      .set(updates)
      .where(eq(workflowExecutionAssessments.id, id))
      .returning();
    return updated;
  }

  async getWorkflowStepAssessments(executionAssessmentId: number): Promise<WorkflowStepAssessment[]> {
    return await db
      .select()
      .from(workflowStepAssessments)
      .where(eq(workflowStepAssessments.executionAssessmentId, executionAssessmentId))
      .orderBy(asc(workflowStepAssessments.workflowStepId));
  }

  async createWorkflowStepAssessment(stepAssessment: InsertWorkflowStepAssessment): Promise<WorkflowStepAssessment> {
    const [created] = await db
      .insert(workflowStepAssessments)
      .values(stepAssessment)
      .returning();
    return created;
  }

  async getWorkflowDeviations(executionAssessmentId: number): Promise<WorkflowDeviation[]> {
    return await db
      .select()
      .from(workflowDeviations)
      .where(eq(workflowDeviations.executionAssessmentId, executionAssessmentId))
      .orderBy(desc(workflowDeviations.identifiedAt));
  }

  async createWorkflowDeviation(deviation: InsertWorkflowDeviation): Promise<WorkflowDeviation> {
    const [created] = await db
      .insert(workflowDeviations)
      .values(deviation)
      .returning();
    return created;
  }

  async updateWorkflowDeviation(id: number, updates: Partial<WorkflowDeviation>): Promise<WorkflowDeviation | undefined> {
    const [updated] = await db
      .update(workflowDeviations)
      .set(updates)
      .where(eq(workflowDeviations.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
