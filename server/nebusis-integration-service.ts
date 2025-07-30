import { storage } from "./storage";
import { InsertNebusisIntegration, InsertSyncLog, NebusisIntegration } from "@shared/schema";

export interface NebusisAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    totalPages: number;
    totalRecords: number;
  };
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: string[];
  details: any[];
}

export class NebusisIntegrationService {
  private async makeAPIRequest(
    integration: NebusisIntegration,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<NebusisAPIResponse> {
    try {
      const url = `${integration.apiEndpoint}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${integration.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const responseData = await response.json();
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async testConnection(integration: NebusisIntegration): Promise<boolean> {
    const response = await this.makeAPIRequest(integration, '/api/health');
    return response.success;
  }

  async syncDocuments(integration: NebusisIntegration, direction: 'import' | 'export' = 'import'): Promise<SyncResult> {
    const syncLog = await storage.createSyncLog({
      integrationId: integration.id,
      syncType: 'documents',
      direction,
      status: 'started',
      recordsProcessed: 0,
      recordsSucceeded: 0,
      recordsFailed: 0
    });

    try {
      if (direction === 'import') {
        return await this.importDocuments(integration, syncLog.id);
      } else {
        return await this.exportDocuments(integration, syncLog.id);
      }
    } catch (error) {
      await storage.updateSyncLog(syncLog.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      
      return {
        success: false,
        recordsProcessed: 0,
        recordsSucceeded: 0,
        recordsFailed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: []
      };
    }
  }

  private async importDocuments(integration: NebusisIntegration, syncLogId: number): Promise<SyncResult> {
    const response = await this.makeAPIRequest(
      integration, 
      `/api/organizations/${integration.organizationId}/documents`
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch documents from NEBUSIS®');
    }

    const documents = response.data?.documents || [];
    const result: SyncResult = {
      success: true,
      recordsProcessed: documents.length,
      recordsSucceeded: 0,
      recordsFailed: 0,
      errors: [],
      details: []
    };

    for (const doc of documents) {
      try {
        // Map NEBUSIS® document to our document format
        const mappedDoc = this.mapNebusisDocument(doc, integration.institutionId);
        
        // Create document in our system
        await storage.createInstitutionDocument(mappedDoc);
        
        result.recordsSucceeded++;
        result.details.push({
          action: 'imported',
          document: doc.name,
          success: true
        });
      } catch (error) {
        result.recordsFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to import ${doc.name}: ${errorMsg}`);
        result.details.push({
          action: 'import_failed',
          document: doc.name,
          error: errorMsg
        });
      }
    }

    await storage.updateSyncLog(syncLogId, {
      status: result.recordsFailed > 0 ? 'completed' : 'completed',
      recordsProcessed: result.recordsProcessed,
      recordsSucceeded: result.recordsSucceeded,
      recordsFailed: result.recordsFailed,
      syncDetails: result.details,
      completedAt: new Date()
    });

