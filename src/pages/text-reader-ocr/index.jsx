import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import CameraViewfinder from './components/CameraViewfinder';
import ImageUploader from './components/ImageUploader';
import TextProcessor from './components/TextProcessor';
import TextDisplay from './components/TextDisplay';
import VoiceCommandHandler from './components/VoiceCommandHandler';

const TextReaderOCR = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('capture'); // 'capture', 'processing', 'display'
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [captureMode, setCaptureMode] = useState('camera'); // 'camera', 'upload'

  // Voice announcement utility
  const announceToUser = (message) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Initialize page
  useEffect(() => {
    // Announce page load
    setTimeout(() => {
      announceToUser('Text Reader page loaded. Point camera at text and tap capture, or upload an image from gallery.');
    }, 1000);

    // Set page title for accessibility
    document.title = 'Text Reader OCR - VisionMate';
  }, []);

  // Handle image capture from camera
  const handleImageCapture = (imageFile) => {
    setSelectedImage(imageFile);
    setCurrentView('processing');
    setIsProcessing(true);
    setError(null);
  };

  // Handle image selection from upload
  const handleImageUpload = (imageFile) => {
    setSelectedImage(imageFile);
    setCurrentView('processing');
    setIsProcessing(true);
    setError(null);
  };

  // Handle text extraction completion
  const handleTextExtracted = (text) => {
    setExtractedText(text);
    setIsProcessing(false);
    setCurrentView('display');
  };

  // Handle processing error
  const handleProcessingError = (errorMessage) => {
    setError(errorMessage);
    setIsProcessing(false);
    setCurrentView('capture');
  };

  // Handle back to capture
  const handleBackToCapture = () => {
    setCurrentView('capture');
    setSelectedImage(null);
    setExtractedText('');
    setError(null);
    speechSynthesis.cancel(); // Stop any ongoing speech
    announceToUser('Returned to camera view');
  };

  // Handle voice commands
  const handleVoiceCommand = (command, transcript = '') => {
    switch (command) {
      case 'capture':
        if (currentView === 'capture' && captureMode === 'camera') {
          // Trigger camera capture
          const captureButton = document.querySelector('[aria-label*="Capture image"]');
          if (captureButton) captureButton?.click();
        }
        break;
      
      case 'upload':
        if (currentView === 'capture') {
          setCaptureMode('upload');
          announceToUser('Switched to upload mode');
        }
        break;
      
      case 'play':
        if (currentView === 'display') {
          announceToUser('Starting text playback');
        }
        break;
      
      case 'pause':
        if (currentView === 'display') {
          speechSynthesis.pause();
          announceToUser('Playback paused');
        }
        break;
      
      case 'stop':
        speechSynthesis.cancel();
        announceToUser('Playback stopped');
        break;
      
      case 'repeat': case 'restart':
        if (currentView === 'display') {
          announceToUser('Restarting text reading');
        }
        break;
      
      case 'speed_up':
        announceToUser('Increasing reading speed');
        break;
      
      case 'speed_down':
        announceToUser('Decreasing reading speed');
        break;
      
      case 'copy':
        if (currentView === 'display' && extractedText) {
          navigator.clipboard?.writeText(extractedText)?.then(() => {
            announceToUser('Text copied to clipboard');
          });
        }
        break;
      
      case 'save':
        if (currentView === 'display') {
          announceToUser('Text saved to history');
        }
        break;
      
      case 'back':
        handleBackToCapture();
        break;
      
      case 'home': navigate('/dashboard-home');
        break;
      
      case 'help':
        const helpMessage = currentView === 'capture' ? 'Available commands: capture, upload image, switch to camera'
          : currentView === 'display' ? 'Available commands: play, pause, stop, repeat, faster, slower, copy text, save, back' : 'Processing in progress';
        announceToUser(helpMessage);
        break;
      
      case 'unknown':
        announceToUser(`Command "${transcript}" not recognized. Say "help" for available commands.`);
        break;
      
      default:
        break;
    }
  };

  // Toggle voice functionality
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    announceToUser(voiceEnabled ? 'Voice guidance disabled' : 'Voice guidance enabled');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main 
        id="main-content"
        className="pt-20 pb-20 lg:pb-8 lg:pl-64"
        role="main"
        aria-label="Text Reader OCR main content"
        tabIndex={-1}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Text Reader
              </h1>
              <p className="text-muted-foreground">
                Extract and hear text from images using OCR technology
              </p>
            </div>
            
            {/* Voice Toggle */}
            <Button
              variant={voiceEnabled ? "primary" : "outline"}
              size="icon"
              onClick={toggleVoice}
              aria-label={`${voiceEnabled ? 'Disable' : 'Enable'} voice guidance`}
            >
              <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={20} />
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={20} className="text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Processing Error</h3>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="max-w-4xl mx-auto">
            {currentView === 'capture' && (
              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Button
                    variant={captureMode === 'camera' ? "primary" : "outline"}
                    onClick={() => {
                      setCaptureMode('camera');
                      announceToUser('Camera mode selected');
                    }}
                    iconName="Camera"
                    iconPosition="left"
                  >
                    Camera
                  </Button>
                  <Button
                    variant={captureMode === 'upload' ? "primary" : "outline"}
                    onClick={() => {
                      setCaptureMode('upload');
                      announceToUser('Upload mode selected');
                    }}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Upload
                  </Button>
                </div>

                {/* Camera or Upload Interface */}
                {captureMode === 'camera' ? (
                  <CameraViewfinder
                    onCapture={handleImageCapture}
                    onVoiceCommand={handleVoiceCommand}
                    isProcessing={isProcessing}
                    voiceEnabled={voiceEnabled}
                  />
                ) : (
                  <div className="max-w-md mx-auto">
                    <ImageUploader
                      onImageSelect={handleImageUpload}
                      isProcessing={isProcessing}
                      voiceEnabled={voiceEnabled}
                    />
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-muted rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Icon name="Info" size={20} className="mr-2" />
                    How to Use
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Point your camera at text or upload an image containing text</p>
                    <p>• Ensure good lighting and clear, readable text</p>
                    <p>• Tap the capture button or use voice commands</p>
                    <p>• The extracted text will be read aloud automatically</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'processing' && (
              <div className="flex justify-center">
                <TextProcessor
                  imageFile={selectedImage}
                  onTextExtracted={handleTextExtracted}
                  onError={handleProcessingError}
                  voiceEnabled={voiceEnabled}
                />
              </div>
            )}

            {currentView === 'display' && (
              <TextDisplay
                extractedText={extractedText}
                onBack={handleBackToCapture}
                voiceEnabled={voiceEnabled}
              />
            )}
          </div>
        </div>
      </main>

      <TabNavigation />
      
      {/* Voice Command Handler */}
      <VoiceCommandHandler
        onCommand={handleVoiceCommand}
        isActive={voiceEnabled}
        currentMode={currentView}
      />

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Current view: {currentView}
        {isProcessing && 'Processing image'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
};

export default TextReaderOCR;