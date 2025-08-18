import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CurrencyResult = ({ 
  result, 
  onNewScan, 
  onSaveResult,
  voiceAnnouncement = true 
}) => {
  // Announce result to user
  useEffect(() => {
    if (result && voiceAnnouncement) {
      const message = result?.isAuthentic 
        ? `${result?.denomination} ${result?.currency} detected with ${result?.confidence}% confidence. Bill appears authentic.`
        : result?.isCounterfeit 
        ? `Warning: Potential counterfeit ${result?.denomination} ${result?.currency} detected. Please verify with authorities.`
        : `${result?.denomination} ${result?.currency} detected with ${result?.confidence}% confidence.`;
      
      announceToUser(message);
    }
  }, [result, voiceAnnouncement]);

  const announceToUser = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    return symbols?.[currency] || currency;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-error';
  };

  const getAuthenticityStatus = () => {
    if (result?.isCounterfeit) {
      return {
        icon: 'AlertTriangle',
        text: 'Potential Counterfeit',
        color: 'text-error',
        bgColor: 'bg-error/10'
      };
    }
    if (result?.isAuthentic) {
      return {
        icon: 'ShieldCheck',
        text: 'Authentic',
        color: 'text-success',
        bgColor: 'bg-success/10'
      };
    }
    return {
      icon: 'HelpCircle',
      text: 'Authenticity Unknown',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50'
    };
  };

  if (!result) return null;

  const authenticityStatus = getAuthenticityStatus();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Result Card */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {/* Currency Display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Banknote" size={32} className="text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {getCurrencySymbol(result?.currency)}{result?.denomination}
          </h2>
          
          <p className="text-muted-foreground">
            {result?.currency} - {result?.currencyName || 'Currency'}
          </p>
        </div>

        {/* Confidence Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Detection Confidence</span>
            <span className={`text-sm font-semibold ${getConfidenceColor(result?.confidence)}`}>
              {result?.confidence}%
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                result?.confidence >= 90 ? 'bg-success' :
                result?.confidence >= 70 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${result?.confidence}%` }}
            />
          </div>
        </div>

        {/* Authenticity Status */}
        <div className={`${authenticityStatus?.bgColor} rounded-lg p-3 mb-4`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={authenticityStatus?.icon} 
              size={20} 
              className={authenticityStatus?.color} 
            />
            <span className={`font-medium ${authenticityStatus?.color}`}>
              {authenticityStatus?.text}
            </span>
          </div>
          
          {result?.isCounterfeit && (
            <p className="text-sm text-error mt-2">
              This bill may be counterfeit. Please verify with financial institution.
            </p>
          )}
        </div>

        {/* Additional Details */}
        {result?.features && result?.features?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Security Features</h3>
            <div className="space-y-1">
              {result?.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Icon 
                    name={feature?.detected ? "Check" : "X"} 
                    size={16} 
                    className={feature?.detected ? "text-success" : "text-error"} 
                  />
                  <span className="text-muted-foreground">{feature?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground text-center mb-4">
          Scanned on {new Date(result.timestamp)?.toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="default"
            onClick={onNewScan}
            iconName="Camera"
            iconPosition="left"
            className="flex-1"
          >
            Scan Again
          </Button>
          
          <Button
            variant="default"
            size="default"
            onClick={() => onSaveResult && onSaveResult(result)}
            iconName="Save"
            iconPosition="left"
            className="flex-1"
          >
            Save Result
          </Button>
        </div>
      </div>
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="assertive">
        Currency detection complete. {result?.denomination} {result?.currency} identified with {result?.confidence}% confidence. 
        {result?.isCounterfeit ? 'Warning: Potential counterfeit detected.' : result?.isAuthentic ?'Bill appears authentic.' : ''}
      </div>
    </div>
  );
};

export default CurrencyResult;