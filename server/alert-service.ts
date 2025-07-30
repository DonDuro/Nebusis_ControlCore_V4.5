import { storage } from "./storage";
import { sendAlertEmail, sendSupervisorAlert, AlertEmailData, EmailRecipient } from "./email-service";
import { AlertNotification, InsertAlertNotification, User, Workflow } from "../shared/schema";

export class AlertService {
  
  // Revisa automáticamente los flujos de trabajo y genera alertas cuando es necesario
  async checkAndSendAlerts(institutionId: number): Promise<void> {
    try {
      console.log(`Revisando alertas para institución ${institutionId}`);
      
      const workflows = await storage.getWorkflowsByInstitution(institutionId);
      const today = new Date();
      
      for (const workflow of workflows) {
        await this.checkWorkflowDeadlines(workflow, today);
        await this.checkWorkflowStagnation(workflow, today);
        await this.checkHighPriorityItems(workflow);
      }
      
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  // Revisa fechas límite próximas o vencidas
  private async checkWorkflowDeadlines(workflow: Workflow, today: Date): Promise<void> {
    if (!workflow.dueDate) return;
    
    const dueDate = new Date(workflow.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let alertType: string;
    let priority: 'alta' | 'media' | 'baja';
    let title: string;
    let description: string;
    
    if (daysDiff < 0) {
      // Vencido
      alertType = 'overdue';
      priority = 'alta';
      title = 'Flujo de Trabajo Vencido';
      description = `El flujo de trabajo "${workflow.name}" venció hace ${Math.abs(daysDiff)} días y requiere atención inmediata.`;
    } else if (daysDiff <= 3) {
      // Próximo a vencer (3 días o menos)
      alertType = 'deadline_approaching';
      priority = 'alta';
      title = 'Fecha Límite Próxima';
      description = `El flujo de trabajo "${workflow.name}" vence en ${daysDiff} días.`;
    } else if (daysDiff <= 7) {
      // Próximo a vencer (1 semana)
      alertType = 'deadline_approaching';
      priority = 'media';
      title = 'Fecha Límite Próxima';
      description = `El flujo de trabajo "${workflow.name}" vence en ${daysDiff} días.`;
    } else {
      return; // No necesita alerta aún
    }

    await this.createAndSendAlert({
      title,
      description,
      type: alertType,
      priority,
      institutionId: workflow.institutionId,
      workflowId: workflow.id,
      assignedToId: workflow.assignedToId,
      dueDate: workflow.dueDate,
      isActive: true,
      emailSent: false
    });
  }

  // Revisa flujos de trabajo estancados
  private async checkWorkflowStagnation(workflow: Workflow, today: Date): Promise<void> {
    if (workflow.status === 'completed' || !workflow.updatedAt) return;
    
    const lastUpdate = new Date(workflow.updatedAt);
    const daysSinceUpdate = Math.ceil((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Si no ha tenido actividad en más de 15 días
    if (daysSinceUpdate > 15) {
      await this.createAndSendAlert({
        title: 'Flujo de Trabajo Estancado',
        description: `El flujo de trabajo "${workflow.name}" no ha tenido actividad en ${daysSinceUpdate} días y puede requerir revisión.`,
        type: 'review_required',
        priority: 'media',
        institutionId: workflow.institutionId,
        workflowId: workflow.id,
        assignedToId: workflow.assignedToId,
        dueDate: workflow.dueDate,
        isActive: true,
        emailSent: false
      });
    }
  }

  // Revisa elementos de alta prioridad
  private async checkHighPriorityItems(workflow: Workflow): Promise<void> {
    const steps = await storage.getWorkflowSteps(workflow.id);
    const pendingSteps = steps.filter(step => step.status === 'pending');
    
    if (pendingSteps.length > 5) {
      await this.createAndSendAlert({
        title: 'Múltiples Pasos Pendientes',
        description: `El flujo de trabajo "${workflow.name}" tiene ${pendingSteps.length} pasos pendientes que requieren atención.`,
        type: 'high_priority',
        priority: 'media',
        institutionId: workflow.institutionId,
        workflowId: workflow.id,
        assignedToId: workflow.assignedToId,
        dueDate: workflow.dueDate,
        isActive: true,
        emailSent: false
      });
    }
  }

  // Crea una alerta y envía notificación por correo
  private async createAndSendAlert(alertData: InsertAlertNotification): Promise<void> {
    try {
      // Verificar si ya existe una alerta similar activa
      const existingAlerts = await storage.getActiveAlerts(alertData.institutionId, alertData.workflowId);
      const similarAlert = existingAlerts.find(alert => 
        alert.type === alertData.type && alert.workflowId === alertData.workflowId
      );
      
      if (similarAlert) {
        console.log(`Alerta similar ya existe para workflow ${alertData.workflowId}`);
        return;
      }

      // Crear la alerta en la base de datos
      const alert = await storage.createAlertNotification(alertData);
      
      // Obtener destinatarios para el correo
      const recipients = await this.getAlertRecipients(alert);
      
      if (recipients.length === 0) {
        console.log('No hay destinatarios para la alerta');
        return;
      }

      // Preparar datos del correo
      const institution = await storage.getInstitution(alert.institutionId);
      const workflow = alert.workflowId ? await storage.getWorkflow(alert.workflowId) : null;
      
      const emailData: AlertEmailData = {
        alertTitle: alert.title,
        alertDescription: alert.description,
        institutionName: institution?.name || 'Institución',
        dueDate: alert.dueDate ? new Date(alert.dueDate).toLocaleDateString('es-DO') : undefined,
        workflowName: workflow?.name,
        priority: alert.priority as 'alta' | 'media' | 'baja',
        actionRequired: this.getActionRequired(alert.type)
      };

      // Enviar correo a los responsables
      const emailSent = await sendAlertEmail(recipients, emailData);
      
      // Enviar correo a supervisores
      await this.sendSupervisorNotifications(recipients, emailData);
      
      // Actualizar el estado de envío de correo
      if (emailSent) {
        await storage.markAlertEmailSent(alert.id);
      }
      
      console.log(`Alerta creada y enviada: ${alert.title}`);
      
    } catch (error) {
      console.error('Error creating and sending alert:', error);
    }
  }

  // Obtiene los destinatarios de una alerta
  private async getAlertRecipients(alert: AlertNotification): Promise<EmailRecipient[]> {
    const recipients: EmailRecipient[] = [];
    
    // Agregar el usuario asignado
    if (alert.assignedToId) {
      const assignedUser = await storage.getUser(alert.assignedToId);
      if (assignedUser && assignedUser.emailNotifications) {
        recipients.push({
          email: assignedUser.email,
          name: `${assignedUser.firstName} ${assignedUser.lastName}`,
          role: assignedUser.role
        });
      }
    }
    
    // Agregar usuarios relevantes de la institución
    const institutionUsers = await storage.getUsersByInstitution(alert.institutionId);
    for (const user of institutionUsers) {
      if (user.emailNotifications && user.role === 'supervisor') {
        recipients.push({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        });
      }
    }
    
    return recipients;
  }

  // Envía notificaciones a supervisores
  private async sendSupervisorNotifications(recipients: EmailRecipient[], emailData: AlertEmailData): Promise<void> {
    const employees = recipients.filter(r => r.role === 'user');
    
    for (const employee of employees) {
      const supervisor = await this.getSupervisorForUser(employee.email);
      if (supervisor) {
        await sendSupervisorAlert(
          supervisor.email,
          supervisor.name,
          employee.name,
          emailData
        );
      }
    }
  }

  // Obtiene el supervisor de un usuario
  private async getSupervisorForUser(userEmail: string): Promise<EmailRecipient | null> {
    const user = await storage.getUserByEmail(userEmail);
    if (!user || !user.supervisorId) return null;
    
    const supervisor = await storage.getUser(user.supervisorId);
    if (!supervisor || !supervisor.emailNotifications) return null;
    
    return {
      email: supervisor.email,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      role: supervisor.role
    };
  }

  // Obtiene la acción requerida según el tipo de alerta
  private getActionRequired(alertType: string): string {
    switch (alertType) {
      case 'deadline_approaching':
        return 'Revisar y completar las actividades pendientes antes de la fecha límite';
      case 'overdue':
        return 'Atender inmediatamente las actividades vencidas y actualizar el estado';
      case 'review_required':
        return 'Revisar el progreso y actualizar el estado del flujo de trabajo';
      case 'high_priority':
        return 'Priorizar la atención de los elementos pendientes';
      default:
        return 'Revisar y tomar acción según corresponda';
    }
  }

  // Ejecutar chequeo automático de alertas (para llamar periódicamente)
  async runAlertCheck(): Promise<void> {
    try {
      console.log('Ejecutando chequeo automático de alertas...');
      
      // Obtener todas las instituciones activas
      const institutions = await storage.getAllInstitutions();
      
      for (const institution of institutions) {
        await this.checkAndSendAlerts(institution.id);
      }
      
      console.log('Chequeo de alertas completado');
    } catch (error) {
      console.error('Error en chequeo automático de alertas:', error);
    }
  }
}

export const alertService = new AlertService();