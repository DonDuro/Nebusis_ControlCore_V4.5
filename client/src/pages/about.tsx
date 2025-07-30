import { useState } from "react";
import { ArrowLeft, Building2, Globe, Award, Users, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import nebusisLogoPath from "@assets/nebusis-logo.png";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { BrandName } from "@/components/common/BrandName";

export default function AboutPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  const openSalesForm = () => {
    // Navigate to landing page and trigger sales form
    setLocation("/?sales=true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-gray-50">
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
            <Building2 className="h-4 w-4 mr-2" />
            {t('about.badge')}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('about.title')}
            <span className="text-primary block">{t('about.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            {t('about.heroDescription')}
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('about.experienceTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('about.experienceDescription1')}
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {t('about.experienceDescription2')}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-primary mb-2">8+</div>
                  <div className="text-sm text-gray-600">{t('about.yearsExperience')}</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-gray-600">{t('about.cloudFocus')}</div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Globe className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('about.multinationalClients')}</h3>
                      <p className="text-sm text-gray-600">{t('about.multinationalClientsDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Building2 className="h-8 w-8 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('about.governmentSector')}</h3>
                      <p className="text-sm text-gray-600">{t('about.governmentSectorDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('about.advancedTechnology')}</h3>
                      <p className="text-sm text-gray-600">{t('about.advancedTechnologyDesc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Business Suite */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('about.businessSuiteTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.businessSuiteSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ComplianceCore - Disponible Ahora */}
            <Card className="border-2 border-primary/40 bg-primary/10 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <Badge className="bg-primary text-white">{t('about.availableNow')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® ComplianceCore
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.complianceCore.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.readyToTransform')}
                </p>
                <Button className="w-full bg-primary hover:bg-primary" onClick={() => window.location.href = "/features"}>
                  {t('about.exploreFeatures')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® Engage */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🚀</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® Engage
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.engage.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® SmartBooks */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">📊</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® SmartBooks
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.smartBooks.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® PowerDocs */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-primary/100 rounded flex items-center justify-center">
                    <span className="text-white text-xs">📄</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® PowerDocs
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.powerDocs.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® LegalFlow */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">⚖️</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® LegalFlow
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.legalFlow.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® Performance Tracker */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">📈</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® Performance Tracker
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.performanceTracker.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® ZappFormZ */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">📋</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® ZappFormZ
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.zapFormZ.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>

            {/* Nebusis® WizSpeek */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">💬</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">{t('about.comingSoon')}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Nebusis® WizSpeek
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('about.wizSpeek.description')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('about.joinWaitlist')}
                </p>
                <Button variant="outline" className="w-full border-gray-500 text-gray-700 hover:bg-gray-50">
                  {t('about.requestEarlyAccess')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {t('about.resilience')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('about.resilienceDescription')}
          </p>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('about.multinationalClientsTitle')}</h3>
                <p className="text-gray-600">
                  {t('about.multinationalClientsText')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('about.headquarters')}</h3>
                <p className="text-gray-600 font-medium">
                  {t('about.headquartersLocation')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('about.requestMoreInfo')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('about.requestMoreInfoDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-50 px-8 py-3"
              onClick={openSalesForm}
            >
              {t('about.clientInformation')}
            </Button>
            <Button 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
              onClick={() => setLocation("/collaborators")}
            >
              {t('about.collaborationOpportunities')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}