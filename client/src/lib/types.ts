export interface DashboardStats {
  activeWorkflows: number;
  completedWorkflows: number;
  underReview: number;
  overallProgress: number;
}

export interface ActivityWithUser {
  id: number;
  type: string;
  description: string;
  user: string;
  workflowId?: number;
  institutionId: number;
  createdAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  componentType: string;
  steps: number;
  duration: string;
  icon: string;
  color: string;
}

export interface COSOComponent {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "not_started" | "in_progress" | "under_review" | "completed";
  dueDate?: string;
  completedTasks: number;
  totalTasks: number;
}