    return result;
  }

  private async exportDocuments(integration: NebusisIntegration, syncLogId: number): Promise<SyncResult> {
    const documents = await storage.getInstitutionDocuments(integration.institutionId);
    
    const result: SyncResult = {
      success: true,
      recordsProcessed: documents.length,
      recordsSucceeded: 0,
      recordsFailed: 0,
      errors: [],
      details: []
    };

    for (const doc of documents) {
      try {
        // Map our document to NEBUSIS® format
        const mappedDoc = this.mapDocumentToNebusis(doc);
        
        // Send document to NEBUSIS®
        const response = await this.makeAPIRequest(
          integration,
          `/api/organizations/${integration.organizationId}/documents`,
          'POST',
          mappedDoc
        );

        if (response.success) {
          result.recordsSucceeded++;
          result.details.push({
            action: 'exported',
            document: doc.originalName,
            success: true
          });
        } else {
          throw new Error(response.error || 'Export failed');
        }
      } catch (error) {
        result.recordsFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to export ${doc.originalName}: ${errorMsg}`);
        result.details.push({
          action: 'export_failed',
          document: doc.originalName,
          error: errorMsg
        });
      }
    }

    await storage.updateSyncLog(syncLogId, {
      status: result.recordsFailed > 0 ? 'completed' : 'completed',
      recordsProcessed: result.recordsProcessed,
      recordsSucceeded: result.recordsSucceeded,
      recordsFailed: result.recordsFailed,
      syncDetails: result.details,
      completedAt: new Date()
    });

    return result;
  }

  async syncPersonnel(integration: NebusisIntegration, direction: 'import' | 'export' = 'import'): Promise<SyncResult> {
    const syncLog = await storage.createSyncLog({
      integrationId: integration.id,
      syncType: 'personnel',
      direction,
      status: 'started',
      recordsProcessed: 0,
      recordsSucceeded: 0,
      recordsFailed: 0
    });

    try {
      if (direction === 'import') {
        return await this.importPersonnel(integration, syncLog.id);
      } else {
        return await this.exportPersonnel(integration, syncLog.id);
      }
    } catch (error) {
      await storage.updateSyncLog(syncLog.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      
      return {
        success: false,
        recordsProcessed: 0,
        recordsSucceeded: 0,
        recordsFailed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: []
      };
    }
  }

  private async importPersonnel(integration: NebusisIntegration, syncLogId: number): Promise<SyncResult> {
    const response = await this.makeAPIRequest(
      integration,
      `/api/organizations/${integration.organizationId}/personnel`
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch personnel from NEBUSIS®');
    }

    const personnel = response.data?.personnel || [];
    const result: SyncResult = {
      success: true,
      recordsProcessed: personnel.length,
      recordsSucceeded: 0,
      recordsFailed: 0,
      errors: [],
      details: []
    };

    for (const person of personnel) {
      try {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(person.email);
        
        if (!existingUser) {
          // Map NEBUSIS® personnel to our user format
          const mappedUser = this.mapNebusisPersonnel(person, integration.institutionId);
          
          // Create user in our system
          await storage.createUser(mappedUser);
          
          result.recordsSucceeded++;
          result.details.push({
            action: 'imported',
            person: `${person.firstName} ${person.lastName}`,
            success: true
          });
        } else {
          result.details.push({
            action: 'skipped',
            person: `${person.firstName} ${person.lastName}`,
            reason: 'User already exists'
          });
        }
      } catch (error) {
        result.recordsFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to import ${person.firstName} ${person.lastName}: ${errorMsg}`);
        result.details.push({
          action: 'import_failed',
          person: `${person.firstName} ${person.lastName}`,
          error: errorMsg
        });
      }
    }

    await storage.updateSyncLog(syncLogId, {
      status: 'completed',
      recordsProcessed: result.recordsProcessed,
      recordsSucceeded: result.recordsSucceeded,
      recordsFailed: result.recordsFailed,
      syncDetails: result.details,
      completedAt: new Date()
    });

    return result;
  }

  private async exportPersonnel(integration: NebusisIntegration, syncLogId: number): Promise<SyncResult> {
    const users = await storage.getUsersByInstitution(integration.institutionId);
    
    const result: SyncResult = {
      success: true,
      recordsProcessed: users.length,
      recordsSucceeded: 0,
      recordsFailed: 0,
      errors: [],
      details: []
    };

    for (const user of users) {
      try {
        // Map our user to NEBUSIS® format
        const mappedUser = this.mapUserToNebusis(user);
        
        // Send user to NEBUSIS®
        const response = await this.makeAPIRequest(
          integration,
          `/api/organizations/${integration.organizationId}/personnel`,
          'POST',
          mappedUser
        );

        if (response.success) {
          result.recordsSucceeded++;
          result.details.push({
            action: 'exported',
            person: `${user.firstName} ${user.lastName}`,
            success: true
          });
        } else {
          throw new Error(response.error || 'Export failed');
        }
      } catch (error) {
        result.recordsFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to export ${user.firstName} ${user.lastName}: ${errorMsg}`);
        result.details.push({
          action: 'export_failed',
          person: `${user.firstName} ${user.lastName}`,
          error: errorMsg
        });
      }
    }

    await storage.updateSyncLog(syncLogId, {
      status: 'completed',
      recordsProcessed: result.recordsProcessed,
      recordsSucceeded: result.recordsSucceeded,
      recordsFailed: result.recordsFailed,
      syncDetails: result.details,
      completedAt: new Date()
    });

    return result;
  }

  private mapNebusisDocument(nebusisDoc: any, institutionId: number): any {
    return {
      institutionId,
      originalName: nebusisDoc.name || nebusisDoc.title,
      fileName: nebusisDoc.filename || `${nebusisDoc.id}.pdf`,
      filePath: nebusisDoc.path || `/synced/${nebusisDoc.id}`,
      fileSize: nebusisDoc.size || 0,
      mimeType: nebusisDoc.mimeType || 'application/pdf',
      documentType: this.mapNebusisDocumentType(nebusisDoc.category),
      description: nebusisDoc.description || `Sincronizado desde NEBUSIS® Management System Wizard`,
      uploadedById: 1, // System user
    };
  }

  private mapDocumentToNebusis(doc: any): any {
    return {
      name: doc.originalName,
      filename: doc.fileName,
      size: doc.fileSize,
      mimeType: doc.mimeType,
      category: this.mapDocumentTypeToNebusis(doc.documentType),
      description: doc.description || '',
      source: 'NEBUSIS® COSO Module'
    };
  }

  private mapNebusisPersonnel(person: any, institutionId: number): any {
    return {
      email: person.email,
      firstName: person.firstName || person.name?.split(' ')[0] || 'Usuario',
      lastName: person.lastName || person.name?.split(' ').slice(1).join(' ') || 'Sincronizado',
      role: this.mapNebusisRole(person.role),
      institutionId,
      emailNotifications: true,
    };
  }

  private mapUserToNebusis(user: any): any {
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      role: this.mapRoleToNebusis(user.role),
      source: 'NEBUSIS® COSO Module'
    };
  }

  private mapNebusisDocumentType(category: string): string {
    const mapping: Record<string, string> = {
      'legal': 'creation_law',
      'policies': 'policies',
      'procedures': 'regulations',
      'organizational': 'organigram',
      'manual': 'functions_manual',
      'regulation': 'sector_regulations',
      'control': 'control_reports'
    };
    return mapping[category?.toLowerCase()] || 'policies';
  }

  private mapDocumentTypeToNebusis(type: string): string {
    const mapping: Record<string, string> = {
      'creation_law': 'legal',
      'policies': 'policies',
      'regulations': 'procedures',
      'organigram': 'organizational',
      'functions_manual': 'manual',
      'sector_regulations': 'regulation',
      'control_reports': 'control'
    };
    return mapping[type] || 'policies';
  }

  private mapNebusisRole(role: string): string {
    const mapping: Record<string, string> = {
      'admin': 'admin',
      'manager': 'supervisor',
      'supervisor': 'supervisor',
      'user': 'user',
      'employee': 'user',
      'coordinator': 'supervisor'
    };
    return mapping[role?.toLowerCase()] || 'user';
  }

  private mapRoleToNebusis(role: string): string {
    const mapping: Record<string, string> = {
      'admin': 'admin',
      'supervisor': 'manager',
      'user': 'employee'
    };
    return mapping[role] || 'employee';
  }
}

export const nebusisIntegrationService = new NebusisIntegrationService();