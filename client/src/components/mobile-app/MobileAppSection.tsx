import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Bell, Fingerprint, Wifi, Camera, MapPin, Star, Download, Users, Apple } from "lucide-react";
import QRCode from 'qrcode';

interface MobileAppSectionProps {
  className?: string;
}

// Mobile device detection hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Mobile|Android|iPhone|iPad/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return isMobile;
};

// QR Code Component
const QRCodeDownload = ({ url, description }: { url: string; description: string }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 120,
      margin: 1,
      color: {
        dark: '#1e3a5f',
        light: '#ffffff'
      }
    })
    .then(url => setQrCodeDataUrl(url))
    .catch(err => console.error('Error generating QR code:', err));
  }, [url]);

  if (!qrCodeDataUrl) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <img 
        src={qrCodeDataUrl} 
        alt="QR Code para descargar app móvil" 
        className="w-32 h-32 border-2 border-primary rounded-lg shadow-lg"
      />
      <p className="text-sm text-gray-600 text-center max-w-32">{description}</p>
    </div>
  );
};

// App Store Button Component
const AppStoreButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
  >
    <Apple className="h-6 w-6" />
    <div className="text-left">
      <div className="text-xs">Descargar en</div>
      <div className="text-sm font-semibold">App Store</div>
    </div>
  </Button>
);

// Google Play Button Component
const GooglePlayButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
  >
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
    <div className="text-left">
      <div className="text-xs">Disponible en</div>
      <div className="text-sm font-semibold">Google Play</div>
    </div>
  </Button>
);

// Smart App Banner Component for mobile users
const SmartAppBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useMobileDetection();

  useEffect(() => {
    const isDismissed = localStorage.getItem('app-banner-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  const handleDownload = () => {
    // Track download attempt
    console.log('Mobile app download clicked from banner');
    // Open appropriate store based on device
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      window.open('https://apps.apple.com/app/compliancecore', '_blank');
    } else if (/Android/i.test(userAgent)) {
      window.open('https://play.google.com/store/apps/details?id=com.nebusis.compliancecore', '_blank');
    }
  };

  if (!isMobile || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 animate-slide-down">
      <div className="flex items-center justify-between p-3 max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">ComplianceCore®</div>
            <div className="text-sm text-gray-600">by Nebusis®</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={handleDownload} className="bg-primary hover:bg-primary">
            Descargar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Mobile App Section Component
export default function MobileAppSection({ className = "" }: MobileAppSectionProps) {
  const isMobile = useMobileDetection();

  const trackDownload = (platform: 'ios' | 'android') => {
    console.log(`Mobile app download clicked: ${platform}`);
    // Track analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `mobile_download_${platform}_clicked`, {
        event_category: 'mobile_app',
        event_label: platform
      });
    }
  };

  const handleiOSDownload = () => {
    trackDownload('ios');
    window.open('https://apps.apple.com/app/compliancecore', '_blank');
  };

  const handleAndroidDownload = () => {
    trackDownload('android');
    window.open('https://play.google.com/store/apps/details?id=com.nebusis.compliancecore', '_blank');
  };

  const mobileFeatures = [
    {
      icon: Smartphone,
      title: "Rendimiento Nativo",
      description: "Velocidad y capacidad de respuesta optimizadas en dispositivos móviles"
    },
    {
      icon: Bell,
      title: "Notificaciones Push",
      description: "Mantente actualizado con notificaciones instantáneas"
    },
    {
      icon: Fingerprint,
      title: "Autenticación Biométrica",
      description: "Inicio de sesión seguro con huella dactilar o Face ID"
    },
    {
      icon: Wifi,
      title: "Funcionalidad Offline",
      description: "Accede a funciones principales incluso sin internet"
    },
    {
      icon: Camera,
      title: "Escaneo de Documentos",
      description: "Digitaliza documentos directamente desde tu dispositivo móvil"
    },
    {
      icon: MapPin,
      title: "Ubicación Inteligente",
      description: "Funcionalidades mejoradas basadas en geolocalización"
    }
  ];

  const appMetrics = [
    {
      icon: Star,
      value: "4.8/5.0",
      label: "Calificación App Store"
    },
    {
      icon: Download,
      value: "10K+",
      label: "Descargas"
    },
    {
      icon: Users,
      value: "5K+",
      label: "Usuarios Activos"
    }
  ];

  return (
    <>
      {/* Smart App Banner for mobile users */}
      <SmartAppBanner />
      
      {/* Main Mobile App Section */}
      <section className={`mobile-app-section py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-white to-indigo-50 ${className}`} id="mobile-app">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Mobile App Promotion */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Aplicación Móvil Disponible
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Descarga ComplianceCore®
                  <span className="text-primary block">App Móvil</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Obtén funciones móviles mejoradas y acceso offline para gestionar 
                  el cumplimiento normativo desde cualquier lugar.
                </p>
              </div>
              
              {/* Download Buttons */}
              <div className="flex flex-wrap gap-4">
                <AppStoreButton onClick={handleiOSDownload} />
                <GooglePlayButton onClick={handleAndroidDownload} />
              </div>
              
              {/* App Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {appMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <metric.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="font-bold text-gray-900">{metric.value}</div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* QR Code (Desktop Only) */}
              {!isMobile && (
                <div className="pt-6">
                  <QRCodeDownload 
                    url="https://compliancecore.nebusis.com/mobile"
                    description="Escanea con tu teléfono para descargar"
                  />
                </div>
              )}
            </div>
            
            {/* Mobile Features Grid */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 text-center lg:text-left">
                Características Móviles Exclusivas
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mobileFeatures.map((feature, index) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <CardContent className="p-6 space-y-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}