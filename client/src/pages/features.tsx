import { useState } from "react";
import { ArrowLeft, BarChart3, Shield, Users, Zap, CheckCircle, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { BrandName } from "@/components/common/BrandName";
import nebusisLogoPath from "@assets/nebusis-logo.png";

export default function FeaturesPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  const openSalesForm = () => {
    // Navigate to landing page and trigger sales form
    setLocation("/?sales=true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('nav.back')}</span>
            </Button>
            <div className="flex items-center space-x-3">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 40 40" 
                className="text-primary"
                fill="currentColor"
              >
                <rect x="5" y="5" width="30" height="30" rx="6" fill="currentColor" opacity="0.1"/>
                <path d="M10 12h20v3H10v-3zm0 5h20v3H10v-3zm0 5h15v3H10v-3zm0 5h20v3H10v-3z" fill="currentColor"/>
                <circle cx="25" cy="22" r="4" fill="currentColor" opacity="0.8"/>
                <path d="M22 20l3 3 5-5" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
              <div>
                <h1 className="text-lg font-bold"><BrandName size="lg" /></h1>
              </div>
            </div>
            <LanguageToggle variant="outline" size="sm" showText />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img 
              src={nebusisLogoPath} 
              alt="Nebusis Logo" 
              className="h-16 w-auto"
            />
          </div>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="h-4 w-4 mr-2" />
            {t('features.badge')}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('features.title')}
            <span className="text-primary block">{t('features.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            {t('features.subtitle')}
          </p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('features.dashboardTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('features.dashboardSubtitle')}
            </p>
          </div>

          {/* Dashboard mockup cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Stats Overview */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-primary/10 to-indigo-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Métricas de Cumplimiento</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Cumplimiento General</p>
                        <p className="text-2xl font-bold text-green-600">87%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Workflows Activos</p>
                        <p className="text-2xl font-bold text-primary">24</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Alertas Pendientes</p>
                        <p className="text-2xl font-bold text-orange-600">3</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Usuarios Activos</p>
                        <p className="text-2xl font-bold text-purple-600">156</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{t('features.workflowCompleted')}</p>
                      <p className="text-xs text-gray-500">{t('coso.components.controlEnvironment')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t('features.newDocument')}</p>
                      <p className="text-xs text-gray-500">{t('features.updatedRegulation')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">{t('features.reviewPending')}</p>
                      <p className="text-xs text-gray-500">{t('coso.components.controlActivities')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('features.mainFeaturesTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('features.mainFeaturesSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('coso.environment.title')}</h3>
                <p className="text-gray-600">
                  {t('coso.environment.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('coso.risk.title')}</h3>
                <p className="text-gray-600">
                  {t('coso.risk.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('coso.controls.title')}</h3>
                <p className="text-gray-600">
                  {t('coso.controls.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('coso.information.title')}</h3>
                <p className="text-gray-600">
                  {t('coso.information.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('coso.monitoring.title')}</h3>
                <p className="text-gray-600">
                  {t('coso.monitoring.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('ai.title')}</h3>
                <p className="text-gray-600">
                  {t('ai.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('features.ctaTitle')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('features.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-50 px-8 py-3"
              onClick={openSalesForm}
            >
{t('features.clientInfo')}
            </Button>
            <Button 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
              onClick={() => setLocation("/collaborators")}
            >
{t('features.collaborationOpportunities')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}