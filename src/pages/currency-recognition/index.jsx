import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import VoiceNavigationProvider, { useVoiceNavigation } from '../../components/ui/VoiceNavigationProvider';
import AccessibilityFocusManager from '../../components/ui/AccessibilityFocusManager';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import page components
import CameraViewfinder from './components/CameraViewfinder';
import CurrencyResult from './components/CurrencyResult';
import ScanHistory from './components/ScanHistory';
import CurrencySettings from './components/CurrencySettings';
import CountingMode from './components/CountingMode';

const CurrencyRecognitionPage = () => {
  const navigate = useNavigate();
  const { announceToScreenReader } = useVoiceNavigation();
  
  // State management
  const [currentView, setCurrentView] = useState('camera'); // camera, result, history, settings, counting
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [settings, setSettings] = useState({
    preferredCurrency: 'USD',
    sensitivity: 'medium',
    voiceAnnouncements: true,
    authenticityCheck: true,
    autoSave: true,
    language: 'en-US'
  });

  // Mock currency data for demonstration
  const mockCurrencyData = [
    {
      id: 1,
      denomination: 20,
      currency: 'USD',
      currencyName: 'US Dollar',
      confidence: 94,
      isAuthentic: true,
      isCounterfeit: false,
      features: [
        { name: 'Watermark', detected: true },
        { name: 'Security Thread', detected: true },
        { name: 'Color-changing Ink', detected: true },
        { name: 'Microprinting', detected: false }
      ],
      timestamp: new Date('2025-01-18T14:25:00')
    },
    {
      id: 2,
      denomination: 50,
      currency: 'EUR',
      currencyName: 'Euro',
      confidence: 87,
      isAuthentic: true,
      isCounterfeit: false,
      features: [
        { name: 'Hologram', detected: true },
        { name: 'Raised Print', detected: true },
        { name: 'UV Features', detected: true }
      ],
      timestamp: new Date('2025-01-18T13:45:00')
    },
    {
      id: 3,
      denomination: 10,
      currency: 'GBP',
      currencyName: 'British Pound',
      confidence: 76,
      isAuthentic: false,
      isCounterfeit: true,
      features: [
        { name: 'Polymer Feel', detected: false },
        { name: 'Transparent Window', detected: false },
        { name: 'Raised Print', detected: true }
      ],
      timestamp: new Date('2025-01-18T12:30:00')
    }
  ];

  // Initialize page
  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('visionmate-currency-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load scan history
    const savedHistory = localStorage.getItem('visionmate-currency-history');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    } else {
      // Use mock data for demonstration
      setScanHistory(mockCurrencyData);
    }

    // Announce page load
    announceToScreenReader('Currency Recognition page loaded. Camera ready for bill scanning.');
  }, [announceToScreenReader]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('visionmate-currency-settings', JSON.stringify(settings));
  }, [settings]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('visionmate-currency-history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  // Mock currency recognition processing
  const processCurrencyImage = async (imageBlob) => {
    setIsProcessing(true);
    
    try {
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result based on settings
      const mockResult = {
        id: Date.now(),
        denomination: Math.random() > 0.5 ? 20 : Math.random() > 0.5 ? 50 : 100,
        currency: settings?.preferredCurrency,
        currencyName: settings?.preferredCurrency === 'USD' ? 'US Dollar' : 
                     settings?.preferredCurrency === 'EUR' ? 'Euro' : 
                     settings?.preferredCurrency === 'GBP' ? 'British Pound' : 'Currency',
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        isAuthentic: Math.random() > 0.2, // 80% chance of authentic
        isCounterfeit: Math.random() < 0.1, // 10% chance of counterfeit
        features: [
          { name: 'Watermark', detected: Math.random() > 0.3 },
          { name: 'Security Thread', detected: Math.random() > 0.2 },
          { name: 'Color-changing Ink', detected: Math.random() > 0.4 },
          { name: 'Microprinting', detected: Math.random() > 0.5 }
        ],
        timestamp: new Date()
      };

      setCurrentResult(mockResult);
      
      // Auto-save if enabled
      if (settings?.autoSave) {
        setScanHistory(prev => [mockResult, ...prev?.slice(0, 49)]); // Keep last 50
      }
      
      setCurrentView('result');
      
    } catch (error) {
      console.error('Currency processing error:', error);
      announceToScreenReader('Error processing currency image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle camera capture
  const handleCapture = (imageBlob) => {
    if (imageBlob) {
      processCurrencyImage(imageBlob);
    }
  };

  // Handle camera retry
  const handleRetryCamera = () => {
    setCameraError(false);
    announceToScreenReader('Retrying camera access...');
  };

  // Handle new scan
  const handleNewScan = () => {
    setCurrentResult(null);
    setCurrentView('camera');
    announceToScreenReader('Ready for new currency scan.');
  };

  // Handle save result
  const handleSaveResult = (result) => {
    if (!scanHistory?.find(scan => scan?.id === result?.id)) {
      setScanHistory(prev => [result, ...prev?.slice(0, 49)]);
      announceToScreenReader('Scan result saved to history.');
    }
  };

  // Handle settings change
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    announceToScreenReader('Currency recognition settings updated.');
  };

  // Handle clear history
  const handleClearHistory = () => {
    setScanHistory([]);
    announceToScreenReader('Scan history cleared.');
  };

  // Handle select scan from history
  const handleSelectScan = (scan) => {
    setCurrentResult(scan);
    setCurrentView('result');
  };

  // Navigation handlers
  const handleBackClick = () => {
    if (currentView === 'result') {
      setCurrentView('camera');
    } else if (currentView !== 'camera') {
      setCurrentView('camera');
    } else {
      navigate('/dashboard-home');
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'result':
        return (
          <CurrencyResult
            result={currentResult}
            onNewScan={handleNewScan}
            onSaveResult={handleSaveResult}
            voiceAnnouncement={settings?.voiceAnnouncements}
          />
        );
      
      case 'history':
        return (
          <ScanHistory
            history={scanHistory}
            onClearHistory={handleClearHistory}
            onSelectScan={handleSelectScan}
            voiceNavigation={settings?.voiceAnnouncements}
          />
        );
      
      case 'settings':
        return (
          <CurrencySettings
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onClose={() => setCurrentView('camera')}
          />
        );
      
      case 'counting':
        return (
          <CountingMode
            onAddBill={(bill) => {
              setScanHistory(prev => [bill, ...prev?.slice(0, 49)]);
            }}
            onClearCount={() => {}}
            onExitMode={() => setCurrentView('camera')}
            voiceAnnouncements={settings?.voiceAnnouncements}
          />
        );
      
      default:
        return (
          <CameraViewfinder
            onCapture={handleCapture}
            isProcessing={isProcessing}
            cameraError={cameraError}
            onRetryCamera={handleRetryCamera}
            voiceInstructions={settings?.voiceAnnouncements}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main 
        id="main-content"
        className="pt-20 pb-20 lg:pb-8 lg:pl-64"
        role="main"
        aria-label="Currency Recognition"
        tabIndex={-1}
      >
        {/* Page Header */}
        <div className="sticky top-20 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                iconName="ArrowLeft"
                aria-label="Go back"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Currency Reader</h1>
                <p className="text-sm text-muted-foreground">
                  {currentView === 'camera' ? 'Scan paper money for identification' :
                   currentView === 'result' ? 'Scan result details' :
                   currentView === 'history' ? 'Previous scan history' :
                   currentView === 'settings' ? 'Recognition settings' :
                   currentView === 'counting' ? 'Multiple bill counting' : 'Currency Recognition'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {currentView === 'camera' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('counting')}
                    iconName="Calculator"
                    aria-label="Counting mode"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('history')}
                    iconName="History"
                    aria-label="View scan history"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('settings')}
                    iconName="Settings"
                    aria-label="Currency settings"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 max-w-2xl mx-auto">
          {renderCurrentView()}
        </div>

        {/* Voice Command Instructions */}
        {settings?.voiceAnnouncements && (
          <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-68 lg:right-4">
            <div className="bg-muted/90 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <Icon name="Mic" size={16} className="text-primary" />
                <p className="text-xs text-muted-foreground">
                  Voice commands: "scan currency", "show history", "settings", "counting mode"
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <TabNavigation />
    </div>
  );
};

// Wrap with providers
const CurrencyRecognitionWithProviders = () => {
  return (
    <VoiceNavigationProvider>
      <AccessibilityFocusManager>
        <CurrencyRecognitionPage />
      </AccessibilityFocusManager>
    </VoiceNavigationProvider>
  );
};

export default CurrencyRecognitionWithProviders;