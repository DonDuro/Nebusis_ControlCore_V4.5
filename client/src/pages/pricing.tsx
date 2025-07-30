import { useState } from "react";
import { ArrowLeft, Check, Building, Users, Headphones, Star, DollarSign, Calculator, TrendingUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { BrandName } from "@/components/common/BrandName";
import nebusisLogoPath from "@assets/nebusis-logo.png";

export default function PricingPage() {
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
              <span>{t('common.back')}</span>
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
            <DollarSign className="h-4 w-4 mr-2" />
            {t('pricing.institutionalPricing')}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('pricing.heroTitle')}
            <span className="text-primary block">{t('pricing.heroSubtitle')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            {t('pricing.heroDescription')}
          </p>
        </div>
      </section>

      {/* Base Pricing Structure */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-8">
            <Calculator className="h-4 w-4 mr-2" />
            {t('pricing.basePricingStructure')}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {t('pricing.transparentPricing')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('pricing.transparentDescription')}
          </p>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Star className="h-8 w-8 text-yellow-500" />
              <p className="text-xl font-semibold text-gray-900">
                {t('pricing.basePricingStructure')}
              </p>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-6 mb-8">
              <div className="bg-primary/10 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-primary mb-3">{t('pricing.baseCosts')}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded border-l-4 border-primary/100">
                    <p className="font-semibold text-gray-900">{t('pricing.initialConfiguration')}</p>
                    <p className="text-2xl font-bold text-primary">{t('pricing.initialConfigurationPrice')}</p>
                    <p className="text-sm text-gray-600">{t('pricing.initialConfigurationDescription')}</p>
                  </div>
                  <div className="bg-white p-4 rounded border-l-4 border-primary/100">
                    <p className="font-semibold text-gray-900">{t('pricing.annualLicense')}</p>
                    <p className="text-2xl font-bold text-primary">{t('pricing.annualLicensePrice')}</p>
                    <p className="text-sm text-gray-600">{t('pricing.annualLicenseDescription')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('pricing.additionalServices')}:</strong> {t('pricing.additionalServicesDescription')}
                </p>
                <p className="text-xs text-gray-600">
                  * {t('pricing.transparentDescription')}
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary px-8 py-3 w-full"
              onClick={openSalesForm}
            >
              {t('pricing.requestProposal')}
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Factors */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pricing.pricingFactorsTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('pricing.pricingFactorsDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Factor 1: Alcance */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">1. {t('pricing.organizationalScope')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">{t('pricing.scopeBasic')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.scopeBasicDescription')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">{t('pricing.scopeIntermediate')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.scopeIntermediateDescription')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">{t('pricing.scopeAdvanced')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.scopeAdvancedDescription')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Factor 2: Usuarios */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">2. {t('pricing.userCount')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-600 mb-2">{t('pricing.userBasic')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.userBasicDescription')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-600 mb-2">{t('pricing.userIntermediate')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.userIntermediateDescription')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-600 mb-2">{t('pricing.userAdvanced')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.userAdvancedDescription')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Factor 3: Servicio */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">3. {t('pricing.serviceLevel')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-600 mb-2">{t('pricing.serviceStandard')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.serviceStandardDescription')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-600 mb-2">{t('pricing.serviceExtended')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.serviceExtendedDescription')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-600 mb-2">{t('pricing.serviceAdvanced')}</h4>
                  <p className="text-sm text-gray-600">{t('pricing.serviceAdvancedDescription')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pricing.serviceTiersTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('pricing.serviceTiersDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Standard Tier */}
            <Card className="border-2 border-gray-200 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <Badge variant="secondary" className="w-fit mx-auto mb-4">{t('pricing.standardTier')}</Badge>
                <CardTitle className="text-2xl text-gray-900">{t('pricing.baseImplementation')}</CardTitle>
                <p className="text-gray-600 mt-2">{t('pricing.baseImplementationDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.completeCososPlatform')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.ticketSupport')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.technicalDocumentation')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.includedUpdates')}</span>
                  </li>
                </ul>
                <div className="space-y-3 mt-6">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">$2,500</span>
                    <span className="text-gray-600 ml-2">USD</span>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary"
                    onClick={() => setLocation("/checkout")}
                  >
                    {t('pricing.buyNow')}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={openSalesForm}>
                    {t('pricing.requestQuote')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Extended Tier */}
            <Card className="border-2 border-primary/40 relative shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">{t('pricing.mostPopular')}</Badge>
              </div>
              <CardHeader className="text-center">
                <Badge variant="default" className="w-fit mx-auto mb-4 bg-primary">{t('pricing.extendedTier')}</Badge>
                <CardTitle className="text-2xl text-gray-900">{t('pricing.guidedImplementation')}</CardTitle>
                <p className="text-gray-600 mt-2">{t('pricing.guidedImplementationDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.allStandardPlan')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.hybridTraining')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.personalizedRemoteAssistance')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.specificWorkflowConfiguration')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.priorityChatSupport')}</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-primary" onClick={openSalesForm}>
                  {t('pricing.requestQuote')}
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Tier */}
            <Card className="border-2 border-purple-300 hover:border-purple-400 transition-colors">
              <CardHeader className="text-center">
                <Badge variant="outline" className="w-fit mx-auto mb-4 border-purple-600 text-purple-600">{t('pricing.premiumTier')}</Badge>
                <CardTitle className="text-2xl text-gray-900">{t('pricing.premiumImplementation')}</CardTitle>
                <p className="text-gray-600 mt-2">{t('pricing.premiumImplementationDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.allExtendedPlan')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.onSiteTraining')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.dedicatedAccountManager')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.advancedCustomization')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">{t('pricing.prioritySupport24x7')}</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6 border-purple-600 text-purple-600 hover:bg-purple-50" onClick={() => setLocation("/")}>
                  {t('pricing.requestQuote')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>





      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('pricing.ctaTitle')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('pricing.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-50 px-8 py-3"
              onClick={openSalesForm}
            >
              {t('pricing.clientInformation')}
            </Button>
            <Button 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
              onClick={() => setLocation("/collaborators")}
            >
              {t('pricing.collaborationOpportunitiesButton')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}