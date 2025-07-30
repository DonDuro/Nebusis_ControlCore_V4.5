import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StrategicPlanning from "@/components/v4/StrategicPlanning";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

interface StrategicPlan {
  id: number;
  title: string;
  description: string;
  cosoComponent: string;
  cosoPrinciple: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
}

export default function StrategicPlanningPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user data for demo
  const mockUser = { institutionId: 1 };
  
  const { data: plans, isLoading } = useQuery({
    queryKey: ['strategic-plans', mockUser.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/strategic-plans?institutionId=${mockUser.institutionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch strategic plans');
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

  const createPlanMutation = useMutation({
    mutationFn: async (planData: Partial<StrategicPlan>) => {
      const response = await fetch('/api/strategic-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...planData,
          institutionId: mockUser.institutionId
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create strategic plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-plans'] });
      toast({
        title: "Plan Creado",
        description: "El plan estratégico ha sido creado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el plan estratégico.",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: { id: number } & Partial<StrategicPlan>) => {
      const response = await fetch(`/api/strategic-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      if (!response.ok) {
        throw new Error('Failed to update strategic plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-plans'] });
      toast({
        title: "Plan Actualizado",
        description: "El plan estratégico ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan estratégico.",
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/strategic-plans/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete strategic plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-plans'] });
      toast({
        title: "Plan Eliminado",
        description: "El plan estratégico ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan estratégico.",
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
            <span className="ml-2">Cargando planes estratégicos...</span>
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
          <StrategicPlanning
            hasAdvancedLicense={hasAdvancedLicense}
            plans={plans || []}
            onCreatePlan={(planData) => createPlanMutation.mutate(planData)}
            onUpdatePlan={(id, planData) => updatePlanMutation.mutate({ id, ...planData })}
            onDeletePlan={(id) => deletePlanMutation.mutate(id)}
          />
        </div>
      </main>
    </div>
  );
}