import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const FeatureCard = ({ 
  title, 
  description, 
  iconName, 
  route, 
  voiceCommand, 
  isHighPriority = false,
  onVoiceAnnounce 
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(route);
    if (onVoiceAnnounce) {
      onVoiceAnnounce(`Opening ${title}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`
        relative bg-card border border-border rounded-lg p-6 cursor-pointer
        transition-all duration-200 ease-out hover:shadow-elevation-2 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${isHighPriority ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
      `}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} - ${description}. Voice command: ${voiceCommand}`}
      aria-describedby={`feature-${title?.toLowerCase()?.replace(/\s+/g, '-')}-desc`}
    >
      {/* Priority Badge */}
      {isHighPriority && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
          Quick Access
        </div>
      )}
      {/* Icon Section */}
      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4 mx-auto">
        <Icon 
          name={iconName} 
          size={32} 
          className="text-primary"
          aria-hidden="true"
        />
      </div>
      {/* Content Section */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold text-card-foreground">
          {title}
        </h3>
        
        <p 
          id={`feature-${title?.toLowerCase()?.replace(/\s+/g, '-')}-desc`}
          className="text-muted-foreground text-sm leading-relaxed"
        >
          {description}
        </p>

        {/* Voice Command Hint */}
        <div className="flex items-center justify-center space-x-2 text-xs text-primary bg-primary/10 rounded-full px-3 py-1">
          <Icon name="Mic" size={12} aria-hidden="true" />
          <span>Say "{voiceCommand}"</span>
        </div>
      </div>
      {/* Accessibility Enhancement */}
      <div className="sr-only">
        Press Enter or Space to activate {title}. You can also use voice command: {voiceCommand}
      </div>
    </div>
  );
};

export default FeatureCard;