import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  FileText,
  Shield,
  Activity
} from "lucide-react";

interface AnalyticalChartsProps {
  stats: any;
  workflows: any[];
  complianceScores: any[];
}

export default function AnalyticalCharts({ stats, workflows, complianceScores }: AnalyticalChartsProps) {
  const { t } = useTranslation();
  const getComplianceColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getComplianceTextColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-yellow-700";
    if (score >= 40) return "text-orange-700";
    return "text-red-700";
  };

  const componentNames = {
    environment_control: t('coso.components.controlEnvironment'),
    risk_assessment: t('coso.components.riskAssessment'),
    control_activities: t('coso.components.controlActivities'),
    information_communication: t('coso.components.informationCommunication'),
    monitoring: t('coso.components.monitoring')
  };

  const componentColors = {
    environment_control: "bg-primary",
    control_environment: "bg-primary",
    ambiente_control: "bg-primary",
    risk_assessment: "bg-orange-500", 
    control_activities: "bg-green-500",
    information_communication: "bg-purple-500",
    monitoring: "bg-red-500"
  };

  return (
    <div className="space-y-6">

      {/* COSO Components Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('dashboard.componentProgress')}
          </CardTitle>
          <CardDescription>{t('dashboard.componentProgressDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceScores?.map((score: any) => {
              const componentName = componentNames[score.componentType as keyof typeof componentNames] || score.componentType;
              const componentColor = componentColors[score.componentType as keyof typeof componentColors] || "bg-gray-500";
              
              return (
                <div key={score.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${componentColor}`}></div>
                      <span className="font-medium text-sm">{componentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={score.score >= 70 ? "default" : "secondary"} className="text-xs">
                        {score.score}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={score.score} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {t('dashboard.complianceTrend')}
            </CardTitle>
            <CardDescription>{t('dashboard.complianceTrendDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[t('months.january'), t('months.february'), t('months.march'), t('months.april')].map((month, index) => {
                const progress = 45 + (index * 8); // Simulated improvement
                return (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month}</span>
                    <div className="flex items-center gap-2 w-32">
                      <Progress value={progress} className="h-2" />
                      <span className="text-xs font-medium">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              {t('dashboard.alertsNotifications')}
            </CardTitle>
            <CardDescription>{t('dashboard.alertsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">{t('dashboard.critical')}</span>
                </div>
                <Badge variant="destructive">2</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">{t('dashboard.warnings')}</span>
                </div>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary/100 rounded-full"></div>
                  <span className="text-sm">{t('dashboard.information')}</span>
                </div>
                <Badge variant="outline">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            {t('dashboard.recentActivity')}
          </CardTitle>
          <CardDescription>{t('dashboard.recentActivityDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: t('time.twoHoursAgo'), action: t('activity.workflowUpdated', { workflow: t('coso.components.controlEnvironment') }), user: "Ana Rodriguez", type: "update" },
              { time: t('time.fiveHoursAgo'), action: t('activity.documentUploaded', { document: t('activity.proceduresManual') }), user: "Carlos Mejía", type: "upload" },
              { time: t('time.yesterday'), action: t('activity.verificationCompleted', { component: t('coso.components.riskAssessment') }), user: "María Santos", type: "complete" },
              { time: t('time.twoDaysAgo'), action: t('activity.workflowCreated', { workflow: t('coso.components.controlActivities') }), user: "Luis Pérez", type: "create" }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'complete' ? 'bg-green-500' :
                  activity.type === 'update' ? 'bg-primary/100' :
                  activity.type === 'upload' ? 'bg-purple-500' : 'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{t('activity.by')} {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}