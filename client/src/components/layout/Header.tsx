import { User as UserType, Institution } from "@shared/schema";
import { Menu, X, Search, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import SmartNotifications from "@/components/dashboard/SmartNotifications";
import MobileSearch from "@/components/dashboard/MobileSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { LanguageToggle } from "@/components/common/LanguageToggle";

import { useTranslation } from "@/i18n";
import { BrandName } from "@/components/common/BrandName";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: UserType;
  institution: Institution;
  onMobileMenuToggle?: () => void;
  stats?: {
    activeWorkflows: number;
    completedWorkflows: number;
    underReview: number;
    overallProgress: number;
  };
}

export default function Header({ user, institution, onMobileMenuToggle, stats }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-sm fixed top-0 left-0 right-0 z-40 transition-colors duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo and branding */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleMobileMenuToggle}
                    className="lg:hidden touch-target bg-transparent hover:bg-muted p-2 rounded-lg transition-colors"
                    aria-label="Toggle mobile menu"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6 text-foreground" />
                    ) : (
                      <Menu className="h-6 w-6 text-foreground" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{mobileMenuOpen ? t('common.close') : t('nav.dashboard')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Logo and title */}
            <div className="flex items-center">
              {/* Custom COSO Icon aligned with N */}
              <svg 
                width="28" 
                height="28" 
                viewBox="0 0 32 32" 
                className="text-primary flex-shrink-0 mr-3"
                fill="currentColor"
              >
                <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" opacity="0.1"/>
                <path d="M8 10h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2zm0 4h16v2H8v-2z" fill="currentColor"/>
                <circle cx="20" cy="18" r="3" fill="currentColor" opacity="0.8"/>
                <path d="M18 16l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
              
              <div className="flex flex-col">
                {/* Main title row with subtitle to the right */}
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-base sm:text-lg md:text-xl font-bold leading-none">
                      <BrandName size="lg" />
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground hidden sm:block">
                    {t('dashboard.title')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Search, notifications, and user info */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder={t('common.search')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 text-sm"
              />
            </div>

            {/* Mobile Search */}
            <MobileSearch />

            {/* Language Toggle */}
            <LanguageToggle variant="ghost" size="sm" />

            {/* Smart Notifications */}
            <SmartNotifications 
              overallProgress={stats?.overallProgress || 0}
              activeWorkflows={stats?.activeWorkflows || 0}
              underReview={stats?.underReview || 0}
            />

            {/* User Profile Section with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 ml-4 h-auto p-2 hover:bg-muted transition-colors">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {(user as any)?.name?.split(' - ')[0] || (user as any)?.firstName + ' ' + (user as any)?.lastName || user.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{(user as any)?.role || 'User'}</p>
                  </div>
                  {(user as any)?.email === 'calvarado@nebusis.com' ? (
                    <img 
                      src="/api/assets/Celso Professional_1753269775786.jpg"
                      alt="Celso Alvarado"
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (user as any)?.email === 'ymontoya@qsiglobalventures.com' ? (
                    <img 
                      src="/api/assets/image_1753270776387.png"
                      alt="Yerardy Montoya"
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {((user as any)?.name || (user as any)?.firstName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('common.profile')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('nav.configuration')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    localStorage.removeItem("sessionToken");
                    localStorage.removeItem("controlcore-auto-login-email");
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('common.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        </div>
      </div>
    </header>
  );
}
