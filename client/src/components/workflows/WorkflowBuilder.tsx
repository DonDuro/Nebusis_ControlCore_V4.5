import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  User, 
  Target, 
  FileText,
  Settings,
  Lightbulb,
  Save,
  X
} from "lucide-react";
import { workflowStepTemplates, type WorkflowStep } from "@/data/coso-workflows";
import { useTranslation } from "@/i18n";

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  componentType: string;
  subcomponent?: string;
  onSave: (workflow: {
    name: string;
    description: string;
    componentType: string;
    steps: WorkflowStep[];
  }) => void;
}

export default function WorkflowBuilder({ 
  isOpen, 
  onClose, 
  componentType, 
  subcomponent, 
  onSave 
}: WorkflowBuilderProps) {
  const { t } = useTranslation();
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  // Get suggested steps based on component type
  const suggestedSteps = workflowStepTemplates[componentType as keyof typeof workflowStepTemplates] || [];

  useEffect(() => {
    if (isOpen && subcomponent) {
      setWorkflowName(`${subcomponent} - Workflow`);
      setWorkflowDescription(`Workflow para implementar: ${subcomponent}`);
    }
  }, [isOpen, subcomponent]);

  const addSuggestedStep = (template: typeof suggestedSteps[0]) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sequenceNumber: steps.length + 1,
      name: template.name,
      description: template.description,
      responsibleRole: template.responsibleRole,
      trigger: template.trigger,
      expectedOutput: template.expectedOutput,
      estimatedDuration: template.estimatedDuration,
      requiredResources: [...template.requiredResources],
      status: "not_started"
    };
    setSteps([...steps, newStep]);
  };

  const addCustomStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sequenceNumber: steps.length + 1,
      name: "Nueva actividad",
      description: "Descripción de la actividad",
      responsibleRole: "Responsable",
      trigger: "manual",
      expectedOutput: "Resultado esperado",
      estimatedDuration: "5 días",
      requiredResources: [],
      status: "not_started"
    };
    setSteps([...steps, newStep]);
    setEditingStepId(newStep.id);
  };

  const updateStep = (stepId: string, field: keyof WorkflowStep, value: any) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const removeStep = (stepId: string) => {
    const filteredSteps = steps.filter(step => step.id !== stepId);
    // Renumber sequence
    const renumberedSteps = filteredSteps.map((step, index) => ({
      ...step,
      sequenceNumber: index + 1
    }));
    setSteps(renumberedSteps);
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;
    
    if (direction === 'up' && stepIndex > 0) {
      const newSteps = [...steps];
      [newSteps[stepIndex], newSteps[stepIndex - 1]] = [newSteps[stepIndex - 1], newSteps[stepIndex]];
      // Update sequence numbers
      newSteps.forEach((step, index) => {
        step.sequenceNumber = index + 1;
      });
      setSteps(newSteps);
    } else if (direction === 'down' && stepIndex < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[stepIndex], newSteps[stepIndex + 1]] = [newSteps[stepIndex + 1], newSteps[stepIndex]];
      // Update sequence numbers
      newSteps.forEach((step, index) => {
        step.sequenceNumber = index + 1;
      });
      setSteps(newSteps);
    }
  };

  const handleSave = () => {
    if (!workflowName.trim() || steps.length === 0) return;
    
    onSave({
      name: workflowName,
      description: workflowDescription,
      componentType,
      steps
    });
    
    // Reset form
    setWorkflowName('');
    setWorkflowDescription('');
    setSteps([]);
    setShowSuggestions(true);
    onClose();
  };

  const handleClose = () => {
    setWorkflowName('');
    setWorkflowDescription('');
    setSteps([]);
    setShowSuggestions(true);
    setEditingStepId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Create New Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Workflow Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="e.g., Control Assessment..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Describe the workflow purpose..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{componentType}</Badge>
                  {subcomponent && <Badge variant="secondary">{subcomponent}</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Steps */}
            {showSuggestions && suggestedSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Suggested Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {suggestedSteps.map((template, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => addSuggestedStep(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {template.estimatedDuration}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  {template.responsibleRole}
                                </Badge>
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                    className="w-full mt-2"
                  >
                    Hide Suggestions
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Workflow Steps */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Workflow Steps ({steps.length})</CardTitle>
                  <div className="flex gap-2">
                    {!showSuggestions && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSuggestions(true)}
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Show Suggestions
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={addCustomStep}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100%-80px)]">
                  {steps.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No steps added</p>
                      <p className="text-sm">Add suggested steps or create a custom one</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <Card key={step.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{step.sequenceNumber}</Badge>
                                {editingStepId === step.id ? (
                                  <Input
                                    value={step.name}
                                    onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                    className="font-medium"
                                  />
                                ) : (
                                  <h3 className="font-medium">{step.name}</h3>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveStep(step.id, 'up')}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveStep(step.id, 'down')}
                                  disabled={index === steps.length - 1}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingStepId(editingStepId === step.id ? null : step.id)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeStep(step.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {editingStepId === step.id ? (
                              <div className="space-y-4">
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                    rows={2}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Responsible</Label>
                                    <Input
                                      value={step.responsibleRole}
                                      onChange={(e) => updateStep(step.id, 'responsibleRole', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Estimated Duration</Label>
                                    <Input
                                      value={step.estimatedDuration}
                                      onChange={(e) => updateStep(step.id, 'estimatedDuration', e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Trigger</Label>
                                  <Select 
                                    value={step.trigger} 
                                    onValueChange={(value) => updateStep(step.id, 'trigger', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="manual">Manual</SelectItem>
                                      <SelectItem value="automatic">Automatic</SelectItem>
                                      <SelectItem value="after_previous">After Previous</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label>Resultado Esperado</Label>
                                  <Textarea
                                    value={step.expectedOutput}
                                    onChange={(e) => updateStep(step.id, 'expectedOutput', e.target.value)}
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-700">{step.description}</p>
                                
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1 text-sm">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span>{step.responsibleRole}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>{step.estimatedDuration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {step.trigger === 'manual' ? 'Manual' : 
                                     step.trigger === 'automatic' ? 'Automático' : 
                                     'Después del anterior'}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-start gap-1 text-sm">
                                  <Target className="h-4 w-4 text-gray-500 mt-0.5" />
                                  <span className="text-gray-700">{step.expectedOutput}</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {steps.length} pasos configurados
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!workflowName.trim() || steps.length === 0}
              className="bg-nebusis-blue hover:bg-nebusis-blue/90"
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}