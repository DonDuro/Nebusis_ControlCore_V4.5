import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // admin, supervisor, user
  supervisorId: integer("supervisor_id"), // reference to supervisor user
  institutionId: integer("institution_id"),
  emailNotifications: boolean("email_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // ministry, direction, department
  sector: text("sector"), // public, private
  legalBasis: text("legal_basis"), // law, decree, ordinance
  sectorRegulations: text("sector_regulations").array(),
  size: text("size").notNull(), // large, medium, small
  country: text("country"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"), // URL or path to institution logo
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  componentType: text("component_type").notNull(), // ambiente_control, evaluacion_riesgos, actividades_control, informacion_comunicacion, supervision
  status: text("status").notNull().default("not_started"), // not_started, in_progress, under_review, completed, observed
  progress: integer("progress").default(0), // 0-100
  institutionId: integer("institution_id").notNull(),
  assignedToId: integer("assigned_to_id"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  assignedToId: integer("assigned_to_id"),
  responsibleRole: text("responsible_role"), // Role or position responsible
  trigger: text("trigger").notNull().default("manual"), // manual, automatic, after_previous
  expectedOutput: text("expected_output"),
  estimatedDuration: text("estimated_duration"), // e.g., "5 days", "2 hours"
  requiredResources: text("required_resources").array(), // Resources needed
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  workflowStepId: integer("workflow_step_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedById: integer("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // workflow_completed, evidence_uploaded, user_assigned, etc.
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  workflowId: integer("workflow_id"),
  institutionId: integer("institution_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceScores = pgTable("compliance_scores", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  componentType: text("component_type").notNull(),
  score: integer("score").notNull(), // 0-100
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const institutionDocuments = pgTable("institution_documents", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  documentType: text("document_type").notNull(), // creation_law, regulations, organigramma, policies, control_reports, etc.
  description: text("description"),
  // Enhanced Document Analysis Fields
  analysisStatus: text("analysis_status").default("pending"), // pending, processing, completed, failed
  controlFrameworkMapping: jsonb("control_framework_mapping"), // COSO/INTOSAI element mappings with page references
  coverageScore: integer("coverage_score"), // 0-100% relevance score
  controlRelevanceTags: text("control_relevance_tags").array(), // tags like "Policy Document", "Evidence", "Risk Register", etc.
  improvementRecommendations: jsonb("improvement_recommendations"), // AI-generated suggestions for strengthening document
  detectedGaps: jsonb("detected_gaps"), // identified compliance gaps and missing elements
  mappedSections: jsonb("mapped_sections"), // specific page/section mappings to control elements
  versionNumber: integer("version_number").default(1), // document version tracking
  auditTrail: jsonb("audit_trail"), // upload metadata, framework selection, etc.
  integrationActions: jsonb("integration_actions"), // available actions for workflow/element linking
  // Legacy COSO mapping fields (maintained for compatibility)
  cosoComponent: text("coso_component"), // ambiente_control, evaluacion_riesgos, etc.
  cosoPrinciple: text("coso_principle"), // specific principle within component
  uploadedById: integer("uploaded_by_id").notNull(),
  analyzedAt: timestamp("analyzed_at"),
  analysisResult: jsonb("analysis_result"), // comprehensive AI analysis results
  createdAt: timestamp("created_at").defaultNow(),
});

export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., "1.1", "2.3"
  requirement: text("requirement").notNull(),
  verificationQuestion: text("verification_question").notNull(),
  componentType: text("component_type").notNull(), // ambiente_control, evaluacion_riesgos, etc.
  standardNumber: integer("standard_number").default(1), // 1-17 for the 17 COSO standards
  createdAt: timestamp("created_at").defaultNow(),
});

// Workflow Execution Assessments - New tables for workflow execution fidelity evaluation
export const workflowExecutionAssessments = pgTable("workflow_execution_assessments", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  assessorId: integer("assessor_id").notNull(),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  executionStatus: text("execution_status").notNull(), // in_progress, completed, delayed, cancelled
  overallFidelityScore: integer("overall_fidelity_score"), // 0-100, how well execution matches design
  designComplianceScore: integer("design_compliance_score"), // 0-100, adherence to original design
  timelineComplianceScore: integer("timeline_compliance_score"), // 0-100, adherence to planned timeline
  qualityScore: integer("quality_score"), // 0-100, quality of execution outputs
  overallFindings: text("overall_findings"),
  recommendations: text("recommendations"),
  nextAssessmentDate: timestamp("next_assessment_date"),
  status: text("status").notNull().default("draft"), // draft, final, under_review
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowStepAssessments = pgTable("workflow_step_assessments", {
  id: serial("id").primaryKey(),
  executionAssessmentId: integer("execution_assessment_id").notNull(),
  workflowStepId: integer("workflow_step_id").notNull(),
  stepName: text("step_name").notNull(),
  plannedDuration: text("planned_duration"), // Original estimated duration
  actualDuration: text("actual_duration"), // Actual time taken
  plannedStartDate: timestamp("planned_start_date"),
  actualStartDate: timestamp("actual_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  designAdherence: text("design_adherence").notNull(), // fully_compliant, partially_compliant, non_compliant, not_applicable
  executionQuality: text("execution_quality").notNull(), // excellent, good, satisfactory, needs_improvement
  outputCompliance: text("output_compliance").notNull(), // meets_requirements, partially_meets, does_not_meet
  deviationReasons: text("deviation_reasons"),
  improvementAreas: text("improvement_areas"),
  stepFindings: text("step_findings"),
  evidenceReview: text("evidence_review"), // assessment of provided evidence quality
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowDeviations = pgTable("workflow_deviations", {
  id: serial("id").primaryKey(),
  executionAssessmentId: integer("execution_assessment_id").notNull(),
  workflowStepId: integer("workflow_step_id"),
  deviationType: text("deviation_type").notNull(), // timeline, process, quality, resource, responsibility
  severity: text("severity").notNull(), // critical, major, minor, informational
  description: text("description").notNull(),
  impactAnalysis: text("impact_analysis"),
  correctionTaken: text("correction_taken"),
  preventiveMeasures: text("preventive_measures"),
  identifiedBy: integer("identified_by").notNull(),
  identifiedAt: timestamp("identified_at").defaultNow(),
  status: text("status").notNull().default("open"), // open, under_review, resolved, closed
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by"),
});

export const checklistResponses = pgTable("checklist_responses", {
  id: serial("id").primaryKey(),
  checklistItemId: integer("checklist_item_id").notNull(),
  workflowId: integer("workflow_id").notNull(),
  institutionId: integer("institution_id").notNull(),
  response: text("response"), // user's text response
  status: text("status").notNull().default("pending"), // pending, compliant, non_compliant, partial
  linkedDocumentIds: integer("linked_document_ids").array().default([]),
  linkedEvidenceIds: integer("linked_evidence_ids").array().default([]),
  respondedById: integer("responded_by_id"),
  respondedAt: timestamp("responded_at"),
  reviewedById: integer("reviewed_by_id"),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alertNotifications = pgTable("alert_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // deadline_approaching, overdue, review_required, high_priority
  priority: text("priority").notNull().default("media"), // alta, media, baja
  institutionId: integer("institution_id").notNull(),
  workflowId: integer("workflow_id"),
  assignedToId: integer("assigned_to_id"),
  dueDate: timestamp("due_date"),
  isActive: boolean("is_active").default(true),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nebusisIntegrations = pgTable("nebusis_integrations", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  integrationName: text("integration_name").notNull().default("NEBUSIS® Management System Wizard"),
  apiEndpoint: text("api_endpoint").notNull(),
  apiKey: text("api_key").notNull(),
  organizationId: text("organization_id").notNull(), // Organization ID in the external system
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: text("sync_status").default("pending"), // pending, syncing, completed, error
  syncSettings: jsonb("sync_settings").default({
    syncDocuments: true,
    syncPersonnel: true,
    syncOrganizationalStructure: true,
    syncPolicies: true,
    syncProcesses: false,
    autoSync: false,
    syncFrequency: "manual" // manual, daily, weekly
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull(),
  syncType: text("sync_type").notNull(), // documents, personnel, organizational_structure, policies
  direction: text("direction").notNull(), // import, export, bidirectional
  status: text("status").notNull(), // started, in_progress, completed, failed
  recordsProcessed: integer("records_processed").default(0),
  recordsSucceeded: integer("records_succeeded").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  syncDetails: jsonb("sync_details"), // Detailed log of what was synced
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// New table for institutional plans (PEI/POA)
export const institutionalPlans = pgTable("institutional_plans", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  planType: text("plan_type").notNull(), // "PEI" or "POA"
  planName: text("plan_name").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedById: integer("uploaded_by_id").notNull(),
  status: text("status").notNull().default("active"), // active, archived, draft
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table for training records
export const trainingRecords = pgTable("training_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionId: integer("institution_id").notNull(),
  trainingTitle: text("training_title").notNull(),
  trainingType: text("training_type").notNull(), // "curso", "taller", "seminario", "certificacion"
  trainingTopic: text("training_topic").notNull(), // "control_interno", "auditoria", "riesgos", "compliance"
  provider: text("provider"), // Training provider/institution
  duration: integer("duration"), // Duration in hours
  completionDate: timestamp("completion_date"),
  certificateFileName: text("certificate_file_name"),
  certificateFilePath: text("certificate_file_path"),
  certificateFileSize: integer("certificate_file_size"),
  certificateMimeType: text("certificate_mime_type"),
  status: text("status").notNull().default("completed"), // completed, in_progress, planned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NEW TABLES FOR CONTROLCORE VERSION 4 - TIER 1 FUNCTIONALITY

// Planning Module (Planificación)
export const planningObjectives = pgTable("planning_objectives", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  frameworkComponent: text("framework_component").notNull(), // ambiente_control, evaluacion_riesgos, actividades_control, informacion_comunicacion, supervision
  expectedOutcome: text("expected_outcome").notNull(),
  ownerResponsible: text("owner_responsible").notNull(),
  resourcesRequired: text("resources_required").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed, on_hold
  progress: integer("progress").default(0), // 0-100
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const objectiveResources = pgTable("objective_resources", {
  id: serial("id").primaryKey(),
  objectiveId: integer("objective_id").notNull(),
  resourceType: text("resource_type").notNull(), // person, department, external_consultant
  resourceName: text("resource_name").notNull(),
  roleDescription: text("role_description"),
  assignedById: integer("assigned_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cultural Surveys Module (Encuestas)
export const culturalSurveys = pgTable("cultural_surveys", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(), // array of survey questions
  isAnonymous: boolean("is_anonymous").default(true),
  status: text("status").notNull().default("draft"), // draft, active, completed, archived
  responseCount: integer("response_count").default(0),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  institutionId: integer("institution_id").notNull(),
  responses: jsonb("responses").notNull(), // user responses to all questions
  respondedById: integer("responded_by_id"), // null if anonymous
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Internal Audit Module (Auditoría Interna)
export const internalAudits = pgTable("internal_audits", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  title: text("title").notNull(),
  auditArea: text("audit_area").notNull(), // department/area being audited
  cosoComponent: text("coso_component"), // optional COSO component focus
  auditType: text("audit_type").notNull().default("compliance"), // compliance, operational, financial
  auditorId: integer("auditor_id").notNull(), // assigned auditor
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, cancelled
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  scope: text("scope"), // audit scope description
  objectives: text("objectives"), // audit objectives
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Findings Management Module (Gestión de Hallazgos)
export const auditFindings = pgTable("audit_findings", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id"), // can be null for non-audit findings
  institutionId: integer("institution_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  findingArea: text("finding_area").notNull(), // department/process where finding occurred
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  recommendedAction: text("recommended_action"),
  responsiblePersonId: integer("responsible_person_id"),
  dueDate: timestamp("due_date"),
  actualResolutionDate: timestamp("actual_resolution_date"),
  resolutionComments: text("resolution_comments"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// License detection for Tier 2 functionality
export const nebusisLicenses = pgTable("nebusis_licenses", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  productName: text("product_name").notNull(), // PerformanceTracker, PowerDocs, etc.
  licenseKey: text("license_key").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  features: jsonb("features"), // available features for this license
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table for audit reporting
export const cgrReports = pgTable("cgr_reports", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  reportType: text("report_type").notNull(), // "cumplimiento", "autoevaluacion", "seguimiento"
  reportPeriod: text("report_period").notNull(), // "2024-Q1", "2024-Annual", etc.
  reportData: jsonb("report_data").notNull(),
  generatedById: integer("generated_by_id").notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, approved
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({
  id: true,
  createdAt: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertInstitutionDocumentSchema = createInsertSchema(institutionDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
});

export const insertChecklistResponseSchema = createInsertSchema(checklistResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertNotificationSchema = createInsertSchema(alertNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertNebusisIntegrationSchema = createInsertSchema(nebusisIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  startedAt: true,
});

export const insertInstitutionalPlanSchema = createInsertSchema(institutionalPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Add Strategic Plans table that storage.ts is looking for
export const strategicPlans = pgTable("strategic_plans", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  objectives: jsonb("objectives"), // Strategic objectives
  status: text("status").notNull().default("draft"), // draft, active, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStrategicPlanSchema = createInsertSchema(strategicPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// NEW SCHEMAS FOR CONTROLCORE VERSION 4 TABLES
export const insertPlanningObjectiveSchema = createInsertSchema(planningObjectives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  endDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export const insertObjectiveResourceSchema = createInsertSchema(objectiveResources).omit({
  id: true,
  createdAt: true,
});

export const insertCulturalSurveySchema = createInsertSchema(culturalSurveys).omit({
  id: true,
  createdAt: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  submittedAt: true,
});

export const insertInternalAuditSchema = createInsertSchema(internalAudits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditFindingSchema = createInsertSchema(auditFindings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNebusisLicenseSchema = createInsertSchema(nebusisLicenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingRecordSchema = createInsertSchema(trainingRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCgrReportSchema = createInsertSchema(cgrReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Workflow Execution Assessment schemas  
export const insertWorkflowExecutionAssessmentSchema = createInsertSchema(workflowExecutionAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowStepAssessmentSchema = createInsertSchema(workflowStepAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowDeviationSchema = createInsertSchema(workflowDeviations).omit({
  id: true,
  identifiedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type ComplianceScore = typeof complianceScores.$inferSelect;
export type InstitutionDocument = typeof institutionDocuments.$inferSelect;
export type InsertInstitutionDocument = z.infer<typeof insertInstitutionDocumentSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type ChecklistResponse = typeof checklistResponses.$inferSelect;
export type InsertChecklistResponse = z.infer<typeof insertChecklistResponseSchema>;
export type AlertNotification = typeof alertNotifications.$inferSelect;
export type InsertAlertNotification = z.infer<typeof insertAlertNotificationSchema>;
export type NebusisIntegration = typeof nebusisIntegrations.$inferSelect;
export type InsertNebusisIntegration = z.infer<typeof insertNebusisIntegrationSchema>;
export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type InstitutionalPlan = typeof institutionalPlans.$inferSelect;
export type InsertInstitutionalPlan = z.infer<typeof insertInstitutionalPlanSchema>;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type CgrReport = typeof cgrReports.$inferSelect;
export type InsertCgrReport = z.infer<typeof insertCgrReportSchema>;

// NEW TYPES FOR CONTROLCORE VERSION 4
export type PlanningObjective = typeof planningObjectives.$inferSelect;
export type InsertPlanningObjective = z.infer<typeof insertPlanningObjectiveSchema>;
export type ObjectiveResource = typeof objectiveResources.$inferSelect;
export type InsertObjectiveResource = z.infer<typeof insertObjectiveResourceSchema>;
export type WorkflowExecutionAssessment = typeof workflowExecutionAssessments.$inferSelect;
export type InsertWorkflowExecutionAssessment = z.infer<typeof insertWorkflowExecutionAssessmentSchema>;
export type WorkflowStepAssessment = typeof workflowStepAssessments.$inferSelect;
export type InsertWorkflowStepAssessment = z.infer<typeof insertWorkflowStepAssessmentSchema>;
export type WorkflowDeviation = typeof workflowDeviations.$inferSelect;
export type InsertWorkflowDeviation = z.infer<typeof insertWorkflowDeviationSchema>;
export type CulturalSurvey = typeof culturalSurveys.$inferSelect;
export type InsertCulturalSurvey = z.infer<typeof insertCulturalSurveySchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type InternalAudit = typeof internalAudits.$inferSelect;
export type InsertInternalAudit = z.infer<typeof insertInternalAuditSchema>;
export type AuditFinding = typeof auditFindings.$inferSelect;
export type InsertAuditFinding = z.infer<typeof insertAuditFindingSchema>;
export type NebusisLicense = typeof nebusisLicenses.$inferSelect;
export type InsertNebusisLicense = z.infer<typeof insertNebusisLicenseSchema>;

// Assessment reports generated from self-assessments
export const assessmentReports = pgTable("assessment_reports", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id),
  framework: text("framework"), // 'coso' or 'intosai'
  componentType: text("component_type"), // component being assessed
  title: text("title"),
  conductedBy: text("conducted_by"), // name of person conducting assessment
  conductedById: integer("conducted_by_id").references(() => users.id),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  totalItems: integer("total_items"),
  compliantItems: integer("compliant_items"),
  partialItems: integer("partial_items"),
  nonCompliantItems: integer("non_compliant_items"),
  overallScore: integer("overall_score"), // percentage
  findings: text("findings").array(), // array of findings based on responses
  recommendations: text("recommendations").array(),
  status: text("status").default("draft"), // 'draft', 'final', 'reviewed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Assessment responses for self-assessments (not tied to workflows)
export const assessmentResponses = pgTable("assessment_responses", {
  id: serial("id").primaryKey(),
  assessmentReportId: integer("assessment_report_id").references(() => assessmentReports.id),
  checklistItemId: integer("checklist_item_id").references(() => checklistItems.id),
  response: text("response"), // 'cumple', 'no_cumple', 'parcialmente'
  observations: text("observations"),
  evidenceDocuments: text("evidence_documents").array(),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas for assessment tables
export const insertAssessmentReportSchema = createInsertSchema(assessmentReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentResponseSchema = createInsertSchema(assessmentResponses).omit({
  id: true,
  createdAt: true,
});

// Types for assessment tables
export type AssessmentReport = typeof assessmentReports.$inferSelect;
export type InsertAssessmentReport = z.infer<typeof insertAssessmentReportSchema>;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type InsertAssessmentResponse = z.infer<typeof insertAssessmentResponseSchema>;
