import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VoiceNavigationContext = createContext();

export const useVoiceNavigation = () => {
  const context = useContext(VoiceNavigationContext);
  if (!context) {
    throw new Error('useVoiceNavigation must be used within VoiceNavigationProvider');
  }
  return context;
};

const VoiceNavigationProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceCommandEnabled, setVoiceCommandEnabled] = useState(true);

  // Voice command vocabulary mapping
  const commandVocabulary = {
    'home': '/dashboard-home',
    'dashboard': '/dashboard-home',
    'text reader': '/text-reader-ocr',
    'read text': '/text-reader-ocr',
    'ocr': '/text-reader-ocr',
    'find objects': '/object-detection',
    'object detection': '/object-detection',
    'detect objects': '/object-detection',
    'check color': '/color-detection',
    'color detection': '/color-detection',
    'identify color': '/color-detection',
    'read money': '/currency-recognition',
    'currency': '/currency-recognition',
    'money recognition': '/currency-recognition',
    'emergency': '/emergency-contacts-sos',
    'sos': '/emergency-contacts-sos',
    'help': '/emergency-contacts-sos'
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 3;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        announceToScreenReader('Voice navigation activated');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (voiceCommandEnabled) {
          // Restart recognition for continuous listening
          setTimeout(() => {
            try {
              recognitionInstance?.start();
            } catch (error) {
              console.log('Speech recognition restart failed:', error);
            }
          }, 1000);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.log('Speech recognition error:', event?.error);
        setIsListening(false);
      };

      recognitionInstance.onresult = (event) => {
        const lastResult = event?.results?.[event?.results?.length - 1];
        if (lastResult?.isFinal) {
          const transcript = lastResult?.[0]?.transcript?.toLowerCase()?.trim();
          handleVoiceCommand(transcript);
        }
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
      console.log('Speech recognition not supported');
    }
  }, []);

  // Handle voice commands
  const handleVoiceCommand = useCallback((transcript) => {
    console.log('Voice command received:', transcript);
    
    // Check for navigation commands
    for (const [command, path] of Object.entries(commandVocabulary)) {
      if (transcript?.includes(command)) {
        navigate(path);
        announceToScreenReader(`Navigating to ${command}`);
        return;
      }
    }

    // Check for "go to" commands
    if (transcript?.includes('go to')) {
      const destination = transcript?.replace('go to', '')?.trim();
      if (commandVocabulary?.[destination]) {
        navigate(commandVocabulary?.[destination]);
        announceToScreenReader(`Navigating to ${destination}`);
        return;
      }
    }

    // Announce unrecognized command
    announceToScreenReader('Voice command not recognized. Try saying "home", "text reader", "find objects", "check color", "read money", or "emergency"');
  }, [navigate]);

  // Screen reader announcements
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement?.setAttribute('aria-live', 'polite');
    announcement?.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body?.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body?.contains(announcement)) {
        document.body?.removeChild(announcement);
      }
    }, 2000);
  };

  // Start voice recognition
  const startListening = useCallback(() => {
    if (recognition && isSupported && !isListening) {
      try {
        recognition?.start();
        setVoiceCommandEnabled(true);
      } catch (error) {
        console.log('Failed to start speech recognition:', error);
      }
    }
  }, [recognition, isSupported, isListening]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition?.stop();
      setVoiceCommandEnabled(false);
      announceToScreenReader('Voice navigation deactivated');
    }
  }, [recognition, isListening]);

  // Toggle voice recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Announce page changes
  useEffect(() => {
    const currentPage = Object.keys(commandVocabulary)?.find(
      key => commandVocabulary?.[key] === location?.pathname
    );
    
    if (currentPage) {
      announceToScreenReader(`Current page: ${currentPage}`);
    }
  }, [location?.pathname]);

  // Auto-start voice recognition on mount
  useEffect(() => {
    if (isSupported && voiceCommandEnabled) {
      const timer = setTimeout(() => {
        startListening();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, voiceCommandEnabled, startListening]);

  const contextValue = {
    isListening,
    isSupported,
    voiceCommandEnabled,
    startListening,
    stopListening,
    toggleListening,
    announceToScreenReader,
    commandVocabulary
  };

  return (
    <VoiceNavigationContext.Provider value={contextValue}>
      {children}
      {/* Voice Command Status Indicator */}
      {isSupported && (
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-label={`Voice navigation ${isListening ? 'active' : 'inactive'}`}
        >
          Voice navigation {isListening ? 'listening' : 'stopped'}
        </div>
      )}
    </VoiceNavigationContext.Provider>
  );
};

export default VoiceNavigationProvider;