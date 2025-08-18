import React from 'react';
import Button from './Button';
import Icon from '../AppIcon';
import { getCameraErrorInfo } from '../../utils/cameraPermissions';

const CameraErrorHandler = ({ 
  error, 
  onRetry, 
  onDismiss,
  showVoiceInstructions = true,
  className = ''
}) => {
  if (!error) return null;

  const errorInfo = getCameraErrorInfo(error);

  const handleBrowserInstructions = () => {
    const userAgent = navigator.userAgent?.toLowerCase();
    let instructionUrl = '';

    if (userAgent?.includes('chrome')) {
      instructionUrl = 'https://support.google.com/chrome/answer/2693767';
    } else if (userAgent?.includes('firefox')) {
      instructionUrl = 'https://support.mozilla.org/en-US/kb/how-manage-your-camera-and-microphone-permissions';
    } else if (userAgent?.includes('safari')) {
      instructionUrl = 'https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac';
    } else {
      instructionUrl = 'https://support.google.com/chrome/answer/2693767';
    }

    window.open(instructionUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 text-center ${className}`}>
      <div className="mb-4">
        <Icon 
          name="AlertCircle" 
          size={48} 
          className="mx-auto text-error mb-3" 
          aria-hidden="true" 
        />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {errorInfo?.title}
        </h3>
        <p className="text-muted-foreground mb-4">
          {errorInfo?.message}
        </p>
      </div>
      {/* Instructions */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <h4 className="font-medium text-card-foreground mb-2 flex items-center justify-center">
          <Icon name="Lightbulb" size={16} className="mr-2" aria-hidden="true" />
          How to Fix This
        </h4>
        <ol className="text-sm text-muted-foreground text-left space-y-1">
          {errorInfo?.instructions?.map((instruction, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                {index + 1}
              </span>
              {instruction}
            </li>
          ))}
        </ol>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {errorInfo?.canRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            iconName="RefreshCw"
            iconPosition="left"
            className="min-w-[120px]"
          >
            Try Again
          </Button>
        )}

        {errorInfo?.showBrowserHelp && (
          <Button
            variant="outline"
            onClick={handleBrowserInstructions}
            iconName="ExternalLink"
            iconPosition="right"
            className="min-w-[120px]"
          >
            Browser Help
          </Button>
        )}

        {onDismiss && (
          <Button
            variant="ghost"
            onClick={onDismiss}
            iconName="X"
            iconPosition="left"
            className="min-w-[120px]"
          >
            Close
          </Button>
        )}
      </div>
      {/* Voice Instructions */}
      {showVoiceInstructions && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-center text-sm text-primary">
            <Icon name="Volume2" size={16} className="mr-2" aria-hidden="true" />
            Voice guidance available - enable screen reader for audio instructions
          </div>
        </div>
      )}
      {/* Screen Reader Content */}
      <div className="sr-only" aria-live="polite">
        Camera error: {errorInfo?.title}. {errorInfo?.message} 
        Instructions: {errorInfo?.instructions?.join('. ')}.
        {errorInfo?.canRetry && ' Retry button is available.'}
        {errorInfo?.showBrowserHelp && ' Browser help link is available.'}
      </div>
    </div>
  );
};

export default CameraErrorHandler;