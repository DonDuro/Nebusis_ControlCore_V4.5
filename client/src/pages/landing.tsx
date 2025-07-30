import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Shield, MessageCircle, Globe, ExternalLink, Menu, X } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useTranslation } from "@/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { BrandName } from "@/components/common/BrandName";


// Create schemas that use translations - these need to be functions that access current language
const createLoginSchema = (t: any) => z.object({
  email: z.string().email(t('validation.emailRequired')),
  password: z.string().min(1, t('validation.passwordRequired')),
});

const createRecoverySchema = (t: any) => z.object({
  email: z.string().email(t('validation.emailRequired')),
});

const createSupportSchema = (t: any) => z.object({
  firstName: z.string().min(1, t('validation.nameRequired')),
  lastName: z.string().min(1, t('validation.lastNameRequired')),
  email: z.string().email(t('validation.emailRequired')),
  subject: z.string().min(1, t('validation.subjectRequired')),
  category: z.string().min(1, t('validation.categoryRequired')),
  description: z.string().min(10, t('validation.descriptionMinLength')),
});

const createSalesSchema = (t: any) => z.object({
  firstName: z.string().min(1, t('validation.nameRequired')),
  lastName: z.string().min(1, t('validation.lastNameRequired')),
  businessEmail: z.string().email(t('validation.emailRequired')),
  phoneNumber: z.string().min(1, t('validation.phoneRequired')),
  companyName: z.string().min(1, t('validation.companyRequired')),
  jobTitle: z.string().min(1, t('validation.jobTitleRequired')),
  industry: z.string().min(1, t('validation.industryRequired')),
  companySize: z.string().min(1, t('validation.companySizeRequired')),
  productInterest: z.string().min(1, t('validation.productInterestRequired')),
  expectedUserCount: z.string().min(1, t('validation.userCountRequired')),
  implementationTimeline: z.string().min(1, t('validation.timelineRequired')),
  specificRequirements: z.string().min(10, t('validation.requirementsMinLength')),
  annualBudgetRange: z.string().optional(),
  currentCommunicationSolution: z.string().optional(),
});

// Type inference helpers
type LoginForm = {
  email: string;
  password: string;
};
type RecoveryForm = {
  email: string;
};
type SupportForm = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  category: string;
  description: string;
};
type SalesForm = {
  firstName: string;
  lastName: string;
  businessEmail: string;
  phoneNumber: string;
  companyName: string;
  jobTitle: string;
  industry: string;
  companySize: string;
  productInterest: string;
  expectedUserCount: string;
  implementationTimeline: string;
  specificRequirements: string;
  annualBudgetRange?: string;
  currentCommunicationSolution?: string;
};

