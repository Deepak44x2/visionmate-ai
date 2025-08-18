import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';

const VoiceCommandHandler = ({ 
  onCommand, 
  isActive = true, 
  currentMode = 'capture' // 'capture', 'processing', 'display'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [lastCommand, setLastCommand] = useState('');

  // Voice command vocabulary for text reader
  const commandVocabulary = {
    capture: {
      'capture': () => onCommand('capture'),
      'take photo': () => onCommand('capture'),
      'take picture': () => onCommand('capture'),
      'scan text': () => onCommand('capture'),
      'upload': () => onCommand('upload'),
      'upload image': () => onCommand('upload'),
      'select from gallery': () => onCommand('upload'),
      'choose file': () => onCommand('upload')
    },
    display: {
      'play': () => onCommand('play'),
      'start reading': () => onCommand('play'),
      'read text': () => onCommand('play'),
      'pause': () => onCommand('pause'),
      'stop': () => onCommand('stop'),
      'stop reading': () => onCommand('stop'),
      'repeat': () => onCommand('repeat'),
      'read again': () => onCommand('repeat'),
      'restart': () => onCommand('restart'),
      'faster': () => onCommand('speed_up'),
      'read faster': () => onCommand('speed_up'),
      'speed up': () => onCommand('speed_up'),
      'slower': () => onCommand('speed_down'),
      'read slower': () => onCommand('speed_down'),
      'slow down': () => onCommand('speed_down'),
      'copy': () => onCommand('copy'),
      'copy text': () => onCommand('copy'),
      'save': () => onCommand('save'),
      'save text': () => onCommand('save'),
      'back': () => onCommand('back'),
      'go back': () => onCommand('back')
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (!isActive) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 3;

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        // Restart recognition for continuous listening
        if (isActive) {
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
      
      // Start recognition
      try {
        recognitionInstance?.start();
      } catch (error) {
        console.log('Failed to start speech recognition:', error);
      }
    }

    return () => {
      if (recognition) {
        recognition?.stop();
      }
    };
  }, [isActive, currentMode]);

  const handleVoiceCommand = useCallback((transcript) => {
    console.log('Voice command received:', transcript);
    setLastCommand(transcript);
    
    const currentCommands = commandVocabulary?.[currentMode] || {};
    
    // Check for exact matches first
    if (currentCommands?.[transcript]) {
      currentCommands?.[transcript]();
      return;
    }

    // Check for partial matches
    for (const [command, action] of Object.entries(currentCommands)) {
      if (transcript?.includes(command)) {
        action();
        return;
      }
    }

    // Global commands available in all modes
    const globalCommands = {
      'help': () => onCommand('help'),
      'what can i say': () => onCommand('help'),
      'commands': () => onCommand('help'),
      'home': () => onCommand('home'),
      'go home': () => onCommand('home'),
      'dashboard': () => onCommand('home')
    };

    for (const [command, action] of Object.entries(globalCommands)) {
      if (transcript?.includes(command)) {
        action();
        return;
      }
    }

    // Command not recognized
    onCommand('unknown', transcript);
  }, [currentMode, onCommand]);

  const getAvailableCommands = () => {
    const currentCommands = commandVocabulary?.[currentMode] || {};
    return Object.keys(currentCommands);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50">
      {/* Voice Status Indicator */}
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg border
        ${isListening 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'bg-surface text-muted-foreground border-border'
        }
      `}>
        <Icon 
          name={isListening ? "Mic" : "MicOff"} 
          size={16} 
          className={isListening ? "animate-pulse" : ""} 
        />
        <span className="text-xs font-medium">
          {isListening ? 'Listening...' : 'Voice Off'}
        </span>
      </div>

      {/* Last Command Display */}
      {lastCommand && (
        <div className="mt-2 px-3 py-2 bg-muted text-muted-foreground text-xs rounded-lg max-w-48 truncate">
          "{lastCommand}"
        </div>
      )}

      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Voice recognition {isListening ? 'active' : 'inactive'}
        {lastCommand && `, last command: ${lastCommand}`}
      </div>
    </div>
  );
};

export default VoiceCommandHandler;