import { db } from "./db";
import { users, institutions, workflows, workflowSteps, complianceScores, activities, checklistItems } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check for checklist items first - this is what we need most
    const existingChecklistItems = await db.select().from(checklistItems).limit(1);
    
    if (existingChecklistItems.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    // Get or create institution
    let institutionRecords = await db.select().from(institutions).limit(1);
    let institution;
    if (institutionRecords.length === 0) {
      [institution] = await db
        .insert(institutions)
        .values({
          name: "Ministerio de Hacienda",
          type: "government",
          size: "large",
          legalBasis: "Ley 5-07 de Función Pública",
          sectorRegulations: ["Ley 10-07 de Control Interno", "Decreto 314-05"],
        })
        .returning();
    } else {
      institution = institutionRecords[0];
    }

    // Get or create user
    let userRecords = await db.select().from(users).limit(1);
    let user;
    if (userRecords.length === 0) {
      [user] = await db
        .insert(users)
        .values({
          email: "ana.rodriguez@hacienda.gob.do",
          firstName: "Ana Belkis",
          lastName: "Rodríguez Mejía",
          role: "admin",
          institutionId: institution.id,
        })
        .returning();
    } else {
      user = userRecords[0];
    }

    // Create sample workflows for each COSO component
    const nobaciComponents = [
      {
        name: "Ambiente de Control",
        componentType: "environment_control",
        description: "Establecimiento del tono organizacional y cultura de control interno",
        progress: 75,
        status: "in_progress"
      },
      {
        name: "Evaluación de Riesgos",
        componentType: "risk_assessment", 
        description: "Identificación y análisis de riesgos que afectan el logro de objetivos",
        progress: 45,
        status: "in_progress"
      },
      {
        name: "Actividades de Control",
        componentType: "control_activities",
        description: "Políticas y procedimientos para mitigar riesgos identificados",
        progress: 30,
        status: "not_started"
      },
      {
        name: "Información y Comunicación",
        componentType: "information_communication",
        description: "Sistemas de información y comunicación efectiva",
        progress: 60,
        status: "in_progress"
      },
      {
        name: "Supervisión",
        componentType: "monitoring",
        description: "Evaluación continua del sistema de control interno",
        progress: 20,
        status: "not_started"
      }
    ];

    const createdWorkflows = [];
    for (const component of nobaciComponents) {
      const [workflow] = await db
        .insert(workflows)
        .values({
          ...component,
          institutionId: institution.id,
          assignedToId: user.id,
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        })
        .returning();
      
      createdWorkflows.push(workflow);

      // Create sample workflow steps
      const steps = [
        {
          name: "Diagnóstico Inicial",
          description: "Evaluación del estado actual del componente",
          order: 1,
          status: "completed"
        },
        {
          name: "Análisis de Brechas",
          description: "Identificación de áreas de mejora",
          order: 2,
          status: component.progress > 50 ? "completed" : "in_progress"
        },
        {
          name: "Plan de Implementación",
          description: "Desarrollo del plan de acción",
          order: 3,
          status: component.progress > 70 ? "in_progress" : "not_started"
        },
        {
          name: "Ejecución",
          description: "Implementación de las mejoras",
          order: 4,
          status: "not_started"
        },
        {
          name: "Verificación",
          description: "Validación de la implementación",
          order: 5,
          status: "not_started"
        }
      ];

      for (const step of steps) {
        await db
          .insert(workflowSteps)
          .values({
            ...step,
            workflowId: workflow.id,
            assignedToId: user.id,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
      }
    }

    // Create compliance scores
    for (const component of nobaciComponents) {
      await db
        .insert(complianceScores)
        .values({
          institutionId: institution.id,
          componentType: component.componentType,
          score: Math.floor(component.progress * 0.8), // Slightly lower than progress
          calculatedAt: new Date(),
        });
    }

    // Create sample activities
    const sampleActivities = [
      {
        type: "workflow_created",
        description: "creó el flujo de trabajo 'Ambiente de Control'",
        userId: user.id,
        workflowId: createdWorkflows[0].id,
        institutionId: institution.id,
      },
      {
        type: "step_completed",
        description: "completó la tarea 'Diagnóstico Inicial' en Ambiente de Control",
        userId: user.id,
        workflowId: createdWorkflows[0].id,
        institutionId: institution.id,
      },
      {
        type: "workflow_created",
        description: "creó el flujo de trabajo 'Evaluación de Riesgos'",
        userId: user.id,
        workflowId: createdWorkflows[1].id,
        institutionId: institution.id,
      },
      {
        type: "user_login",
        description: "inició sesión en el sistema",
        userId: user.id,
        workflowId: null,
        institutionId: institution.id,
      }
    ];

    for (const activity of sampleActivities) {
      await db.insert(activities).values(activity);
    }

    // Create COSO checklist items
    const checklistItemsData = [
      // Ambiente de Control
      { code: "1.1", requirement: "Integridad y valores éticos", verificationQuestion: "¿Existen normas de conducta claras y difundidas?", componentType: "ambiente_control" },
      { code: "1.2", requirement: "Supervisión del sistema de control interno", verificationQuestion: "¿Se supervisa el diseño y funcionamiento del sistema de control interno?", componentType: "ambiente_control" },
      { code: "1.3", requirement: "Estructura organizacional", verificationQuestion: "¿Existe una estructura organizacional formalizada con líneas de autoridad claras?", componentType: "ambiente_control" },
      { code: "1.4", requirement: "Administración y desarrollo del talento humano", verificationQuestion: "¿Se gestionan las competencias y desarrollo del personal?", componentType: "ambiente_control" },
      { code: "1.5", requirement: "Evaluación del control interno", verificationQuestion: "¿Se realiza una evaluación continua del sistema de control interno?", componentType: "ambiente_control" },
      
      // Evaluación de Riesgos
      { code: "2.1", requirement: "Establecimiento de objetivos", verificationQuestion: "¿Los objetivos institucionales están claramente definidos y documentados?", componentType: "evaluacion_riesgos" },
      { code: "2.2", requirement: "Identificación de eventos", verificationQuestion: "¿Se identifican eventos o riesgos que puedan impedir el logro de los objetivos?", componentType: "evaluacion_riesgos" },
      { code: "2.3", requirement: "Evaluación de riesgos", verificationQuestion: "¿Se evalúan los riesgos incluyendo el riesgo de fraude?", componentType: "evaluacion_riesgos" },
      { code: "2.4", requirement: "Respuesta a los riesgos", verificationQuestion: "¿Se implementan acciones para aceptar, evitar, mitigar o compartir los riesgos?", componentType: "evaluacion_riesgos" },
      
      // Actividades de Control
      { code: "3.1", requirement: "Actividades de control", verificationQuestion: "¿Se han establecido controles para mitigar riesgos clave?", componentType: "actividades_control" },
      { code: "3.2", requirement: "Control en sistemas de información", verificationQuestion: "¿Existen controles sobre los sistemas de información?", componentType: "actividades_control" },
      { code: "3.3", requirement: "Políticas y procedimientos", verificationQuestion: "¿Están documentadas y actualizadas las políticas y procedimientos clave?", componentType: "actividades_control" },
      
      // Información y Comunicación
      { code: "4.1", requirement: "Calidad y suficiencia de la información", verificationQuestion: "¿La información institucional es adecuada, confiable y oportuna?", componentType: "informacion_comunicacion" },
      { code: "4.2", requirement: "Comunicación interna", verificationQuestion: "¿Existen mecanismos eficaces para la comunicación interna?", componentType: "informacion_comunicacion" },
      { code: "4.3", requirement: "Comunicación externa", verificationQuestion: "¿La institución comunica adecuadamente con partes interesadas externas?", componentType: "informacion_comunicacion" },
      
      // Supervisión
      { code: "5.1", requirement: "Supervisión continua", verificationQuestion: "¿Se supervisan continuamente los controles implementados?", componentType: "supervision" },
      { code: "5.2", requirement: "Informes y recomendaciones", verificationQuestion: "¿Se elaboran informes sobre deficiencias y se implementan recomendaciones?", componentType: "supervision" }
    ];

    for (const item of checklistItemsData) {
      await db.insert(checklistItems).values(item);
    }

    console.log("Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}