import { db } from "./db";
import { checklistItems, institutions, planningObjectives, workflowExecutionAssessments } from "@shared/schema";

export async function seedChecklistItems() {
  try {
    console.log("Checking checklist items...");
    
    // Test database connection first with timeout
    const connectionTest = await Promise.race([
      db.select().from(checklistItems).limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
    // Check if checklist items already exist
    const existing = await db.select().from(checklistItems).limit(1);
    if (existing.length > 0) {
      console.log("Checklist items already exist, skipping seed");
      return;
    }

    console.log("Creating COSO checklist items...");

    // COSO checklist items - 17 Official Standards
    const checklistItemsData = [
      // COMPONENTE 1: AMBIENTE DE CONTROL
      { code: "1.1", requirement: "Integridad y valores éticos", verificationQuestion: "¿La institución promueve la integridad, los valores éticos y un ambiente de honestidad, transparencia y cumplimiento?", componentType: "ambiente_control" },
      { code: "1.2", requirement: "Supervisión del sistema de control interno", verificationQuestion: "¿La alta dirección supervisa activamente el diseño, implementación y mantenimiento del sistema de control interno?", componentType: "ambiente_control" },
      { code: "1.3", requirement: "Estructura organizacional", verificationQuestion: "¿La entidad tiene una estructura formalmente definida, coherente con sus objetivos y funciones?", componentType: "ambiente_control" },
      { code: "1.4", requirement: "Políticas y prácticas de recursos humanos", verificationQuestion: "¿La administración promueve la competencia del personal mediante políticas claras de contratación, evaluación, capacitación y sanción?", componentType: "ambiente_control" },
      { code: "1.5", requirement: "Evaluación del ambiente de control", verificationQuestion: "¿La institución evalúa periódicamente si su cultura, estructura y prácticas apoyan el control interno?", componentType: "ambiente_control" },
      
      // COMPONENTE 2: VALORACIÓN Y ADMINISTRACIÓN DE RIESGOS
      { code: "2.1", requirement: "Establecimiento de objetivos institucionales", verificationQuestion: "¿La entidad define objetivos claros y coherentes con su mandato legal y su planificación estratégica?", componentType: "evaluacion_riesgos" },
      { code: "2.2", requirement: "Identificación de eventos de riesgo", verificationQuestion: "¿Se identifican eventos internos y externos que puedan afectar el logro de los objetivos institucionales?", componentType: "evaluacion_riesgos" },
      { code: "2.3", requirement: "Evaluación de riesgos", verificationQuestion: "¿Los riesgos se analizan considerando su probabilidad e impacto?", componentType: "evaluacion_riesgos" },
      { code: "2.4", requirement: "Respuesta a los riesgos", verificationQuestion: "¿La entidad establece respuestas apropiadas para mitigar, aceptar, transferir o evitar los riesgos identificados?", componentType: "evaluacion_riesgos" },
      
      // COMPONENTE 3: ACTIVIDADES DE CONTROL
      { code: "3.1", requirement: "Diseño e implementación de controles", verificationQuestion: "¿Se establecen controles que aseguren la ejecución efectiva y eficiente de las operaciones?", componentType: "actividades_control" },
      { code: "3.2", requirement: "Controles sobre tecnología de la información", verificationQuestion: "¿La entidad implementa controles para proteger la integridad, confidencialidad y disponibilidad de la información?", componentType: "actividades_control" },
      { code: "3.3", requirement: "Documentación de políticas y procedimientos", verificationQuestion: "¿Las actividades y controles clave están documentados y actualizados?", componentType: "actividades_control" },
      
      // COMPONENTE 4: INFORMACIÓN Y COMUNICACIÓN
      { code: "4.1", requirement: "Calidad de la información", verificationQuestion: "¿La información es completa, oportuna, precisa y accesible para quienes la necesiten?", componentType: "informacion_comunicacion" },
      { code: "4.2", requirement: "Comunicación interna", verificationQuestion: "¿Fluye adecuadamente la información entre los distintos niveles jerárquicos y funciones?", componentType: "informacion_comunicacion" },
      { code: "4.3", requirement: "Comunicación externa", verificationQuestion: "¿La entidad asegura la comunicación eficaz con sus partes interesadas externas?", componentType: "informacion_comunicacion" },
      
      // COMPONENTE 5: MONITOREO Y EVALUACIÓN
      { code: "5.1", requirement: "Supervisión continua del control interno", verificationQuestion: "¿Se establecen mecanismos para supervisar el cumplimiento de los controles?", componentType: "supervision" },
      { code: "5.2", requirement: "Evaluaciones independientes y seguimiento a recomendaciones", verificationQuestion: "¿Se realizan auditorías internas o externas y se da seguimiento efectivo a sus recomendaciones?", componentType: "supervision" },
      
      // INTOSAI COMPONENTS
      // Audit Standards
      { code: "I1.1", requirement: "Compliance with ISSAI auditing standards", verificationQuestion: "Are audit procedures aligned with International Standards of Supreme Audit Institutions (ISSAI)?", componentType: "audit_standards" },
      { code: "I1.2", requirement: "Professional competence and due care", verificationQuestion: "Do auditors maintain professional competence and exercise due professional care?", componentType: "audit_standards" },
      
      // Independence & Ethics
      { code: "I2.1", requirement: "Institutional independence of the audit organization", verificationQuestion: "Is the audit organization independent from the audited entity in all matters?", componentType: "independence" },
      { code: "I2.2", requirement: "Individual auditor independence and objectivity", verificationQuestion: "Do individual auditors maintain independence and objectivity in their work?", componentType: "independence" },
      
      // Quality Control
      { code: "I3.1", requirement: "Quality control systems for audit processes", verificationQuestion: "Are there established quality control procedures for all audit activities?", componentType: "quality_control" },
      { code: "I3.2", requirement: "Quality assurance and review processes", verificationQuestion: "Are audit findings and conclusions subject to appropriate review processes?", componentType: "quality_control" },
      
      // Performance Audit
      { code: "I4.1", requirement: "Economy, efficiency, and effectiveness assessments", verificationQuestion: "Do performance audits evaluate the 3Es (economy, efficiency, effectiveness)?", componentType: "performance_audit" },
      { code: "I4.2", requirement: "Value-for-money analysis methodology", verificationQuestion: "Is there a systematic approach to assess value-for-money in public expenditure?", componentType: "performance_audit" },
      
      // Financial Audit
      { code: "I5.1", requirement: "Financial statement audit compliance", verificationQuestion: "Do financial audits comply with applicable accounting and auditing standards?", componentType: "financial_audit" },
      { code: "I5.2", requirement: "Audit opinion formulation and reporting", verificationQuestion: "Are audit opinions properly formulated and communicated according to standards?", componentType: "financial_audit" },
      
      // Compliance Audit
      { code: "I6.1", requirement: "Legal and regulatory compliance verification", verificationQuestion: "Are compliance audits designed to verify adherence to laws and regulations?", componentType: "compliance_audit" },
      { code: "I6.2", requirement: "Public accountability and transparency", verificationQuestion: "Do compliance audits promote public accountability and transparency?", componentType: "compliance_audit" }
    ];

    for (const item of checklistItemsData) {
      await db.insert(checklistItems).values(item);
    }

    console.log(`Created ${checklistItemsData.length} checklist items successfully!`);
    
  } catch (error) {
    console.error("Error seeding checklist items:", error);
    // Don't throw error, just log it so the app can continue
    console.log("Continuing without seeding data...");
  }
}

export async function seedInstitution() {
  console.log("Checking institution...");
  
  try {
    // Check if institution exists
    const existingInstitution = await db.select().from(institutions).limit(1);
    
    if (existingInstitution.length === 0) {
      console.log("Creating sample institution...");
      await db.insert(institutions).values({
        name: "Department of Public Administration",
        type: "government",
        sector: "public",
        size: "large",
        country: "United States",
        address: "1500 Pennsylvania Avenue NW, Washington, DC 20220",
        phone: "+1-202-555-0100",
        email: "contact@publicadmin.gov",
        website: "https://publicadmin.gov",
        logoUrl: null,
        isActive: true
      });
      console.log("Institution created successfully!");
    }
    
    // Check if planning objectives exist
    const existingObjectives = await db.select().from(planningObjectives).limit(1);
    
    if (existingObjectives.length === 0) {
      console.log("Creating relevant planning objectives aligned with form structure...");
      
      const relevantObjectives = [
        {
          institutionId: 1,
          title: "Establish Code of Ethics and Conduct",
          description: "Develop and implement an institutional code of ethics defining values, principles, and conduct standards for all personnel, including procedures for reporting violations and conflicts of interest",
          frameworkComponent: "COSO: Control Environment",
          expectedOutcome: "100% of staff trained on ethics code, 95% reduction in inappropriate conduct incidents, and operational whistleblower channel established",
          ownerResponsible: "Human Resources Director",
          resourcesRequired: "Ethics specialist consultant, virtual training platform, ethics committee, institutional communication materials",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-09-30"),
          progress: 0,
          status: "not_started",
          createdById: 1
        },
        {
          institutionId: 1,
          title: "Implement Risk Management System",
          description: "Design and implement comprehensive system to identify, evaluate, treat, and monitor institutional risks that may affect strategic and operational objective fulfillment",
          frameworkComponent: "COSO: Risk Assessment",
          expectedOutcome: "Updated institutional risk register, treatment plans implemented for 100% of critical risks, and 50% reduction in risk materialization",
          ownerResponsible: "Planning and Risk Management Chief",
          resourcesRequired: "Risk management software, specialized consultant, management team training, statistical analysis tools",
          startDate: new Date("2025-03-15"),
          endDate: new Date("2025-12-31"),
          progress: 0,
          status: "not_started",
          createdById: 2
        },
        {
          institutionId: 1,
          title: "Automate Financial Authorization Controls",
          description: "Implement automated controls in the financial system to ensure all transactions have appropriate authorizations according to established limits and authorization matrix",
          frameworkComponent: "COSO: Control Activities",
          expectedOutcome: "100% of financial transactions processed with verified automatic authorization, 90% reduction in authorization errors, and 70% improvement in processing time",
          ownerResponsible: "Administrative and Financial Director",
          resourcesRequired: "Systems developer, financial ERP upgrade, user training, process documentation",
          startDate: new Date("2025-01-20"),
          endDate: new Date("2025-08-31"),
          progress: 25,
          status: "in_progress",
          createdById: 3
        }
      ];
      
      await db.insert(planningObjectives).values(relevantObjectives);
      console.log("Created", relevantObjectives.length, "relevant planning objectives successfully!");
    }
    
  } catch (error) {
    console.log("Error seeding institution/objectives:", error);
  }
}

export async function seedWorkflowAssessments() {
  try {
    console.log("Checking workflow execution assessments...");
    
    // Force clearing and recreating workflow assessments for fresh data
    console.log("Clearing existing workflow assessments...");
    await db.delete(workflowExecutionAssessments);
    
    console.log("Creating comprehensive workflow execution assessments...");

    const workflowAssessmentsData = [
      {
        workflowId: 1,
        assessorId: 1,
        executionStatus: "completed" as const,
        overallFidelityScore: 88,
        designComplianceScore: 92,
        timelineComplianceScore: 85,
        qualityScore: 87,
        overallFindings: "Control Environment Assessment Q4 2024 was executed with high fidelity to the designed workflow. All major steps were completed within acceptable timeframes with quality deliverables.",
        recommendations: "Continue leveraging the structured approach demonstrated in this assessment. Consider incorporating additional stakeholder feedback mechanisms for future assessments.",
        status: "final" as const,
        assessmentDate: new Date("2024-12-29")
      },
      {
        workflowId: 2,
        assessorId: 1,
        executionStatus: "completed" as const,
        overallFidelityScore: 95,
        designComplianceScore: 97,
        timelineComplianceScore: 93,
        qualityScore: 95,
        overallFindings: "IT General Controls Review executed exceptionally well with near-perfect adherence to workflow design. All control testing procedures were followed precisely and documentation quality exceeded expectations.",
        recommendations: "This workflow serves as an excellent template for future IT control reviews. Consider sharing methodologies with other assessment teams.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-15")
      },
      {
        workflowId: 3,
        assessorId: 1,
        executionStatus: "completed" as const,
        overallFidelityScore: 82,
        designComplianceScore: 85,
        timelineComplianceScore: 80,
        qualityScore: 81,
        overallFindings: "Financial Reporting Controls Documentation completed successfully with good workflow adherence. Some minor deviations from standard procedures were noted but did not materially impact outcomes.",
        recommendations: "Implement additional quality checkpoints during the documentation phase. Consider expanding the review process for complex control procedures.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-09")
      },
      {
        workflowId: 4,
        assessorId: 1,
        executionStatus: "completed" as const,
        overallFidelityScore: 76,
        designComplianceScore: 80,
        timelineComplianceScore: 73,
        qualityScore: 75,
        overallFindings: "Internal Communication Systems Review workflow was completed with adequate adherence to design specifications. Several timeline delays were experienced due to stakeholder availability issues.",
        recommendations: "Improve scheduling coordination with key stakeholders. Consider implementing parallel review processes where feasible to reduce overall timeline impact.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-18")
      },
      {
        workflowId: 5,
        assessorId: 1,
        executionStatus: "completed" as const,
        overallFidelityScore: 91,
        designComplianceScore: 93,
        timelineComplianceScore: 89,
        qualityScore: 91,
        overallFindings: "Vendor Management Control Framework workflow demonstrated excellent execution fidelity with comprehensive documentation and timely completion of all major milestones.",
        recommendations: "Continue using this workflow as a best practice model. Consider developing similar structured approaches for other third-party management processes.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-22")
      },
      {
        workflowId: 6,
        assessorId: 1,
        executionStatus: "completed" as const,
        overallFidelityScore: 79,
        designComplianceScore: 82,
        timelineComplianceScore: 77,
        qualityScore: 78,
        overallFindings: "Business Continuity Assessment workflow completed within acceptable parameters. Some gaps in documentation quality and minor timeline slippages were observed.",
        recommendations: "Enhance documentation templates and provide additional training on business continuity assessment methodologies. Implement periodic checkpoint reviews.",
        status: "final" as const,
        assessmentDate: new Date("2025-01-25")
      }
    ];

    await db.insert(workflowExecutionAssessments).values(workflowAssessmentsData);
    console.log("Created", workflowAssessmentsData.length, "workflow execution assessments successfully!");

  } catch (error) {
    console.error("Error seeding workflow assessments:", error);
    console.log("Continuing without workflow assessment data...");
  }
}