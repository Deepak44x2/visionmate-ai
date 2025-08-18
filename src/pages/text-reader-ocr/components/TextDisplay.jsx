import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TextDisplay = ({ 
  extractedText, 
  onBack, 
  voiceEnabled = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [utterance, setUtterance] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const textRef = useRef(null);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    // Auto-start reading when text is loaded
    if (extractedText && voiceEnabled) {
      setTimeout(() => {
        startReading();
      }, 1000);
    }

    return () => {
      if (utterance) {
        speechSynthesis.cancel();
      }
    };
  }, [extractedText]);

  const announceToUser = (message) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      // Cancel current speech before announcement
      speechSynthesis.cancel();
      const announcement = new SpeechSynthesisUtterance(message);
      announcement.rate = 1;
      announcement.volume = 0.8;
      speechSynthesis.speak(announcement);
    }
  };

  const startReading = () => {
    if (!extractedText || !voiceEnabled) return;

    speechSynthesis.cancel();

    const newUtterance = new SpeechSynthesisUtterance(extractedText);
    newUtterance.rate = playbackSpeed;
    newUtterance.volume = 0.9;
    newUtterance.pitch = 1;

    newUtterance.onstart = () => {
      setIsPlaying(true);
      setCurrentPosition(0);
    };

    newUtterance.onend = () => {
      setIsPlaying(false);
      setCurrentPosition(0);
      announceToUser('Reading complete');
    };

    newUtterance.onerror = () => {
      setIsPlaying(false);
      announceToUser('Reading error occurred');
    };

    newUtterance.onboundary = (event) => {
      setCurrentPosition(event?.charIndex);
    };

    setUtterance(newUtterance);
    speechSynthesis.speak(newUtterance);
  };

  const pauseReading = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPlaying(false);
      announceToUser('Reading paused');
    }
  };

  const resumeReading = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPlaying(true);
      announceToUser('Reading resumed');
    } else {
      startReading();
    }
  };

  const stopReading = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentPosition(0);
    announceToUser('Reading stopped');
  };

  const changeSpeed = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
    announceToUser(`Speed set to ${newSpeed}x`);
    
    if (isPlaying) {
      stopReading();
      setTimeout(() => startReading(), 500);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard?.writeText(extractedText);
      announceToUser('Text copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
      announceToUser('Failed to copy text');
    }
  };

  const saveToHistory = () => {
    const historyItem = {
      id: Date.now(),
      text: extractedText,
      timestamp: new Date()?.toISOString(),
      type: 'ocr'
    };

    const existingHistory = JSON.parse(localStorage.getItem('visionmate_text_history') || '[]');
    const updatedHistory = [historyItem, ...existingHistory]?.slice(0, 50); // Keep last 50 items
    
    localStorage.setItem('visionmate_text_history', JSON.stringify(updatedHistory));
    announceToUser('Text saved to history');
  };

  const getHighlightedText = () => {
    if (currentPosition === 0) return extractedText;
    
    const beforeCurrent = extractedText?.slice(0, currentPosition);
    const currentWord = extractedText?.slice(currentPosition, currentPosition + 50);
    const afterCurrent = extractedText?.slice(currentPosition + 50);
    
    return (
      <>
        {beforeCurrent}
        <span className="bg-primary/20 text-primary font-medium">
          {currentWord}
        </span>
        {afterCurrent}
      </>
    );
  };

  if (!extractedText) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No text to display</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
          className="text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowControls(!showControls)}
            aria-label={showControls ? 'Hide controls' : 'Show controls'}
          >
            <Icon name={showControls ? "EyeOff" : "Eye"} size={20} />
          </Button>
        </div>
      </div>
      {/* Text Display Area */}
      <div className="bg-card border rounded-lg p-6 mb-6 min-h-[400px]">
        <div 
          ref={textRef}
          className="text-lg leading-relaxed text-foreground whitespace-pre-wrap font-mono"
          style={{ fontSize: '18px', lineHeight: '1.8' }}
          role="article"
          aria-label="Extracted text content"
        >
          {getHighlightedText()}
        </div>
      </div>
      {/* Playback Controls */}
      {showControls && (
        <div className="bg-surface border rounded-lg p-6">
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={stopReading}
              disabled={!isPlaying && !speechSynthesis.paused}
              aria-label="Stop reading"
            >
              <Icon name="Square" size={20} />
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={isPlaying ? pauseReading : resumeReading}
              className="w-16 h-16 rounded-full"
              aria-label={isPlaying ? 'Pause reading' : 'Start reading'}
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={startReading}
              aria-label="Restart reading"
            >
              <Icon name="RotateCcw" size={20} />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Icon name="Gauge" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Speed:</span>
            {speedOptions?.map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "primary" : "outline"}
                size="sm"
                onClick={() => changeSpeed(speed)}
                className="min-w-[60px]"
              >
                {speed}x
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              iconName="Copy"
              iconPosition="left"
              className="flex-1"
            >
              Copy Text
            </Button>
            
            <Button
              variant="outline"
              onClick={saveToHistory}
              iconName="Save"
              iconPosition="left"
              className="flex-1"
            >
              Save to History
            </Button>
          </div>

          {/* Voice Commands Help */}
          {voiceEnabled && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="Volume2" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-2">Voice Commands:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-muted-foreground">
                    <p>"Play" or "Start reading"</p>
                    <p>"Pause" or "Stop reading"</p>
                    <p>"Read faster" or "Speed up"</p>
                    <p>"Read slower" or "Slow down"</p>
                    <p>"Repeat" or "Read again"</p>
                    <p>"Copy text"</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Reading Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPlaying ? 'Reading text' : 'Reading paused'}
      </div>
    </div>
  );
};

export default TextDisplay;