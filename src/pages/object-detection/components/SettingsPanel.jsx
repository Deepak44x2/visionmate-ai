import React from 'react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const SettingsPanel = ({
  isVisible = false,
  onToggleVisibility,
  settings = {},
  onSettingsChange,
  className = ''
}) => {
  const {
    detailedDescriptions = true,
    announcementFrequency = 'immediate',
    voiceEnabled = true,
    batteryOptimization = true,
    confidenceThreshold = 0.7,
    spatialAudio = false,
    autoCapture = false,
    nightMode = false
  } = settings;

  // Frequency options
  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Announce objects as soon as detected' },
    { value: 'every3seconds', label: 'Every 3 Seconds', description: 'Announce detected objects every 3 seconds' },
    { value: 'ondemand', label: 'On Demand Only', description: 'Only announce when requested manually' }
  ];

  // Confidence threshold options
  const confidenceOptions = [
    { value: 0.5, label: 'Low (50%)', description: 'Detect more objects with lower accuracy' },
    { value: 0.7, label: 'Medium (70%)', description: 'Balanced detection accuracy' },
    { value: 0.9, label: 'High (90%)', description: 'Only highly confident detections' }
  ];

  const handleSettingChange = (key, value) => {
    onSettingsChange?.({
      ...settings,
      [key]: value
    });
  };

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-surface border-t border-border rounded-t-xl shadow-elevation-3 max-h-[80vh] flex flex-col">
          {/* Handle Bar */}
          <div className="flex items-center justify-center py-3 border-b border-border">
            <button
              onClick={onToggleVisibility}
              className="w-12 h-1 bg-muted-foreground/30 rounded-full focus:outline-none focus:bg-muted-foreground/50"
              aria-label={isVisible ? "Hide settings panel" : "Show settings panel"}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Detection Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              iconName="X"
              aria-label="Close settings"
            />
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Voice Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Voice Announcements</h4>
              
              <Checkbox
                label="Enable voice feedback"
                description="Turn on/off audio announcements for detected objects"
                checked={voiceEnabled}
                onChange={(e) => handleSettingChange('voiceEnabled', e?.target?.checked)}
              />

              <Checkbox
                label="Detailed descriptions"
                description="Include object details and confidence levels in announcements"
                checked={detailedDescriptions}
                onChange={(e) => handleSettingChange('detailedDescriptions', e?.target?.checked)}
                disabled={!voiceEnabled}
              />

              <Select
                label="Announcement frequency"
                description="How often to announce detected objects"
                options={frequencyOptions}
                value={announcementFrequency}
                onChange={(value) => handleSettingChange('announcementFrequency', value)}
                disabled={!voiceEnabled}
              />
            </div>

            {/* Detection Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Detection Accuracy</h4>
              
              <Select
                label="Confidence threshold"
                description="Minimum confidence level for object detection"
                options={confidenceOptions}
                value={confidenceThreshold}
                onChange={(value) => handleSettingChange('confidenceThreshold', value)}
              />
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Advanced Options</h4>
              
              <Checkbox
                label="Battery optimization"
                description="Automatically pause detection during inactivity to save battery"
                checked={batteryOptimization}
                onChange={(e) => handleSettingChange('batteryOptimization', e?.target?.checked)}
              />

              <Checkbox
                label="Spatial audio cues"
                description="Use stereo audio to indicate object positions (experimental)"
                checked={spatialAudio}
                onChange={(e) => handleSettingChange('spatialAudio', e?.target?.checked)}
                disabled={!voiceEnabled}
              />

              <Checkbox
                label="Auto-capture frames"
                description="Automatically save frames when objects are detected"
                checked={autoCapture}
                onChange={(e) => handleSettingChange('autoCapture', e?.target?.checked)}
              />

              <Checkbox
                label="Night mode detection"
                description="Enhanced detection for low-light conditions"
                checked={nightMode}
                onChange={(e) => handleSettingChange('nightMode', e?.target?.checked)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Modal */}
      {isVisible && (
        <div className="hidden lg:block fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-surface rounded-xl shadow-elevation-3 w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">Detection Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVisibility}
                  iconName="X"
                  aria-label="Close settings"
                />
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Voice Settings Column */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-foreground">Voice Announcements</h4>
                    
                    <Checkbox
                      label="Enable voice feedback"
                      description="Turn on/off audio announcements for detected objects"
                      checked={voiceEnabled}
                      onChange={(e) => handleSettingChange('voiceEnabled', e?.target?.checked)}
                    />

                    <Checkbox
                      label="Detailed descriptions"
                      description="Include object details and confidence levels in announcements"
                      checked={detailedDescriptions}
                      onChange={(e) => handleSettingChange('detailedDescriptions', e?.target?.checked)}
                      disabled={!voiceEnabled}
                    />

                    <Select
                      label="Announcement frequency"
                      description="How often to announce detected objects"
                      options={frequencyOptions}
                      value={announcementFrequency}
                      onChange={(value) => handleSettingChange('announcementFrequency', value)}
                      disabled={!voiceEnabled}
                    />

                    <Checkbox
                      label="Spatial audio cues"
                      description="Use stereo audio to indicate object positions (experimental)"
                      checked={spatialAudio}
                      onChange={(e) => handleSettingChange('spatialAudio', e?.target?.checked)}
                      disabled={!voiceEnabled}
                    />
                  </div>

                  {/* Detection & Advanced Settings Column */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-foreground">Detection & Advanced</h4>
                    
                    <Select
                      label="Confidence threshold"
                      description="Minimum confidence level for object detection"
                      options={confidenceOptions}
                      value={confidenceThreshold}
                      onChange={(value) => handleSettingChange('confidenceThreshold', value)}
                    />

                    <Checkbox
                      label="Battery optimization"
                      description="Automatically pause detection during inactivity to save battery"
                      checked={batteryOptimization}
                      onChange={(e) => handleSettingChange('batteryOptimization', e?.target?.checked)}
                    />

                    <Checkbox
                      label="Auto-capture frames"
                      description="Automatically save frames when objects are detected"
                      checked={autoCapture}
                      onChange={(e) => handleSettingChange('autoCapture', e?.target?.checked)}
                    />

                    <Checkbox
                      label="Night mode detection"
                      description="Enhanced detection for low-light conditions"
                      checked={nightMode}
                      onChange={(e) => handleSettingChange('nightMode', e?.target?.checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={onToggleVisibility}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Settings Toggle Button */}
      {!isVisible && (
        <button
          onClick={onToggleVisibility}
          className="fixed top-32 right-4 lg:right-20 w-12 h-12 bg-secondary text-secondary-foreground rounded-full shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring z-30"
          aria-label="Open detection settings"
        >
          <Icon name="Settings" size={20} className="mx-auto" />
        </button>
      )}
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Settings panel {isVisible ? 'open' : 'closed'}. 
        Voice feedback {voiceEnabled ? 'enabled' : 'disabled'}. 
        Announcement frequency set to {announcementFrequency}.
        Confidence threshold at {Math.round(confidenceThreshold * 100)} percent.
      </div>
    </>
  );
};

export default SettingsPanel;