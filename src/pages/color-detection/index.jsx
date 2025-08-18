import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import CameraView from './components/CameraView';
import ControlPanel from './components/ControlPanel';
import ColorHistoryPanel from './components/ColorHistoryPanel';
import ColorResultDisplay from './components/ColorResultDisplay';
import SettingsPanel from './components/SettingsPanel';

const ColorDetection = () => {
  const navigate = useNavigate();
  
  // Core state
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMode, setScanningMode] = useState('continuous');
  const [sensitivity, setSensitivity] = useState('medium');
  const [currentColor, setCurrentColor] = useState(null);
  const [colorHistory, setColorHistory] = useState([]);
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    detailLevel: 'basic',
    voiceSpeed: 'normal',
    autoAnnounce: true,
    announceConfidence: false,
    hapticFeedback: true,
    saveHistory: true,
    lightingWarnings: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false
  });

  // Voice synthesis
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Load saved settings and history
  useEffect(() => {
    const savedSettings = localStorage.getItem('visionmate-color-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedHistory = localStorage.getItem('visionmate-color-history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory)?.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setColorHistory(history);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('visionmate-color-settings', JSON.stringify(settings));
  }, [settings]);

  // Save history when changed
  useEffect(() => {
    if (settings?.saveHistory) {
      localStorage.setItem('visionmate-color-history', JSON.stringify(colorHistory));
    }
  }, [colorHistory, settings?.saveHistory]);

  // Voice announcement function
  const speakText = useCallback((text) => {
    if (!settings?.autoAnnounce || !speechSynthesis) return;

    speechSynthesis?.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings?.voiceSpeed === 'slow' ? 0.7 : settings?.voiceSpeed === 'fast' ? 1.3 : 1.0;
    utterance.volume = 1.0;
    utterance.pitch = 1.0;
    
    speechSynthesis?.speak(utterance);
  }, [speechSynthesis, settings?.autoAnnounce, settings?.voiceSpeed]);

  // Handle color detection
  const handleColorDetected = useCallback((colorInfo) => {
    setCurrentColor(colorInfo);
    
    // Add to history if enabled
    if (settings?.saveHistory) {
      setColorHistory(prev => {
        const newHistory = [colorInfo, ...prev?.slice(0, 49)]; // Keep last 50 colors
        return newHistory;
      });
    }
    
    // Haptic feedback
    if (settings?.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    // Lighting warning
    if (settings?.lightingWarnings && colorInfo?.confidence < 60) {
      setTimeout(() => {
        speakText("Low confidence detection. Try improving lighting conditions.");
      }, 1000);
    }
  }, [settings?.saveHistory, settings?.hapticFeedback, settings?.lightingWarnings, speakText]);

  // Handle scanning toggle
  const handleToggleScanning = () => {
    setIsScanning(prev => !prev);
    speakText(isScanning ? "Scanning stopped" : "Scanning started");
  };

  // Handle scanning mode change
  const handleScanningModeChange = (mode) => {
    setScanningMode(mode);
    speakText(`Switched to ${mode === 'continuous' ? 'continuous scanning' : 'tap to detect'} mode`);
  };

  // Handle sensitivity change
  const handleSensitivityChange = (level) => {
    setSensitivity(level);
    speakText(`Detection sensitivity set to ${level}`);
  };

  // Handle camera error
  const handleCameraError = (error) => {
    setCameraError(error);
    speakText("Camera access error. Please check permissions and try again.");
  };

  // Handle color selection from history
  const handleColorSelect = (color) => {
    setCurrentColor(color);
    const description = settings?.detailLevel === 'basic' ? color?.name : 
                      settings?.detailLevel === 'detailed' ? `${color?.name}, ${color?.brightness} and ${color?.saturation}` :
                      `${color?.name}, RGB ${color?.rgb?.r}, ${color?.rgb?.g}, ${color?.rgb?.b}`;
    speakText(`Selected color: ${description}`);
  };

  // Clear color history
  const handleClearHistory = () => {
    setColorHistory([]);
    localStorage.removeItem('visionmate-color-history');
    speakText("Color history cleared");
  };

  // Voice command handling
  useEffect(() => {
    const handleVoiceCommand = (event) => {
      const command = event?.detail?.command?.toLowerCase() || '';
      
      if (command?.includes('what color') || command?.includes('detect color')) {
        if (!isScanning) {
          setIsScanning(true);
          speakText("Starting color detection");
        }
      } else if (command?.includes('scan continuously')) {
        setScanningMode('continuous');
        setIsScanning(true);
        speakText("Continuous scanning activated");
      } else if (command?.includes('stop scanning')) {
        setIsScanning(false);
        speakText("Scanning stopped");
      } else if (command?.includes('show history')) {
        setShowHistory(true);
        speakText("Opening color history");
      }
    };

    document.addEventListener('voiceCommand', handleVoiceCommand);
    return () => document.removeEventListener('voiceCommand', handleVoiceCommand);
  }, [isScanning, speakText]);

  // Announce page load
  useEffect(() => {
    setTimeout(() => {
      speakText("Color Detection screen loaded. Point your camera at objects to identify their colors.");
    }, 1000);
  }, [speakText]);

  return (
    <div className={`min-h-screen bg-background ${settings?.highContrast ? 'contrast-more' : ''}`}>
      <Header />
      <main 
        id="main-content"
        className="pt-20 pb-20 lg:pb-4 lg:pl-64 min-h-screen"
        tabIndex={-1}
        role="main"
        aria-label="Color Detection - AI-powered color identification"
      >
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard-home')}
                iconName="ArrowLeft"
                iconPosition="left"
                aria-label="Go back to dashboard"
              >
                Back
              </Button>
              <div>
                <h1 className={`text-2xl font-bold text-foreground ${settings?.largeText ? 'text-3xl' : ''}`}>
                  Color Detector
                </h1>
                <p className="text-muted-foreground">
                  AI-powered color identification with voice feedback
                </p>
              </div>
            </div>
          </div>

          {/* Camera Error Display */}
          {cameraError && (
            <div className="bg-error bg-opacity-10 border border-error rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={24} className="text-error mt-0.5" />
                <div>
                  <h3 className="font-medium text-error mb-1">Camera Access Required</h3>
                  <p className="text-error text-sm mb-3">
                    This feature requires camera access to detect colors. Please enable camera permissions and refresh the page.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location?.reload()}
                    iconName="RefreshCw"
                    iconPosition="left"
                  >
                    Retry Camera Access
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera View - Takes up 2 columns on desktop */}
            <div className="lg:col-span-2 space-y-4">
              <CameraView
                onColorDetected={handleColorDetected}
                isScanning={isScanning}
                scanningMode={scanningMode}
                sensitivity={sensitivity}
                onCameraError={handleCameraError}
              />
              
              {/* Control Panel - Mobile */}
              <div className="lg:hidden">
                <ControlPanel
                  isScanning={isScanning}
                  scanningMode={scanningMode}
                  sensitivity={sensitivity}
                  onToggleScanning={handleToggleScanning}
                  onChangeScanningMode={handleScanningModeChange}
                  onChangeSensitivity={handleSensitivityChange}
                  onShowHistory={() => setShowHistory(true)}
                  onShowSettings={() => setShowSettings(true)}
                  colorHistoryCount={colorHistory?.length}
                />
              </div>
            </div>

            {/* Sidebar - Desktop */}
            <div className="hidden lg:block space-y-4">
              {/* Color Result Display */}
              <ColorResultDisplay
                currentColor={currentColor}
                detailLevel={settings?.detailLevel}
                onSpeak={speakText}
                isVisible={true}
              />

              {/* Control Panel - Desktop */}
              <ControlPanel
                isScanning={isScanning}
                scanningMode={scanningMode}
                sensitivity={sensitivity}
                onToggleScanning={handleToggleScanning}
                onChangeScanningMode={handleScanningModeChange}
                onChangeSensitivity={handleSensitivityChange}
                onShowHistory={() => setShowHistory(true)}
                onShowSettings={() => setShowSettings(true)}
                colorHistoryCount={colorHistory?.length}
              />
            </div>
          </div>

          {/* Color Result Display - Mobile */}
          <div className="lg:hidden">
            <ColorResultDisplay
              currentColor={currentColor}
              detailLevel={settings?.detailLevel}
              onSpeak={speakText}
              isVisible={true}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScanningMode('continuous');
                  setIsScanning(true);
                }}
                iconName="Play"
                iconPosition="left"
                className="justify-start"
              >
                Start Continuous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScanningMode('tap');
                  setIsScanning(false);
                }}
                iconName="Target"
                iconPosition="left"
                className="justify-start"
              >
                Tap Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                iconName="History"
                iconPosition="left"
                className="justify-start"
              >
                View History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                iconName="Settings"
                iconPosition="left"
                className="justify-start"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </main>
      {/* Navigation */}
      <TabNavigation />
      {/* Modals */}
      <ColorHistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        colorHistory={colorHistory}
        onClearHistory={handleClearHistory}
        onColorSelect={handleColorSelect}
        detailLevel={settings?.detailLevel}
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Color detection is {isScanning ? 'active' : 'inactive'}. 
        Current mode: {scanningMode === 'continuous' ? 'continuous scanning' : 'tap to detect'}.
        {currentColor && `Last detected color: ${currentColor?.name}`}
      </div>
    </div>
  );
};

export default ColorDetection;