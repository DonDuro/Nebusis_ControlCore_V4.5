import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, ArrowRight, Zap, Star } from "lucide-react";
import { useTranslation } from "@/i18n";

export type TierLevel = 1 | 2;

interface TierIndicatorProps {
  tier: TierLevel;
  featureName: string;
  className?: string;
}

interface FeatureUnavailableMessageProps {
  featureName: string;
  tier: TierLevel;
  description?: string;
  businessSuiteApp?: string;
  onUpgrade?: () => void;
  className?: string;
}

export function TierIndicator({ tier, featureName, className = "" }: TierIndicatorProps) {
  const { t } = useTranslation();
  
  return (
    <Badge 
      variant={tier === 1 ? "default" : "secondary"} 
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {tier === 1 ? (
        <>
          <CheckCircle className="w-3 h-3" />
          {t('tier.tier1')}
        </>
      ) : (
        <>
          <Star className="w-3 h-3" />
          {t('tier.tier2')}
        </>
      )}
    </Badge>
  );
}

export function FeatureUnavailableMessage({ 
  featureName, 
  tier, 
  description, 
  businessSuiteApp, 
  onUpgrade,
  className = "" 
}: FeatureUnavailableMessageProps) {
  const { t } = useTranslation();
  
  return (
    <Card className={`border-dashed border-2 border-muted ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{featureName}</CardTitle>
        <TierIndicator tier={tier} featureName={featureName} className="mx-auto" />
      </CardHeader>
      <CardContent className="text-center pt-0">
        <CardDescription className="mb-4">
          {description || t('tier.upgradeRequired', { feature: featureName })}
        </CardDescription>
        
        {businessSuiteApp && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-foreground mb-1">
              {t('tier.availableIn')}
            </p>
            <p className="text-sm text-muted-foreground">
              Nebusis® {businessSuiteApp}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            variant="default" 
            size="sm" 
            onClick={onUpgrade}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {t('tier.upgradeNow')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            {t('tier.learnMore')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to show feature comparison
interface TierComparisonProps {
  tier1Features: string[];
  tier2Features: string[];
  currentTier: TierLevel;
  onUpgrade?: () => void;
}

export function TierComparison({ tier1Features, tier2Features, currentTier, onUpgrade }: TierComparisonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Tier 1 - Basic Features */}
      <Card className={currentTier === 1 ? "ring-2 ring-primary" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {t('tier.tier1Basic')}
          </CardTitle>
          <CardDescription>{t('tier.tier1Description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tier1Features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tier 2 - Advanced Features */}
      <Card className={currentTier === 2 ? "ring-2 ring-primary" : "border-dashed"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {t('tier.tier2Advanced')}
          </CardTitle>
          <CardDescription>{t('tier.tier2Description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {tier2Features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                {currentTier === 2 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={currentTier === 2 ? "" : "text-muted-foreground"}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
          
          {currentTier === 1 && onUpgrade && (
            <Button onClick={onUpgrade} className="w-full">
              <Zap className="w-4 h-4 mr-2" />
              {t('tier.upgradeToTier2')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}