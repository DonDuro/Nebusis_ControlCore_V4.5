import { useState } from "react";
import { ArrowLeft, Users, TrendingUp, Settings, Check, Star, Mail, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useLanguage } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { BrandName } from "@/components/common/BrandName";
import nebusisLogoPath from "@assets/nebusis-logo.png";

export default function PartnersPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    area: '',
    experience: '',
    location: '',
    references: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would go the form submission logic
    alert(t('partners.successMessage'));
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      area: '',
      experience: '',
      location: '',
      references: ''
    });
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
              <span>{t('partners.backButton')}</span>
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
          <div className="flex items-center justify-center mb-8">
            <img 
              src={nebusisLogoPath}
              alt="Nebusis Logo"
              className="h-16 w-auto"
            />
          </div>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-8">
            <Users className="h-4 w-4 mr-2" />
            {t('partners.badge')}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('partners.joinTitle')}
            <span className="text-primary block">{t('partners.partnerProgram')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            {t('partners.description')}
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('partners.whyPartner')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('partners.whyPartnerDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">{t('partners.specializedMarket')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  {t('partners.specializedMarketDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">{t('partners.completeTraining')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  {t('partners.completeTrainingDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">{t('partners.attractiveRevenue')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  {t('partners.attractiveRevenueDescription')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Collaboration Areas */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('partners.collaborationAreas')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('partners.collaborationAreasDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">{t('partners.commercialSales')}</h3>
              </div>
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.directSales')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.strategicRelations')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.eventRepresentation')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.competitiveCommissions')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.publicTenders')}</span>
                </li>
              </ul>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  {t('partners.salesProfile')}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">{t('partners.technicalConfiguration')}</h3>
              </div>
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.completeImplementation')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.institutionalCustomization')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.specializedTraining')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.technicalSupport')}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{t('partners.systemIntegration')}</span>
                </li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800 font-medium">
                  {t('partners.technicalProfile')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('partners.partnerApplicationForm')}
            </h2>
            <p className="text-lg text-gray-600">
              Complete the following form to start the collaboration process
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-gray-50 p-8 rounded-lg shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partners.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent"
                    placeholder={t('partners.name')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partners.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent"
                    placeholder="email@empresa.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partners.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent"
                    placeholder="+1 (809) 000-0000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('partners.company')}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent"
                    placeholder={t('partners.company')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partners.area')} *
                </label>
                <select 
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent" 
                  required
                >
                  <option value="">{t('partners.areaPlaceholder')}</option>
                  <option value="comercializacion">{t('partners.commercialSalesOption')}</option>
                  <option value="configuracion">{t('partners.technicalConfigurationOption')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partners.experience')} *
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent"
                  placeholder={t('partners.experiencePlaceholder')}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partners.location')} *
                </label>
                <select 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent" 
                  required
                >
                  <option value="">{t('partners.locationPlaceholder')}</option>
                  <option value="america-norte">{t('partners.northAmerica')}</option>
                  <option value="america-central">{t('partners.centralAmerica')}</option>
                  <option value="america-sur">{t('partners.southAmerica')}</option>
                  <option value="europa">{t('partners.europe')}</option>
                  <option value="asia">{t('partners.asia')}</option>
                  <option value="africa">{t('partners.africa')}</option>
                  <option value="oceania">{t('partners.oceania')}</option>
                  <option value="otro">{t('partners.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partners.references')}
                </label>
                <textarea
                  name="references"
                  value={formData.references}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent"
                  placeholder={t('partners.referencesPlaceholder')}
                ></textarea>
              </div>

              <Button 
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary text-white py-4 text-lg"
              >
                {t('partners.submitApplication')}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                * {t('partners.required')} fields. Our partnerships team will contact you within 5 business days.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Contact Information
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Mail className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600">Through the application form</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">Reston, Virginia, USA</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Team</h3>
              <p className="text-gray-600">Strategic Partnerships</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}