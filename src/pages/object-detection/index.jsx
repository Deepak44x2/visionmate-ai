import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Import components
import CameraFeed from './components/CameraFeed';
import ControlPanel from './components/ControlPanel';
import DetectionHistory from './components/DetectionHistory';
import VoiceAnnouncement from './components/VoiceAnnouncement';
import SettingsPanel from './components/SettingsPanel';

const ObjectDetection = () => {
  const navigate = useNavigate();
  
  // Core detection state
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [isDescribing, setIsDescribing] = useState(false);
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    detailedDescriptions: true,
    announcementFrequency: 'immediate',
    voiceEnabled: true,
    batteryOptimization: true,
    confidenceThreshold: 0.7,
    spatialAudio: false,
    autoCapture: false,
    nightMode: false
  });

  // Voice command recognition
  const recognitionRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Initialize voice commands
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const lastResult = event?.results?.[event?.results?.length - 1];
        if (lastResult?.isFinal) {
          const transcript = lastResult?.[0]?.transcript?.toLowerCase()?.trim();
          handleVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.log('Voice recognition error:', event?.error);
      };

      recognitionRef.current = recognition;
      
      // Start voice recognition
      try {
        recognition?.start();
      } catch (error) {
        console.log('Voice recognition failed to start:', error);
      }
    }

    return () => {
      if (recognitionRef?.current) {
        recognitionRef?.current?.stop();
      }
    };
  }, []);

  // Handle voice commands
  const handleVoiceCommand = useCallback((transcript) => {
    console.log('Voice command:', transcript);
    
    if (transcript?.includes('what do you see') || transcript?.includes('describe surroundings')) {
      handleDescribeSurroundings();
    } else if (transcript?.includes('pause detection') || transcript?.includes('stop detection')) {
      setIsDetecting(false);
      announceToUser('Object detection paused');
    } else if (transcript?.includes('start detection') || transcript?.includes('resume detection')) {
      setIsDetecting(true);
      announceToUser('Object detection started');
    } else if (transcript?.includes('capture frame') || transcript?.includes('take picture')) {
      handleCaptureFrame();
    } else if (transcript?.includes('show history') || transcript?.includes('open history')) {
      setShowHistory(true);
      announceToUser('Detection history opened');
    } else if (transcript?.includes('hide history') || transcript?.includes('close history')) {
      setShowHistory(false);
      announceToUser('Detection history closed');
    } else if (transcript?.includes('open settings') || transcript?.includes('show settings')) {
      setShowSettings(true);
      announceToUser('Settings panel opened');
    }
  }, []);

  // Announce to user via speech synthesis
  const announceToUser = (message) => {
    if (settings?.voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      window.speechSynthesis?.speak(utterance);
    }
  };

  // Handle object detection results
  const handleDetection = useCallback((objects) => {
    setDetectedObjects(objects);
    
    // Add to history
    const historyItems = objects?.map(obj => ({
      ...obj,
      timestamp: new Date()?.toISOString(),
      id: `${obj?.name}-${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)}`
    }));
    
    setDetectionHistory(prev => [...historyItems, ...prev]?.slice(0, 100)); // Keep last 100 items

    // Auto-capture if enabled
    if (settings?.autoCapture && objects?.length > 0) {
      handleCaptureFrame();
    }

    // Reset inactivity timer
    if (settings?.batteryOptimization) {
      resetInactivityTimer();
    }
  }, [settings?.autoCapture, settings?.batteryOptimization]);

  // Handle camera errors
  const handleCameraError = useCallback((error) => {
    setCameraError(error);
    announceToUser(`Camera error: ${error}`);
  }, []);

  // Handle frame capture
  const handleCaptureFrame = useCallback((imageData, objects) => {
    // In a real app, this would save the image
    console.log('Frame captured with objects:', objects);
    announceToUser(`Frame captured with ${objects?.length || detectedObjects?.length} objects`);
  }, [detectedObjects]);

  // Handle describe surroundings
  const handleDescribeSurroundings = useCallback(() => {
    setIsDescribing(true);
    
    // Simulate description delay
    setTimeout(() => {
      const objectCount = detectedObjects?.length;
      let description = '';
      
      if (objectCount === 0) {
        description = 'No objects are currently detected in your surroundings.';
      } else if (objectCount === 1) {
        const obj = detectedObjects?.[0];
        description = `I can see a ${obj?.description || obj?.name} ${obj?.position} with ${Math.round(obj?.confidence * 100)} percent confidence.`;
      } else {
        const objectList = detectedObjects?.map(obj => `${obj?.name} ${obj?.position}`)?.join(', ');
        description = `I can see ${objectCount} objects in your surroundings: ${objectList}.`;
      }
      
      announceToUser(description);
      setIsDescribing(false);
    }, 1500);
  }, [detectedObjects]);

  // Battery optimization - inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef?.current) {
      clearTimeout(inactivityTimerRef?.current);
    }
    
    if (settings?.batteryOptimization && isDetecting) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsDetecting(false);
        announceToUser('Detection paused due to inactivity. Say "start detection" to resume.');
      }, 300000); // 5 minutes
    }
  }, [settings?.batteryOptimization, isDetecting]);

  // Handle settings changes
  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    
    // Apply confidence threshold immediately
    if (newSettings?.confidenceThreshold !== settings?.confidenceThreshold) {
      announceToUser(`Confidence threshold set to ${Math.round(newSettings?.confidenceThreshold * 100)} percent`);
    }
  }, [settings?.confidenceThreshold]);

  // Clear detection history
  const handleClearHistory = useCallback(() => {
    setDetectionHistory([]);
    announceToUser('Detection history cleared');
  }, []);

  // Handle back navigation
  const handleBackNavigation = () => {
    navigate('/dashboard-home');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef?.current) {
        clearTimeout(inactivityTimerRef?.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main 
        id="main-content"
        className="pt-20 pb-16 lg:pb-0 lg:pl-64 min-h-screen"
        tabIndex={-1}
        role="main"
        aria-label="Object Detection Interface"
      >
        {/* Page Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              iconName="ArrowLeft"
              aria-label="Go back to dashboard"
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Object Detection</h1>
              <p className="text-sm text-muted-foreground">Real-time environmental awareness</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              iconName="History"
              aria-label={showHistory ? "Hide detection history" : "Show detection history"}
            />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-6 bg-surface border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Object Detection</h1>
              <p className="text-muted-foreground">
                Real-time identification of objects through live camera feed with voice feedback
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                iconName="History"
                iconPosition="left"
                aria-label={showHistory ? "Hide detection history" : "Show detection history"}
              >
                History
              </Button>
            </div>
          </div>
        </div>

        {/* Camera Error Display */}
        {cameraError && (
          <div className="p-4 bg-destructive/10 border-l-4 border-destructive">
            <div className="flex items-center space-x-3">
              <Icon name="AlertCircle" size={20} className="text-destructive" />
              <div>
                <p className="font-medium text-destructive">Camera Error</p>
                <p className="text-sm text-destructive/80">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Camera Feed Container */}
        <div className="relative flex-1" style={{ height: 'calc(100vh - 200px)' }}>
          <CameraFeed
            isDetecting={isDetecting}
            onDetection={handleDetection}
            onCameraError={handleCameraError}
            detectionSensitivity={settings?.confidenceThreshold}
            onFrameCapture={handleCaptureFrame}
          />
        </div>

        {/* Control Panel */}
        <ControlPanel
          isDetecting={isDetecting}
          onToggleDetection={() => setIsDetecting(!isDetecting)}
          onCaptureFrame={handleCaptureFrame}
          onAdjustSensitivity={(value) => handleSettingsChange({ ...settings, confidenceThreshold: value })}
          detectionSensitivity={settings?.confidenceThreshold}
          onDescribeSurroundings={handleDescribeSurroundings}
          isDescribing={isDescribing}
          className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-64 z-20"
        />
      </main>
      {/* Detection History */}
      <DetectionHistory
        detectionHistory={detectionHistory}
        isVisible={showHistory}
        onToggleVisibility={() => setShowHistory(!showHistory)}
        onClearHistory={handleClearHistory}
        onPlayAnnouncement={announceToUser}
      />
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={handleSettingsChange}
      />
      {/* Voice Announcement System */}
      <VoiceAnnouncement
        detectedObjects={detectedObjects}
        announcementFrequency={settings?.announcementFrequency}
        isEnabled={settings?.voiceEnabled}
        detailedDescriptions={settings?.detailedDescriptions}
        onAnnouncementComplete={(text) => console.log('Announced:', text)}
      />
      {/* Tab Navigation */}
      <TabNavigation />
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Object detection page loaded. 
        Detection is {isDetecting ? 'active' : 'paused'}. 
        {detectedObjects?.length} objects currently detected.
        Voice commands available: "what do you see", "pause detection", "start detection", "capture frame".
      </div>
    </div>
  );
};

export default ObjectDetection;