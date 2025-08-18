import React from 'react';
import Icon from '../../../components/AppIcon';

const EmergencyLogCard = ({ logEntry, onVoiceAnnounce }) => {
  const handleCardFocus = () => {
    if (onVoiceAnnounce) {
      const date = new Date(logEntry.timestamp)?.toLocaleDateString();
      const time = new Date(logEntry.timestamp)?.toLocaleTimeString();
      const announcement = `Emergency log entry from ${date} at ${time}. Status: ${logEntry?.status}. ${logEntry?.contactsNotified} contacts notified.`;
      onVoiceAnnounce(announcement);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'cancelled':
        return 'text-muted-foreground bg-muted';
      case 'in-progress':
        return 'text-warning bg-warning/10';
      case 'failed':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'cancelled':
        return 'XCircle';
      case 'in-progress':
        return 'Clock';
      case 'failed':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date?.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date?.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onFocus={handleCardFocus}
      tabIndex={0}
      role="article"
      aria-label={`Emergency log entry from ${formatTimestamp(logEntry?.timestamp)}`}
    >
      {/* Header with Status and Timestamp */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(logEntry?.status)}`}>
            <Icon 
              name={getStatusIcon(logEntry?.status)} 
              size={12} 
              className="mr-1" 
            />
            {logEntry?.status?.charAt(0)?.toUpperCase() + logEntry?.status?.slice(1)}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatTimestamp(logEntry?.timestamp)}
        </span>
      </div>
      {/* Emergency Details */}
      <div className="space-y-2">
        {/* Location */}
        {logEntry?.location && (
          <div className="flex items-start space-x-2">
            <Icon name="MapPin" size={16} className="text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-foreground">
                {logEntry?.location?.address || 'Location captured'}
              </p>
              {logEntry?.location?.coordinates && (
                <p className="text-xs text-muted-foreground">
                  {logEntry?.location?.coordinates?.lat?.toFixed(6)}, {logEntry?.location?.coordinates?.lng?.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contacts Notified */}
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={16} className="text-muted-foreground" />
          <p className="text-sm text-foreground">
            {logEntry?.contactsNotified} contact{logEntry?.contactsNotified !== 1 ? 's' : ''} notified
          </p>
        </div>

        {/* Response Time */}
        {logEntry?.responseTime && (
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <p className="text-sm text-foreground">
              Response time: {logEntry?.responseTime}
            </p>
          </div>
        )}

        {/* Notes */}
        {logEntry?.notes && (
          <div className="flex items-start space-x-2">
            <Icon name="FileText" size={16} className="text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {logEntry?.notes}
            </p>
          </div>
        )}
      </div>
      {/* Emergency Services Contact */}
      {logEntry?.emergencyServicesContacted && (
        <div className="mt-3 p-2 bg-error/5 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Phone" size={14} className="text-error" />
            <p className="text-xs text-error font-medium">
              Emergency services contacted
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyLogCard;