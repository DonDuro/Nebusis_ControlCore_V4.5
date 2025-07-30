import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import SidebarSimple from "@/components/layout/SidebarSimple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Settings, Bell, User, Shield, AlertTriangle, CheckCircle, Clock, Lock, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ConfigurationPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: institution } = useQuery({
    queryKey: ["/api/institutions/1"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats", { institutionId: 1 }],
    enabled: !!user,
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch(`/api/users/${user?.id}/notifications`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: enabled }),
      });
      if (!response.ok) throw new Error(t('settings.errorUpdatingPreferences'));
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('settings.preferencesUpdated'),
        description: t('settings.notificationConfigSaved'),
      });
    },
  });

  const createTestNotificationMutation = useMutation({
    mutationFn: async () => {
      // Create a test notification internally
      const testNotification = {
        id: Date.now(),
        title: t('settings.testNotificationTitle'),
        description: t('settings.testNotificationDesc'),
        type: "info",
        timestamp: new Date().toISOString(),
        read: false
      };
      return testNotification;
    },
    onSuccess: () => {
      toast({
        title: t('settings.notificationCreated'),
        description: t('settings.testNotificationCreated'),
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch(`/api/users/${user?.id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || t('settings.invalidCurrentPassword'));
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('settings.passwordChanged'),
        description: t('settings.passwordChanged'),
      });
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/reset-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Error sending reset email");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('settings.passwordResetSent'),
        description: t('settings.passwordResetSent'),
      });
      setIsResetDialogOpen(false);
    },
  });

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('settings.passwordsDoNotMatch'),
        variant: "destructive"
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        institution={institution} 
        onMobileMenuToggle={() => setSidebarOpen(true)}
        stats={stats}
      />
      
      <div className="flex h-screen pt-16">
        <SidebarSimple 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Settings className="h-8 w-8 text-dr-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
                <p className="text-gray-600">{t('settings.description')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* User Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-dr-blue" />
                    {t('settings.userPreferences')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.userPreferencesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('settings.autoBackup')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.autoBackupDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label className="text-base">{t('settings.userInformation')}</Label>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm"><span className="font-medium">{t('settings.name')}:</span> {user?.firstName || ''} {user?.lastName || ''}</p>
                      <p className="text-sm"><span className="font-medium">{t('settings.email')}:</span> {user?.email || ''}</p>
                      <p className="text-sm"><span className="font-medium">{t('settings.institution')}:</span> {institution?.name || ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alert Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-dr-blue" />
                    {t('settings.alertConfiguration')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.alertConfigurationDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('settings.emailNotifications')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.emailNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked);
                        updateNotificationsMutation.mutate(checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('settings.securityAlerts')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.securityAlertsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={securityAlerts}
                      onCheckedChange={setSecurityAlerts}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label className="text-base">{t('settings.alertTypes')}</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>{t('settings.overdueWorkflows')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>{t('settings.upcomingDeadlines')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary/100" />
                        <span>{t('settings.workflowsRequireReview')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-gray-500" />
                        <span>{t('settings.multiplePendingSteps')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-dr-blue" />
                    {t('settings.passwordSecurity')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.passwordSecurityDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Key className="h-4 w-4 mr-2" />
                          {t('settings.changePassword')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('settings.changePassword')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>{t('settings.currentPassword')}</Label>
                            <Input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>{t('settings.newPassword')}</Label>
                            <Input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>{t('settings.confirmPassword')}</Label>
                            <Input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                          </div>
                          <p className="text-xs text-gray-500">{t('settings.passwordRequirements')}</p>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                              {t('settings.cancel')}
                            </Button>
                            <Button 
                              onClick={handlePasswordChange}
                              disabled={changePasswordMutation.isPending}
                            >
                              {changePasswordMutation.isPending ? t('settings.creating') : t('settings.save')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Lock className="h-4 w-4 mr-2" />
                          {t('settings.resetPassword')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('settings.resetPassword')}</DialogTitle>
                          <DialogDescription>
                            {t('settings.resetPasswordDesc')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>{t('settings.email')}</Label>
                            <Input
                              type="email"
                              value={user?.email || ''}
                              disabled
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                              {t('settings.cancel')}
                            </Button>
                            <Button 
                              onClick={() => resetPasswordMutation.mutate(user?.email || '')}
                              disabled={resetPasswordMutation.isPending}
                            >
                              {resetPasswordMutation.isPending ? t('settings.creating') : t('settings.sendResetLink')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Testing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-dr-blue" />
                    {t('settings.notificationTesting')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.notificationTestingDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('settings.testNotificationDesc')}
                  </p>
                  
                  <Button 
                    onClick={() => createTestNotificationMutation.mutate()}
                    disabled={createTestNotificationMutation.isPending}
                    className="w-full bg-dr-blue hover:bg-dr-blue/90"
                  >
                    {createTestNotificationMutation.isPending ? t('settings.creating') : t('settings.createTestNotification')}
                  </Button>
                  
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-gray-700">
                      <span className="font-medium text-green-600">{t('settings.internalSystem')}</span> 
                      {" "}{t('settings.notificationsShowDirectly')}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-dr-blue" />
                    {t('settings.securityConfiguration')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.securityConfigurationDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">{t('settings.activeConfigurations')}</Label>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{t('settings.secureSessionEnabled')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{t('settings.dataEncryptionActive')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{t('settings.accessAuditEnabled')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-primary/100 bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-gray-700">
                      <span className="font-medium text-primary">{t('settings.secure')}</span> 
                      {" "}{t('settings.allSecurityConfigsActive')}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}