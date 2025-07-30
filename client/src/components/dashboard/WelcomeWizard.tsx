import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, ArrowRight, BookOpen, FileText, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WelcomeWizardProps {
  user: any;
  institution: any;
  onComplete?: () => void;
}

const setupSteps = [
  {
    id: 1,
    title: "Configuración Inicial",
    description: "Configura tu perfil y preferencias",
    icon: <Settings className="w-5 h-5" />,
    completed: true,
    estimated: "5 min"
  },
  {
    id: 2,
    title: "Cargar Documentos",
    description: "Sube documentos institucionales clave",
    icon: <FileText className="w-5 h-5" />,
    completed: false,
    estimated: "15 min"
  },
  {
    id: 3,
    title: "Conocer COSO",
    description: "Revisa los 5 componentes principales",
    icon: <BookOpen className="w-5 h-5" />,
    completed: false,
    estimated: "10 min"
  }
];

export default function WelcomeWizard({ user, institution, onComplete }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const completedSteps = setupSteps.filter(step => step.completed).length;
  const totalSteps = setupSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleNextStep = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      onComplete?.();
    }
  };

  const isFirstTime = completedSteps === 0;

  return (
    <>
      {/* Welcome Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-indigo-50 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">
                {isFirstTime ? `¡Bienvenido/a, ${user.firstName}!` : `Hola de nuevo, ${user.firstName}`}
              </CardTitle>
              <CardDescription className="text-primary">
                {isFirstTime 
                  ? "Te ayudamos a configurar tu sistema COSO en pocos pasos"
                  : "Continúa con la configuración de tu sistema COSO"
                }
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary">Progreso inicial</p>
              <p className="text-2xl font-bold text-primary">{completedSteps}/{totalSteps}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary">Configuración</span>
                <span className="text-primary font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Setup Steps Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {setupSteps.map((step) => (
                <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                  step.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {step.completed ? <CheckCircle className="w-4 h-4" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      step.completed ? 'text-green-800' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-600">{step.estimated}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary/100" />
                <span className="text-sm text-primary">
                  Tiempo estimado: {30 - (completedSteps * 10)} minutos
                </span>
              </div>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary">
                    {isFirstTime ? "Empezar Configuración" : "Continuar Configuración"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Configuración Nebusis® ControlCore - Paso {currentStep + 1}
                    </DialogTitle>
                    <DialogDescription>
                      {setupSteps[currentStep]?.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Step Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {setupSteps[currentStep]?.icon}
                        <span className="font-medium">{setupSteps[currentStep]?.title}</span>
                      </div>
                      <Badge variant="outline">
                        Paso {currentStep + 1} de {totalSteps}
                      </Badge>
                    </div>

                    {/* Step Content */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      {currentStep === 0 && (
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Configuración Inicial</h3>
                          <p className="text-sm text-gray-600">
                            Tu perfil básico ya está configurado. Aquí puedes ver tu información:
                          </p>
                          <div className="bg-white rounded-lg p-4 border">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Nombre</label>
                                <p className="text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Institución</label>
                                <p className="text-sm text-gray-900">{institution.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Rol</label>
                                <p className="text-sm text-gray-900">{user.role}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <p className="text-sm text-gray-900">{user.email}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Documentos Institucionales</h3>
                          <p className="text-sm text-gray-600">
                            Para personalizar tu experiencia COSO, recomendamos cargar estos documentos:
                          </p>
                          <div className="space-y-3">
                            {["Ley de Creación", "Reglamento Interno", "Organigrama", "Manual de Funciones"].map((doc) => (
                              <div key={doc} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-900">{doc}</span>
                                <Badge variant="outline" className="ml-auto">Opcional</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Componentes COSO</h3>
                          <p className="text-sm text-gray-600">
                            COSO se basa en 5 componentes principales de control interno:
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { name: "Ambiente de Control", color: "bg-primary/20 text-primary" },
                              { name: "Evaluación de Riesgos", color: "bg-orange-100 text-orange-800" },
                              { name: "Actividades de Control", color: "bg-green-100 text-green-800" },
                              { name: "Información y Comunicación", color: "bg-purple-100 text-purple-800" },
                              { name: "Supervisión", color: "bg-red-100 text-red-800" }
                            ].map((component) => (
                              <div key={component.name} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                                <span className="text-sm text-gray-900">{component.name}</span>
                                <Badge variant="secondary" className={`ml-auto ${component.color}`}>
                                  Componente
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        Anterior
                      </Button>
                      <Button onClick={handleNextStep}>
                        {currentStep === totalSteps - 1 ? "Finalizar" : "Siguiente"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}