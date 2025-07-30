import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CulturalSurveys from "@/components/v4/CulturalSurveys";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

interface CulturalSurvey {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isAnonymous: boolean;
  status: 'draft' | 'active' | 'completed' | 'archived';
  responseCount: number;
  createdAt: string;
}

interface SurveyQuestion {
  id: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'yes_no';
  question: string;
  options?: string[];
  required: boolean;
}

export default function CulturalSurveysPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user data for demo
  const mockUser = { institutionId: 1 };
  
  const { data: surveys, isLoading } = useQuery({
    queryKey: ['cultural-surveys', mockUser.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/cultural-surveys?institutionId=${mockUser.institutionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cultural surveys');
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

  const createSurveyMutation = useMutation({
    mutationFn: async (surveyData: Partial<CulturalSurvey>) => {
      const response = await fetch('/api/cultural-surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...surveyData,
          institutionId: mockUser.institutionId
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create cultural survey');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-surveys'] });
      toast({
        title: "Encuesta Creada",
        description: "La encuesta cultural ha sido creada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la encuesta cultural.",
        variant: "destructive",
      });
    },
  });

  const updateSurveyMutation = useMutation({
    mutationFn: async ({ id, ...surveyData }: { id: number } & Partial<CulturalSurvey>) => {
      const response = await fetch(`/api/cultural-surveys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });
      if (!response.ok) {
        throw new Error('Failed to update cultural survey');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-surveys'] });
      toast({
        title: "Encuesta Actualizada",
        description: "La encuesta cultural ha sido actualizada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la encuesta cultural.",
        variant: "destructive",
      });
    },
  });

  const deleteSurveyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cultural-surveys/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete cultural survey');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-surveys'] });
      toast({
        title: "Encuesta Eliminada",
        description: "La encuesta cultural ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la encuesta cultural.",
        variant: "destructive",
      });
    },
  });

  const toggleSurveyStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const survey = surveys?.find((s: CulturalSurvey) => s.id === id);
      const newStatus = survey?.status === 'draft' ? 'active' : 
                       survey?.status === 'active' ? 'completed' : 'draft';
      
      const response = await fetch(`/api/cultural-surveys/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle survey status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-surveys'] });
      toast({
        title: "Estado Actualizado",
        description: "El estado de la encuesta ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la encuesta.",
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
            <span className="ml-2">Cargando encuestas culturales...</span>
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
          <CulturalSurveys
            hasAdvancedLicense={hasAdvancedLicense}
            surveys={surveys || []}
            onCreateSurvey={(surveyData) => createSurveyMutation.mutate(surveyData)}
            onUpdateSurvey={(id, surveyData) => updateSurveyMutation.mutate({ id, ...surveyData })}
            onDeleteSurvey={(id) => deleteSurveyMutation.mutate(id)}
            onToggleSurveyStatus={(id) => toggleSurveyStatusMutation.mutate(id)}
          />
        </div>
      </main>
    </div>
  );
}