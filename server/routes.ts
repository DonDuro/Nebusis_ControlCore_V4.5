import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertWorkflowSchema, insertWorkflowStepSchema, insertEvidenceSchema, insertInstitutionDocumentSchema, insertChecklistResponseSchema,
  insertPlanningObjectiveSchema, insertObjectiveResourceSchema, insertCulturalSurveySchema, insertSurveyResponseSchema, 
  insertInternalAuditSchema, insertAuditFindingSchema, insertNebusisLicenseSchema,
  insertWorkflowExecutionAssessmentSchema, insertWorkflowStepAssessmentSchema, insertWorkflowDeviationSchema
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import express from "express";
import PDFDocument from "pdfkit";

// Initialize Stripe (optional)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static assets
  app.use('/api/assets', express.static(path.resolve(process.cwd(), 'attached_assets')));

  // Demo login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Demo credentials validation
      const validCredentials = [
        { email: "ana.rodriguez@hacienda.gob.do", password: "nobaci2024" },
        { email: "aquezada@qsiglobalventures.com", password: "demo2024" },
        { email: "calvarado@nebusis.com", password: "admin2024" },
        { email: "dzambrano@nebusis.com", password: "admin2024" },
        { email: "ymontoya@qsiglobalventures.com", password: "video2024" }
      ];
      
      const isValid = validCredentials.some(cred => 
        cred.email === email && cred.password === password
      );
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // For demo, create user response based on email
      const getUserData = (email: string) => {
        switch (email) {
          case "ana.rodriguez@hacienda.gob.do":
            return { id: 1, name: "Ana Rodriguez", role: "admin", institutionId: 1 };
          case "aquezada@qsiglobalventures.com":
            return { id: 2, name: "A. Quezada", role: "admin", institutionId: 1 };
          case "calvarado@nebusis.com":
            return { id: 3, name: "Celso Alvarado - Nebusis President", role: "admin", institutionId: 1 };
          case "dzambrano@nebusis.com":
            return { id: 4, name: "David Zambrano - Nebusis CTO", role: "admin", institutionId: 1 };
          case "ymontoya@qsiglobalventures.com":
            return { id: 5, name: "Yerardy Montoya - QSI Global Ventures", role: "admin", institutionId: 1 };
          default:
            return { id: 1, name: "Admin User", role: "admin", institutionId: 1 };
        }
      };
      
      const userData = getUserData(email);
      const user = {
        ...userData,
        email: email
      };
      
      // Generate a session token
      const sessionToken = Math.random().toString(36).substring(7) + Date.now();
      (app as any).activeSessions = (app as any).activeSessions || new Map();
      (app as any).activeSessions.set(sessionToken, { email, timestamp: Date.now() });
      
      res.json({ user, sessionToken });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile endpoints
  app.get("/api/user/profile", async (req, res) => {
    try {
      const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
      
      // Check if session is active
      (app as any).activeSessions = (app as any).activeSessions || new Map();
      const session = (app as any).activeSessions.get(sessionToken);
      
      if (!session) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Return user profile data based on email
      const getUserProfile = (email: string) => {
        switch (email) {
          case "ana.rodriguez@hacienda.gob.do":
            return { 
              id: 1, 
              name: "Ana Rodriguez", 
              email: email,
              role: "admin", 
              institutionId: 1,
              firstName: "Ana",
              lastName: "Rodriguez"
            };
          case "aquezada@qsiglobalventures.com":
            return { 
              id: 2, 
              name: "A. Quezada", 
              email: email,
              role: "admin", 
              institutionId: 1,
              firstName: "Antonia",
              lastName: "Quezada"
            };
          case "calvarado@nebusis.com":
            return { 
              id: 3, 
              name: "Celso Alvarado - Nebusis President", 
              email: email,
              role: "admin", 
              institutionId: 1,
              firstName: "Celso",
              lastName: "Alvarado"
            };
          case "dzambrano@nebusis.com":
            return { 
              id: 4, 
              name: "David Zambrano - Nebusis CTO", 
              email: email,
              role: "admin", 
              institutionId: 1,
              firstName: "David",
              lastName: "Zambrano"
            };
          case "ymontoya@qsiglobalventures.com":
            return { 
              id: 5, 
              name: "Yerardy Montoya - QSI Global Ventures", 
              email: email,
              role: "admin", 
              institutionId: 1,
              firstName: "Yerardy",
              lastName: "Montoya"
            };
          default:
            return { 
              id: 1, 
              name: "Admin User", 
              email: email,
              role: "admin", 
              institutionId: 1,
              firstName: "Usuario",
              lastName: "Admin"
            };
        }
      };
      
      const profile = getUserProfile(session.email);
      res.json(profile);
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
      
      // Check if session is active
      (app as any).activeSessions = (app as any).activeSessions || new Map();
      const session = (app as any).activeSessions.get(sessionToken);
      
      if (!session) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // For demo purposes, just return success
      const { firstName, lastName } = req.body;
      
      res.json({ 
        message: "Perfil actualizado exitosamente",
        profile: {
          firstName,
          lastName,
          email: session.email
        }
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/profile/photo", async (req, res) => {
    try {
      const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
      
      // Check if session is active
      (app as any).activeSessions = (app as any).activeSessions || new Map();
      const session = (app as any).activeSessions.get(sessionToken);
      
      if (!session) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // For demo purposes, just return success
      res.json({ 
        message: "Foto de perfil actualizada exitosamente",
        photoUrl: "/api/assets/default-profile.jpg"
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { sessionToken } = req.body;
      
      // Remove session from active sessions
      (app as any).activeSessions = (app as any).activeSessions || new Map();
      (app as any).activeSessions.delete(sessionToken);
      
      res.json({ message: "Sesión cerrada exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Password reset request
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      // In a real app, you would send an email here
      // For demo purposes, we'll just simulate success
      console.log(`Password reset requested for: ${email}`);
      
      res.json({ 
        message: "Password reset link sent", 
        email: email 
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Error sending reset email" });
    }
  });

  // Change password
  app.put("/api/users/:id/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = parseInt(req.params.id);
      
      // In a real app, you would verify the current password and update it
      // For demo purposes, we'll simulate success
      console.log(`Password change requested for user ${userId}`);
      
      res.json({ 
        message: "Password changed successfully",
        userId: userId 
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Error changing password" });
    }
  });

  // Update user notification preferences
  app.put("/api/users/:id/notifications", async (req, res) => {
    try {
      const { emailNotifications } = req.body;
      const userId = parseInt(req.params.id);
      
      // In a real app, you would update user preferences in database
      console.log(`Notification preferences updated for user ${userId}: ${emailNotifications}`);
      
      res.json({ 
        message: "Preferences updated",
        userId: userId,
        emailNotifications: emailNotifications
      });
    } catch (error) {
      console.error("Preferences update error:", error);
      res.status(500).json({ message: "Error updating preferences" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
      
      // Check if session is active
      (app as any).activeSessions = (app as any).activeSessions || new Map();
      const session = (app as any).activeSessions.get(sessionToken);
      
      if (!session) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // For demo, return user response based on email
      const getUserData = (email: string) => {
        switch (email) {
          case "ana.rodriguez@hacienda.gob.do":
            return { id: 1, name: "Ana Rodriguez", firstName: "Ana", lastName: "Rodriguez", role: "admin", institutionId: 1, emailNotifications: true };
          case "aquezada@qsiglobalventures.com":
            return { id: 2, name: "A. Quezada", firstName: "Antonia", lastName: "Quezada", role: "admin", institutionId: 1, emailNotifications: true };
          case "calvarado@nebusis.com":
            return { id: 3, name: "Celso Alvarado - Nebusis President", firstName: "Celso", lastName: "Alvarado", role: "admin", institutionId: 1, emailNotifications: true };
          case "dzambrano@nebusis.com":
            return { id: 4, name: "David Zambrano - Nebusis CTO", firstName: "David", lastName: "Zambrano", role: "admin", institutionId: 1, emailNotifications: true };
          case "ymontoya@qsiglobalventures.com":
            return { id: 5, name: "Yerardy Montoya - QSI Global Ventures", firstName: "Yerardy", lastName: "Montoya", role: "admin", institutionId: 1, emailNotifications: true };
          default:
            return { id: 1, name: "Admin User", firstName: "Usuario", lastName: "Admin", role: "admin", institutionId: 1, emailNotifications: true };
        }
      };
      
      const userData = getUserData(session.email);
      const user = {
        ...userData,
        email: session.email
      };
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get institution
  app.get("/api/institutions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const institution = await storage.getInstitution(id);
      if (!institution) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }
      res.json(institution);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get workflows
  app.get("/api/workflows", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const workflows = await storage.getWorkflowsByInstitution(institutionId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create workflow with steps
  app.post("/api/workflows", async (req, res) => {
    try {
      const { steps, ...workflowData } = req.body;
      
      // Validate workflow data
      const validatedWorkflowData = insertWorkflowSchema.parse(workflowData);
      
      // Create the workflow first
      const workflow = await storage.createWorkflow(validatedWorkflowData);
      
      // Create workflow steps if provided
      if (steps && Array.isArray(steps) && steps.length > 0) {
        for (const stepData of steps) {
          const stepWithWorkflowId = {
            ...stepData,
            workflowId: workflow.id,
            order: stepData.sequenceNumber
          };
          
          try {
            const validatedStepData = insertWorkflowStepSchema.parse(stepWithWorkflowId);
            await storage.createWorkflowStep(validatedStepData);
          } catch (stepError) {
            console.error("Error creating workflow step:", stepError);
          }
        }
      }
      
      // Create activity
      await storage.createActivity({
        type: "workflow_created",
        description: `creó el flujo de trabajo "${workflow.name}" con ${steps?.length || 0} pasos`,
        userId: workflow.assignedToId || 1,
        workflowId: workflow.id,
        institutionId: workflow.institutionId,
      });
      
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Workflow creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update workflow
  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const workflow = await storage.updateWorkflow(id, updates);
      if (!workflow) {
        return res.status(404).json({ message: "Flujo de trabajo no encontrado" });
      }
      
      // Create activity if status changed
      if (updates.status) {
        let activityType = "workflow_updated";
        let description = `actualizó el flujo de trabajo "${workflow.name}"`;
        
        if (updates.status === "completed") {
          activityType = "workflow_completed";
          description = `completó el flujo de trabajo "${workflow.name}"`;
        }
        
        await storage.createActivity({
          type: activityType,
          description,
          userId: workflow.assignedToId || 1,
          workflowId: workflow.id,
          institutionId: workflow.institutionId,
        });
      }
      
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get workflow steps
  app.get("/api/workflows/:id/steps", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      const steps = await storage.getWorkflowSteps(workflowId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create workflow step
  app.post("/api/workflows/:id/steps", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      const stepData = { ...req.body, workflowId };
      const validatedData = insertWorkflowStepSchema.parse(stepData);
      
      const step = await storage.createWorkflowStep(validatedData);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const stats = await storage.getDashboardStats(institutionId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recent activities
  app.get("/api/activities", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const activities = await storage.getRecentActivities(institutionId, limit);
      
      // Enrich activities with user data
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const user = await storage.getUser(activity.userId);
          return {
            ...activity,
            user: user ? `${user.firstName} ${user.lastName}` : "Usuario desconocido"
          };
        })
      );
      
      res.json(enrichedActivities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get compliance scores
  app.get("/api/compliance-scores", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const scores = await storage.getComplianceScores(institutionId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Document management endpoints
  app.get("/api/documents", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const documents = await storage.getInstitutionDocuments(institutionId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Simulate file upload (in real implementation, use multer middleware)
  app.post("/api/documents/upload", async (req, res) => {
    try {
      const { institutionId, fileName, documentType, description, fileSize, mimeType } = req.body;
      
      if (!institutionId || !fileName || !documentType) {
        return res.status(400).json({ message: "Datos requeridos faltantes" });
      }

      const documentData = {
        institutionId: parseInt(institutionId),
        fileName: `doc_${Date.now()}_${fileName}`,
        originalName: fileName,
        filePath: `/uploads/${institutionId}/${fileName}`,
        fileSize: fileSize || 0,
        mimeType: mimeType || "application/octet-stream",
        documentType,
        description: description || null,
        uploadedById: 1, // Current user
      };

      const document = await storage.createInstitutionDocument(documentData);
      
      // Create activity
      await storage.createActivity({
        type: "document_uploaded",
        description: `subió el documento "${fileName}" (${documentType})`,
        userId: 1,
        workflowId: null,
        institutionId: parseInt(institutionId),
      });

      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Document analysis endpoint
  app.post("/api/documents/:id/analyze", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { framework = 'coso' } = req.body;
      
      // Get the document
      const document = await storage.getInstitutionDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      // Generate comprehensive framework analysis
      const analysisResult = {
        documentId,
        framework,
        analysisDate: new Date().toISOString(),
        
        // 1. Control Framework Mapping
        controlFrameworkMapping: {
          detectedElements: framework === 'coso' ? [
            {
              component: "ambiente_control",
              componentName: "Control Environment",
              principles: [
                {
                  id: "principle_1",
                  name: "Demonstrates commitment to integrity and ethical values",
                  mappedSections: [
                    { page: 2, section: "Ethics Code Implementation", excerpt: "Ethical guidelines and conduct standards..." },
                    { page: 5, section: "Leadership Commitment", excerpt: "Management commitment to ethical behavior..." }
                  ],
                  coverageLevel: "strong"
                },
                {
                  id: "principle_3", 
                  name: "Establishes structure, authority, and responsibility",
                  mappedSections: [
                    { page: 8, section: "Organizational Structure", excerpt: "Authority delegation and responsibility assignment..." }
                  ],
                  coverageLevel: "moderate"
                }
              ]
            },
            {
              component: "evaluacion_riesgos",
              componentName: "Risk Assessment",
              principles: [
                {
                  id: "principle_6",
                  name: "Defines objectives clearly to enable risk identification",
                  mappedSections: [
                    { page: 12, section: "Strategic Objectives", excerpt: "Clear definition of institutional objectives..." }
                  ],
                  coverageLevel: "weak"
                }
              ]
            }
          ] : [
            {
              component: "governance_ethics",
              componentName: "Governance and Ethics (INTOSAI-GOV-9100)",
              principles: [
                {
                  id: "intosai_1.1",
                  name: "Institutional Framework for Governance",
                  mappedSections: [
                    { page: 2, section: "Governance Structure", excerpt: "Clear governance framework with defined roles..." },
                    { page: 5, section: "Leadership Authority", excerpt: "Executive leadership accountability..." }
                  ],
                  coverageLevel: "strong"
                }
              ]
            }
          ]
        },
        
        // 2. Coverage Score
        coverageScore: {
          overall: framework === 'coso' ? 72 : 68,
          byComponent: framework === 'coso' ? {
            ambiente_control: 85,
            evaluacion_riesgos: 45,
            actividades_control: 78,
            informacion_comunicacion: 82,
            supervision: 70
          } : {
            governance_ethics: 75,
            risk_management: 60,
            control_activities: 70,
            information_communication: 65,
            monitoring_evaluation: 70
          },
          strengths: ["Clear governance structure", "Well-defined ethical guidelines", "Comprehensive policy framework"],
          gaps: ["Risk assessment methodology", "Control activity documentation", "Monitoring procedures"]
        },
        
        // 3. Control Relevance Tagging
        controlRelevanceTagging: {
          highRelevance: [
            { tag: "Strategic Planning", confidence: 0.92, sections: ["Section 1.2", "Section 3.1"] },
            { tag: "Risk Management", confidence: 0.87, sections: ["Section 2.3", "Section 4.2"] },
            { tag: "Internal Controls", confidence: 0.95, sections: ["Section 5.1", "Section 6.2"] }
          ],
          mediumRelevance: [
            { tag: "Performance Monitoring", confidence: 0.73, sections: ["Section 7.1"] },
            { tag: "Compliance Requirements", confidence: 0.68, sections: ["Section 8.3"] }
          ],
          lowRelevance: [
            { tag: "Administrative Procedures", confidence: 0.45, sections: ["Section 9.2"] }
          ]
        },
        
        // 4. Improvement Recommendations
        improvementRecommendations: [
          {
            priority: "high",
            component: framework === 'coso' ? "evaluacion_riesgos" : "risk_management",
            recommendation: "Develop comprehensive risk assessment methodology",
            rationale: "Current risk assessment practices lack formal documentation and systematic approach",
            implementationSteps: [
              "Establish risk assessment committee",
              "Define risk tolerance levels",
              "Create risk register template",
              "Implement quarterly risk reviews"
            ],
            estimatedEffort: "3-6 months",
            expectedImpact: "High"
          },
          {
            priority: "medium", 
            component: framework === 'coso' ? "supervision" : "monitoring_evaluation",
            recommendation: "Enhance monitoring and evaluation procedures",
            rationale: "Monitoring activities need better documentation and regular review cycles",
            implementationSteps: [
              "Create monitoring dashboard",
              "Establish key performance indicators",
              "Implement regular review meetings"
            ],
            estimatedEffort: "2-4 months",
            expectedImpact: "Medium"
          }
        ],
        
        // 5. Integration Actions
        integrationActions: [
          {
            actionType: "workflow_creation",
            title: "Risk Assessment Workflow",
            description: "Create structured workflow for systematic risk assessment",
            targetComponent: framework === 'coso' ? "evaluacion_riesgos" : "risk_management",
            suggestedSteps: [
              "Identify risk factors",
              "Assess probability and impact", 
              "Develop mitigation strategies",
              "Monitor risk levels"
            ]
          },
          {
            actionType: "policy_update",
            title: "Internal Control Policy Enhancement",
            description: "Update existing policies based on document analysis findings",
            targetComponent: framework === 'coso' ? "actividades_control" : "control_activities",
            suggestedChanges: [
              "Add specific control procedures",
              "Define responsibility matrices",
              "Include performance metrics"
            ]
          }
        ],
        
        // 6. Audit Trail Metadata
        auditTrailMetadata: {
          analysisMethod: "AI-powered document analysis with framework mapping",
          frameworkVersion: framework === 'coso' ? "COSO 2013" : "INTOSAI Standards 2019",
          analysisDuration: "2.3 seconds",
          documentProcessingStats: {
            totalPages: 15,
            processedSections: 12,
            identifiedControls: 23,
            mappedPrinciples: 8
          },
          confidenceScore: 0.84,
          reviewRecommended: true,
          lastUpdated: new Date().toISOString(),
          analysisVersion: "v2.1.0"
        }
      };
      
      // Create activity log
      await storage.createActivity({
        type: "document_analyzed",
        description: `analizó el documento "${document.fileName}" usando framework ${framework.toUpperCase()}`,
        userId: 1,
        workflowId: null,
        institutionId: document.institutionId,
      });
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Document analysis error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInstitutionDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      res.json({ message: "Documento eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chatbot endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      // Simple AI response simulation based on keywords
      let response = "Gracias por tu pregunta sobre COSO. ";
      
      if (message.toLowerCase().includes("ambiente de control")) {
        response += "El Ambiente de Control establece el tono de la organización e influye en la conciencia de control de su personal. Es la base de todos los demás componentes del control interno.";
      } else if (message.toLowerCase().includes("evaluación de riesgos")) {
        response += "La Evaluación de Riesgos identifica y analiza los riesgos relevantes para el logro de los objetivos, formando una base para determinar cómo deben administrarse los riesgos.";
      } else if (message.toLowerCase().includes("actividades de control")) {
        response += "Las Actividades de Control son las políticas y procedimientos que ayudan a asegurar que se ejecuten las directrices de la administración.";
      } else if (message.toLowerCase().includes("información y comunicación")) {
        response += "La Información y Comunicación sistemas identifican, capturan y comunican información pertinente en forma y tiempo que permitan cumplir a cada empleado con sus responsabilidades.";
      } else if (message.toLowerCase().includes("supervisión")) {
        response += "La Supervisión es un proceso que evalúa la calidad del funcionamiento del control interno en el tiempo y permite al sistema reaccionar dinámicamente.";
      } else {
        response += "Puedo ayudarte con información sobre los 5 componentes de COSO basados en COSO 2013: Ambiente de Control, Evaluación de Riesgos, Actividades de Control, Información y Comunicación, y Supervisión.";
      }
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Checklist verification endpoints
  app.get("/api/checklist/items", async (req, res) => {
    try {
      const componentType = req.query.componentType as string;
      
      if (componentType) {
        const items = await storage.getChecklistItemsByComponent(componentType);
        res.json(items);
      } else {
        const items = await storage.getChecklistItems();
        res.json(items);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/checklist/responses/:workflowId", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.workflowId);
      if (!workflowId) {
        return res.status(400).json({ message: "ID de flujo de trabajo requerido" });
      }
      
      const responses = await storage.getChecklistResponses(workflowId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/checklist/responses", async (req, res) => {
    try {
      const validatedData = insertChecklistResponseSchema.parse(req.body);
      const response = await storage.createChecklistResponse(validatedData);
      
      // Create activity
      await storage.createActivity({
        type: "checklist_response",
        description: `respondió a la verificación: ${validatedData.response}`,
        userId: 1, // Current user
        workflowId: validatedData.workflowId,
        institutionId: 1, // Current institution
      });
      
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/checklist/responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const response = await storage.updateChecklistResponse(id, updates);
      if (!response) {
        return res.status(404).json({ message: "Respuesta no encontrada" });
      }
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Institution logo upload endpoint
  app.post("/api/institutions/:id/logo", async (req, res) => {
    try {
      const institutionId = parseInt(req.params.id);
      const { fileName } = req.body;
      
      if (!fileName) {
        return res.status(400).json({ message: "Nombre de archivo requerido" });
      }

      // Update institution with logo URL
      const logoUrl = `/api/assets/${fileName}`;
      const institution = await storage.getInstitution(institutionId);
      
      if (!institution) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }

      // For now, we'll simulate updating the logo URL
      // In a real implementation, you'd update the database
      res.json({ 
        message: "Logo actualizado exitosamente",
        logoUrl: logoUrl
      });
    } catch (error) {
      res.status(500).json({ message: "Error actualizando logo de institución" });
    }
  });

  // Reports generation endpoints
  app.get("/api/reports/compliance", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const institution = await storage.getInstitution(institutionId);
      const workflows = await storage.getWorkflowsByInstitution(institutionId);
      const complianceScores = await storage.getComplianceScores(institutionId);
      const dashboardStats = await storage.getDashboardStats(institutionId);

      const report = {
        reportType: 'compliance',
        generatedAt: new Date(),
        institution: {
          id: institution?.id,
          name: institution?.name,
          type: institution?.type
        },
        summary: {
          overallCompliance: complianceScores.length > 0 
            ? Math.round(complianceScores.reduce((sum, score) => sum + score.score, 0) / complianceScores.length)
            : 0,
          totalWorkflows: workflows.length,
          completedWorkflows: dashboardStats.completedWorkflows,
          activeWorkflows: dashboardStats.activeWorkflows,
          underReview: dashboardStats.underReview
        },
        componentCompliance: complianceScores.map(score => ({
          component: score.componentType,
          score: score.score,
          calculatedAt: score.calculatedAt
        })),
        workflows: workflows.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          component: workflow.componentType,
          status: workflow.status,
          progress: workflow.progress,
          dueDate: workflow.dueDate,
          completedAt: workflow.completedAt
        }))
      };

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Error generando informe de cumplimiento" });
    }
  });

  app.get("/api/reports/progress", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const workflows = await storage.getWorkflowsByInstitution(institutionId);
      const activities = await storage.getRecentActivities(institutionId, 50);

      const report = {
        reportType: 'progress',
        generatedAt: new Date(),
        workflows: workflows.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          component: workflow.componentType,
          status: workflow.status,
          progress: workflow.progress,
          assignedTo: workflow.assignedToId,
          startDate: workflow.createdAt,
          dueDate: workflow.dueDate,
          completedAt: workflow.completedAt,
          estimatedCompletion: workflow.dueDate ? new Date(workflow.dueDate.getTime() + (1000 * 60 * 60 * 24 * 7)) : null
        })),
        recentActivities: activities.map(activity => ({
          type: activity.type,
          description: activity.description,
          createdAt: activity.createdAt,
          userId: activity.userId,
          workflowId: activity.workflowId
        }))
      };

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Error generando informe de progreso" });
    }
  });

  app.get("/api/reports/performance", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const workflows = await storage.getWorkflowsByInstitution(institutionId);
      const activities = await storage.getRecentActivities(institutionId, 100);

      const completedWorkflows = workflows.filter(w => w.status === 'completed');
      const averageCompletionTime = completedWorkflows.length > 0 
        ? completedWorkflows.reduce((sum, w) => {
            if (w.completedAt && w.createdAt) {
              return sum + (w.completedAt.getTime() - w.createdAt.getTime());
            }
            return sum;
          }, 0) / completedWorkflows.length
        : 0;

      const report = {
        reportType: 'performance',
        generatedAt: new Date(),
        metrics: {
          totalWorkflows: workflows.length,
          completedWorkflows: completedWorkflows.length,
          averageCompletionDays: Math.round(averageCompletionTime / (1000 * 60 * 60 * 24)),
          onTimeCompletion: completedWorkflows.filter(w => 
            w.dueDate && w.completedAt && w.completedAt <= w.dueDate
          ).length,
          delayedCompletion: completedWorkflows.filter(w => 
            w.dueDate && w.completedAt && w.completedAt > w.dueDate
          ).length
        },
        componentPerformance: ['ambiente_control', 'evaluacion_riesgos', 'actividades_control', 'informacion_comunicacion', 'supervision'].map(component => {
          const componentWorkflows = workflows.filter(w => w.componentType === component);
          const componentCompleted = componentWorkflows.filter(w => w.status === 'completed');
          
          return {
            component,
            totalWorkflows: componentWorkflows.length,
            completedWorkflows: componentCompleted.length,
            completionRate: componentWorkflows.length > 0 
              ? Math.round((componentCompleted.length / componentWorkflows.length) * 100)
              : 0
          };
        }),
        activityTrends: activities.slice(0, 30).map(activity => ({
          date: activity.createdAt,
          type: activity.type,
          count: 1
        }))
      };

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Error generando informe de rendimiento" });
    }
  });

  app.get("/api/reports/risk", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const workflows = await storage.getWorkflowsByInstitution(institutionId);
      const complianceScores = await storage.getComplianceScores(institutionId);

      const riskWorkflows = workflows.filter(w => w.componentType === 'evaluacion_riesgos');
      const lowComplianceComponents = complianceScores.filter(score => score.score < 70);
      const overdue = workflows.filter(w => 
        w.dueDate && new Date() > w.dueDate && w.status !== 'completed'
      );

      const report = {
        reportType: 'risk',
        generatedAt: new Date(),
        riskAssessment: {
          highRiskAreas: lowComplianceComponents.map(comp => ({
            component: comp.componentType,
            score: comp.score,
            riskLevel: comp.score < 50 ? 'alto' : 'medio'
          })),
          overdueWorkflows: overdue.map(workflow => ({
            id: workflow.id,
            name: workflow.name,
            component: workflow.componentType,
            dueDate: workflow.dueDate,
            daysOverdue: workflow.dueDate 
              ? Math.floor((new Date().getTime() - workflow.dueDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0
          })),
          riskMitigation: riskWorkflows.map(workflow => ({
            id: workflow.id,
            name: workflow.name,
            status: workflow.status,
            progress: workflow.progress,
            implementationStatus: workflow.status === 'completed' ? 'implementado' 
              : workflow.status === 'in_progress' ? 'en_progreso' 
              : 'pendiente'
          }))
        },
        recommendations: [
          "Priorizar flujos de trabajo con cumplimiento menor al 70%",
          "Implementar controles adicionales en áreas de alto riesgo",
          "Establecer seguimiento quincenal para flujos atrasados",
          "Revisar y actualizar evaluaciones de riesgo trimestralmente"
        ]
      };

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Error generando informe de riesgos" });
    }
  });

  // Alert Notifications endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const workflowId = req.query.workflowId ? parseInt(req.query.workflowId as string) : undefined;
      const alerts = await storage.getActiveAlerts(institutionId, workflowId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo alertas" });
    }
  });

  app.post("/api/alerts/check", async (req, res) => {
    try {
      const institutionId = parseInt(req.body.institutionId);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      // Import alert service and run check
      const { alertService } = await import("./alert-service");
      await alertService.checkAndSendAlerts(institutionId);
      
      res.json({ message: "Chequeo de alertas completado" });
    } catch (error) {
      res.status(500).json({ message: "Error ejecutando chequeo de alertas" });
    }
  });

  // Planning Module API routes
  app.get("/api/planning/objectives", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const objectives = await storage.getPlanningObjectives(institutionId);
      res.json(objectives);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/planning/objectives", async (req, res) => {
    try {
      console.log("Received objective data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertPlanningObjectiveSchema.parse(req.body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
      const objective = await storage.createPlanningObjective(validatedData);
      
      // Create activity
      await storage.createActivity({
        type: "objective_created",
        description: `creó el objetivo "${objective.title}"`,
        userId: objective.createdById,
        institutionId: objective.institutionId,
      });
      
      res.status(201).json(objective);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Server error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/planning/objectives/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      
      const objective = await storage.updatePlanningObjectiveProgress(id, progress);
      if (!objective) {
        return res.status(404).json({ message: "Objetivo no encontrado" });
      }
      
      res.json(objective);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/planning/objectives/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const objective = await storage.updatePlanningObjectiveStatus(id, status);
      if (!objective) {
        return res.status(404).json({ message: "Objetivo no encontrado" });
      }

      // Create activity
      await storage.createActivity({
        type: "objective_updated",
        description: `actualizó el estado del objetivo "${objective.title}" a ${status}`,
        userId: objective.createdById,
        institutionId: objective.institutionId,
      });
      
      res.json(objective);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/planning/resources/:objectiveId", async (req, res) => {
    try {
      const objectiveId = parseInt(req.params.objectiveId);
      const resources = await storage.getObjectiveResources(objectiveId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/planning/resources", async (req, res) => {
    try {
      const validatedData = insertObjectiveResourceSchema.parse(req.body);
      const resource = await storage.createObjectiveResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/alerts/send-test", async (req, res) => {
    try {
      const { recipientEmail, recipientName } = req.body;
      
      if (!recipientEmail || !recipientName) {
        return res.status(400).json({ message: "Email y nombre del destinatario requeridos" });
      }

      // Import email service and send test alert
      const { sendAlertEmail } = await import("./email-service");
      
      const testEmailData = {
        alertTitle: "Prueba del Sistema de Alertas COSO",
        alertDescription: "Esta es una prueba del sistema de notificaciones por correo electrónico. El sistema está funcionando correctamente.",
        institutionName: "Ministerio Modelo",
        priority: "media" as const,
        actionRequired: "Esta es una prueba, no se requiere acción"
      };

      const recipients = [{
        email: recipientEmail,
        name: recipientName,
        role: "user"
      }];

      const emailSent = await sendAlertEmail(recipients, testEmailData);
      
      if (emailSent) {
        res.json({ message: "Email de prueba enviado exitosamente" });
      } else {
        res.status(500).json({ message: "Error enviando email de prueba" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error en envío de email de prueba" });
    }
  });

  // User notification preferences
  app.put("/api/users/:id/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { emailNotifications } = req.body;
      
      // For now, we'll simulate updating user preferences
      // In a real implementation, you'd update the database
      res.json({ 
        message: "Preferencias de notificación actualizadas",
        emailNotifications: emailNotifications
      });
    } catch (error) {
      res.status(500).json({ message: "Error actualizando preferencias de notificación" });
    }
  });

  // Institutional Plans endpoints
  app.get("/api/institutional-plans", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const plans = await storage.getInstitutionalPlans(institutionId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo planes institucionales" });
    }
  });

  app.post("/api/institutional-plans", async (req, res) => {
    try {
      const { institutionId, planType, planName, validFrom, validTo } = req.body;
      
      if (!institutionId || !planType || !planName) {
        return res.status(400).json({ message: "Datos requeridos faltantes" });
      }

      const planData = {
        institutionId: parseInt(institutionId),
        planType,
        planName,
        fileName: `plan_${Date.now()}.pdf`,
        filePath: `/uploads/plans/${institutionId}/${planType}_${Date.now()}.pdf`,
        fileSize: 1024000, // Mock file size
        mimeType: "application/pdf",
        uploadedById: 1,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
      };

      const plan = await storage.createInstitutionalPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error creando plan institucional" });
    }
  });

  // Training Records endpoints
  app.get("/api/training-records", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const records = await storage.getTrainingRecords(institutionId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo registros de capacitación" });
    }
  });

  app.post("/api/training-records", async (req, res) => {
    try {
      const { institutionId, userId, trainingTitle, trainingType, trainingTopic, provider, duration, completionDate, status } = req.body;
      
      if (!institutionId || !userId || !trainingTitle || !trainingType || !trainingTopic) {
        return res.status(400).json({ message: "Datos requeridos faltantes" });
      }

      const recordData = {
        institutionId: parseInt(institutionId),
        userId: parseInt(userId),
        trainingTitle,
        trainingType,
        trainingTopic,
        provider: provider || null,
        duration: duration ? parseInt(duration) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        status: status || "completed",
        certificateFileName: `cert_${Date.now()}.pdf`,
        certificateFilePath: `/uploads/certificates/${institutionId}/${userId}_${Date.now()}.pdf`,
        certificateFileSize: 512000,
        certificateMimeType: "application/pdf",
      };

      const record = await storage.createTrainingRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: "Error creando registro de capacitación" });
    }
  });

  app.get("/api/training-stats", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const stats = await storage.getTrainingStats(institutionId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo estadísticas de capacitación" });
    }
  });

  // Audit Reports endpoints
  app.get("/api/cgr-reports", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      const reports = await storage.getCgrReports(institutionId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo informes de auditoría" });
    }
  });

  app.post("/api/cgr-reports", async (req, res) => {
    try {
      const { institutionId, reportType, reportPeriod, reportData } = req.body;
      
      if (!institutionId || !reportType || !reportPeriod) {
        return res.status(400).json({ message: "Datos requeridos faltantes" });
      }

      const mockReportData = {
        componentes: {
          ambiente_control: { score: 85, status: "implementado" },
          evaluacion_riesgos: { score: 78, status: "en_progreso" },
          actividades_control: { score: 92, status: "implementado" },
          informacion_comunicacion: { score: 75, status: "en_progreso" },
          supervision: { score: 88, status: "implementado" }
        },
        resumen_ejecutivo: "Resumen del cumplimiento COSO para el período " + reportPeriod,
        recomendaciones: [
          "Fortalecer controles en información y comunicación",
          "Completar evaluación de riesgos pendiente",
          "Implementar seguimiento trimestral"
        ]
      };

      const reportDataObj = {
        institutionId: parseInt(institutionId),
        reportType,
        reportPeriod,
        reportData: reportData || mockReportData,
        generatedById: 1,
        status: "draft",
      };

      const report = await storage.createCgrReport(reportDataObj);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Error creando informe de auditoría" });
    }
  });

  app.post("/api/cgr-reports/:id/submit", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.submitCgrReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Informe no encontrado" });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Error enviando informe de auditoría" });
    }
  });

  app.get("/api/cgr-templates", async (req, res) => {
    try {
      const templates = [
        {
          type: "cumplimiento",
          name: "Informe de Cumplimiento COSO",
          description: "Informe trimestral sobre el cumplimiento de las normas básicas de control interno",
          fields: ["ambiente_control", "evaluacion_riesgos", "actividades_control", "informacion_comunicacion", "supervision"],
          frequency: "trimestral"
        },
        {
          type: "autoevaluacion",
          name: "Autoevaluación del Sistema de Control Interno",
          description: "Evaluación anual del sistema de control interno institucional",
          fields: ["fortalezas", "debilidades", "plan_mejoras", "recursos_necesarios"],
          frequency: "anual"
        },
        {
          type: "seguimiento",
          name: "Seguimiento de Recomendaciones",
          description: "Informe de seguimiento a recomendaciones de auditoría interna y externa",
          fields: ["recomendaciones_pendientes", "recomendaciones_implementadas", "cronograma_implementacion"],
          frequency: "semestral"
        }
      ];
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo plantillas de auditoría" });
    }
  });

  // Stripe payment route for basic tier purchase
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is not configured. Please contact administrator." 
        });
      }

      const { amount, currency = "usd", metadata = {} } = req.body;
      
      // Validate amount (minimum $0.50 for Stripe)
      if (!amount || amount < 0.5) {
        return res.status(400).json({ 
          message: "Amount must be at least $0.50" 
        });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: {
          product: "Nebusis ControlCore Basic Implementation",
          tier: "basic",
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // ===== VERSION 4 API ENDPOINTS =====
  
  // Strategic Plans endpoints
  app.get("/api/strategic-plans", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      // For demo purposes, return mock data
      const mockPlans = [
        {
          id: 1,
          title: "Fortalecimiento del Ambiente de Control",
          description: "Plan estratégico para mejorar el tono organizacional y la integridad institucional",
          cosoComponent: "ambiente_control",
          cosoPrinciple: "Demuestra compromiso con la integridad y valores éticos",
          assignedTo: "Dirección de Control Interno",
          startDate: "2024-01-15",
          endDate: "2024-12-31",
          status: "in_progress",
          progress: 65
        },
        {
          id: 2,
          title: "Implementación de Evaluación de Riesgos",
          description: "Desarrollo e implementación de metodología de evaluación de riesgos institucional",
          cosoComponent: "evaluacion_riesgos",
          cosoPrinciple: "Identifica y analiza los riesgos",
          assignedTo: "Comité de Riesgos",
          startDate: "2024-02-01",
          endDate: "2024-10-31",
          status: "planned",
          progress: 25
        }
      ];
      
      res.json(mockPlans);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo planes estratégicos" });
    }
  });

  app.post("/api/strategic-plans", async (req, res) => {
    try {
      const planData = req.body;
      // For demo, return the created plan with an ID
      const plan = {
        id: Date.now(),
        ...planData,
        progress: 0
      };
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error creando plan estratégico" });
    }
  });

  app.delete("/api/strategic-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      res.json({ message: "Plan estratégico eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error eliminando plan estratégico" });
    }
  });

  // Cultural Surveys endpoints
  app.get("/api/cultural-surveys", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      // For demo purposes, return mock data
      const mockSurveys = [
        {
          id: 1,
          title: "Evaluación del Ambiente de Control 2024",
          description: "Encuesta anual para evaluar la percepción del ambiente de control interno",
          questions: [
            {
              id: "1",
              type: "rating",
              question: "¿Qué tan bien comprende usted la importancia del control interno?",
              required: true
            },
            {
              id: "2",
              type: "multiple_choice",
              question: "¿Cuál es el mayor desafío para el control interno?",
              options: ["Recursos", "Conocimiento", "Resistencia", "Liderazgo"],
              required: true
            }
          ],
          isAnonymous: true,
          status: "active",
          responseCount: 87,
          createdAt: "2024-01-15"
        }
      ];
      
      res.json(mockSurveys);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo encuestas culturales" });
    }
  });

  app.post("/api/cultural-surveys", async (req, res) => {
    try {
      const surveyData = req.body;
      const survey = {
        id: Date.now(),
        ...surveyData,
        responseCount: 0,
        createdAt: new Date().toISOString()
      };
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json({ message: "Error creando encuesta cultural" });
    }
  });

  app.put("/api/cultural-surveys/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      res.json({ id, status, message: "Estado actualizado" });
    } catch (error) {
      res.status(500).json({ message: "Error actualizando estado de encuesta" });
    }
  });

  app.delete("/api/cultural-surveys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      res.json({ message: "Encuesta cultural eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error eliminando encuesta cultural" });
    }
  });

  // Internal Audits endpoints
  app.get("/api/internal-audits", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      // For demo purposes, return mock data
      const mockAudits = [
        {
          id: 1,
          title: "Auditoría de Controles de Acceso",
          description: "Evaluación de la efectividad de los controles de acceso a sistemas críticos",
          auditType: "it",
          cosoComponent: "actividades_control",
          auditor: "María González",
          startDate: "2024-01-15",
          endDate: "2024-03-31",
          status: "fieldwork",
          priority: "high",
          findings: [
            {
              id: 1,
              title: "Privilegios excesivos en sistema financiero",
              description: "Se identificaron usuarios con privilegios superiores a los necesarios",
              riskLevel: "high",
              recommendation: "Implementar revisión periódica de privilegios",
              managementResponse: "Se acepta la recomendación",
              actionPlan: "Revisar privilegios trimestralmente",
              responsiblePerson: "Administrador de Sistemas",
              dueDate: "2024-06-30",
              status: "open"
            }
          ]
        }
      ];
      
      res.json(mockAudits);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo auditorías internas" });
    }
  });

  app.post("/api/internal-audits", async (req, res) => {
    try {
      const auditData = req.body;
      const audit = {
        id: Date.now(),
        ...auditData,
        findings: []
      };
      res.status(201).json(audit);
    } catch (error) {
      res.status(500).json({ message: "Error creando auditoría interna" });
    }
  });

  app.delete("/api/internal-audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      res.json({ message: "Auditoría interna eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error eliminando auditoría interna" });
    }
  });

  // Executive Dashboard data endpoint
  app.get("/api/executive-dashboard", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }

      // For demo purposes, return mock data
      const components = [
        {
          name: "Ambiente de Control",
          status: "partial",
          score: 78,
          openAudits: 2,
          openFindings: 5,
          openActions: 3
        },
        {
          name: "Evaluación de Riesgos", 
          status: "compliant",
          score: 92,
          openAudits: 1,
          openFindings: 1,
          openActions: 2
        },
        {
          name: "Actividades de Control",
          status: "non_compliant",
          score: 65,
          openAudits: 3,
          openFindings: 8,
          openActions: 6
        },
        {
          name: "Información y Comunicación",
          status: "partial",
          score: 74,
          openAudits: 1,
          openFindings: 3,
          openActions: 4
        },
        {
          name: "Supervisión",
          status: "compliant",
          score: 88,
          openAudits: 1,
          openFindings: 2,
          openActions: 1
        }
      ];

      res.json({ components });
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo datos del dashboard ejecutivo" });
    }
  });

  // Internal Audit endpoints
  app.get("/api/internal-audits", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const audits = await storage.getInternalAudits(institutionId);
      res.json(audits);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo auditorías internas" });
    }
  });

  app.post("/api/internal-audits", async (req, res) => {
    try {
      const auditData = insertInternalAuditSchema.parse(req.body);
      const audit = await storage.createInternalAudit(auditData);
      res.status(201).json(audit);
    } catch (error) {
      res.status(500).json({ message: "Error creando auditoría interna" });
    }
  });

  // Audit Findings endpoints
  app.get("/api/audit-findings", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      const auditId = req.query.auditId ? parseInt(req.query.auditId as string) : undefined;
      
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const findings = await storage.getAuditFindings(institutionId, auditId);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo hallazgos de auditoría" });
    }
  });

  app.post("/api/audit-findings", async (req, res) => {
    try {
      const findingData = insertAuditFindingSchema.parse(req.body);
      const finding = await storage.createAuditFinding(findingData);
      res.status(201).json(finding);
    } catch (error) {
      res.status(500).json({ message: "Error creando hallazgo de auditoría" });
    }
  });

  // Nebusis Licenses endpoint
  app.get("/api/nebusis-licenses", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      const licenses = await storage.getNebusisLicenses(institutionId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo licencias Nebusis" });
    }
  });

  // Assessment Reports and Responses routes  
  // Use different endpoint structure to avoid conflicts
  app.get('/api/assessment-report/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid assessment report ID' });
      }
      const report = await storage.getAssessmentReportDetails(id);
      if (!report) {
        return res.status(404).json({ error: 'Assessment report not found' });
      }
      res.json(report);
    } catch (error) {
      console.error('Error fetching assessment report details:', error);
      res.status(500).json({ error: 'Failed to fetch assessment report details' });
    }
  });

  // PDF route must come BEFORE the general :institutionId route to avoid conflicts
  app.get('/api/assessment-reports/:id/pdf', async (req, res) => {
    try {
      const PDFDocument = require('pdfkit');
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid assessment report ID' });
      }

      // Get assessment report from storage
      const reports = await storage.getAssessmentReports(1);
      const report = reports.find(r => r.id === id);
      
      if (!report) {
        return res.status(404).json({ error: 'Assessment report not found' });
      }

      const institution = await storage.getInstitution(report.institutionId);
      
      // Prepare data for PDF generation
      const pdfData = {
        id: report.id,
        framework: (report.framework || 'COSO').toUpperCase(),
        institutionName: institution?.name || 'Organization',
        title: report.title || `${report.framework} Assessment Report`,
        totalItems: report.totalItems || 26,
        compliantItems: report.compliantItems || 21,
        partialItems: report.partialItems || 3,
        nonCompliantItems: report.nonCompliantItems || 2,
        overallScore: report.overallScore || 85,
        findings: Array.isArray(report.findings) ? report.findings : 
          ["Information quality standards well-established", "Communication channels effective for operations", "External communication protocols need enhancement"],
        recommendations: Array.isArray(report.recommendations) ? report.recommendations :
          ["Upgrade stakeholder communication platforms", "Implement real-time management reporting dashboards"],
        assessmentDate: report.assessmentDate || new Date()
      };

      // Set response headers for PDF download FIRST
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Assessment_Report_${id}.pdf"`);
      
      // Create a new PDF document with buffer pages enabled
      const doc = new PDFDocument({ 
        margin: 50,
        bufferPages: true 
      });
      
      // Pipe the PDF to the response immediately after creation
      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(20).text('Framework Assessment Report', { align: 'center' });
      doc.moveDown();
      
      // Header information
      doc.fontSize(12)
         .text(`Report ID: ${pdfData.id}`, 50, doc.y)
         .text(`Framework: ${pdfData.framework}`, 300, doc.y - 14)
         .text(`Institution: ${pdfData.institutionName}`, 50, doc.y)
         .text(`Date: ${new Date(pdfData.assessmentDate).toLocaleDateString()}`, 300, doc.y - 14)
         .text(`Overall Score: ${pdfData.overallScore}%`, 50, doc.y);
      
      doc.moveDown(2);

      // Executive Summary
      doc.fontSize(16).text('Executive Summary', { underline: true });
      doc.moveDown(0.5);
      const executiveSummary = `This comprehensive ${pdfData.framework} framework assessment evaluated ${pdfData.totalItems} control elements across ${pdfData.institutionName}. The assessment achieved an overall compliance score of ${pdfData.overallScore}%, with ${pdfData.compliantItems} elements fully compliant, ${pdfData.partialItems} partially compliant, and ${pdfData.nonCompliantItems} non-compliant. This assessment provides critical insights into the organization's internal control effectiveness and identifies key areas for improvement to enhance governance and risk management capabilities.`;
      doc.fontSize(10).text(executiveSummary, { align: 'justify' });
      doc.moveDown(2);

      // Summary Statistics
      doc.fontSize(16).text('Assessment Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12)
         .text(`Total Items Assessed: ${pdfData.totalItems}`)
         .text(`Compliant Items: ${pdfData.compliantItems}`)
         .text(`Partially Compliant Items: ${pdfData.partialItems}`)
         .text(`Non-Compliant Items: ${pdfData.nonCompliantItems}`);
      doc.moveDown(2);

      // Findings Detail
      doc.fontSize(16).text('Findings Detail', { underline: true });
      doc.moveDown(0.5);
      const findingsDetail = `Detailed analysis of ${pdfData.totalItems} assessed control elements reveals varying levels of implementation across framework components. The assessment methodology utilized structured verification questions aligned with ${pdfData.framework} standards, ensuring comprehensive coverage of all framework components. Critical findings indicate that ${Math.round((pdfData.compliantItems / pdfData.totalItems) * 100)}% of controls are operating effectively, with ${Math.round((pdfData.partialItems / pdfData.totalItems) * 100)}% requiring enhancement and ${Math.round((pdfData.nonCompliantItems / pdfData.totalItems) * 100)}% needing complete remediation.`;
      doc.fontSize(10).text(findingsDetail, { align: 'justify' });
      doc.moveDown(2);

      // Key Findings
      doc.fontSize(16).text('Key Findings', { underline: true });
      doc.moveDown(0.5);
      pdfData.findings.forEach((finding) => {
        doc.fontSize(10).text(`• ${finding}`);
      });
      doc.moveDown(2);

      // Recommendations
      doc.fontSize(16).text('Recommendations', { underline: true });
      doc.moveDown(0.5);
      pdfData.recommendations.forEach((rec) => {
        doc.fontSize(10).text(`• ${rec}`);
      });
      doc.moveDown(2);

      // Conclusions
      doc.fontSize(16).text('Conclusions', { underline: true });
      doc.moveDown(0.5);
      const conclusions = `Based on this ${pdfData.framework} framework assessment, ${pdfData.institutionName} demonstrates ${pdfData.overallScore >= 80 ? 'strong' : pdfData.overallScore >= 60 ? 'adequate' : 'developing'} internal control capabilities. The overall compliance score of ${pdfData.overallScore}% indicates ${pdfData.overallScore >= 80 ? 'a mature control environment with minor gaps' : pdfData.overallScore >= 60 ? 'a functional control environment requiring targeted improvements' : 'significant opportunities for control enhancement'}. Priority should be given to addressing non-compliant areas while maintaining strengths in well-performing control areas.`;
      doc.fontSize(10).text(conclusions, { align: 'justify' });
      doc.moveDown(2);

      // Follow-up Actions
      doc.fontSize(16).text('Follow-up Actions', { underline: true });
      doc.moveDown(0.5);
      const followUpActions = [
        'Develop detailed remediation plans for all non-compliant control elements',
        'Establish monitoring procedures for partially compliant areas to track improvement progress',
        'Implement regular review cycles to maintain compliance levels in well-performing areas',
        'Assign specific ownership and timelines for each identified improvement initiative',
        'Schedule follow-up assessment within 6-12 months to measure improvement progress'
      ];
      followUpActions.forEach((action, index) => {
        doc.fontSize(10).text(`${index + 1}. ${action}`);
      });

      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  app.get('/api/assessment-reports/:institutionId', async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const reports = await storage.getAssessmentReports(institutionId);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching assessment reports:', error);
      res.status(500).json({ error: 'Failed to fetch assessment reports' });
    }
  });

  app.get('/api/assessment-reports/:institutionId/:framework', async (req, res) => {
    try {
      const institutionId = parseInt(req.params.institutionId);
      const framework = req.params.framework;
      const reports = await storage.getAssessmentReportsByFramework(institutionId, framework);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching assessment reports by framework:', error);
      res.status(500).json({ error: 'Failed to fetch assessment reports' });
    }
  });

  app.post('/api/assessment-reports', async (req, res) => {
    try {
      const report = await storage.createAssessmentReport(req.body);
      res.json(report);
    } catch (error) {
      console.error('Error creating assessment report:', error);
      res.status(500).json({ error: 'Failed to create assessment report' });
    }
  });

  app.patch('/api/assessment-reports/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.updateAssessmentReport(id, req.body);
      if (!report) {
        return res.status(404).json({ error: 'Assessment report not found' });
      }
      res.json(report);
    } catch (error) {
      console.error('Error updating assessment report:', error);
      res.status(500).json({ error: 'Failed to update assessment report' });
    }
  });

  app.get('/api/assessment-responses', async (req, res) => {
    try {
      const reportId = parseInt(req.query.reportId as string);
      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }
      const responses = await storage.getAssessmentResponses(reportId);
      res.json(responses);
    } catch (error) {
      console.error('Error fetching assessment responses:', error);
      res.status(500).json({ error: 'Failed to fetch assessment responses' });
    }
  });

  app.post('/api/assessment-responses', async (req, res) => {
    try {
      const response = await storage.upsertAssessmentResponse(req.body);
      res.json(response);
    } catch (error) {
      console.error('Error creating/updating assessment response:', error);
      res.status(500).json({ error: 'Failed to save assessment response' });
    }
  });

  app.get('/api/checklist-items/:framework', async (req, res) => {
    try {
      const framework = req.params.framework;
      const items = await storage.getChecklistItemsByFramework(framework);
      res.json(items);
    } catch (error) {
      console.error('Error fetching checklist items by framework:', error);
      res.status(500).json({ error: 'Failed to fetch checklist items' });
    }
  });

  // Workflow Execution Assessment API routes
  app.get("/api/workflow-execution-assessments", async (req, res) => {
    try {
      const institutionId = parseInt(req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ message: "Institution ID required" });
      }
      
      console.log("Fetching workflow assessments for institution:", institutionId);
      const assessments = await storage.getWorkflowExecutionAssessments(institutionId);
      console.log("Found assessments:", assessments.length);
      
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching workflow assessments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/workflow-execution-assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getWorkflowExecutionAssessment(id);
      if (!assessment) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/workflow-execution-assessments", async (req, res) => {
    try {
      const assessment = await storage.createWorkflowExecutionAssessment(req.body);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auto-generate workflow execution assessments
  app.post("/api/workflow-execution-assessments/auto-generate", async (req, res) => {
    try {
      const { workflowIds, institutionId } = req.body;
      
      if (!workflowIds || !Array.isArray(workflowIds) || workflowIds.length === 0) {
        return res.status(400).json({ message: "Se requiere una lista válida de IDs de workflows" });
      }

      const generatedAssessments = [];

      for (const workflowId of workflowIds) {
        // Get workflow details
        const workflow = await storage.getWorkflow(workflowId);
        if (!workflow) continue;

        // Get workflow steps for detailed analysis
        const steps = await storage.getWorkflowSteps(workflowId);

        // Calculate automatic scores based on workflow data
        let overallFidelityScore = 75; // Base score
        let designComplianceScore = 80;
        let timelineComplianceScore = 70;
        let qualityScore = 75;

        // Adjust scores based on workflow status and progress
        if (workflow.status === "completed") {
          overallFidelityScore += 15;
          designComplianceScore += 10;
          timelineComplianceScore += 20;
        } else if (workflow.status === "in_progress") {
          overallFidelityScore = Math.min(workflow.progress, 85);
          designComplianceScore = Math.min(workflow.progress + 5, 90);
          timelineComplianceScore = Math.max(workflow.progress - 10, 60);
        }

        // Check if workflow was completed on time
        if (workflow.dueDate && workflow.completedAt) {
          const dueDate = new Date(workflow.dueDate);
          const completedDate = new Date(workflow.completedAt);
          if (completedDate <= dueDate) {
            timelineComplianceScore = Math.min(timelineComplianceScore + 15, 95);
          } else {
            timelineComplianceScore = Math.max(timelineComplianceScore - 20, 40);
          }
        }

        // Generate findings based on workflow analysis
        let findings = `Automated assessment of ${workflow.name} workflow execution.`;
        let recommendations = "Continue monitoring workflow execution for optimization opportunities.";

        if (workflow.status === "completed") {
          findings += ` Workflow completed successfully with ${workflow.progress}% completion rate.`;
          if (timelineComplianceScore > 85) {
            findings += " Timeline compliance was excellent.";
          }
        } else if (workflow.status === "in_progress") {
          findings += ` Workflow is currently ${workflow.progress}% complete and in progress.`;
          recommendations = "Monitor progress closely to ensure timely completion.";
        }

        if (steps.length > 0) {
          findings += ` Workflow contains ${steps.length} defined steps for execution tracking.`;
        }

        // Create the assessment
        const assessmentData = {
          workflowId: workflowId,
          assessorId: 1, // System-generated assessment
          executionStatus: workflow.status === "completed" ? "completed" as const : 
                          workflow.status === "in_progress" ? "in_progress" as const : "in_progress" as const,
          overallFidelityScore: Math.min(Math.max(overallFidelityScore, 0), 100),
          designComplianceScore: Math.min(Math.max(designComplianceScore, 0), 100),
          timelineComplianceScore: Math.min(Math.max(timelineComplianceScore, 0), 100),
          qualityScore: Math.min(Math.max(qualityScore, 0), 100),
          overallFindings: findings,
          recommendations: recommendations,
          status: "final" as const,
          assessmentDate: new Date().toISOString()
        };

        const createdAssessment = await storage.createWorkflowExecutionAssessment(assessmentData);
        generatedAssessments.push(createdAssessment);

        // Create step assessments if steps exist
        for (const step of steps) {
          const stepAssessmentData = {
            executionAssessmentId: createdAssessment.id,
            workflowStepId: step.id,
            stepName: step.title,
            designAdherence: "fully_compliant" as const,
            executionQuality: workflow.status === "completed" ? "excellent" as const : "good" as const,
            outputCompliance: "meets_requirements" as const,
            stepFindings: `Step "${step.title}" executed according to design specifications.`,
            evidenceReview: "Step execution evidence reviewed and compliant."
          };

          await storage.createWorkflowStepAssessment(stepAssessmentData);
        }

        // Create a sample deviation if timeline compliance is low
        if (timelineComplianceScore < 70) {
          const deviationData = {
            executionAssessmentId: createdAssessment.id,
            deviationType: "timeline" as const,
            severity: "minor" as const,
            description: "Workflow execution experienced minor timeline deviations from original schedule.",
            impactAnalysis: "Minimal impact on overall project delivery timeline.",
            correctionTaken: "Timeline adjustments made to accommodate execution requirements.",
            preventiveMeasures: "Enhanced timeline monitoring implemented for future workflows.",
            identifiedBy: 1,
            identifiedAt: new Date().toISOString(),
            status: "resolved" as const
          };

          await storage.createWorkflowDeviation(deviationData);
        }
      }

      res.status(201).json(generatedAssessments);
    } catch (error) {
      console.error("Error generating automatic assessments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/workflow-execution-assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.updateWorkflowExecutionAssessment(id, req.body);
      if (!assessment) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/workflow-execution-assessments/:id/step-assessments", async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const stepAssessments = await storage.getWorkflowStepAssessments(assessmentId);
      res.json(stepAssessments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/workflow-step-assessments", async (req, res) => {
    try {
      const stepAssessment = await storage.createWorkflowStepAssessment(req.body);
      res.status(201).json(stepAssessment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/workflow-execution-assessments/:id/deviations", async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const deviations = await storage.getWorkflowDeviations(assessmentId);
      res.json(deviations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/workflow-deviations", async (req, res) => {
    try {
      const deviation = await storage.createWorkflowDeviation(req.body);
      res.status(201).json(deviation);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/workflow-deviations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deviation = await storage.updateWorkflowDeviation(id, req.body);
      if (!deviation) {
        return res.status(404).json({ message: "Desviación no encontrada" });
      }
      res.json(deviation);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PDF Generation for Workflow Execution Assessment
  app.get("/api/workflow-execution-assessments/:id/pdf", async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      
      // Get the assessment details
      const assessment = await storage.getWorkflowExecutionAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Get workflow details
      const workflow = await storage.getWorkflow(assessment.workflowId);
      const workflowName = workflow?.name || `Workflow ${assessment.workflowId}`;

      // Get institution details
      const institution = await storage.getInstitution(1); // Using default institution
      const institutionName = institution?.name || "Government Institution";

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="workflow_assessment_${assessmentId}.pdf"`);
      
      // Pipe the PDF to the response
      doc.pipe(res);

      // Add content to PDF
      
      // Header
      doc.fontSize(18).text('Nebusis® ControlCore', 50, 50);
      doc.fontSize(14).text('WorkFlow Execution Assessment Report', 50, 75);
      doc.moveDown(2);

      // Institution and Assessment Info
      doc.fontSize(12);
      doc.text(`Institution: ${institutionName}`, 50, doc.y);
      doc.text(`Workflow: ${workflowName}`, 50, doc.y + 15);
      doc.text(`Assessment ID: ${assessmentId}`, 50, doc.y + 15);
      doc.text(`Assessment Date: ${new Date(assessment.assessmentDate).toLocaleDateString()}`, 50, doc.y + 15);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, doc.y + 15);
      doc.moveDown(2);

      // Execution Status
      doc.fontSize(14).text('Execution Status', 50, doc.y);
      doc.fontSize(12);
      doc.text(`Status: ${assessment.executionStatus.replace('_', ' ').toUpperCase()}`, 70, doc.y + 20);
      doc.moveDown(1);

      // Performance Scores
      doc.fontSize(14).text('Performance Scores', 50, doc.y);
      doc.fontSize(12);
      if (assessment.overallFidelityScore) {
        doc.text(`Overall Fidelity Score: ${assessment.overallFidelityScore}%`, 70, doc.y + 20);
      }
      if (assessment.designComplianceScore) {
        doc.text(`Design Compliance Score: ${assessment.designComplianceScore}%`, 70, doc.y + 15);
      }
      if (assessment.timelineComplianceScore) {
        doc.text(`Timeline Compliance Score: ${assessment.timelineComplianceScore}%`, 70, doc.y + 15);
      }
      if (assessment.qualityScore) {
        doc.text(`Quality Score: ${assessment.qualityScore}%`, 70, doc.y + 15);
      }
      doc.moveDown(2);

      // Overall Findings
      if (assessment.overallFindings) {
        doc.fontSize(14).text('Overall Findings', 50, doc.y);
        doc.fontSize(12);
        doc.text(assessment.overallFindings, 70, doc.y + 20, { width: 450, align: 'justify' });
        doc.moveDown(2);
      }

      // Recommendations
      if (assessment.recommendations) {
        doc.fontSize(14).text('Recommendations', 50, doc.y);
        doc.fontSize(12);
        doc.text(assessment.recommendations, 70, doc.y + 20, { width: 450, align: 'justify' });
        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(10).text(
        'This report was generated by Nebusis® ControlCore - The Nucleus of Modern Internal Control',
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );

      // Finalize the PDF
      doc.end();

      // Also create a record in assessment reports for tracking
      const reportData = {
        institutionId: 1,
        reportType: "workflow_assessment" as const,
        title: `Workflow Assessment Report - ${workflowName}`,
        description: `Comprehensive execution fidelity assessment for ${workflowName} workflow`,
        generatedAt: new Date(),
        generatedById: 1,
        fileName: `workflow_assessment_${assessmentId}_${Date.now()}.pdf`,
        filePath: `/reports/workflow_assessments/assessment_${assessmentId}.pdf`,
        fileSize: 256000,
        mimeType: "application/pdf",
        framework: "COSO",
        reportPeriod: "current",
        reportScope: workflow?.componentType || "workflow_assessment",
        complianceScore: assessment.overallFidelityScore || 75,
        findings: assessment.overallFindings || "Workflow execution assessment completed",
        recommendations: assessment.recommendations || "Continue monitoring workflow execution"
      };

      // Store the report record asynchronously (don't wait for it)
      storage.createAssessmentReport(reportData).catch(console.error);

    } catch (error) {
      console.error("Error generating PDF report:", error);
      res.status(500).json({ message: "Error generating PDF report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
