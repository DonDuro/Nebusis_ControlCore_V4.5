import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Temporarily using a placeholder until asset loading is fixed
const nebusisLogo = "/api/assets/Nebusis%20Logo_1749783287386.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  // Auto-fill credentials for calvarado@nebusis.com
  useEffect(() => {
    const autoLoginEmail = localStorage.getItem('controlcore-auto-login-email');
    if (autoLoginEmail === 'calvarado@nebusis.com') {
      setEmail('calvarado@nebusis.com');
      setPassword('admin2024');
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('login.invalidCredentials'));
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Store the session token in localStorage
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
      }
      toast({
        title: t('login.loginSuccess'),
        description: t('success.loginSuccess'),
      });
      // Force a page refresh to trigger authentication check
      window.location.href = "/";
    },
    onError: (error: any) => {
      setError(error.message || t('login.invalidCredentials'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError(t('validation.required'));
      return;
    }

    loginMutation.mutate({ email, password });
  };

  // Demo login function
  const handleDemoLogin = () => {
    setEmail("ana.rodriguez@hacienda.gob.do");
    setPassword("nobaci2024");
    setTimeout(() => {
      loginMutation.mutate({ 
        email: "ana.rodriguez@hacienda.gob.do", 
        password: "nobaci2024" 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dr-bg via-primary/10 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Illustration and Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8 p-8">
          <div className="text-center space-y-4">
            <img 
              src={nebusisLogo} 
              alt="NEBUSIS Logo" 
              className="h-16 w-auto mx-auto"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {t('branding.productName')}
              </h1>
              <p className="text-gray-600 mt-4 max-w-md">
                {t('dashboard.title')}
              </p>
            </div>
          </div>
          
          <div className="w-full max-w-lg space-y-6">
            <div className="relative">
              <div className="w-full bg-gradient-to-br from-primary/10 to-green-50 rounded-lg shadow-lg p-8 border">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                  {/* Workflow Management Illustration */}
                  <rect width="400" height="300" fill="url(#workflowGradient)" rx="8"/>
                  
                  {/* Team Members */}
                  <circle cx="80" cy="80" r="25" fill="#1e40af" opacity="0.8"/>
                  <circle cx="320" cy="80" r="25" fill="#059669" opacity="0.8"/>
                  <circle cx="200" cy="60" r="28" fill="#dc2626" opacity="0.8"/>
                  
                  {/* Workflow Arrows */}
                  <path d="M105 80 L175 65" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)"/>
                  <path d="M225 65 L295 80" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)"/>
                  
                  {/* Dashboard Elements */}
                  <rect x="50" y="150" width="300" height="120" fill="white" rx="8" opacity="0.9"/>
                  <rect x="70" y="170" width="80" height="40" fill="#3b82f6" rx="4"/>
                  <rect x="160" y="170" width="80" height="40" fill="#10b981" rx="4"/>
                  <rect x="250" y="170" width="80" height="40" fill="#f59e0b" rx="4"/>
                  
                  {/* Progress Bars */}
                  <rect x="70" y="230" width="260" height="8" fill="#e5e7eb" rx="4"/>
                  <rect x="70" y="230" width="180" height="8" fill="#3b82f6" rx="4"/>
                  
                  <rect x="70" y="250" width="260" height="8" fill="#e5e7eb" rx="4"/>
                  <rect x="70" y="250" width="120" height="8" fill="#10b981" rx="4"/>
                  
                  {/* Text Labels */}
                  <text x="200" y="30" textAnchor="middle" className="text-sm font-semibold" fill="#1f2937">
                    Gestión de Flujos COSO
                  </text>
                  
                  <defs>
                    <linearGradient id="workflowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#dbeafe" />
                      <stop offset="100%" stopColor="#dcfce7" />
                    </linearGradient>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                    </marker>
                  </defs>
                </svg>
              </div>
              
              <div className="absolute -bottom-2 -right-2 bg-white rounded-lg shadow-lg p-3 border">
                <svg viewBox="0 0 80 80" className="w-20 h-20">
                  {/* Analytics Chart */}
                  <rect width="80" height="80" fill="url(#analyticsGradient)" rx="8"/>
                  
                  {/* Bar Chart */}
                  <rect x="15" y="50" width="8" height="20" fill="#3b82f6"/>
                  <rect x="30" y="40" width="8" height="30" fill="#10b981"/>
                  <rect x="45" y="35" width="8" height="35" fill="#f59e0b"/>
                  <rect x="60" y="25" width="8" height="45" fill="#ef4444"/>
                  
                  {/* Pie Chart */}
                  <circle cx="25" cy="25" r="12" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="15 23"/>
                  <circle cx="25" cy="25" r="12" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="10 28" strokeDashoffset="-15"/>
                  
                  <text x="40" y="15" className="text-xs font-medium" fill="#374151">Analytics</text>
                  
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f0f9ff" />
                      <stop offset="100%" stopColor="#ecfdf5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="font-semibold text-dr-blue mb-2">Gestión de Flujos</h3>
                <p className="text-sm text-gray-600">Diseño visual de procesos COSO</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="font-semibold text-dr-blue mb-2">Análisis y Reportes</h3>
                <p className="text-sm text-gray-600">Seguimiento de cumplimiento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            
            {/* Mobile Header */}
            {/* Language Toggle and Mobile Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="lg:hidden text-center flex-1">
                <img 
                  src={nebusisLogo} 
                  alt="NEBUSIS Logo" 
                  className="h-12 w-auto mx-auto mb-2"
                />
                <h1 className="text-xl font-bold text-gray-900">
                  {t('branding.productName')}
                </h1>
              </div>
              <LanguageToggle variant="outline" size="sm" showText />
            </div>

            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-dr-blue/10 rounded-full">
                  <Building2 className="w-8 h-8 text-dr-blue" />
                </div>
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {t('login.title')}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {t('login.subtitle')}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      {t('login.email')}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              id="email"
                              type="email"
                              placeholder="usuario@institucion.gob.do"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-12 border-gray-200 focus:border-dr-blue focus:ring-dr-blue"
                              disabled={loginMutation.isPending}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ingresa tu correo electrónico institucional</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      {t('login.password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-12 border-gray-200 focus:border-dr-blue focus:ring-dr-blue"
                              disabled={loginMutation.isPending}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ingresa tu contraseña institucional</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              disabled={loginMutation.isPending}
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-dr-blue hover:bg-dr-blue/90 text-white font-medium text-base"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>{t('common.loading')}</span>
                            </div>
                          ) : (
                            t('login.signIn')
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Iniciar sesión con tus credenciales institucionales</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">o</span>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDemoLogin}
                        className="w-full h-12 border-dr-blue text-dr-blue hover:bg-dr-blue hover:text-white font-medium"
                        disabled={loginMutation.isPending}
                      >
                        {t('login.demoAccess')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Accede al sistema con credenciales de demostración</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="text-center space-y-2 pt-4">
                  <p className="text-xs text-gray-500">
                    {t('auth.securityNote')}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                    <span>{t('auth.digitalGovernment')}</span>
                    <span>•</span>
                    <span>{t('auth.secureAccess')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                ¿Problemas para acceder? Contacte a su administrador del sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}