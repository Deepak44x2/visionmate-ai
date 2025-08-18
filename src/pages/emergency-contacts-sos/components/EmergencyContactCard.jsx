import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const EmergencyContactCard = ({ 
  contact, 
  onCall, 
  onEdit, 
  onDelete,
  onVoiceAnnounce 
}) => {
  const handleCardFocus = () => {
    if (onVoiceAnnounce) {
      const announcement = `Emergency contact: ${contact?.name}, ${contact?.relationship}, phone number ${contact?.phone}`;
      onVoiceAnnounce(announcement);
    }
  };

  const handleQuickCall = () => {
    if (onCall) {
      onCall(contact);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'primary':
        return 'bg-error text-error-foreground';
      case 'secondary':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'primary':
        return 'Primary Contact';
      case 'secondary':
        return 'Secondary Contact';
      default:
        return 'Emergency Contact';
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onFocus={handleCardFocus}
      tabIndex={0}
      role="article"
      aria-label={`Emergency contact card for ${contact?.name}`}
    >
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact?.priority)}`}
          aria-label={getPriorityLabel(contact?.priority)}
        >
          <Icon 
            name={contact?.priority === 'primary' ? 'Star' : 'Circle'} 
            size={12} 
            className="mr-1" 
          />
          {getPriorityLabel(contact?.priority)}
        </span>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit && onEdit(contact)}
            iconName="Edit2"
            iconSize={16}
            aria-label={`Edit contact ${contact?.name}`}
            className="min-w-[44px] min-h-[44px]"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(contact)}
            iconName="Trash2"
            iconSize={16}
            aria-label={`Delete contact ${contact?.name}`}
            className="min-w-[44px] min-h-[44px] text-error hover:text-error hover:bg-error/10"
          />
        </div>
      </div>
      {/* Contact Information */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {contact?.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {contact?.relationship}
        </p>
        <p className="text-base font-medium text-foreground">
          {contact?.phone}
        </p>
        {contact?.email && (
          <p className="text-sm text-muted-foreground mt-1">
            {contact?.email}
          </p>
        )}
      </div>
      {/* Quick Call Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleQuickCall}
        iconName="Phone"
        iconPosition="left"
        iconSize={20}
        className="w-full min-h-[56px] text-base font-medium"
        aria-label={`Call ${contact?.name} at ${contact?.phone}`}
      >
        Quick Call
      </Button>
      {/* Additional Contact Info */}
      {contact?.notes && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <Icon name="FileText" size={14} className="inline mr-1" />
            {contact?.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactCard;