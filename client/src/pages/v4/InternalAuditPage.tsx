import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InternalAuditModule from "@/components/v4/InternalAuditModule";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

interface InternalAudit {
  id: number;
  title: string;
  description: string;
  auditType: 'compliance' | 'operational' | 'financial' | 'it' | 'risk';
  cosoComponent: string;
  auditor: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'fieldwork' | 'reporting' | 'follow_up' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  findings: AuditFinding[];
}

interface AuditFinding {
  id: number;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  managementResponse: string;
  actionPlan: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed' | 'overdue';
}

export default function InternalAuditPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user data for demo
  const mockUser = { institutionId: 1 };
  
  const { data: audits, isLoading } = useQuery({
    queryKey: ['internal-audits', mockUser.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/internal-audits?institutionId=${mockUser.institutionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch internal audits');
      }
      return response.json();
    }
  });

  const { data: licenses } = useQuery({
    queryKey: ['nebusis-licenses', mockUser.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/nebusis-licenses?institutionId=${mockUser.institutionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch licenses');
      }
      return response.json();
    }
  });

  const createAuditMutation = useMutation({
    mutationFn: async (auditData: Partial<InternalAudit>) => {
      const response = await fetch('/api/internal-audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...auditData,
          institutionId: mockUser.institutionId
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create internal audit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      toast({
        title: "Auditoría Creada",
        description: "La auditoría interna ha sido creada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la auditoría interna.",
        variant: "destructive",
      });
    },
  });

  const updateAuditMutation = useMutation({
    mutationFn: async ({ id, ...auditData }: { id: number } & Partial<InternalAudit>) => {
      const response = await fetch(`/api/internal-audits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
      });
      if (!response.ok) {
        throw new Error('Failed to update internal audit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      toast({
        title: "Auditoría Actualizada",
        description: "La auditoría interna ha sido actualizada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la auditoría interna.",
        variant: "destructive",
      });
    },
  });

  const deleteAuditMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/internal-audits/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete internal audit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      toast({
        title: "Auditoría Eliminada",
        description: "La auditoría interna ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la auditoría interna.",
        variant: "destructive",
      });
    },
  });

  const addFindingMutation = useMutation({
    mutationFn: async ({ auditId, findingData }: { auditId: number; findingData: Partial<AuditFinding> }) => {
      const response = await fetch('/api/audit-findings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...findingData,
          auditId
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add audit finding');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      toast({
        title: "Hallazgo Agregado",
        description: "El hallazgo de auditoría ha sido agregado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el hallazgo de auditoría.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Header 
          user={null} 
          institution={null} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <SidebarSimple isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando auditorías internas...</span>
          </div>
        </main>
      </div>
    );
  }

  const hasAdvancedLicense = licenses && licenses.length > 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <Header 
        user={null} 
        institution={null} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
      />
      <SidebarSimple isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <InternalAuditModule
            hasAdvancedLicense={hasAdvancedLicense}
            audits={audits || []}
            onCreateAudit={(auditData) => createAuditMutation.mutate(auditData)}
            onUpdateAudit={(id, auditData) => updateAuditMutation.mutate({ id, ...auditData })}
            onDeleteAudit={(id) => deleteAuditMutation.mutate(id)}
            onAddFinding={(auditId, findingData) => addFindingMutation.mutate({ auditId, findingData })}
          />
        </div>
      </main>
    </div>
  );
}