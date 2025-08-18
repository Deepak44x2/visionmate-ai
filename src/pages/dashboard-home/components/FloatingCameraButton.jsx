import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FloatingCameraButton = ({ onVoiceAnnounce }) => {
  const [isActive, setIsActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCameraClick = () => {
    setIsActive(true);
    
    if (onVoiceAnnounce) {
      onVoiceAnnounce('Camera activated. Point your device at what you want to analyze and tap the screen to capture.');
    }

    // Simulate camera activation
    setTimeout(() => {
      setIsActive(false);
    }, 2000);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (onVoiceAnnounce) {
      onVoiceAnnounce('Quick camera access button');
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleCameraClick();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-foreground text-background text-sm rounded-lg shadow-elevation-2 whitespace-nowrap">
              Quick Camera Access
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
            </div>
          )}

          {/* Main Button */}
          <button
            className={`
              w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-elevation-3
              flex items-center justify-center transition-all duration-300 ease-out
              hover:scale-110 hover:shadow-elevation-4 focus:outline-none focus:ring-4 focus:ring-primary/30
              ${isActive ? 'animate-pulse bg-accent text-accent-foreground' : ''}
            `}
            onClick={handleCameraClick}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label="Quick camera access - Tap to capture or say camera"
            aria-describedby="camera-button-description"
          >
            <Icon 
              name={isActive ? "Zap" : "Camera"} 
              size={28} 
              className={isActive ? "animate-bounce" : ""}
              aria-hidden="true"
            />
          </button>

          {/* Pulse Animation Ring */}
          {!isActive && (
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20"></div>
          )}
        </div>
      </div>

      {/* Voice Command Hint */}
      <div className="fixed bottom-6 left-6 lg:bottom-8 lg:left-8 z-40">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-elevation-1">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Mic" size={12} aria-hidden="true" />
            <span>Say "Camera" for quick access</span>
          </div>
        </div>
      </div>

      {/* Screen Reader Description */}
      <div id="camera-button-description" className="sr-only">
        Floating camera button for quick photo capture. You can tap this button or use voice command "camera" 
        to activate the camera for text reading, object detection, color identification, or currency recognition.
      </div>

      {/* Active State Announcement */}
      {isActive && (
        <div className="sr-only" aria-live="assertive">
          Camera is now active. Point your device at the object you want to analyze and tap anywhere on the screen to capture.
        </div>
      )}
    </>
  );
};

export default FloatingCameraButton;