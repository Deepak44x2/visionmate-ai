import React from 'react';
import Button from '../../../components/ui/Button';


const ControlPanel = ({
  isDetecting,
  onToggleDetection,
  onCaptureFrame,
  onAdjustSensitivity,
  detectionSensitivity = 0.7,
  onDescribeSurroundings,
  isDescribing = false,
  className = ''
}) => {
  const sensitivityPercentage = Math.round(detectionSensitivity * 100);

  const handleSensitivityChange = (direction) => {
    const step = 0.1;
    const newValue = direction === 'increase' 
      ? Math.min(1.0, detectionSensitivity + step)
      : Math.max(0.1, detectionSensitivity - step);
    
    onAdjustSensitivity?.(newValue);
  };

  return (
    <div className={`bg-surface/95 backdrop-blur-sm border-t border-border p-4 ${className}`}>
      {/* Main Controls Row */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {/* Toggle Detection Button */}
        <Button
          variant={isDetecting ? "destructive" : "default"}
          size="lg"
          onClick={onToggleDetection}
          iconName={isDetecting ? "Pause" : "Play"}
          iconPosition="left"
          className="min-w-[140px]"
          aria-label={isDetecting ? "Pause object detection" : "Start object detection"}
        >
          {isDetecting ? 'Pause' : 'Start'} Detection
        </Button>

        {/* Describe Surroundings Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onDescribeSurroundings}
          loading={isDescribing}
          iconName="MessageSquare"
          iconPosition="left"
          className="min-w-[140px]"
          aria-label="Describe current surroundings with voice feedback"
        >
          {isDescribing ? 'Describing...' : 'What Do You See?'}
        </Button>

        {/* Capture Frame Button */}
        <Button
          variant="secondary"
          size="lg"
          onClick={onCaptureFrame}
          iconName="Camera"
          iconPosition="left"
          className="min-w-[120px]"
          aria-label="Capture current camera frame with detected objects"
        >
          Capture
        </Button>
      </div>

      {/* Sensitivity Controls */}
      <div className="flex items-center justify-center space-x-4">
        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
          Sensitivity:
        </span>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSensitivityChange('decrease')}
            iconName="Minus"
            className="w-10 h-10"
            aria-label="Decrease detection sensitivity"
            disabled={detectionSensitivity <= 0.1}
          />
          
          <div className="flex items-center space-x-2 min-w-[100px] justify-center">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${sensitivityPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground min-w-[35px]">
              {sensitivityPercentage}%
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSensitivityChange('increase')}
            iconName="Plus"
            className="w-10 h-10"
            aria-label="Increase detection sensitivity"
            disabled={detectionSensitivity >= 1.0}
          />
        </div>
      </div>

      {/* Voice Commands Help */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Voice commands: "What do you see", "Pause detection", "Start detection", "Capture frame"
        </p>
      </div>

      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Detection is {isDetecting ? 'active' : 'paused'}. 
        Sensitivity set to {sensitivityPercentage} percent.
        {isDescribing && 'Currently describing surroundings.'}
      </div>
    </div>
  );
};

export default ControlPanel;