export default function LandingPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSales, setShowSales] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Check URL params to auto-open sales form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('sales') === 'true') {
      setShowSales(true);
      // Clean URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const form = useForm<LoginForm>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const recoveryForm = useForm<RecoveryForm>({
    resolver: zodResolver(createRecoverySchema(t)),
    defaultValues: {
      email: "",
    },
  });

  const supportForm = useForm<SupportForm>({
    resolver: zodResolver(createSupportSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      category: "",
      description: "",
    },
  });

  const salesForm = useForm<SalesForm>({
    resolver: zodResolver(createSalesSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessEmail: "",
      phoneNumber: "",
      companyName: "",
      jobTitle: "",
      industry: "",
      companySize: "",
      productInterest: "",
      expectedUserCount: "",
      implementationTimeline: "",
      specificRequirements: "",
      annualBudgetRange: "",
      currentCommunicationSolution: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        // Store session token
        localStorage.setItem('sessionToken', result.sessionToken);
        // Refresh the page to trigger authentication check
        window.location.href = "/";
      } else {
        const error = await response.json();
        console.error("Login failed:", error);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error("Login error:", error);
      // TODO: Show error message to user
    }
  };

  const onRecoverySubmit = async (data: RecoveryForm) => {
    // For demo purposes, just show success message
    alert("Instrucciones de recuperación enviadas al correo electrónico");
    setShowRecovery(false);
  };

  const onSupportSubmit = async (data: SupportForm) => {
    try {
      alert(t('support.successMessage', { 
        firstName: data.firstName, 
        lastName: data.lastName, 
        email: data.email, 
        category: data.category, 
        subject: data.subject 
      }));
      setShowSupport(false);
      supportForm.reset();
    } catch (error) {
      alert("Error al enviar solicitud de soporte");
    }
  };

  const onSalesSubmit = async (data: SalesForm) => {
    try {
      alert(`Consulta de ventas institucionales enviada exitosamente!\n\nDetalles:\n• Institución: ${data.companyName}\n• Contacto: ${data.firstName} ${data.lastName}\n• Email: ${data.businessEmail}\n• Sector: ${data.industry}\n• Usuarios: ${data.expectedUserCount}\n\nNuestro equipo de ventas se pondrá en contacto contigo en las próximas 24 horas para proporcionar una solución personalizada.`);
      setShowSales(false);
      salesForm.reset();
    } catch (error) {
      alert("Error al enviar consulta de ventas");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
                onClick={() => window.location.href = "/features"}
              >
                {t('nav.features')}
              </button>

              <button 
                className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
                onClick={() => window.location.href = "/pricing"}
              >
                {t('nav.pricing')}
              </button>
              <button 
                className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
                onClick={() => window.location.href = "/about"}
              >
                {t('nav.about')}
              </button>
              <button 
                className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
                onClick={() => window.location.href = "/collaborators"}
              >
                {t('nav.collaborators')}
              </button>
              <Dialog open={showSupport} onOpenChange={setShowSupport}>
                <DialogTrigger asChild>
                  <button className="text-gray-600 hover:text-blue-700 transition-colors duration-200">
                    {t('nav.support')}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      {t('support.title')}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {t('support.description')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...supportForm}>
                    <form onSubmit={supportForm.handleSubmit(onSupportSubmit)} className="space-y-4">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={supportForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('support.firstName')} *</FormLabel>
                              <FormControl>
                                <Input placeholder={t('support.firstNamePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={supportForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('support.lastName')} *</FormLabel>
                              <FormControl>
                                <Input placeholder={t('support.lastNamePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email */}
                      <FormField
                        control={supportForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.email')} *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subject */}
                      <FormField
                        control={supportForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('support.subject')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('support.subjectPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category */}
                      <FormField
                        control={supportForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('support.category')} *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('support.categoryPlaceholder')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="technical">{t('support.categories.technical')}</SelectItem>
                                <SelectItem value="training">{t('support.categories.training')}</SelectItem>
                                <SelectItem value="implementation">{t('support.categories.implementation')}</SelectItem>
                                <SelectItem value="billing">{t('support.categories.billing')}</SelectItem>
                                <SelectItem value="general">{t('support.categories.general')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description */}
                      <FormField
                        control={supportForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('support.supportDescription')} *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t('support.descriptionPlaceholder')}
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full bg-primary hover:bg-primary text-white">
{t('support.submit')}
                      </Button>
                    </form>
                  </Form>

                  {/* Additional Support Options */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('support.institutional.title')}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {t('support.institutional.description')}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowSales(true)}
                        >
{t('support.contactSales')}
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('support.servicesInfo.title')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('support.servicesInfo.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                className="text-primary hover:text-primary"
                onClick={() => setShowSales(true)}
              >
                {t('nav.joinNow')}
              </Button>
              <LanguageToggle variant="outline" size="sm" showText />
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 py-3 space-y-1">
                <button 
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => {
                    window.location.href = "/features";
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.features')}
                </button>
                <button 
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => {
                    window.location.href = "/pricing";
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.pricing')}
                </button>
                <button 
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => {
                    window.location.href = "/about";
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.about')}
                </button>
                <button 
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => {
                    window.location.href = "/collaborators";
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.collaborators')}
                </button>
                <button 
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => {
                    setShowSupport(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.support')}
                </button>
                <button 
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => {
                    setShowSales(true);
                    setMobileMenuOpen(false);
                  }}
                >
{t('support.contactSales')}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sales Inquiry Dialog */}
      <Dialog open={showSales} onOpenChange={setShowSales}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
{t('sales.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t('sales.description')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...salesForm}>
            <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sales.contactInfo')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={salesForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('support.firstName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('support.firstNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salesForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('support.lastName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('support.lastNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={salesForm.control}
                    name="businessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.businessEmail')} *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('sales.businessEmailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salesForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.phoneNumber')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('sales.phoneNumberPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Organization Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sales.organizationDetails')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={salesForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.institutionName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('sales.institutionNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salesForm.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.jobTitle')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('sales.jobTitlePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={salesForm.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.industry')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('sales.industryPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="government">{t('sales.industries.government')}</SelectItem>
                            <SelectItem value="banking">{t('sales.industries.banking')}</SelectItem>
                            <SelectItem value="healthcare">{t('sales.industries.healthcare')}</SelectItem>
                            <SelectItem value="education">{t('sales.industries.education')}</SelectItem>
                            <SelectItem value="manufacturing">{t('sales.industries.manufacturing')}</SelectItem>
                            <SelectItem value="other">{t('sales.industries.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salesForm.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.companySize')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('sales.companySizePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">{t('sales.companySizes.small')}</SelectItem>
                            <SelectItem value="medium">{t('sales.companySizes.medium')}</SelectItem>
                            <SelectItem value="large">{t('sales.companySizes.large')}</SelectItem>
                            <SelectItem value="enterprise">{t('sales.companySizes.enterprise')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Product Interest Field */}
                <div className="mt-4">
                  <FormField
                    control={salesForm.control}
                    name="productInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.productOfInterest')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('sales.productPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="compliancecore">ComplianceCore (Disponible)</SelectItem>
                            <SelectItem value="controlcore">Nebusis® ControlCore (Universal Framework)</SelectItem>
                            <SelectItem value="engage-proximamente">Engage - Acceso Anticipado</SelectItem>
                            <SelectItem value="smartbooks-proximamente">SmartBooks - Acceso Anticipado</SelectItem>
                            <SelectItem value="powerdocs-proximamente">PowerDocs - Acceso Anticipado</SelectItem>
                            <SelectItem value="legalflow-proximamente">LegalFlow - Acceso Anticipado</SelectItem>
                            <SelectItem value="performance-tracker-proximamente">Performance Tracker - Acceso Anticipado</SelectItem>
                            <SelectItem value="zappformz-proximamente">ZappFormZ - Acceso Anticipado</SelectItem>
                            <SelectItem value="wizspeek-proximamente">WizSpeek - Acceso Anticipado</SelectItem>
                            <SelectItem value="multiple-products">Múltiples Productos</SelectItem>
                            <SelectItem value="custom-solution">Solución Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Project Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sales.projectRequirements')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={salesForm.control}
                    name="expectedUserCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.expectedUserCount')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('sales.userCountPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-25">1-25 usuarios</SelectItem>
                            <SelectItem value="26-50">26-50 usuarios</SelectItem>
                            <SelectItem value="51-100">51-100 usuarios</SelectItem>
                            <SelectItem value="101-500">101-500 usuarios</SelectItem>
                            <SelectItem value="500+">500+ usuarios</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salesForm.control}
                    name="implementationTimeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.implementationTimeline')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('sales.timelinePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Inmediato (1-30 días)</SelectItem>
                            <SelectItem value="short">Corto plazo (1-3 meses)</SelectItem>
                            <SelectItem value="medium">Mediano plazo (3-6 meses)</SelectItem>
                            <SelectItem value="long">Largo plazo (6+ meses)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={salesForm.control}
                  name="specificRequirements"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t('sales.specificRequirements')} *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('sales.requirementsPlaceholder')}
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={salesForm.control}
                    name="annualBudgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.budgetRange')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('sales.budgetPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-10k">Menos de $10,000</SelectItem>
                            <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                            <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                            <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100k+">$100,000+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salesForm.control}
                    name="currentCommunicationSolution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.currentSolution')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('sales.currentSolutionPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowSales(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t('sales.submitButton')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex-1 flex pt-16">
        {/* Left Side - Welcome Text and Login Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {t('landing.welcome')}
              </h1>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {t('landing.subtitle')} <span className="text-primary">{t('landing.platform')}</span>
              </h1>
              <p className="text-gray-600 text-lg">
                {t('landing.description')}
              </p>
              <p className="text-gray-500 text-sm mt-2">
{t('landing.subtitle2')}
              </p>
            </div>

            {/* Login Form */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl text-gray-900">{t('landing.loginTitle')}</CardTitle>
                <CardDescription className="text-gray-600">
                  {t('landing.loginDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('auth.enterUsername')}
                              {...field}
                              className="bg-white border-gray-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('auth.enterPassword')}
                                {...field}
                                className="bg-white border-gray-300 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary text-white"
                    >
{t('auth.signIn')}
                    </Button>
                  </form>
                </Form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled
                        >
                          <SiGoogle className="w-4 h-4 mr-2" />
                          Google
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('auth.googleComingSoon')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Microsoft
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('auth.microsoftComingSoon')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Forgot Password */}
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary text-sm"
                    onClick={() => setShowRecovery(true)}
                  >
{t('auth.forgotPassword')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* COSO Features */}

          </div>
        </div>

        {/* Right Side - Blue Panel */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary flex items-center justify-center">
            <div className="text-center text-white px-8">
              <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-8">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 40 40" 
                  className="text-white"
                  fill="currentColor"
                >
                  <rect x="5" y="5" width="30" height="30" rx="6" fill="currentColor" opacity="0.3"/>
                  <path d="M10 12h20v3H10v-3zm0 5h20v3H10v-3zm0 5h15v3H10v-3zm0 5h20v3H10v-3z" fill="currentColor"/>
                  <circle cx="25" cy="22" r="4" fill="currentColor" opacity="0.9"/>
                  <path d="M22 20l3 3 5-5" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4"><BrandName size="xl" variant="white" /></h2>
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-primary/20">{t('coso.components.controlEnvironment')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-primary/20">{t('coso.components.riskAssessment')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-primary/20">{t('coso.components.controlActivities')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-primary/20">{t('coso.components.informationCommunication')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-primary/20">{t('coso.components.monitoring')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{t('footer.copyright')}</span>
              <span>{t('footer.poweredBy')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">{t('footer.mobileApp')}</span>
              <a href="/privacy-policy" className="hover:text-gray-700">{t('footer.privacyPolicy')}</a>
              <a href="/terms-of-service" className="hover:text-gray-700">{t('footer.termsOfService')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Password Recovery Dialog */}
      <Dialog open={showRecovery} onOpenChange={setShowRecovery}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('auth.resetPassword')}</DialogTitle>
            <DialogDescription>
{t('auth.resetDescription')}
            </DialogDescription>
          </DialogHeader>
          <Form {...recoveryForm}>
            <form onSubmit={recoveryForm.handleSubmit(onRecoverySubmit)} className="space-y-4">
              <FormField
                control={recoveryForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.emailPlaceholder')}
                        {...field}
                        className="bg-white border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowRecovery(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary">
{t('auth.sendInstructions')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}