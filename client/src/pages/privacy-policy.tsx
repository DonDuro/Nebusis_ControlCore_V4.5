import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";

export default function PrivacyPolicyPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')}</span>
            </Button>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/api/assets/Nebusis Logo_1749783287386.png" 
                alt="Nebusis Logo" 
                className="h-8 w-auto"
              />
            </div>
            <div className="ml-auto">
              <LanguageToggle variant="ghost" size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              {t('privacyPolicy.badge')}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('privacyPolicy.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {t('privacyPolicy.subtitle')}
            </p>
            <p className="text-sm text-gray-500">
              {t('privacyPolicy.effectiveDate')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Information Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>{t('privacyPolicy.section1.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section1.accountInfo')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section1.accountDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section1.communicationData')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section1.communicationDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section1.technicalData')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section1.technicalDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section1.usageInfo')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section1.usageDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span>{t('privacyPolicy.section2.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section2.serviceProvision')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section2.serviceDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section2.security')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section2.securityDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section2.communication')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section2.communicationDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section2.analytics')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section2.analyticsDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span>{t('privacyPolicy.section3.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section3.encryption')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section3.encryptionDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section3.accessControls')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section3.accessDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section3.dataMinimization')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section3.minimizationDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section3.compliance')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section3.complianceDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>{t('privacyPolicy.section4.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section4.noThirdParty')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section4.noThirdPartyDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section4.serviceProviders')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section4.serviceProvidersDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section4.legalRequirements')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section4.legalDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: User Rights */}
            <Card>
              <CardHeader>
                <CardTitle>{t('privacyPolicy.section5.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section5.accessPortability')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section5.accessDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section5.corrections')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section5.correctionsDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('privacyPolicy.section5.deletion')}</h4>
                  <p className="text-gray-600">{t('privacyPolicy.section5.deletionDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('privacyPolicy.section6.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('privacyPolicy.section6.content')}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>{t('privacyPolicy.section6.company')}</strong><br />
                  {t('privacyPolicy.section6.location')}<br />
                  {t('privacyPolicy.section6.jurisdiction')}
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="bg-gray-50">
              <CardContent className="text-center py-6">
                <p className="text-sm text-gray-600">
                  {t('privacyPolicy.footer.lastUpdated')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}