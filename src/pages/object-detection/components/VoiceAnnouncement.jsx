import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';

const VoiceAnnouncement = ({
  detectedObjects = [],
  announcementFrequency = 'immediate', // 'immediate', 'every3seconds', 'ondemand'
  isEnabled = true,
  detailedDescriptions = true,
  onAnnouncementComplete,
  className = ''
}) => {
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechSynthesisRef = useRef(null);
  const announcementQueueRef = useRef([]);
  const lastAnnouncementRef = useRef(0);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
      speechSynthesisRef.current = window.speechSynthesis;
    } else {
      setSpeechSupported(false);
      console.warn('Speech synthesis not supported in this browser');
    }
  }, []);

  // Generate announcement text
  const generateAnnouncement = (objects, detailed = true) => {
    if (!objects || objects?.length === 0) {
      return "No objects currently detected.";
    }

    if (objects?.length === 1) {
      const obj = objects?.[0];
      if (detailed) {
        return `${obj?.description || obj?.name} detected ${obj?.position} with ${Math.round(obj?.confidence * 100)} percent confidence.`;
      } else {
        return `${obj?.name} ${obj?.position}.`;
      }
    }

    // Multiple objects
    const objectList = objects?.map(obj => {
      if (detailed) {
        return `${obj?.description || obj?.name} ${obj?.position}`;
      } else {
        return `${obj?.name} ${obj?.position}`;
      }
    })?.join(', ');

    const prefix = detailed 
      ? `${objects?.length} objects detected: ` 
      : `I see ${objects?.length} objects: `;
    
    return prefix + objectList + '.';
  };

  // Speak announcement
  const speakAnnouncement = (text, priority = false) => {
    if (!speechSupported || !isEnabled || !text) return;

    // Cancel current speech if priority announcement
    if (priority && speechSynthesisRef?.current?.speaking) {
      speechSynthesisRef?.current?.cancel();
    }

    // Add to queue if already speaking and not priority
    if (speechSynthesisRef?.current?.speaking && !priority) {
      announcementQueueRef?.current?.push(text);
      return;
    }

    setIsAnnouncing(true);
    setCurrentAnnouncement(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsAnnouncing(true);
    };

    utterance.onend = () => {
      setIsAnnouncing(false);
      setCurrentAnnouncement('');
      onAnnouncementComplete?.(text);

      // Process queue
      if (announcementQueueRef?.current?.length > 0) {
        const nextAnnouncement = announcementQueueRef?.current?.shift();
        setTimeout(() => speakAnnouncement(nextAnnouncement), 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event?.error);
      setIsAnnouncing(false);
      setCurrentAnnouncement('');
    };

    speechSynthesisRef?.current?.speak(utterance);
  };

  // Handle object detection announcements
  useEffect(() => {
    if (!isEnabled || !speechSupported || detectedObjects?.length === 0) return;

    const now = Date.now();
    const timeSinceLastAnnouncement = now - lastAnnouncementRef?.current;

    // Determine if we should announce based on frequency
    let shouldAnnounce = false;

    switch (announcementFrequency) {
      case 'immediate':
        shouldAnnounce = true;
        break;
      case 'every3seconds':
        shouldAnnounce = timeSinceLastAnnouncement >= 3000;
        break;
      case 'ondemand':
        shouldAnnounce = false; // Only manual announcements
        break;
      default:
        shouldAnnounce = true;
    }

    if (shouldAnnounce) {
      const announcement = generateAnnouncement(detectedObjects, detailedDescriptions);
      speakAnnouncement(announcement);
      lastAnnouncementRef.current = now;
    }
  }, [detectedObjects, announcementFrequency, isEnabled, detailedDescriptions, speechSupported]);

  // Manual announcement trigger
  const announceCurrentObjects = (objects = detectedObjects) => {
    const announcement = generateAnnouncement(objects, detailedDescriptions);
    speakAnnouncement(announcement, true); // Priority announcement
  };

  // Stop current announcement
  const stopAnnouncement = () => {
    if (speechSynthesisRef?.current && speechSynthesisRef?.current?.speaking) {
      speechSynthesisRef?.current?.cancel();
      announcementQueueRef.current = []; // Clear queue
      setIsAnnouncing(false);
      setCurrentAnnouncement('');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef?.current && speechSynthesisRef?.current?.speaking) {
        speechSynthesisRef?.current?.cancel();
      }
    };
  }, []);

  // Expose methods to parent component
  useEffect(() => {
    // Attach methods to window for external access if needed
    window.visionMateVoice = {
      announce: announceCurrentObjects,
      stop: stopAnnouncement,
      isAnnouncing
    };

    return () => {
      delete window.visionMateVoice;
    };
  }, [isAnnouncing]);

  return (
    <div className={`${className}`}>
      {/* Voice Status Indicator */}
      {isAnnouncing && (
        <div className="fixed top-24 left-4 z-50 flex items-center space-x-2 bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg backdrop-blur-sm">
          <Icon name="Volume2" size={16} className="animate-pulse" />
          <span className="text-sm font-medium">Speaking...</span>
        </div>
      )}
      {/* Speech Not Supported Warning */}
      {!speechSupported && (
        <div className="fixed top-24 left-4 z-50 flex items-center space-x-2 bg-warning/90 text-warning-foreground px-3 py-2 rounded-lg backdrop-blur-sm">
          <Icon name="AlertTriangle" size={16} />
          <span className="text-sm font-medium">Voice not supported</span>
        </div>
      )}
      {/* Current Announcement Display (for debugging) */}
      {process.env?.NODE_ENV === 'development' && currentAnnouncement && (
        <div className="fixed bottom-4 left-4 max-w-sm bg-gray-900/90 text-white p-3 rounded-lg text-sm z-50">
          <div className="flex items-start space-x-2">
            <Icon name="MessageSquare" size={16} className="mt-0.5 flex-shrink-0" />
            <span>{currentAnnouncement}</span>
          </div>
        </div>
      )}
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Voice announcements {isEnabled ? 'enabled' : 'disabled'}. 
        Frequency set to {announcementFrequency}. 
        {detailedDescriptions ? 'Detailed descriptions enabled.' : 'Simple object names only.'}
        {isAnnouncing && `Currently announcing: ${currentAnnouncement}`}
      </div>
    </div>
  );
};

export default VoiceAnnouncement;