import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CountingMode = ({ 
  onAddBill, 
  onClearCount, 
  onExitMode,
  voiceAnnouncements = true 
}) => {
  const [bills, setBills] = useState([]);
  const [runningTotal, setRunningTotal] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Calculate running total when bills change
  useEffect(() => {
    const total = bills?.reduce((sum, bill) => {
      // Convert to USD for calculation (simplified conversion)
      const usdValue = convertToUSD(bill?.denomination, bill?.currency);
      return sum + usdValue;
    }, 0);
    setRunningTotal(total);
    
    if (voiceAnnouncements && bills?.length > 0) {
      announceTotal(total, bills?.length);
    }
  }, [bills, voiceAnnouncements]);

  const convertToUSD = (amount, currency) => {
    const rates = {
      'USD': 1,
      'EUR': 1.1,
      'GBP': 1.25,
      'JPY': 0.0067,
      'CAD': 0.74,
      'AUD': 0.66,
      'CHF': 1.08,
      'CNY': 0.14
    };
    return amount * (rates?.[currency] || 1);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'Fr',
      'CNY': '¥'
    };
    return symbols?.[currency] || currency;
  };

  const announceToUser = (message) => {
    if (voiceAnnouncements) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const announceTotal = (total, count) => {
    const message = `Running total: ${count} bills worth approximately $${total?.toFixed(2)} USD`;
    announceToUser(message);
  };

  const handleAddBill = (billData) => {
    const newBill = {
      id: Date.now(),
      ...billData,
      timestamp: new Date()
    };
    
    setBills(prev => [...prev, newBill]);
    onAddBill && onAddBill(newBill);
    
    announceToUser(`Added ${getCurrencySymbol(billData?.currency)}${billData?.denomination} ${billData?.currency}`);
  };

  const handleRemoveBill = (billId) => {
    const billToRemove = bills?.find(bill => bill?.id === billId);
    setBills(prev => prev?.filter(bill => bill?.id !== billId));
    
    if (billToRemove) {
      announceToUser(`Removed ${getCurrencySymbol(billToRemove?.currency)}${billToRemove?.denomination} ${billToRemove?.currency}`);
    }
  };

  const handleClearAll = () => {
    setBills([]);
    setRunningTotal(0);
    onClearCount && onClearCount();
    announceToUser('All bills cleared. Count reset to zero.');
  };

  const startCounting = () => {
    setIsActive(true);
    announceToUser('Counting mode activated. Scan bills to add them to your total.');
  };

  const stopCounting = () => {
    setIsActive(false);
    onExitMode && onExitMode();
    announceToUser(`Counting mode ended. Final total: $${runningTotal?.toFixed(2)} USD from ${bills?.length} bills.`);
  };

  const getBillsByDenomination = () => {
    const grouped = bills?.reduce((acc, bill) => {
      const key = `${bill?.currency}-${bill?.denomination}`;
      if (!acc?.[key]) {
        acc[key] = {
          currency: bill?.currency,
          denomination: bill?.denomination,
          count: 0,
          total: 0
        };
      }
      acc[key].count += 1;
      acc[key].total += bill?.denomination;
      return acc;
    }, {});
    
    return Object.values(grouped);
  };

  if (!isActive) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Calculator" size={32} className="text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">Counting Mode</h2>
          <p className="text-muted-foreground mb-6">
            Scan multiple bills to calculate total value with running count announcements.
          </p>
          
          <Button
            variant="default"
            size="lg"
            onClick={startCounting}
            iconName="Play"
            iconPosition="left"
            className="w-full"
          >
            Start Counting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Running Total Display */}
      <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center">
        <h2 className="text-sm font-medium opacity-90 mb-1">Running Total</h2>
        <p className="text-3xl font-bold mb-1">${runningTotal?.toFixed(2)}</p>
        <p className="text-sm opacity-80">{bills?.length} bills counted</p>
      </div>
      {/* Bill Breakdown */}
      {bills?.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Bill Breakdown</h3>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {getBillsByDenomination()?.map((group, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Icon name="Banknote" size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {getCurrencySymbol(group?.currency)}{group?.denomination} {group?.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {group?.count} × {getCurrencySymbol(group?.currency)}{group?.denomination}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {getCurrencySymbol(group?.currency)}{group?.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ≈ ${convertToUSD(group?.total, group?.currency)?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Recent Bills List */}
      {bills?.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Scans</h3>
          </div>
          
          <div className="max-h-32 overflow-y-auto">
            {bills?.slice(-5)?.reverse()?.map((bill) => (
              <div key={bill?.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-2">
                  <Icon name="Banknote" size={16} className="text-primary" />
                  <span className="text-sm text-foreground">
                    {getCurrencySymbol(bill?.currency)}{bill?.denomination} {bill?.currency}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBill(bill?.id)}
                  iconName="X"
                  aria-label={`Remove ${getCurrencySymbol(bill?.currency)}${bill?.denomination} bill`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="default"
          onClick={handleClearAll}
          iconName="Trash2"
          iconPosition="left"
          className="flex-1"
          disabled={bills?.length === 0}
        >
          Clear All
        </Button>
        
        <Button
          variant="destructive"
          size="default"
          onClick={stopCounting}
          iconName="Square"
          iconPosition="left"
          className="flex-1"
        >
          Stop Counting
        </Button>
      </div>
      {/* Voice Instructions */}
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground text-center">
          Continue scanning bills to add them to your count. Total will be announced after each scan.
        </p>
      </div>
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite">
        Counting mode active. {bills?.length} bills counted. Running total: ${runningTotal?.toFixed(2)} USD.
      </div>
    </div>
  );
};

export default CountingMode;