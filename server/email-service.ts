import { MailService } from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  const mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailRecipient {
  email: string;
  name: string;
  role: string;
}

export interface AlertEmailData {
  alertTitle: string;
  alertDescription: string;
  institutionName: string;
  dueDate?: string;
  workflowName?: string;
  priority: 'alta' | 'media' | 'baja';
  actionRequired: string;
}

export async function sendAlertEmail(
  recipients: EmailRecipient[],
  alertData: AlertEmailData
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY no está configurada - simulando envío de email');
    console.log('Destinatarios:', recipients.map(r => `${r.name} <${r.email}>`));
    console.log('Alerta:', alertData.alertTitle);
    return true;
  }

  try {
    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);

    const priorityColors = {
      'alta': '#dc2626',
      'media': '#f59e0b', 
      'baja': '#059669'
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alerta COSO - ${alertData.alertTitle}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">Sistema COSO</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${alertData.institutionName}</p>
        </div>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${priorityColors[alertData.priority]}; padding: 15px; margin-bottom: 20px;">
          <h2 style="color: ${priorityColors[alertData.priority]}; margin-top: 0;">
            🔴 ${alertData.alertTitle}
          </h2>
          <p style="margin-bottom: 0;">${alertData.alertDescription}</p>
        </div>

        <div style="background-color: white; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">Detalles de la Alerta</h3>
          
          ${alertData.workflowName ? `<p><strong>Flujo de Trabajo:</strong> ${alertData.workflowName}</p>` : ''}
          ${alertData.dueDate ? `<p><strong>Fecha Límite:</strong> ${alertData.dueDate}</p>` : ''}
          <p><strong>Prioridad:</strong> <span style="color: ${priorityColors[alertData.priority]}; font-weight: bold; text-transform: uppercase;">${alertData.priority}</span></p>
          <p><strong>Acción Requerida:</strong> ${alertData.actionRequired}</p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Acceder al Sistema COSO
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #6b7280;">
          <p>Este es un mensaje automático del Sistema COSO. No responda a este correo.</p>
          <p>Si tiene problemas para acceder al sistema, contacte al administrador técnico.</p>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Sistema COSO - ${alertData.institutionName}

${alertData.alertTitle}

${alertData.alertDescription}

Detalles:
${alertData.workflowName ? `Flujo de Trabajo: ${alertData.workflowName}` : ''}
${alertData.dueDate ? `Fecha Límite: ${alertData.dueDate}` : ''}
Prioridad: ${alertData.priority.toUpperCase()}
Acción Requerida: ${alertData.actionRequired}

Acceder al sistema: ${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}

---
Este es un mensaje automático del Sistema COSO.
    `;

    const emails = recipients.map(recipient => ({
      to: recipient.email,
      from: 'sistema-nobaci@gobierno.do', // Cambiar por email verificado en SendGrid
      subject: `🔴 Alerta COSO: ${alertData.alertTitle}`,
      text: emailText,
      html: emailHtml
    }));

    await mailService.send(emails);
    console.log(`Emails de alerta enviados a ${recipients.length} destinatarios`);
    return true;

  } catch (error) {
    console.error('Error enviando emails de alerta:', error);
    return false;
  }
}

export async function sendSupervisorAlert(
  supervisorEmail: string,
  supervisorName: string,
  employeeName: string,
  alertData: AlertEmailData
): Promise<boolean> {
  const supervisorAlertData = {
    ...alertData,
    alertTitle: `Notificación de Supervisión: ${alertData.alertTitle}`,
    alertDescription: `Su supervisado ${employeeName} tiene una alerta pendiente: ${alertData.alertDescription}`,
    actionRequired: `Supervisar y dar seguimiento a la acción requerida de ${employeeName}: ${alertData.actionRequired}`
  };

  return sendAlertEmail([{
    email: supervisorEmail,
    name: supervisorName,
    role: 'supervisor'
  }], supervisorAlertData);
}