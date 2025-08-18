import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const TextProcessor = ({ 
  imageFile, 
  onTextExtracted, 
  onError, 
  voiceEnabled = true 
}) => {
  const [processingStage, setProcessingStage] = useState('analyzing');
  const [progress, setProgress] = useState(0);

  const processingStages = {
    analyzing: { message: 'Analyzing image...', progress: 25 },
    extracting: { message: 'Extracting text...', progress: 65 },
    preparing: { message: 'Preparing audio...', progress: 90 },
    complete: { message: 'Processing complete!', progress: 100 }
  };

  const announceToUser = (message) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (imageFile) {
      processImage();
    }
  }, [imageFile]);

  const processImage = async () => {
    try {
      // Stage 1: Analyzing image
      setProcessingStage('analyzing');
      setProgress(25);
      announceToUser('Analyzing image');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Extracting text (Mock OCR processing)
      setProcessingStage('extracting');
      setProgress(65);
      announceToUser('Extracting text');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock text extraction result
      const mockExtractedText = `Welcome to VisionMate Text Reader

This is a demonstration of the OCR text extraction feature. The system can read text from images, documents, signs, and other visual content.

Key features include:
• Real-time text recognition
• Voice-guided navigation
• Multiple language support
• High accuracy text extraction
• Accessibility-first design

The extracted text can be read aloud, saved to history, or exported to clipboard for further use.

Date: ${new Date()?.toLocaleDateString()}
Time: ${new Date()?.toLocaleTimeString()}`;

      // Stage 3: Preparing audio
      setProcessingStage('preparing');
      setProgress(90);
      announceToUser('Preparing audio');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 4: Complete
      setProcessingStage('complete');
      setProgress(100);
      
      // Simulate text extraction completion
      setTimeout(() => {
        onTextExtracted(mockExtractedText);
        announceToUser('Text extraction complete. Beginning playback.');
      }, 500);

    } catch (error) {
      console.error('Text processing error:', error);
      const errorMessage = 'Failed to extract text from image. Please try with a clearer image.';
      announceToUser(errorMessage);
      onError(errorMessage);
    }
  };

  const currentStage = processingStages?.[processingStage];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Processing Animation */}
      <div className="flex flex-col items-center p-8 bg-card rounded-lg shadow-sm border">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon 
              name="FileText" 
              size={32} 
              className="text-primary animate-pulse" 
            />
          </div>
          {/* Scanning animation overlay */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        </div>

        {/* Processing Stage */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Processing Image
        </h3>
        
        <p className="text-muted-foreground text-center mb-6">
          {currentStage?.message}
        </p>

        {/* Progress Bar */}
        <div className="w-full mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="w-full space-y-2">
          {Object.entries(processingStages)?.map(([stage, data], index) => {
            const isActive = stage === processingStage;
            const isComplete = progress > data?.progress;
            
            return (
              <div 
                key={stage}
                className={`
                  flex items-center space-x-3 p-2 rounded-lg transition-colors
                  ${isActive ? 'bg-primary/5' : ''}
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${isComplete 
                    ? 'bg-success text-success-foreground' 
                    : isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {isComplete ? (
                    <Icon name="Check" size={14} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`
                  text-sm
                  ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}
                `}>
                  {data?.message}
                </span>
              </div>
            );
          })}
        </div>

        {/* Voice Feedback Indicator */}
        {voiceEnabled && (
          <div className="flex items-center space-x-2 mt-4 text-xs text-muted-foreground">
            <Icon name="Volume2" size={14} />
            <span>Voice guidance active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextProcessor;