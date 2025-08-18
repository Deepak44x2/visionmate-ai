import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../ui/Button';


const Header = () => {
  const location = useLocation();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const handleEmergencyClick = () => {
    setIsEmergencyActive(true);
    // Emergency functionality - could trigger SOS, navigate to emergency contacts, etc.
    window.location.href = '/emergency-contacts-sos';
    
    // Reset after a brief moment for visual feedback
    setTimeout(() => {
      setIsEmergencyActive(false);
    }, 1000);
  };

  const handleLogoClick = () => {
    window.location.href = '/dashboard-home';
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-1000 bg-background border-b border-border h-20"
      role="banner"
      aria-label="VisionMate main navigation"
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo Section */}
        <div 
          className="flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg p-2 -ml-2"
          onClick={handleLogoClick}
          onKeyDown={(e) => {
            if (e?.key === 'Enter' || e?.key === ' ') {
              e?.preventDefault();
              handleLogoClick();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="VisionMate home - Go to dashboard"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path 
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" 
                  fill="currentColor"
                  className="text-primary-foreground"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground leading-tight">
                VisionMate
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Assistive Vision AI
              </span>
            </div>
          </div>
        </div>

        {/* Emergency SOS Button */}
        <Button
          variant={isEmergencyActive ? "destructive" : "outline"}
          size="lg"
          onClick={handleEmergencyClick}
          className={`
            min-w-[120px] h-12 font-semibold transition-all duration-200
            ${isEmergencyActive ? 'animate-pulse-subtle' : ''}
            border-2 hover:scale-105 focus:scale-105
          `}
          iconName="Phone"
          iconPosition="left"
          iconSize={20}
          aria-label="Emergency SOS - Activate emergency contacts and assistance"
          role="button"
        >
          {isEmergencyActive ? 'ACTIVATING...' : 'SOS'}
        </Button>
      </div>
    </header>
  );
};

export default Header;