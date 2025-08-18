import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ColorHistoryPanel = ({ 
  isOpen, 
  onClose, 
  colorHistory = [],
  onClearHistory,
  onColorSelect,
  detailLevel = 'basic'
}) => {
  const [selectedColor, setSelectedColor] = useState(null);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp?.toLocaleDateString();
  };

  const getColorDescription = (color) => {
    if (detailLevel === 'technical') {
      return `${color?.name} (RGB: ${color?.rgb?.r}, ${color?.rgb?.g}, ${color?.rgb?.b}) - ${color?.brightness}, ${color?.saturation} - ${Math.round(color?.confidence)}% confidence`;
    } else if (detailLevel === 'detailed') {
      return `${color?.name} - ${color?.brightness} and ${color?.saturation}`;
    }
    return color?.name;
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    onColorSelect?.(color);
    
    // Announce color selection
    const announcement = `Selected ${getColorDescription(color)}`;
    const ariaLiveRegion = document.createElement('div');
    ariaLiveRegion?.setAttribute('aria-live', 'polite');
    ariaLiveRegion.className = 'sr-only';
    ariaLiveRegion.textContent = announcement;
    document.body?.appendChild(ariaLiveRegion);
    
    setTimeout(() => {
      document.body?.removeChild(ariaLiveRegion);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-1000 bg-black bg-opacity-50 flex items-end lg:items-center lg:justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="color-history-title"
    >
      <div 
        className="bg-background w-full lg:w-2/3 lg:max-w-4xl max-h-[80vh] rounded-t-lg lg:rounded-lg shadow-elevation-3 flex flex-col"
        onClick={(e) => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="color-history-title" className="text-xl font-semibold text-foreground">
            Color History
          </h2>
          <div className="flex items-center space-x-2">
            {colorHistory?.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                iconName="Trash2"
                iconPosition="left"
                aria-label="Clear all color history"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
              aria-label="Close color history panel"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {colorHistory?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Palette" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No colors detected yet</p>
              <p className="text-muted-foreground text-sm">
                Start scanning to build your color history
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {colorHistory?.map((color, index) => (
                <div
                  key={`${color?.timestamp}-${index}`}
                  className={`
                    flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-all duration-200
                    ${selectedColor === color 
                      ? 'border-primary bg-primary bg-opacity-10' :'border-border hover:border-primary hover:bg-muted'
                    }
                  `}
                  onClick={() => handleColorClick(color)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e?.key === 'Enter' || e?.key === ' ') {
                      e?.preventDefault();
                      handleColorClick(color);
                    }
                  }}
                  aria-label={`Color: ${getColorDescription(color)}, detected ${formatTimestamp(color?.timestamp)}`}
                >
                  {/* Color Swatch */}
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
                    style={{ backgroundColor: color?.hex }}
                    aria-hidden="true"
                  />

                  {/* Color Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground capitalize">
                      {color?.name}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {detailLevel === 'technical' && (
                          <>RGB: {color?.rgb?.r}, {color?.rgb?.g}, {color?.rgb?.b} • </>
                        )}
                        {detailLevel !== 'basic' && (
                          <>{color?.brightness}, {color?.saturation} • </>
                        )}
                        {Math.round(color?.confidence)}% confidence
                      </p>
                      <p className="flex items-center space-x-2">
                        <Icon name="Clock" size={12} />
                        <span>{formatTimestamp(color?.timestamp)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Hex Code */}
                  <div className="text-right">
                    <p className="text-sm font-mono text-muted-foreground">
                      {color?.hex?.toUpperCase()}
                    </p>
                    {detailLevel === 'technical' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        HSL: {color?.hsl?.[0]}°, {color?.hsl?.[1]}%, {color?.hsl?.[2]}%
                      </p>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {selectedColor === color && (
                    <Icon name="Check" size={20} className="text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {colorHistory?.length > 0 && (
          <div className="border-t border-border p-4">
            <p className="text-sm text-muted-foreground text-center">
              {colorHistory?.length} color{colorHistory?.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorHistoryPanel;