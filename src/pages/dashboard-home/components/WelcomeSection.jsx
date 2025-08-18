import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeSection = ({ onVoiceAnnounce }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasAnnounced, setHasAnnounced] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Welcome announcement on component mount
    if (!hasAnnounced && onVoiceAnnounce) {
      const welcomeMessage = `Welcome to VisionMate. Your assistive vision companion is ready. Current time is ${currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setTimeout(() => {
        onVoiceAnnounce(welcomeMessage);
        setHasAnnounced(true);
      }, 1000);
    }
  }, [onVoiceAnnounce, hasAnnounced, currentTime]);

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-8">
      <div className="flex items-center space-x-4">
        {/* VisionMate Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="Eye" size={24} className="text-primary-foreground" aria-hidden="true" />
        </div>

        {/* Welcome Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {getGreeting()}!
          </h1>
          <p className="text-muted-foreground text-sm">
            {formatDate()} • {formatTime()}
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-success rounded-full" aria-hidden="true"></div>
            <span className="text-muted-foreground">Camera Ready</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-success rounded-full" aria-hidden="true"></div>
            <span className="text-muted-foreground">Voice Active</span>
          </div>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="mt-4 p-3 bg-card/50 rounded-lg border border-border/50">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm text-card-foreground font-medium">Quick Tip</p>
            <p className="text-xs text-muted-foreground mt-1">
              Say "Help" anytime for voice commands, or use the floating camera button for quick capture.
            </p>
          </div>
        </div>
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        VisionMate Dashboard loaded. {getGreeting()}. Today is {formatDate()}. Current time is {formatTime()}. 
        Camera and voice systems are ready. You can navigate using voice commands or touch controls.
      </div>
    </div>
  );
};

export default WelcomeSection;