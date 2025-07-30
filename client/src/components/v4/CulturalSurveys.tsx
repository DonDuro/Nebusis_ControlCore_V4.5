import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TierIndicator, FeatureUnavailableMessage } from "./TierIndicator";
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  BarChart3,
  Users,
  CheckCircle2,
  Clock
} from "lucide-react";

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

interface CulturalSurveysProps {
  hasAdvancedLicense: boolean;
  surveys: CulturalSurvey[];
  onCreateSurvey: (survey: Partial<CulturalSurvey>) => void;
  onUpdateSurvey: (id: number, survey: Partial<CulturalSurvey>) => void;
  onDeleteSurvey: (id: number) => void;
  onToggleSurveyStatus: (id: number) => void;
}

export function CulturalSurveys({ 
  hasAdvancedLicense, 
  surveys, 
  onCreateSurvey, 
  onUpdateSurvey, 
  onDeleteSurvey,
  onToggleSurveyStatus 
}: CulturalSurveysProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

  const predefinedQuestions = [
    {
      id: '1',
      type: 'rating' as const,
      question: '¿Qué tan bien comprende usted la importancia del control interno en nuestra organización?',
      required: true
    },
    {
      id: '2',
      type: 'rating' as const,
      question: '¿En qué medida siente que puede reportar problemas de control interno sin temor a represalias?',
      required: true
    },
    {
      id: '3',
      type: 'multiple_choice' as const,
      question: '¿Cuál considera que es el mayor desafío para el control interno en su área?',
      options: ['Falta de recursos', 'Falta de conocimiento', 'Resistencia al cambio', 'Falta de liderazgo', 'Otros'],
      required: true
    },
    {
      id: '4',
      type: 'yes_no' as const,
      question: '¿Ha recibido capacitación sobre control interno en los últimos 12 meses?',
      required: true
    },
    {
      id: '5',
      type: 'text' as const,
      question: '¿Qué sugerencias tiene para mejorar el ambiente de control en nuestra organización?',
      required: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-primary/20 text-primary';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'archived': return <Clock className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const CreateSurveyForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Encuesta Cultural
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onCreateSurvey({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            questions: questions.length > 0 ? questions : predefinedQuestions,
            isAnonymous: formData.get('isAnonymous') === 'on',
            status: 'draft'
          });
          setShowCreateForm(false);
          setQuestions([]);
        }} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título de la Encuesta</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input name="title" required placeholder="Ej: Evaluación del Ambiente de Control 2024" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nombre descriptivo de la encuesta cultural</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea name="description" placeholder="Describe el propósito y alcance de la encuesta" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explica los objetivos y la importancia de esta encuesta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" name="isAnonymous" id="isAnonymous" defaultChecked />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="isAnonymous" className="text-sm font-medium cursor-pointer">
                    Encuesta Anónima
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Las respuestas no se vincularán con usuarios específicos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Preguntas de la Encuesta</label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Se incluirán {predefinedQuestions.length} preguntas predefinidas alineadas con COSO:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Comprensión del control interno</li>
                <li>• Ambiente de reporte seguro</li>
                <li>• Desafíos del control interno</li>
                <li>• Capacitación recibida</li>
                <li>• Sugerencias de mejora</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Crear Encuesta
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear la nueva encuesta cultural</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancelar la creación de la encuesta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  // Tier 1: Basic Cultural Surveys
  const BasicSurveys = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Encuestas Culturales</h2>
        <div className="flex items-center space-x-2">
          <TierIndicator hasAdvancedLicense={false} productName="PeopleCore + e-Learning Wizard" />
          {!showCreateForm && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Encuesta
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear nueva encuesta de evaluación cultural</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {showCreateForm && <CreateSurveyForm />}

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <Card key={survey.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{survey.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(survey.status)}>
                    {getStatusIcon(survey.status)}
                    <span className="ml-1 capitalize">{survey.status}</span>
                  </Badge>

                  {survey.status === 'draft' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onToggleSurveyStatus(survey.id)}>
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Activar encuesta para recibir respuestas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {survey.status === 'active' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onToggleSurveyStatus(survey.id)}>
                            <Pause className="h-4 w-4 text-yellow-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pausar encuesta</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver resultados de la encuesta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteSurvey(survey.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar encuesta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{survey.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-primary/100" />
                  <span>{survey.questions.length} preguntas</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  <span>{survey.responseCount} respuestas</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{survey.isAnonymous ? 'Anónima' : 'Con identificación'}</span>
                </div>
              </div>

              {survey.status === 'active' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✓ Encuesta activa - Los usuarios pueden responder
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {surveys.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay encuestas culturales</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primera encuesta cultural para evaluar el ambiente de control interno.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Encuesta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {!hasAdvancedLicense && (
        <FeatureUnavailableMessage productName="PeopleCore + e-Learning Wizard" />
      )}
    </div>
  );

  return <BasicSurveys />;
}

export default CulturalSurveys;