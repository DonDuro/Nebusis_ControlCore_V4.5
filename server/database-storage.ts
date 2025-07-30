import { 
  users, institutions, workflows, workflowSteps, evidence, activities, complianceScores, institutionDocuments,
  checklistItems, checklistResponses, alertNotifications, nebusisIntegrations, syncLogs,
  institutionalPlans, trainingRecords, cgrReports,
  type User, type InsertUser, type Institution, type InsertInstitution,
  type Workflow, type InsertWorkflow, type WorkflowStep, type InsertWorkflowStep,
  type Evidence, type InsertEvidence, type Activity, type InsertActivity,
  type ComplianceScore, type InstitutionDocument, type InsertInstitutionDocument,
  type ChecklistItem, type InsertChecklistItem, type ChecklistResponse, type InsertChecklistResponse,
  type AlertNotification, type InsertAlertNotification, type NebusisIntegration, type InsertNebusisIntegration,
  type SyncLog, type InsertSyncLog, type InstitutionalPlan, type InsertInstitutionalPlan,
  type TrainingRecord, type InsertTrainingRecord, type CgrReport, type InsertCgrReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Existing methods would go here...
  
  // For now, let's implement the new methods needed for the three new features
  
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
    return result.rowCount > 0;
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
    return result.rowCount > 0;
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
    return result.rowCount > 0;
  }

  async submitCgrReport(id: number): Promise<CgrReport | undefined> {
    const [submittedReport] = await db
      .update(cgrReports)
      .set({ 
        status: "submitted", 
        submittedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(cgrReports.id, id))
      .returning();
    return submittedReport;
  }

  // Placeholder implementations for other required methods - would need full implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getInstitution(id: number): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution;
  }

  async createInstitution(institution: InsertInstitution): Promise<Institution> {
    const [newInstitution] = await db.insert(institutions).values(institution).returning();
    return newInstitution;
  }

  // Additional placeholder methods would go here...
  async getWorkflow(id: number): Promise<Workflow | undefined> { throw new Error("Not implemented"); }
  async getWorkflowsByInstitution(institutionId: number): Promise<Workflow[]> { throw new Error("Not implemented"); }
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> { throw new Error("Not implemented"); }
  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | undefined> { throw new Error("Not implemented"); }
  async getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]> { throw new Error("Not implemented"); }
  async createWorkflowStep(step: InsertWorkflowStep): Promise<WorkflowStep> { throw new Error("Not implemented"); }
  async updateWorkflowStep(id: number, updates: Partial<WorkflowStep>): Promise<WorkflowStep | undefined> { throw new Error("Not implemented"); }
  async getEvidenceByStep(stepId: number): Promise<Evidence[]> { throw new Error("Not implemented"); }
  async createEvidence(evidence: InsertEvidence): Promise<Evidence> { throw new Error("Not implemented"); }
  async getRecentActivities(institutionId: number, limit?: number): Promise<Activity[]> { throw new Error("Not implemented"); }
  async createActivity(activity: InsertActivity): Promise<Activity> { throw new Error("Not implemented"); }
  async getComplianceScores(institutionId: number): Promise<ComplianceScore[]> { throw new Error("Not implemented"); }
  async updateComplianceScore(institutionId: number, componentType: string, score: number): Promise<ComplianceScore> { throw new Error("Not implemented"); }
  async getDashboardStats(institutionId: number): Promise<{ activeWorkflows: number; completedWorkflows: number; underReview: number; overallProgress: number; }> { throw new Error("Not implemented"); }
  async getInstitutionDocuments(institutionId: number): Promise<InstitutionDocument[]> { throw new Error("Not implemented"); }
  async createInstitutionDocument(document: InsertInstitutionDocument): Promise<InstitutionDocument> { throw new Error("Not implemented"); }
  async deleteInstitutionDocument(id: number): Promise<boolean> { throw new Error("Not implemented"); }
  async getInstitutionDocumentsByType(institutionId: number, documentType: string): Promise<InstitutionDocument[]> { throw new Error("Not implemented"); }
  async getChecklistItems(): Promise<ChecklistItem[]> { throw new Error("Not implemented"); }
  async getChecklistItemsByComponent(componentType: string): Promise<ChecklistItem[]> { throw new Error("Not implemented"); }
  async createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem> { throw new Error("Not implemented"); }
  async getChecklistResponses(workflowId: number): Promise<ChecklistResponse[]> { throw new Error("Not implemented"); }
  async getChecklistResponse(checklistItemId: number, workflowId: number): Promise<ChecklistResponse | undefined> { throw new Error("Not implemented"); }
  async createChecklistResponse(response: InsertChecklistResponse): Promise<ChecklistResponse> { throw new Error("Not implemented"); }
  async updateChecklistResponse(id: number, updates: Partial<ChecklistResponse>): Promise<ChecklistResponse | undefined> { throw new Error("Not implemented"); }
  async getActiveAlerts(institutionId: number, workflowId?: number): Promise<AlertNotification[]> { throw new Error("Not implemented"); }
  async createAlertNotification(alert: InsertAlertNotification): Promise<AlertNotification> { throw new Error("Not implemented"); }
  async markAlertEmailSent(alertId: number): Promise<void> { throw new Error("Not implemented"); }
  async getUsersByInstitution(institutionId: number): Promise<User[]> { throw new Error("Not implemented"); }
  async getAllInstitutions(): Promise<Institution[]> { throw new Error("Not implemented"); }
  async getNebusisIntegration(institutionId: number): Promise<NebusisIntegration | undefined> { throw new Error("Not implemented"); }
  async createNebusisIntegration(integration: InsertNebusisIntegration): Promise<NebusisIntegration> { throw new Error("Not implemented"); }
  async updateNebusisIntegration(id: number, updates: Partial<NebusisIntegration>): Promise<NebusisIntegration | undefined> { throw new Error("Not implemented"); }
  async deleteNebusisIntegration(id: number): Promise<boolean> { throw new Error("Not implemented"); }
  async getSyncLogs(integrationId: number, limit?: number): Promise<SyncLog[]> { throw new Error("Not implemented"); }
  async createSyncLog(log: InsertSyncLog): Promise<SyncLog> { throw new Error("Not implemented"); }
  async updateSyncLog(id: number, updates: Partial<SyncLog>): Promise<SyncLog | undefined> { throw new Error("Not implemented"); }
}