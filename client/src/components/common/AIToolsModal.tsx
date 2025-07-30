import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIToolsModal({ isOpen, onClose }: AIToolsModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "¡Hola! Soy tu asistente para implementar las COSO. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Send to AI
    chatMutation.mutate(inputMessage);
  };

  const quickQuestions = [
    { icon: "fa-question-circle", text: "Explicar componente COSO" },
    { icon: "fa-magic", text: "Generar plantilla de política" },
    { icon: "fa-clipboard-check", text: "Revisar cumplimiento" },
    { icon: "fa-lightbulb", text: "Sugerir mejoras" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className="fas fa-robot text-dr-blue"></i>
            <span>Asistente IA para COSO</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-dr-blue text-white"
                    : "bg-dr-blue bg-opacity-5 text-gray-900"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-dr-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                )}
                {message.role === "user" && (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-dr-blue bg-opacity-5 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dr-blue"></div>
                  <span className="text-sm text-gray-600">Escribiendo...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(question.text);
                  handleSendMessage();
                }}
                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <i className={`fas ${question.icon} text-dr-light-blue`}></i>
                  <span>{question.text}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex space-x-2 p-4 border-t">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu pregunta sobre COSO..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={chatMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            className="bg-dr-light-blue text-white hover:bg-dr-blue"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
