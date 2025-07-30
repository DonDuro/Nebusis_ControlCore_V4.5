import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TierIndicator, FeatureUnavailableMessage, TierComparison } from "@/components/v4/TierIndicator";
import { useTranslation } from "@/i18n";
import { CheckCircle, Star, BarChart3, FileText, Users, Shield } from "lucide-react";

export default function TierShowcase() {
  const { t } = useTranslation();

  // Example tier 1 and tier 2 features for different components
  const controlEnvironmentFeatures = {
    tier1: [
      t('coso.components.controlEnvironment') + ' - Basic Policy Management',
      'Document Upload & Storage',
      'Basic Organizational Chart',
      'Simple Workflow Tracking',
      'Standard Reports'
    ],
    tier2: [
      'Advanced Policy Automation via PolicyFlow',
      'Dynamic Organizational Mapping via OrgChart Pro',
      'AI-Powered Risk Assessment via RiskEngine',
      'Automated Compliance Monitoring via ComplianceBot',
      'Real-time Analytics Dashboard via Analytics Pro'
    ]
  };

  const riskAssessmentFeatures = {
    tier1: [
      'Basic Risk Registry',
      'Simple Risk Categories',
      'Manual Risk Scoring',
      'Basic Risk Reports',
      'Document Attachments'
    ],
    tier2: [
      'Monte Carlo Risk Simulation via RiskEngine Pro',
      'Predictive Risk Analytics via AI Risk Advisor',
      'Automated Risk Monitoring via RiskWatch',
      'Advanced Scenario Modeling via ScenarioBuilder',
      'Real-time Risk Dashboards via RiskVision'
    ]
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Nebusis® ControlCore
        </h1>
        <p className="text-muted-foreground">
          Two-Tier Architecture: Core Features + Advanced Business Suite Integration
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="ring-2 ring-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {t('tier.tier1Basic')}
            </CardTitle>
            <CardDescription>{t('tier.tier1Description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">Complete COSO/INTOSAI Framework Implementation</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm">Document Management & Evidence Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm">Basic Analytics & Reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm">Multi-user Collaboration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t('tier.tier2Advanced')}
            </CardTitle>
            <CardDescription>{t('tier.tier2Description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">AI-Powered Risk Assessment & Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Advanced Analytics & Business Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Process Automation & Workflow Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Integration with Nebusis® Business Suite</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Environment Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Control Environment Features</h2>
        <TierComparison
          tier1Features={controlEnvironmentFeatures.tier1}
          tier2Features={controlEnvironmentFeatures.tier2}
          currentTier={1}
          onUpgrade={() => console.log('Upgrade to Tier 2')}
        />
      </div>

      {/* Risk Assessment Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Risk Assessment Features</h2>
        <TierComparison
          tier1Features={riskAssessmentFeatures.tier1}
          tier2Features={riskAssessmentFeatures.tier2}
          currentTier={1}
          onUpgrade={() => console.log('Upgrade to Tier 2')}
        />
      </div>

      {/* Feature Unavailable Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Advanced Features (Tier 2)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureUnavailableMessage
            featureName="AI Risk Prediction Engine"
            tier={2}
            description="Advanced AI algorithms that predict potential risks based on historical data and external factors."
            businessSuiteApp="RiskEngine Pro"
            onUpgrade={() => console.log('Upgrade to RiskEngine Pro')}
          />
          
          <FeatureUnavailableMessage
            featureName="Automated Policy Compliance Monitoring"
            tier={2}
            description="Real-time monitoring and automated alerts for policy compliance violations."
            businessSuiteApp="PolicyFlow Advanced"
            onUpgrade={() => console.log('Upgrade to PolicyFlow')}
          />
        </div>
      </div>

      {/* Business Suite Integration Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-center">Nebusis® Business Suite Integration</CardTitle>
          <CardDescription className="text-center">
            Tier 2 features are powered by specialized applications in the Nebusis® Business Suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <h4 className="font-semibold">RiskEngine Pro</h4>
              <p className="text-xs text-muted-foreground">Advanced risk modeling and prediction</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">PolicyFlow</h4>
              <p className="text-xs text-muted-foreground">Automated policy management</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Analytics Pro</h4>
              <p className="text-xs text-muted-foreground">Business intelligence & insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}