import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ExecutiveDashboard from "@/components/v4/ExecutiveDashboard";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";

interface ComponentStatus {
  name: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
  score: number;
  openAudits: number;
  openFindings: number;
  openActions: number;
}

export default function ExecutiveDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Mock user and institution data for demo
  const mockUser = { institutionId: 1 };
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['executive-dashboard', mockUser.institutionId],
    queryFn: async () => {
      const response = await fetch(`/api/executive-dashboard?institutionId=${mockUser.institutionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
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
            <span className="ml-2">Cargando dashboard ejecutivo...</span>
          </div>
        </main>
      </div>
    );
  }

  const hasAdvancedLicense = licenses && licenses.length > 0;
  const components: ComponentStatus[] = dashboardData?.components || [];

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
          <ExecutiveDashboard
            hasAdvancedLicense={hasAdvancedLicense}
            components={components}
          />
        </div>
      </main>
    </div>
  );
}