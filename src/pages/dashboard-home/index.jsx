import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import VoiceNavigationProvider, { useVoiceNavigation } from '../../components/ui/VoiceNavigationProvider';
import AccessibilityFocusManager from '../../components/ui/AccessibilityFocusManager';
import WelcomeSection from './components/WelcomeSection';
import FeatureCard from './components/FeatureCard';
import RecentActivitySection from './components/RecentActivitySection';
import FloatingCameraButton from './components/FloatingCameraButton';
import PermissionStatusCard from './components/PermissionStatusCard';

const DashboardHomeContent = () => {
  const { announceToScreenReader } = useVoiceNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Voice announcement handler
  const handleVoiceAnnounce = (message) => {
    if (announceToScreenReader) {
      announceToScreenReader(message);
    }
  };

  // Feature cards configuration
  const featureCards = [
    {
      title: "Text Reader",
      description: "Scan and read text from documents, signs, and printed materials with OCR technology",
      iconName: "FileText",
      route: "/text-reader-ocr",
      voiceCommand: "open text reader",
      isHighPriority: true
    },
    {
      title: "Object Detection",
      description: "Identify and describe objects, people, and scenes around you using AI vision",
      iconName: "Search",
      route: "/object-detection",
      voiceCommand: "find objects",
      isHighPriority: true
    },
    {
      title: "Color Identifier",
      description: "Detect and announce colors of clothing, objects, and surfaces instantly",
      iconName: "Palette",
      route: "/color-detection",
      voiceCommand: "check color",
      isHighPriority: false
    },
    {
      title: "Currency Recognition",
      description: "Identify and announce the value of paper money and currency notes",
      iconName: "DollarSign",
      route: "/currency-recognition",
      voiceCommand: "read money",
      isHighPriority: false
    },
    {
      title: "Emergency Contacts",
      description: "Quick access to emergency contacts and SOS functionality with location sharing",
      iconName: "Phone",
      route: "/emergency-contacts-sos",
      voiceCommand: "emergency help",
      isHighPriority: true
    },
    {
      title: "Voice Settings",
      description: "Customize voice speed, language preferences, and audio feedback options",
      iconName: "Settings",
      route: "/voice-settings",
      voiceCommand: "voice settings",
      isHighPriority: false
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading VisionMate Dashboard...</p>
          <div className="sr-only" aria-live="polite">
            VisionMate is loading. Please wait.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main 
        id="main-content"
        className="pt-20 pb-24 lg:pb-8 lg:pl-64"
        tabIndex={-1}
        role="main"
        aria-label="VisionMate Dashboard"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <WelcomeSection onVoiceAnnounce={handleVoiceAnnounce} />

          {/* Feature Cards Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <span className="mr-2">🎯</span>
              VisionMate Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards?.map((card, index) => (
                <FeatureCard
                  key={index}
                  title={card?.title}
                  description={card?.description}
                  iconName={card?.iconName}
                  route={card?.route}
                  voiceCommand={card?.voiceCommand}
                  isHighPriority={card?.isHighPriority}
                  onVoiceAnnounce={handleVoiceAnnounce}
                />
              ))}
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <RecentActivitySection onVoiceAnnounce={handleVoiceAnnounce} />
            
            {/* Permission Status */}
            <PermissionStatusCard onVoiceAnnounce={handleVoiceAnnounce} />
          </div>

          {/* Voice Commands Help */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
              <span className="mr-2">🎤</span>
              Voice Commands
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-card-foreground mb-2">Navigation</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>"Go to home" - Return to dashboard</li>
                  <li>"Open text reader" - Start OCR scanning</li>
                  <li>"Find objects" - Object detection</li>
                  <li>"Check color" - Color identification</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-card-foreground mb-2">Actions</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>"Camera" - Quick photo capture</li>
                  <li>"Emergency help" - SOS contacts</li>
                  <li>"Read money" - Currency recognition</li>
                  <li>"Help" - Voice command list</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Floating Camera Button */}
      <FloatingCameraButton onVoiceAnnounce={handleVoiceAnnounce} />
      {/* Navigation */}
      <TabNavigation />
      {/* Page Load Announcement */}
      <div className="sr-only" aria-live="polite">
        VisionMate Dashboard loaded successfully. {featureCards?.length} features available. 
        Use voice commands or touch navigation to access features. 
        Camera and emergency buttons are available for quick access.
      </div>
    </div>
  );
};

const DashboardHome = () => {
  return (
    <VoiceNavigationProvider>
      <AccessibilityFocusManager>
        <DashboardHomeContent />
      </AccessibilityFocusManager>
    </VoiceNavigationProvider>
  );
};

export default DashboardHome;