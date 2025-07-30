import { CheckCircle, AlertCircle, XCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrafficLightProps {
  status: "completed" | "in_progress" | "at_risk" | "not_started";
  progress: number;
  title: string;
  description?: string;
}

export default function TrafficLight({ status, progress, title, description }: TrafficLightProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-500",
          icon: <CheckCircle className="w-4 h-4 text-white" />,
          text: "Completado",
          textColor: "text-green-800",
          bgColor: "bg-green-100"
        };
      case "in_progress":
        return {
          color: "bg-yellow-500",
          icon: <AlertCircle className="w-4 h-4 text-white" />,
          text: "En Progreso",
          textColor: "text-yellow-800",
          bgColor: "bg-yellow-100"
        };
      case "at_risk":
        return {
          color: "bg-red-500",
          icon: <XCircle className="w-4 h-4 text-white" />,
          text: "En Riesgo",
          textColor: "text-red-800",
          bgColor: "bg-red-100"
        };
      default:
        return {
          color: "bg-gray-300",
          icon: <Circle className="w-4 h-4 text-gray-600" />,
          text: "No Iniciado",
          textColor: "text-gray-600",
          bgColor: "bg-gray-100"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              {/* Traffic Light Indicator */}
              <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{progress}% completado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${config.bgColor} ${config.textColor}`}>
                {config.text}
              </Badge>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{progress}%</div>
                <div className="w-16 h-1 bg-gray-200 rounded-full">
                  <div 
                    className={`h-1 rounded-full ${config.color} transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm opacity-75">{description}</p>
            <p className="text-sm">Estado: {config.text} ({progress}%)</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}