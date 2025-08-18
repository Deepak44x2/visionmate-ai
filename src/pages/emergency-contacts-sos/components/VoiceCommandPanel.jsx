import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const VoiceCommandPanel = ({ 
  contacts, 
  onVoiceCommand, 
  onVoiceAnnounce,
  isListening = false,
  onToggleListening 
}) => {
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 3;

      recognitionInstance.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.toLowerCase()?.trim();
        setLastCommand(transcript);
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.log('Speech recognition error:', event?.error);
        if (onVoiceAnnounce) {
          onVoiceAnnounce('Voice command not recognized. Please try again.');
        }
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleVoiceCommand = (transcript) => {
    console.log('Voice command received:', transcript);
    
    // Emergency activation commands
    if (transcript?.includes('emergency') || transcript?.includes('sos') || transcript?.includes('help')) {
      if (onVoiceCommand) {
        onVoiceCommand('emergency');
      }
      if (onVoiceAnnounce) {
        onVoiceAnnounce('Emergency SOS activated');
      }
      return;
    }

    // Call contact commands
    if (transcript?.includes('call')) {
      const contactName = transcript?.replace('call', '')?.trim();
      const matchedContact = findContactByName(contactName);
      
      if (matchedContact) {
        if (onVoiceCommand) {
          onVoiceCommand('call', matchedContact);
        }
        if (onVoiceAnnounce) {
          onVoiceAnnounce(`Calling ${matchedContact?.name}`);
        }
      } else {
        if (onVoiceAnnounce) {
          onVoiceAnnounce(`Contact ${contactName} not found`);
        }
      }
      return;
    }

    // Find contact commands
    if (transcript?.includes('find') && transcript?.includes('contact')) {
      const contactName = transcript?.replace('find', '')?.replace('contact', '')?.trim();
      const matchedContact = findContactByName(contactName);
      
      if (matchedContact) {
        if (onVoiceAnnounce) {
          onVoiceAnnounce(`Found contact: ${matchedContact?.name}, ${matchedContact?.relationship}, phone number ${matchedContact?.phone}`);
        }
      } else {
        if (onVoiceAnnounce) {
          onVoiceAnnounce(`Contact ${contactName} not found`);
        }
      }
      return;
    }

    // List contacts command
    if (transcript?.includes('list contacts') || transcript?.includes('show contacts')) {
      if (contacts?.length > 0) {
        const contactList = contacts?.map(c => `${c?.name}, ${c?.relationship}`)?.join(', ');
        if (onVoiceAnnounce) {
          onVoiceAnnounce(`Your emergency contacts are: ${contactList}`);
        }
      } else {
        if (onVoiceAnnounce) {
          onVoiceAnnounce('No emergency contacts found');
        }
      }
      return;
    }

    // Unrecognized command
    if (onVoiceAnnounce) {
      onVoiceAnnounce('Command not recognized. Try saying "call [name]", "emergency", or "list contacts"');
    }
  };

  const findContactByName = (searchName) => {
    return contacts?.find(contact => 
      contact?.name?.toLowerCase()?.includes(searchName) ||
      contact?.relationship?.toLowerCase()?.includes(searchName)
    );
  };

  const startListening = () => {
    if (recognition && isSupported) {
      try {
        recognition?.start();
        if (onToggleListening) {
          onToggleListening(true);
        }
        if (onVoiceAnnounce) {
          onVoiceAnnounce('Voice commands activated. Say "call [name]" or "emergency"');
        }
      } catch (error) {
        console.log('Failed to start speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition?.stop();
      if (onToggleListening) {
        onToggleListening(false);
      }
      if (onVoiceAnnounce) {
        onVoiceAnnounce('Voice commands deactivated');
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Icon name="MicOff" size={20} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Voice commands not supported in this browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon 
            name={isListening ? "Mic" : "MicOff"} 
            size={20} 
            className={isListening ? "text-success" : "text-muted-foreground"} 
          />
          <h3 className="text-lg font-semibold text-foreground">
            Voice Commands
          </h3>
        </div>
        
        <Button
          variant={isListening ? "success" : "outline"}
          size="sm"
          onClick={toggleListening}
          iconName={isListening ? "MicOff" : "Mic"}
          iconPosition="left"
          iconSize={16}
          className="min-w-[120px]"
          aria-label={isListening ? "Stop voice commands" : "Start voice commands"}
        >
          {isListening ? 'Stop' : 'Start'} Voice
        </Button>
      </div>

      {/* Status */}
      <div className="mb-4">
        <p className={`text-sm ${isListening ? 'text-success' : 'text-muted-foreground'}`}>
          {isListening ? 'Listening for voice commands...' : 'Voice commands inactive'}
        </p>
        {lastCommand && (
          <p className="text-xs text-muted-foreground mt-1">
            Last command: "{lastCommand}"
          </p>
        )}
      </div>

      {/* Available Commands */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Available Commands:</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>• "Emergency" or "SOS" - Activate emergency alert</p>
          <p>• "Call [name]" - Call a specific contact</p>
          <p>• "List contacts" - Hear all emergency contacts</p>
          <p>• "Find contact [name]" - Get contact information</p>
        </div>
      </div>

      {/* Quick Test Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={startListening}
        iconName="MessageSquare"
        iconPosition="left"
        iconSize={16}
        className="w-full mt-4"
        disabled={isListening}
        aria-label="Test voice command"
      >
        Test Voice Command
      </Button>
    </div>
  );
};

export default VoiceCommandPanel;