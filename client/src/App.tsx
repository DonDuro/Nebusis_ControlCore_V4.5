import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/common/LanguageProvider";
import { FrameworkProvider } from "@/components/common/FrameworkProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows";
import Documents from "@/pages/documents";
import Verification from "@/pages/verification";
import SelfAssessment from "@/pages/self-assessment";
import AuditReports from "@/pages/audit-reports";
import Glossary from "@/pages/glossary";
import Reports from "@/pages/reports";

import Configuration from "@/pages/configuration";
import Profile from "@/pages/Profile";
import InstitutionalPlans from "@/pages/institutional-plans";
import TrainingManagement from "@/pages/training-management";
import CgrReporting from "@/pages/cgr-reporting";
import Login from "@/pages/login";
import Landing from "@/pages/landing";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import Partners from "@/pages/partners";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import AutoLogin from "@/pages/auto-login";
import NotFound from "@/pages/not-found";
import Checkout from "@/pages/checkout";
import FrameworkAssessmentDetails from "@/pages/framework-assessment-details";
import WorkflowAssessmentDetails from "@/pages/workflow-assessment-details";

// ADVANCED FEATURES PAGES
import StrategicPlanningPage from "@/pages/v4/StrategicPlanningPage";
import Planning from "@/pages/planning-new";
import WorkflowDefinitionPage from "@/pages/workflow-definition";
import WorkflowExecutionPage from "@/pages/workflow-execution";
import WorkflowsConsolidatedPage from "@/pages/workflows-consolidated";

import InternalAuditPage from "@/pages/v4/InternalAuditPage";
import { AIHelpBot } from "@/components/ai-help/AIHelpBot";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";

function Router() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dr-blue mx-auto"></div>
          <p className="mt-4 text-dr-neutral">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/auto-login" component={AutoLogin} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/about" component={About} />
        <Route path="/collaborators" component={Partners} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflows" component={WorkflowsConsolidatedPage} />
      <Route path="/documents" component={Documents} />
      <Route path="/verification" component={Verification} />
      <Route path="/self-assessment" component={SelfAssessment} />
      <Route path="/audit-reports" component={AuditReports} />
      <Route path="/framework-assessment-details/:id" component={FrameworkAssessmentDetails} />
      <Route path="/workflow-assessment-details/:id" component={WorkflowAssessmentDetails} />
      <Route path="/institutional-plans" component={InstitutionalPlans} />
      <Route path="/training-management" component={TrainingManagement} />
      
      {/* WORKFLOW ROUTES */}
      <Route path="/workflow-definition" component={WorkflowDefinitionPage} />
      <Route path="/workflow-execution" component={WorkflowExecutionPage} />
      
      {/* ADVANCED FEATURES ROUTES */}
      <Route path="/planning" component={Planning} />
      <Route path="/strategic-planning" component={StrategicPlanningPage} />

      <Route path="/internal-audit" component={InternalAuditPage} />
      <Route path="/reports" component={Reports} />
      <Route path="/informes" component={Reports} />
      <Route path="/cgr-reporting" component={CgrReporting} />

      <Route path="/configuration" component={Configuration} />
      <Route path="/profile" component={Profile} />
      <Route path="/glossary" component={Glossary} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <FrameworkProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <AIHelpBot />
            </TooltipProvider>
          </FrameworkProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
