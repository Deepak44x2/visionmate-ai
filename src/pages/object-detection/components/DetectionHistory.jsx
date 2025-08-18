import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DetectionHistory = ({ 
  detectionHistory = [], 
  isVisible = false, 
  onToggleVisibility,
  onClearHistory,
  onPlayAnnouncement,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get confidence level description
  const getConfidenceDescription = (confidence) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Medium';
    if (confidence >= 0.6) return 'Low';
    return 'Very Low';
  };

  // Handle item selection and voice announcement
  const handleItemSelect = (item, index) => {
    setSelectedItem(index);
    const announcement = `${item?.name} detected ${item?.position} with ${getConfidenceDescription(item?.confidence)} confidence at ${formatTime(item?.timestamp)}`;
    onPlayAnnouncement?.(announcement);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, item, index) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleItemSelect(item, index);
    }
  };

  return (
    <>
      {/* Mobile Slide-up Panel */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-30 transform transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-surface border-t border-border rounded-t-xl shadow-elevation-2 max-h-[70vh] flex flex-col">
          {/* Handle Bar */}
          <div className="flex items-center justify-center py-3 border-b border-border">
            <button
              onClick={onToggleVisibility}
              className="w-12 h-1 bg-muted-foreground/30 rounded-full focus:outline-none focus:bg-muted-foreground/50"
              aria-label={isVisible ? "Hide detection history" : "Show detection history"}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Detection History</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {detectionHistory?.length} items
              </span>
              {detectionHistory?.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearHistory}
                  iconName="Trash2"
                  className="text-destructive hover:text-destructive"
                  aria-label="Clear all detection history"
                />
              )}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto">
            {detectionHistory?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon name="Search" size={48} className="text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No objects detected yet</p>
                <p className="text-sm text-muted-foreground/75 mt-1">
                  Start detection to see identified objects here
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {detectionHistory?.map((item, index) => (
                  <div
                    key={`${item?.timestamp}-${index}`}
                    onClick={() => handleItemSelect(item, index)}
                    onKeyDown={(e) => handleKeyDown(e, item, index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                      selectedItem === index
                        ? 'bg-primary/10 border-primary/30' :'bg-card border-border hover:bg-muted/50'
                    }`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${item?.name} detected ${item?.position} at ${formatTime(item?.timestamp)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground capitalize">
                            {item?.name}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            {item?.position}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item?.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatTime(item?.timestamp)}</span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Target" size={12} />
                            <span>{getConfidenceDescription(item?.confidence)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed right-0 top-20 bottom-0 w-80 bg-surface border-l border-border z-20 transform transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">Detection History</h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">
              {detectionHistory?.length} items
            </span>
            {detectionHistory?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                iconName="Trash2"
                className="text-destructive hover:text-destructive"
                aria-label="Clear all detection history"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              iconName="X"
              aria-label="Close detection history"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {detectionHistory?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Icon name="Search" size={64} className="text-muted-foreground/50 mb-6" />
              <p className="text-lg text-muted-foreground mb-2">No objects detected yet</p>
              <p className="text-sm text-muted-foreground/75">
                Start detection to see identified objects here
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {detectionHistory?.map((item, index) => (
                <div
                  key={`${item?.timestamp}-${index}`}
                  onClick={() => handleItemSelect(item, index)}
                  onKeyDown={(e) => handleKeyDown(e, item, index)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    selectedItem === index
                      ? 'bg-primary/10 border-primary/30' :'bg-card border-border hover:bg-muted/50'
                  }`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${item?.name} detected ${item?.position} at ${formatTime(item?.timestamp)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-foreground capitalize">
                          {item?.name}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {item?.position}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item?.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatTime(item?.timestamp)}</span>
                        <span className="flex items-center space-x-1">
                          <Icon name="Target" size={12} />
                          <span>{getConfidenceDescription(item?.confidence)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Toggle Button for Desktop */}
      {!isVisible && (
        <button
          onClick={onToggleVisibility}
          className="hidden lg:block fixed right-4 top-32 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring z-30"
          aria-label="Show detection history"
        >
          <Icon name="History" size={20} className="mx-auto" />
        </button>
      )}
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Detection history {isVisible ? 'visible' : 'hidden'}. 
        {detectionHistory?.length} objects in history.
        {selectedItem !== null && `Selected item ${selectedItem + 1} of ${detectionHistory?.length}.`}
      </div>
    </>
  );
};

export default DetectionHistory;