import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ControlPanel = ({
  isScanning,
  scanningMode,
  sensitivity,
  onToggleScanning,
  onChangeScanningMode,
  onChangeSensitivity,
  onShowHistory,
  onShowSettings,
  colorHistoryCount = 0
}) => {
  const scanningModeOptions = [
    { value: 'continuous', label: 'Continuous Scanning' },
    { value: 'tap', label: 'Tap to Detect' }
  ];

  const sensitivityOptions = [
    { value: 'low', label: 'Low Sensitivity' },
    { value: 'medium', label: 'Medium Sensitivity' },
    { value: 'high', label: 'High Sensitivity' }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      {/* Main Controls Row */}
      <div className="flex items-center justify-between space-x-4">
        {/* Scanning Toggle */}
        <Button
          variant={isScanning ? "destructive" : "default"}
          size="lg"
          onClick={onToggleScanning}
          iconName={isScanning ? "Square" : "Play"}
          iconPosition="left"
          className="flex-1 min-h-[60px]"
          aria-label={isScanning ? "Stop color scanning" : "Start color scanning"}
        >
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </Button>

        {/* History Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onShowHistory}
          iconName="History"
          iconPosition="left"
          className="min-h-[60px] min-w-[120px]"
          aria-label={`View color history - ${colorHistoryCount} colors detected`}
        >
          History
          {colorHistoryCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {colorHistoryCount}
            </span>
          )}
        </Button>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onShowSettings}
          iconName="Settings"
          className="min-h-[60px] min-w-[60px]"
          aria-label="Open color detection settings"
        />
      </div>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scanning Mode */}
        <Select
          label="Scanning Mode"
          options={scanningModeOptions}
          value={scanningMode}
          onChange={onChangeScanningMode}
          className="w-full"
          aria-label="Select color detection scanning mode"
        />

        {/* Sensitivity */}
        <Select
          label="Detection Sensitivity"
          options={sensitivityOptions}
          value={sensitivity}
          onChange={onChangeSensitivity}
          className="w-full"
          aria-label="Select color detection sensitivity level"
        />
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
          <span>
            {isScanning ? 'Active' : 'Inactive'} - {scanningMode === 'continuous' ? 'Continuous' : 'Tap Mode'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="Target" size={16} />
          <span>Sensitivity: {sensitivity}</span>
        </div>
      </div>

      {/* Voice Commands Hint */}
      <div className="bg-muted rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Mic" size={16} className="text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Voice Commands:</p>
            <p>"What color is this" • "Scan continuously" • "Stop scanning"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;