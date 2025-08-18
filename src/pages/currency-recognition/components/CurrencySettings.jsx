import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CurrencySettings = ({ 
  settings, 
  onSettingsChange, 
  onClose 
}) => {
  const [localSettings, setLocalSettings] = useState({
    preferredCurrency: 'USD',
    sensitivity: 'medium',
    voiceAnnouncements: true,
    authenticityCheck: true,
    autoSave: true,
    language: 'en-US',
    ...settings
  });

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)', description: 'United States Dollar' },
    { value: 'EUR', label: 'Euro (EUR)', description: 'European Union Euro' },
    { value: 'GBP', label: 'British Pound (GBP)', description: 'British Pound Sterling' },
    { value: 'JPY', label: 'Japanese Yen (JPY)', description: 'Japanese Yen' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)', description: 'Canadian Dollar' },
    { value: 'AUD', label: 'Australian Dollar (AUD)', description: 'Australian Dollar' },
    { value: 'CHF', label: 'Swiss Franc (CHF)', description: 'Swiss Franc' },
    { value: 'CNY', label: 'Chinese Yuan (CNY)', description: 'Chinese Yuan' }
  ];

  const sensitivityOptions = [
    { value: 'low', label: 'Low Sensitivity', description: 'More tolerant of poor lighting' },
    { value: 'medium', label: 'Medium Sensitivity', description: 'Balanced detection (recommended)' },
    { value: 'high', label: 'High Sensitivity', description: 'Requires optimal conditions' }
  ];

  const languageOptions = [
    { value: 'en-US', label: 'English (US)', description: 'American English' },
    { value: 'en-GB', label: 'English (UK)', description: 'British English' },
    { value: 'es-ES', label: 'Spanish', description: 'Español' },
    { value: 'fr-FR', label: 'French', description: 'Français' },
    { value: 'de-DE', label: 'German', description: 'Deutsch' },
    { value: 'it-IT', label: 'Italian', description: 'Italiano' },
    { value: 'pt-PT', label: 'Portuguese', description: 'Português' },
    { value: 'ja-JP', label: 'Japanese', description: '日本語' }
  ];

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    announceToUser('Settings saved successfully');
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      preferredCurrency: 'USD',
      sensitivity: 'medium',
      voiceAnnouncements: true,
      authenticityCheck: true,
      autoSave: true,
      language: 'en-US'
    };
    setLocalSettings(defaultSettings);
    announceToUser('Settings reset to defaults');
  };

  const announceToUser = (message) => {
    if (localSettings?.voiceAnnouncements) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Test voice announcement
  const testVoiceAnnouncement = () => {
    announceToUser(`Voice announcement test. Current language is ${languageOptions?.find(lang => lang?.value === localSettings?.language)?.label || 'English'}.`);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Currency Settings</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          iconName="X"
          aria-label="Close settings"
        />
      </div>
      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Preferred Currency */}
        <div>
          <Select
            label="Preferred Currency"
            description="Default currency for detection priority"
            options={currencyOptions}
            value={localSettings?.preferredCurrency}
            onChange={(value) => handleSettingChange('preferredCurrency', value)}
            searchable
          />
        </div>

        {/* Detection Sensitivity */}
        <div>
          <Select
            label="Detection Sensitivity"
            description="Adjust for different lighting conditions"
            options={sensitivityOptions}
            value={localSettings?.sensitivity}
            onChange={(value) => handleSettingChange('sensitivity', value)}
          />
        </div>

        {/* Voice Language */}
        <div>
          <Select
            label="Voice Language"
            description="Language for voice announcements"
            options={languageOptions}
            value={localSettings?.language}
            onChange={(value) => handleSettingChange('language', value)}
            searchable
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={testVoiceAnnouncement}
            iconName="Volume2"
            iconPosition="left"
            className="mt-2"
          >
            Test Voice
          </Button>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Features</h3>
          
          <Checkbox
            label="Voice Announcements"
            description="Enable audio feedback for scan results"
            checked={localSettings?.voiceAnnouncements}
            onChange={(e) => handleSettingChange('voiceAnnouncements', e?.target?.checked)}
          />
          
          <Checkbox
            label="Authenticity Check"
            description="Perform basic counterfeit detection"
            checked={localSettings?.authenticityCheck}
            onChange={(e) => handleSettingChange('authenticityCheck', e?.target?.checked)}
          />
          
          <Checkbox
            label="Auto-Save Results"
            description="Automatically save scan results to history"
            checked={localSettings?.autoSave}
            onChange={(e) => handleSettingChange('autoSave', e?.target?.checked)}
          />
        </div>

        {/* Sensitivity Info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Detection Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use good lighting for best results</li>
                <li>• Place bills flat against a contrasting background</li>
                <li>• Ensure the entire bill is visible in frame</li>
                <li>• Clean camera lens for clearer images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-3 p-4 border-t border-border">
        <Button
          variant="outline"
          size="default"
          onClick={handleReset}
          iconName="RotateCcw"
          iconPosition="left"
          className="flex-1"
        >
          Reset
        </Button>
        
        <Button
          variant="default"
          size="default"
          onClick={handleSave}
          iconName="Save"
          iconPosition="left"
          className="flex-1"
        >
          Save Settings
        </Button>
      </div>
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite">
        Currency recognition settings. Current preferred currency: {localSettings?.preferredCurrency}. 
        Detection sensitivity: {localSettings?.sensitivity}. 
        Voice announcements: {localSettings?.voiceAnnouncements ? 'enabled' : 'disabled'}.
      </div>
    </div>
  );
};

export default CurrencySettings;