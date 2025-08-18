import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SOSButton = ({ 
  onSOSActivate, 
  onVoiceAnnounce,
  isEmergencyActive = false 
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isActivating, setIsActivating] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const handleSOSPress = () => {
    if (isActivating) return;
    
    setIsActivating(true);
    setCountdown(3);
    
    if (onVoiceAnnounce) {
      onVoiceAnnounce('Emergency alert activating in 3 seconds. Release to cancel.');
    }
  };

  const handleSOSRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (isActivating && countdown > 0) {
      // Cancel activation
      setIsActivating(false);
      setCountdown(0);
      if (onVoiceAnnounce) {
        onVoiceAnnounce('Emergency alert cancelled');
      }
    }
  };

  const handleSOSClick = () => {
    if (!isActivating) {
      handleSOSPress();
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isActivating && countdown > 0) {
      timer = setTimeout(() => {
        const newCount = countdown - 1;
        setCountdown(newCount);
        
        if (onVoiceAnnounce) {
          if (newCount > 0) {
            onVoiceAnnounce(`${newCount}`);
          } else {
            onVoiceAnnounce('Emergency alert activated');
          }
        }
        
        if (newCount === 0) {
          // Activate SOS
          setIsActivating(false);
          if (onSOSActivate) {
            onSOSActivate();
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isActivating, onSOSActivate, onVoiceAnnounce]);

  return (
    <div className="relative">
      {/* Main SOS Button */}
      <Button
        variant={isActivating || isEmergencyActive ? "destructive" : "outline"}
        size="xl"
        onClick={handleSOSClick}
        onMouseDown={handleSOSPress}
        onMouseUp={handleSOSRelease}
        onMouseLeave={handleSOSRelease}
        onTouchStart={handleSOSPress}
        onTouchEnd={handleSOSRelease}
        iconName="Phone"
        iconPosition="left"
        iconSize={24}
        className={`
          min-w-[140px] min-h-[64px] text-lg font-bold transition-all duration-200
          ${isActivating ? 'animate-pulse scale-105' : ''}
          ${isEmergencyActive ? 'animate-pulse' : ''}
          border-2 shadow-lg hover:shadow-xl focus:shadow-xl
        `}
        aria-label="Emergency SOS button - Press and hold to activate emergency alert"
        role="button"
        aria-pressed={isActivating || isEmergencyActive}
      >
        {isActivating ? `SOS ${countdown}` : isEmergencyActive ? 'ACTIVE' : 'SOS'}
      </Button>

      {/* Countdown Overlay */}
      {isActivating && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/90 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive-foreground mb-1">
              {countdown}
            </div>
            <div className="text-xs text-destructive-foreground">
              Release to cancel
            </div>
          </div>
        </div>
      )}

      {/* Emergency Active Indicator */}
      {isEmergencyActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center animate-pulse">
          <Icon name="AlertTriangle" size={14} className="text-error-foreground" />
        </div>
      )}
    </div>
  );
};

export default SOSButton;