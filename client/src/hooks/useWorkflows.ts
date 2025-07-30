import { useQuery } from "@tanstack/react-query";
import { Workflow } from "@shared/schema";

export function useWorkflows(institutionId: number) {
  return useQuery<Workflow[]>({
    queryKey: ["/api/workflows", { institutionId }],
    enabled: !!institutionId,
  });
}

export function useWorkflow(id: number) {
  return useQuery<Workflow>({
    queryKey: ["/api/workflows", id],
    enabled: !!id,
  });
}

export function useWorkflowSteps(workflowId: number) {
  return useQuery({
    queryKey: ["/api/workflows", workflowId, "steps"],
    enabled: !!workflowId,
  });
}
