import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const ColorResultDisplay = ({ 
  currentColor, 
  detailLevel = 'basic',
  onSpeak,
  isVisible = true 
}) => {
  const [displayColor, setDisplayColor] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentColor) {
      setIsAnimating(true);
      setDisplayColor(currentColor);
      
      // Speak the color result
      if (onSpeak) {
        const description = getSpokenDescription(currentColor);
        onSpeak(description);
      }
      
      // Reset animation
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [currentColor, onSpeak]);

  const getSpokenDescription = (color) => {
    if (detailLevel === 'technical') {
      return `${color?.name}. RGB values: ${color?.rgb?.r}, ${color?.rgb?.g}, ${color?.rgb?.b}. ${color?.brightness} and ${color?.saturation}. Confidence: ${Math.round(color?.confidence)} percent.`;
    } else if (detailLevel === 'detailed') {
      return `${color?.name}. This color is ${color?.brightness} and ${color?.saturation}. Confidence: ${Math.round(color?.confidence)} percent.`;
    }
    return `${color?.name}`;
  };

  const getVisualDescription = (color) => {
    if (detailLevel === 'technical') {
      return (
        <div className="space-y-2">
          <p className="text-lg font-semibold capitalize">{color?.name}</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>RGB: {color?.rgb?.r}, {color?.rgb?.g}, {color?.rgb?.b}</p>
            <p>HSL: {color?.hsl?.[0]}°, {color?.hsl?.[1]}%, {color?.hsl?.[2]}%</p>
            <p>Hex: {color?.hex?.toUpperCase()}</p>
            <p>{color?.brightness}, {color?.saturation}</p>
            <p>Confidence: {Math.round(color?.confidence)}%</p>
          </div>
        </div>
      );
    } else if (detailLevel === 'detailed') {
      return (
        <div className="space-y-2">
          <p className="text-lg font-semibold capitalize">{color?.name}</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{color?.brightness} and {color?.saturation}</p>
            <p>Confidence: {Math.round(color?.confidence)}%</p>
            <p>Hex: {color?.hex?.toUpperCase()}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <p className="text-xl font-semibold capitalize">{color?.name}</p>
        <p className="text-sm text-muted-foreground">
          {Math.round(color?.confidence)}% confidence
        </p>
      </div>
    );
  };

  if (!isVisible || !displayColor) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 h-32 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Icon name="Target" size={32} className="mx-auto mb-2" />
          <p>Point camera at an object to detect its color</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-surface border border-border rounded-lg p-6 transition-all duration-300
        ${isAnimating ? 'scale-105 shadow-elevation-2' : 'scale-100 shadow-elevation-1'}
      `}
      role="region"
      aria-live="polite"
      aria-label="Color detection result"
    >
      <div className="flex items-center space-x-4">
        {/* Color Swatch */}
        <div 
          className="w-16 h-16 rounded-lg border-2 border-border flex-shrink-0 shadow-inner"
          style={{ backgroundColor: displayColor?.hex }}
          aria-label={`Color swatch showing ${displayColor?.name}`}
        />

        {/* Color Information */}
        <div className="flex-1">
          {getVisualDescription(displayColor)}
        </div>

        {/* Confidence Indicator */}
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <Icon 
              name={displayColor?.confidence > 80 ? "CheckCircle" : displayColor?.confidence > 60 ? "AlertCircle" : "XCircle"} 
              size={20} 
              className={
                displayColor?.confidence > 80 ? "text-success" : 
                displayColor?.confidence > 60 ? "text-warning" : "text-error"
              }
            />
            <span className="text-sm font-medium">
              {Math.round(displayColor?.confidence)}%
            </span>
          </div>
          
          {/* Timestamp */}
          <p className="text-xs text-muted-foreground">
            {displayColor?.timestamp?.toLocaleTimeString()}
          </p>
        </div>
      </div>
      {/* Additional Info for Low Confidence */}
      {displayColor?.confidence < 70 && (
        <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div className="text-sm text-warning">
              <p className="font-medium">Low confidence detection</p>
              <p>Try improving lighting or moving closer to the object</p>
            </div>
          </div>
        </div>
      )}
      {/* Screen Reader Description */}
      <div className="sr-only" aria-live="polite">
        Color detected: {getSpokenDescription(displayColor)}
      </div>
    </div>
  );
};

export default ColorResultDisplay;