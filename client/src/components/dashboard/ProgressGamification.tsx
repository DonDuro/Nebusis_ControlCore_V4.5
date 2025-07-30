import { useState } from "react";
import { Trophy, Star, Award, Target, Zap, TrendingUp, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface ProgressGamificationProps {
  overallProgress: number;
  completedWorkflows: number;
  activeWorkflows: number;
  onViewAchievements?: () => void;
}

export default function ProgressGamification({
  overallProgress,
  completedWorkflows,
  activeWorkflows,
  onViewAchievements
}: ProgressGamificationProps) {
  const [selectedTab, setSelectedTab] = useState<"progress" | "achievements">("progress");

  // Calculate user level based on progress
  const calculateLevel = (progress: number): { level: number; xp: number; nextLevelXp: number } => {
    const xp = Math.floor(progress * 10 + completedWorkflows * 50);
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = (level - 1) * 100;
    const nextLevelXp = level * 100;
    
    return {
      level,
      xp: xp - currentLevelXp,
      nextLevelXp: nextLevelXp - currentLevelXp
    };
  };

  const { level, xp, nextLevelXp } = calculateLevel(overallProgress);

  const achievements: Achievement[] = [
    {
      id: "first_workflow",
      name: "Primer Paso",
      description: "Completa tu primer flujo de trabajo COSO",
      icon: "🚀",
      unlocked: completedWorkflows >= 1,
      progress: Math.min(completedWorkflows, 1),
      target: 1,
      points: 50,
      rarity: "common"
    },
    {
      id: "environment_master",
      name: "Maestro del Ambiente",
      description: "Domina completamente el Ambiente de Control",
      icon: "🏛️",
      unlocked: overallProgress >= 20,
      progress: Math.min(overallProgress, 20),
      target: 20,
      points: 100,
      rarity: "rare"
    },
    {
      id: "multitasker",
      name: "Multitarea",
      description: "Mantén 3 flujos de trabajo activos simultáneamente",
      icon: "⚡",
      unlocked: activeWorkflows >= 3,
      progress: Math.min(activeWorkflows, 3),
      target: 3,
      points: 75,
      rarity: "rare"
    },
    {
      id: "halfway_hero",
      name: "Héroe del Camino",
      description: "Alcanza el 50% de cumplimiento COSO",
      icon: "🎯",
      unlocked: overallProgress >= 50,
      progress: Math.min(overallProgress, 50),
      target: 50,
      points: 200,
      rarity: "epic"
    },
    {
      id: "nobaci_champion",
      name: "Campeón COSO",
      description: "Logra el 100% de cumplimiento institucional",
      icon: "🏆",
      unlocked: overallProgress >= 100,
      progress: Math.min(overallProgress, 100),
      target: 100,
      points: 500,
      rarity: "legendary"
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800";
      case "rare": return "bg-primary/10 text-primary";
      case "epic": return "bg-purple-100 text-purple-800";
      case "legendary": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelTitle = (level: number) => {
    if (level <= 2) return "Principiante COSO";
    if (level <= 5) return "Implementador";
    if (level <= 10) return "Especialista";
    if (level <= 15) return "Experto";
    return "Maestro COSO";
  };

  const getMotivationalMessage = () => {
    if (overallProgress < 20) return "¡Excelente inicio! Continúa configurando tu sistema COSO.";
    if (overallProgress < 50) return "¡Gran progreso! Estás avanzando muy bien en la implementación.";
    if (overallProgress < 80) return "¡Impresionante! Estás muy cerca de completar COSO.";
    return "¡Felicitaciones! Eres un verdadero líder en cumplimiento.";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Progreso y Logros
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={selectedTab === "progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("progress")}
            >
              Progreso
            </Button>
            <Button
              variant={selectedTab === "achievements" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("achievements")}
            >
              Logros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedTab === "progress" ? (
          <div className="space-y-6">
            {/* Level Progress */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary/100 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="text-white font-bold text-xl">{level}</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-800" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nivel {level}</h3>
                <p className="text-sm text-gray-600">{getLevelTitle(level)}</p>
                <Badge variant="secondary" className="mt-2">
                  {totalPoints} puntos totales
                </Badge>
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experiencia</span>
                <span className="font-medium">{xp}/{nextLevelXp} XP</span>
              </div>
              <Progress value={(xp / nextLevelXp) * 100} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {nextLevelXp - xp} XP para el siguiente nivel
              </p>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cumplimiento COSO</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <p className="text-xs text-gray-500 text-center">
                {getMotivationalMessage()}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedWorkflows}</div>
                <div className="text-xs text-gray-600">Flujos Completados</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{activeWorkflows}</div>
                <div className="text-xs text-gray-600">Flujos Activos</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Achievements Header */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {unlockedAchievements.length} de {achievements.length} logros desbloqueados
              </p>
              <Progress 
                value={(unlockedAchievements.length / achievements.length) * 100} 
                className="mt-2" 
              />
            </div>

            {/* Achievements List */}
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <TooltipProvider key={achievement.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`p-3 rounded-lg border transition-all ${
                        achievement.unlocked 
                          ? "bg-green-50 border-green-200" 
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{achievement.name}</h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getRarityColor(achievement.rarity)}`}
                              >
                                {achievement.rarity}
                              </Badge>
                              {achievement.unlocked && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <Medal className="w-3 h-3" />
                                  +{achievement.points} pts
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                            {!achievement.unlocked && (
                              <div className="mt-2">
                                <Progress 
                                  value={(achievement.progress / achievement.target) * 100} 
                                  className="h-1" 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {achievement.progress}/{achievement.target}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm opacity-75">{achievement.description}</p>
                        <p className="text-sm">
                          {achievement.unlocked ? "¡Desbloqueado!" : `Progreso: ${achievement.progress}/${achievement.target}`}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center pt-4">
              <Button variant="outline" size="sm" onClick={onViewAchievements}>
                Ver Todos los Logros
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}