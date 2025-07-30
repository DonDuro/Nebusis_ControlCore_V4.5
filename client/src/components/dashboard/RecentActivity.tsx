interface Activity {
  id: number;
  type: string;
  description: string;
  user: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "workflow_completed":
        return { icon: "fa-check", color: "text-dr-success", bg: "bg-dr-success bg-opacity-10" };
      case "evidence_uploaded":
        return { icon: "fa-upload", color: "text-dr-light-blue", bg: "bg-dr-light-blue bg-opacity-10" };
      case "workflow_created":
        return { icon: "fa-plus", color: "text-dr-light-blue", bg: "bg-dr-light-blue bg-opacity-10" };
      case "user_assigned":
        return { icon: "fa-user-plus", color: "text-dr-light-blue", bg: "bg-dr-light-blue bg-opacity-10" };
      default:
        return { icon: "fa-bell", color: "text-dr-warning", bg: "bg-dr-warning bg-opacity-10" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours === 0) return "Hace unos minutos";
    if (diffInHours === 1) return "Hace 1 hora";
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours === 24) return "Ayer";
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  if (activities.length === 0) {
    return (
      <div className="bg-dr-surface rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <i className="fas fa-history text-gray-400 text-3xl mb-3"></i>
            <p className="text-gray-500">No hay actividad reciente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dr-surface rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          <button className="text-dr-light-blue hover:text-dr-blue text-sm font-medium">
            Ver Historial
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const iconInfo = getActivityIcon(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${iconInfo.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <i className={`fas ${iconInfo.icon} ${iconInfo.color} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>
                    {" "}{activity.description}
                  </p>
                  <p className="text-sm text-dr-neutral">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
