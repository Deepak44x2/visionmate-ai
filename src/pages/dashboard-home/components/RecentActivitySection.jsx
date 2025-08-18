import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivitySection = ({ onVoiceAnnounce }) => {
  // Mock recent activity data
  const recentActivities = [
    {
      id: 1,
      action: "Text Reader",
      description: "Scanned restaurant menu",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      iconName: "FileText",
      success: true
    },
    {
      id: 2,
      action: "Object Detection",
      description: "Identified coffee mug on desk",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      iconName: "Search",
      success: true
    },
    {
      id: 3,
      action: "Color Detection",
      description: "Detected blue shirt color",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      iconName: "Palette",
      success: true
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleActivityClick = (activity) => {
    if (onVoiceAnnounce) {
      onVoiceAnnounce(`${activity?.action}: ${activity?.description}, ${formatTimeAgo(activity?.timestamp)}`);
    }
  };

  if (recentActivities?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2" aria-hidden="true" />
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start using VisionMate features to see your activity here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
        <Icon name="Clock" size={20} className="mr-2" aria-hidden="true" />
        Recent Activity
      </h2>
      <div className="space-y-3">
        {recentActivities?.map((activity) => (
          <div
            key={activity?.id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => handleActivityClick(activity)}
            onKeyDown={(e) => {
              if (e?.key === 'Enter' || e?.key === ' ') {
                e?.preventDefault();
                handleActivityClick(activity);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Recent activity: ${activity?.action} - ${activity?.description}, ${formatTimeAgo(activity?.timestamp)}`}
          >
            {/* Activity Icon */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
              ${activity?.success ? 'bg-success/10' : 'bg-error/10'}
            `}>
              <Icon 
                name={activity?.iconName} 
                size={20} 
                className={activity?.success ? 'text-success' : 'text-error'}
                aria-hidden="true"
              />
            </div>

            {/* Activity Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">
                {activity?.action}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity?.description}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {formatTimeAgo(activity?.timestamp)}
            </div>

            {/* Success Indicator */}
            {activity?.success && (
              <div className="flex-shrink-0">
                <Icon name="CheckCircle" size={16} className="text-success" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg p-2"
          onClick={() => onVoiceAnnounce && onVoiceAnnounce('View all activity selected')}
          aria-label="View all recent activity"
        >
          View All Activity
        </button>
      </div>
      {/* Screen Reader Summary */}
      <div className="sr-only" aria-live="polite">
        Recent activity section showing {recentActivities?.length} recent actions. 
        Latest activity: {recentActivities?.[0]?.action} - {recentActivities?.[0]?.description}, 
        {formatTimeAgo(recentActivities?.[0]?.timestamp)}.
      </div>
    </div>
  );
};

export default RecentActivitySection;