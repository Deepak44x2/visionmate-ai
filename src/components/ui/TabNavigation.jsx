import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const TabNavigation = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      path: '/dashboard-home',
      label: 'Home',
      icon: 'Home',
      ariaLabel: 'Home - Dashboard and feature overview'
    },
    {
      path: '/text-reader-ocr',
      label: 'Text Reader',
      icon: 'FileText',
      ariaLabel: 'Text Reader - OCR document scanning'
    },
    {
      path: '/object-detection',
      label: 'Find Objects',
      icon: 'Search',
      ariaLabel: 'Find Objects - AI object detection'
    },
    {
      path: '/color-detection',
      label: 'Check Color',
      icon: 'Palette',
      ariaLabel: 'Check Color - Color identification tool'
    },
    {
      path: '/currency-recognition',
      label: 'Read Money',
      icon: 'DollarSign',
      ariaLabel: 'Read Money - Currency recognition'
    },
    {
      path: '/emergency-contacts-sos',
      label: 'Emergency',
      icon: 'Phone',
      ariaLabel: 'Emergency - SOS contacts and safety'
    }
  ];

  const handleTabClick = (path, label) => {
    navigate(path);
    
    // Announce navigation for screen readers
    const announcement = `Navigated to ${label}`;
    const ariaLiveRegion = document.createElement('div');
    ariaLiveRegion?.setAttribute('aria-live', 'polite');
    ariaLiveRegion?.setAttribute('aria-atomic', 'true');
    ariaLiveRegion.className = 'sr-only';
    ariaLiveRegion.textContent = announcement;
    document.body?.appendChild(ariaLiveRegion);
    
    setTimeout(() => {
      document.body?.removeChild(ariaLiveRegion);
    }, 1000);
  };

  const isActive = (path) => location?.pathname === path;

  return (
    <>
      {/* Mobile Tab Navigation - Bottom */}
      <nav 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-900 bg-surface border-t border-border ${className}`}
        role="navigation"
        aria-label="Main navigation tabs"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems?.map((item) => {
            const active = isActive(item?.path);
            return (
              <button
                key={item?.path}
                onClick={() => handleTabClick(item?.path, item?.label)}
                className={`
                  flex flex-col items-center justify-center min-w-[60px] min-h-[60px] p-2 rounded-lg
                  transition-all duration-200 ease-out
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-elevation-1' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                aria-label={item?.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  className={`mb-1 ${active ? 'text-primary-foreground' : ''}`}
                />
                <span className={`text-xs font-medium leading-tight ${active ? 'text-primary-foreground' : ''}`}>
                  {item?.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      {/* Desktop Sidebar Navigation - Left */}
      <nav 
        className={`hidden lg:flex lg:fixed lg:left-0 lg:top-20 lg:bottom-0 lg:w-64 lg:z-900 bg-surface border-r border-border flex-col ${className}`}
        role="navigation"
        aria-label="Main navigation sidebar"
      >
        <div className="flex flex-col p-4 space-y-2">
          {navigationItems?.map((item) => {
            const active = isActive(item?.path);
            return (
              <button
                key={item?.path}
                onClick={() => handleTabClick(item?.path, item?.label)}
                className={`
                  flex items-center space-x-3 w-full min-h-[60px] px-4 py-3 rounded-lg text-left
                  transition-all duration-200 ease-out
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-elevation-1' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                aria-label={item?.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  name={item?.icon} 
                  size={24} 
                  className={active ? 'text-primary-foreground' : ''}
                />
                <span className={`text-base font-medium ${active ? 'text-primary-foreground' : ''}`}>
                  {item?.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default TabNavigation;