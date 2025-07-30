import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { searchGlossary } from "@/data/coso-glossary";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const predefinedQuestions = [
  "What is Nebusis® ControlCore?",
  "What are the 5 internal control components?",
  "How to implement control environment?",
  "What is risk assessment?",
  "How to document control activities?",
  "What information systems do I need?",
  "How to perform monitoring activities?",
  "What is the legal framework?"
];

const controlCoreResponses = {
  "what is controlcore": "Nebusis® ControlCore is a universal internal control framework supporting both COSO and INTOSAI standards. It consists of five fundamental components: Control Environment, Risk Assessment, Control Activities, Information & Communication, and Monitoring Activities.",
  
  "internal control components": "The 5 Nebusis® ControlCore components are:\n1. Control Environment - Fundamental foundation establishing organizational tone\n2. Risk Assessment - Risk identification and analysis\n3. Control Activities - Control policies and procedures\n4. Information & Communication - Information systems and communication\n5. Monitoring Activities - Ongoing supervision of the system",
  
  "ambiente de control": "El Ambiente de Control incluye:\n• Integridad y valores éticos\n• Estructura organizacional\n• Supervisión del sistema de control interno\n• Administración del talento humano\n• Evaluación del control interno\n\nEs el fundamento de todos los demás componentes.",
  
  "evaluación de riesgos": "La Evaluación de Riesgos comprende:\n• Establecimiento de objetivos institucionales\n• Identificación de eventos y riesgos\n• Evaluación de riesgos incluyendo fraude\n• Respuesta a los riesgos (aceptar, evitar, mitigar, compartir)",
  
  "actividades de control": "Las Actividades de Control incluyen:\n• Controles para mitigar riesgos clave\n• Controles en sistemas de información\n• Políticas y procedimientos documentados\n• Segregación de funciones\n• Autorizaciones apropiadas",
  
  "información y comunicación": "Información y Comunicación abarca:\n• Calidad y suficiencia de la información\n• Sistemas integrados de información\n• Controles en sistemas de TI\n• Comunicación interna y externa\n• Archivo y registros institucionales",
  
  "monitoreo y evaluación": "Monitoreo y Evaluación incluye:\n• Supervisión continua de controles\n• Autoevaluación del control interno\n• Evaluación de efectividad\n• Informes de evaluaciones\n• Seguimiento de recomendaciones",
  
  "marco legal": "El marco legal COSO incluye:\n• COSO Internal Control Framework - Committee of Sponsoring Organizations\n• INTOSAI Standards - International Organization of Supreme Audit Institutions\n• Enterprise Risk Management Framework\n• Internal Control Guidance for entities worldwide"
};

export function AIHelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your Nebusis® ControlCore assistant. I can help you with questions about internal control, Nebusis® ControlCore components, and how to use this application. How can I help you?",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Search in glossary first
    const glossaryResults = searchGlossary(message);
    if (glossaryResults.length > 0) {
      const term = glossaryResults[0];
      return `**${term.term}**: ${term.definition}${term.relatedTerms ? `\n\nTérminos relacionados: ${term.relatedTerms.join(', ')}` : ''}`;
    }
    
    // Search in predefined responses
    for (const [key, response] of Object.entries(controlCoreResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Application help
    if (message.includes("application") || message.includes("system") || message.includes("use")) {
      return "This application helps you:\n• View control dashboard with compliance statistics\n• Manage Nebusis® ControlCore workflows\n• Perform compliance verifications\n• Upload and manage institutional documents\n• Consult the terminology glossary\n\nNavigate using the sidebar menu to access each section.";
    }
    
    if (message.includes("verificación") || message.includes("checklist")) {
      return "En la sección de Verificación puedes:\n• Seleccionar componentes COSO\n• Responder preguntas de cumplimiento (Sí/No/Parcial)\n• Agregar comentarios y observaciones\n• Vincular documentos de evidencia\n• Seleccionar flujos de trabajo para guardar respuestas";
    }
    
    if (message.includes("documento")) {
      return "En la sección de Documentos puedes:\n• Subir documentos institucionales por categorías\n• Organizar documentos por tipo (leyes, reglamentos, organigramas, etc.)\n• Usar IA para personalizar flujos de trabajo según tu contexto\n• Vincular documentos como evidencia en verificaciones";
    }
    
    // Default response
    return "Puedo ayudarte con:\n• Conceptos y definiciones COSO\n• Los 5 componentes del control interno\n• Cómo usar esta aplicación\n• Marco legal y normativo\n\n¿Podrías ser más específico sobre tu consulta?";
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date()
    };
    
    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: generateResponse(currentMessage),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage, botResponse]);
    setCurrentMessage("");
  };

  const handlePredefinedQuestion = (question: string) => {
    setCurrentMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-dr-blue hover:bg-dr-dark-blue shadow-lg z-50"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-dr-blue" />
            Asistente COSO
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          {/* Quick Questions */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {predefinedQuestions.slice(0, 4).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePredefinedQuestion(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    message.type === "user" ? "bg-dr-blue" : "bg-gray-100"
                  }`}>
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-dr-blue" />
                    )}
                  </div>
                  <div className={`max-w-[70%] p-3 rounded-lg ${
                    message.type === "user" 
                      ? "bg-dr-blue text-white" 
                      : "bg-gray-50"
                  }`}>
                    <div className="whitespace-pre-line text-sm">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.type === "user" ? "text-primary/20" : "text-gray-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Escribe tu pregunta sobre COSO..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}