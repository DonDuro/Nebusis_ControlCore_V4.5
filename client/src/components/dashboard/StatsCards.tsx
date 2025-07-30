import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import TrafficLight from "@/components/dashboard/TrafficLight";
import { TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { useTranslation } from "@/i18n";

interface StatsCardsProps {
  stats?: {
    activeWorkflows: number;
    completedWorkflows: number;
    underReview: number;
    overallProgress: number;
  };
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 60) return "bg-yellow-500";
  if (progress >= 40) return "bg-orange-500";
  return "bg-red-500";
};

const getProgressStatus = (progress: number, t: any) => {
  if (progress >= 80) return { text: t('dashboard.excellent'), color: "bg-green-100 text-green-800" };
  if (progress >= 60) return { text: t('dashboard.good'), color: "bg-yellow-100 text-yellow-800" };
  if (progress >= 40) return { text: t('dashboard.regular'), color: "bg-orange-100 text-orange-800" };
  return { text: t('dashboard.critical'), color: "bg-red-100 text-red-800" };
};

export default function StatsCards({ stats }: StatsCardsProps) {
  const { t } = useTranslation();
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-dr-surface rounded-lg p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const progressStatus = getProgressStatus(stats.overallProgress, t);
  const progressColor = getProgressColor(stats.overallProgress);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-dr-surface rounded-lg p-6 border border-gray-200 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dr-neutral">{t('dashboard.activeWorkflows')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeWorkflows}</p>
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {t('dashboard.inProgress')}
                  </Badge>
                </div>
                <div className="w-16 h-16 bg-dr-blue bg-opacity-10 rounded-xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-dr-blue" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-dr-success mr-1" />
                <span className="text-dr-success font-medium">8%</span>
                <span className="text-dr-neutral ml-1">{t('dashboard.sinceLastMonth')}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('dashboard.activeWorkflowsTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-dr-surface rounded-lg p-6 border border-gray-200 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dr-neutral">{t('dashboard.completed')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedWorkflows}</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('dashboard.finished')}
                  </Badge>
                </div>
                <div className="w-16 h-16 bg-dr-success bg-opacity-10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-dr-success" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-dr-success mr-1" />
                <span className="text-dr-success font-medium">12%</span>
                <span className="text-dr-neutral ml-1">{t('dashboard.sinceLastMonth')}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('dashboard.completedWorkflowsTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-dr-surface rounded-lg p-6 border border-gray-200 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dr-neutral">{t('dashboard.underReview')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.underReview}</p>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-2">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {t('dashboard.pending')}
                  </Badge>
                </div>
                <div className="w-16 h-16 bg-dr-warning bg-opacity-10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-dr-warning" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-dr-error mr-1" />
                <span className="text-dr-error font-medium">5%</span>
                <span className="text-dr-neutral ml-1">{t('dashboard.sinceLastMonth')}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('dashboard.underReviewTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-dr-surface rounded-lg p-6 border border-gray-200 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-dr-neutral">{t('dashboard.cosoCompliance')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.overallProgress}%</p>
                  <Badge variant="secondary" className={`mt-2 ${progressStatus.color}`}>
                    <BarChart3 className="w-3 h-3 mr-1" />
                    {progressStatus.text}
                  </Badge>
                </div>
                <div className="w-16 h-16 bg-dr-light-blue bg-opacity-10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-dr-light-blue" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dr-neutral">{t('dashboard.progress')}</span>
                  <span className="font-medium text-gray-900">{stats.overallProgress}%</span>
                </div>
                <Progress value={stats.overallProgress} className="h-2" />
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-dr-success mr-1" />
                  <span className="text-dr-success font-medium">15%</span>
                  <span className="text-dr-neutral ml-1">{t('dashboard.sinceLastMonth')}</span>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('dashboard.cosoComplianceTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    

  );
}
