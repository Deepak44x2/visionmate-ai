import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ScanHistory = ({ 
  history = [], 
  onClearHistory, 
  onSelectScan,
  voiceNavigation = true 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    return symbols?.[currency] || currency;
  };

  const announceToUser = (message) => {
    if (voiceNavigation) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const readLastScans = (count = 5) => {
    const recentScans = history?.slice(0, count);
    if (recentScans?.length === 0) {
      announceToUser('No recent scans found.');
      return;
    }

    const scanSummary = recentScans?.map((scan, index) => 
      `${index + 1}. ${getCurrencySymbol(scan?.currency)}${scan?.denomination} ${scan?.currency} scanned ${getRelativeTime(scan?.timestamp)}`
    )?.join('. ');

    announceToUser(`Last ${recentScans?.length} scans: ${scanSummary}`);
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const scanTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - scanTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getTotalValue = () => {
    return history?.reduce((total, scan) => {
      // Convert to USD for calculation (simplified)
      const usdValue = scan?.currency === 'USD' ? scan?.denomination : 
                      scan?.currency === 'EUR' ? scan?.denomination * 1.1 :
                      scan?.currency === 'GBP' ? scan?.denomination * 1.25 : scan?.denomination;
      return total + parseFloat(usdValue);
    }, 0);
  };

  const handleKeyNavigation = (e) => {
    if (!voiceNavigation || history?.length === 0) return;

    switch (e?.key) {
      case 'ArrowUp':
        e?.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        e?.preventDefault();
        setSelectedIndex(prev => Math.min(history?.length - 1, prev + 1));
        break;
      case 'Enter':
        e?.preventDefault();
        if (history?.[selectedIndex]) {
          onSelectScan && onSelectScan(history?.[selectedIndex]);
          announceToUser(`Selected ${getCurrencySymbol(history?.[selectedIndex]?.currency)}${history?.[selectedIndex]?.denomination} scan`);
        }
        break;
      case 'r':
        e?.preventDefault();
        readLastScans();
        break;
    }
  };

  if (history?.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Icon name="History" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Scan History</h3>
          <p className="text-muted-foreground">
            Your currency scans will appear here for easy reference.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-md mx-auto"
      onKeyDown={handleKeyNavigation}
      tabIndex={0}
      role="region"
      aria-label="Currency scan history"
    >
      {/* Header with Summary */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Scan History</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => readLastScans()}
            iconName="Volume2"
            iconPosition="left"
            aria-label="Read last 5 scans aloud"
          >
            Read Aloud
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{history?.length}</p>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">${getTotalValue()?.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Est. Value (USD)</p>
          </div>
        </div>
      </div>
      {/* History List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          {history?.map((scan, index) => (
            <div
              key={scan?.id || index}
              className={`
                p-4 border-b border-border last:border-b-0 cursor-pointer
                transition-colors duration-200 hover:bg-muted/50
                ${selectedIndex === index ? 'bg-primary/10 border-l-4 border-l-primary' : ''}
              `}
              onClick={() => {
                setSelectedIndex(index);
                onSelectScan && onSelectScan(scan);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Currency scan: ${getCurrencySymbol(scan?.currency)}${scan?.denomination} ${scan?.currency}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="Banknote" size={20} className="text-primary" />
                  </div>
                  
                  <div>
                    <p className="font-semibold text-foreground">
                      {getCurrencySymbol(scan?.currency)}{scan?.denomination}
                    </p>
                    <p className="text-sm text-muted-foreground">{scan?.currency}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Icon 
                      name={scan?.confidence >= 90 ? "CheckCircle" : scan?.confidence >= 70 ? "AlertCircle" : "XCircle"} 
                      size={16} 
                      className={
                        scan?.confidence >= 90 ? "text-success" :
                        scan?.confidence >= 70 ? "text-warning" : "text-error"
                      } 
                    />
                    <span className="text-sm font-medium">{scan?.confidence}%</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {getRelativeTime(scan?.timestamp)}
                  </p>
                </div>
              </div>
              
              {/* Authenticity Indicator */}
              {scan?.isCounterfeit && (
                <div className="mt-2 flex items-center space-x-1">
                  <Icon name="AlertTriangle" size={14} className="text-error" />
                  <span className="text-xs text-error font-medium">Potential Counterfeit</span>
                </div>
              )}
              
              {scan?.isAuthentic && (
                <div className="mt-2 flex items-center space-x-1">
                  <Icon name="ShieldCheck" size={14} className="text-success" />
                  <span className="text-xs text-success font-medium">Authentic</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Clear History Button */}
        <div className="p-4 bg-muted/30 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            iconName="Trash2"
            iconPosition="left"
            className="w-full"
          >
            Clear History
          </Button>
        </div>
      </div>
      {/* Voice Navigation Instructions */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Voice Commands: Press 'R' to read last 5 scans • Use arrow keys to navigate • Enter to select
        </p>
      </div>
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite">
        {history?.length} scans in history. Selected item {selectedIndex + 1} of {history?.length}.
      </div>
    </div>
  );
};

export default ScanHistory;