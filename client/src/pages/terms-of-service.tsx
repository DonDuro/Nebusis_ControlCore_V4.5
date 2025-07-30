import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Settings, Mail, Eye } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";

export default function TermsOfServicePage() {
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
              <FileText className="h-4 w-4 mr-2" />
              {t('termsOfService.badge')}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('termsOfService.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {t('termsOfService.subtitle')}
            </p>
            <p className="text-sm text-gray-500">
              {t('termsOfService.effectiveDate')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Acceptance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section1.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('termsOfService.section1.content')}
                </p>
              </CardContent>
            </Card>

            {/* Section 2: Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section2.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section2.platform')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section2.platformDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section2.availability')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section2.availabilityDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section2.updates')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section2.updatesDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section3.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section3.platformRights')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section3.platformDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section3.userContent')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section3.userDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section4.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section4.prohibitedActivities')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section4.prohibitedDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section4.compliance')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section4.complianceDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section4.contentStandards')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section4.contentDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section4.reporting')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section4.reportingDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section5.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section5.platformRights')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section5.platformDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section5.userContent')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section5.userDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section5.respectRights')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section5.respectDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Service Modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section6.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section6.modifications')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section6.modificationsDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section6.termination')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section6.terminationDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section6.dataRetention')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section6.dataDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section7.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section7.serviceDisclaimer')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section7.serviceDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section7.liability')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section7.liabilityDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section7.forceMajeure')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section7.forceDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Dispute Resolution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section8.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section8.jurisdiction')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section8.jurisdictionDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section8.governingLaw')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section8.lawDesc')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('termsOfService.section8.venue')}</h4>
                  <p className="text-gray-600">{t('termsOfService.section8.venueDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 9: Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>{t('termsOfService.section9.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('termsOfService.section9.description')}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Nebusis Cloud Services, LLC</strong><br />
                  {t('termsOfService.section9.address')}<br />
                  {t('termsOfService.section9.jurisdiction')}
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="bg-gray-50">
              <CardContent className="text-center py-6">
                <p className="text-sm text-gray-600">
                  {t('termsOfService.footer.lastUpdated')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}