import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';


const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const detailLevelOptions = [
    { value: 'basic', label: 'Basic Names', description: 'Simple color names only' },
    { value: 'detailed', label: 'Detailed Description', description: 'Includes brightness and saturation' },
    { value: 'technical', label: 'Technical Details', description: 'RGB, HSL, and hex values' }
  ];

  const voiceSpeedOptions = [
    { value: 'slow', label: 'Slow' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' }
  ];

  const handleSettingChange = (key, value) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-1000 bg-black bg-opacity-50 flex items-end lg:items-center lg:justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-background w-full lg:w-1/2 lg:max-w-2xl max-h-[80vh] rounded-t-lg lg:rounded-lg shadow-elevation-3 flex flex-col"
        onClick={(e) => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="settings-title" className="text-xl font-semibold text-foreground">
            Color Detection Settings
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            aria-label="Close settings panel"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Color Description Detail Level */}
          <div>
            <Select
              label="Color Description Detail"
              description="Choose how detailed color descriptions should be"
              options={detailLevelOptions}
              value={settings?.detailLevel}
              onChange={(value) => handleSettingChange('detailLevel', value)}
            />
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Voice Settings</h3>
            
            <Select
              label="Voice Speed"
              description="Speed of color announcements"
              options={voiceSpeedOptions}
              value={settings?.voiceSpeed}
              onChange={(value) => handleSettingChange('voiceSpeed', value)}
            />

            <Checkbox
              label="Auto-announce colors"
              description="Automatically speak detected colors"
              checked={settings?.autoAnnounce}
              onChange={(e) => handleSettingChange('autoAnnounce', e?.target?.checked)}
            />

            <Checkbox
              label="Confidence announcements"
              description="Include confidence levels in voice feedback"
              checked={settings?.announceConfidence}
              onChange={(e) => handleSettingChange('announceConfidence', e?.target?.checked)}
            />
          </div>

          {/* Detection Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Detection Settings</h3>
            
            <Checkbox
              label="Haptic feedback"
              description="Vibrate on color detection (mobile devices)"
              checked={settings?.hapticFeedback}
              onChange={(e) => handleSettingChange('hapticFeedback', e?.target?.checked)}
            />

            <Checkbox
              label="Save color history"
              description="Keep a record of detected colors"
              checked={settings?.saveHistory}
              onChange={(e) => handleSettingChange('saveHistory', e?.target?.checked)}
            />

            <Checkbox
              label="Lighting warnings"
              description="Alert when lighting conditions may affect accuracy"
              checked={settings?.lightingWarnings}
              onChange={(e) => handleSettingChange('lightingWarnings', e?.target?.checked)}
            />
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Accessibility</h3>
            
            <Checkbox
              label="High contrast mode"
              description="Increase visual contrast for better visibility"
              checked={settings?.highContrast}
              onChange={(e) => handleSettingChange('highContrast', e?.target?.checked)}
            />

            <Checkbox
              label="Large text mode"
              description="Use larger text for better readability"
              checked={settings?.largeText}
              onChange={(e) => handleSettingChange('largeText', e?.target?.checked)}
            />

            <Checkbox
              label="Reduced motion"
              description="Minimize animations and transitions"
              checked={settings?.reducedMotion}
              onChange={(e) => handleSettingChange('reducedMotion', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const defaultSettings = {
                  detailLevel: 'basic',
                  voiceSpeed: 'normal',
                  autoAnnounce: true,
                  announceConfidence: false,
                  hapticFeedback: true,
                  saveHistory: true,
                  lightingWarnings: true,
                  highContrast: false,
                  largeText: false,
                  reducedMotion: false
                };
                onUpdateSettings(defaultSettings);
              }}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reset to Defaults
            </Button>
            
            <Button
              variant="default"
              onClick={onClose}
              iconName="Check"
              iconPosition="left"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;