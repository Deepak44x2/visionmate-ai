import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PermissionStatusCard = ({ onVoiceAnnounce }) => {
  const [permissions, setPermissions] = useState({
    camera: 'unknown',
    microphone: 'unknown',
    location: 'unknown'
  });

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setIsChecking(true);
    
    try {
      // Check camera permission
      const cameraPermission = await navigator.permissions?.query({ name: 'camera' });
      
      // Check microphone permission
      const microphonePermission = await navigator.permissions?.query({ name: 'microphone' });
      
      // Check location permission
      const locationPermission = await navigator.permissions?.query({ name: 'geolocation' });

      setPermissions({
        camera: cameraPermission?.state,
        microphone: microphonePermission?.state,
        location: locationPermission?.state
      });

      // Voice announcement for permission status
      if (onVoiceAnnounce) {
        const deniedPermissions = [];
        if (cameraPermission?.state === 'denied') deniedPermissions?.push('camera');
        if (microphonePermission?.state === 'denied') deniedPermissions?.push('microphone');
        if (locationPermission?.state === 'denied') deniedPermissions?.push('location');

        if (deniedPermissions?.length > 0) {
          onVoiceAnnounce(`Attention: ${deniedPermissions?.join(' and ')} permission${deniedPermissions?.length > 1 ? 's are' : ' is'} required for full functionality.`);
        }
      }
    } catch (error) {
      console.log('Permission check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const requestPermission = async (type) => {
    try {
      if (type === 'camera') {
        await navigator.mediaDevices?.getUserMedia({ video: true });
        if (onVoiceAnnounce) {
          onVoiceAnnounce('Camera permission granted');
        }
      } else if (type === 'microphone') {
        await navigator.mediaDevices?.getUserMedia({ audio: true });
        if (onVoiceAnnounce) {
          onVoiceAnnounce('Microphone permission granted');
        }
      } else if (type === 'location') {
        navigator.geolocation?.getCurrentPosition(
          () => {
            if (onVoiceAnnounce) {
              onVoiceAnnounce('Location permission granted');
            }
          },
          () => {
            if (onVoiceAnnounce) {
              onVoiceAnnounce('Location permission denied');
            }
          }
        );
      }
      
      // Recheck permissions after request
      setTimeout(() => {
        checkPermissions();
      }, 1000);
    } catch (error) {
      if (onVoiceAnnounce) {
        onVoiceAnnounce(`${type} permission was denied`);
      }
    }
  };

  const getPermissionIcon = (status) => {
    switch (status) {
      case 'granted': return 'CheckCircle';
      case 'denied': return 'XCircle';
      case 'prompt': return 'AlertCircle';
      default: return 'HelpCircle';
    }
  };

  const getPermissionColor = (status) => {
    switch (status) {
      case 'granted': return 'text-success';
      case 'denied': return 'text-error';
      case 'prompt': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getPermissionStatus = (status) => {
    switch (status) {
      case 'granted': return 'Allowed';
      case 'denied': return 'Blocked';
      case 'prompt': return 'Not Set';
      default: return 'Unknown';
    }
  };

  const permissionItems = [
    {
      name: 'Camera',
      description: 'Required for text reading, object detection, and color identification',
      type: 'camera',
      status: permissions?.camera,
      critical: true
    },
    {
      name: 'Microphone',
      description: 'Enables voice commands and audio feedback',
      type: 'microphone',
      status: permissions?.microphone,
      critical: true
    },
    {
      name: 'Location',
      description: 'Used for emergency SOS and location sharing',
      type: 'location',
      status: permissions?.location,
      critical: false
    }
  ];

  const hasBlockedPermissions = Object.values(permissions)?.includes('denied');
  const hasUnsetPermissions = Object.values(permissions)?.includes('prompt') || Object.values(permissions)?.includes('unknown');

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground flex items-center">
          <Icon name="Shield" size={20} className="mr-2" aria-hidden="true" />
          System Permissions
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={checkPermissions}
          loading={isChecking}
          iconName="RefreshCw"
          iconPosition="left"
          aria-label="Refresh permission status"
        >
          Refresh
        </Button>
      </div>
      {/* Permission Status Alert */}
      {(hasBlockedPermissions || hasUnsetPermissions) && (
        <div className={`
          mb-4 p-3 rounded-lg border
          ${hasBlockedPermissions ? 'bg-error/10 border-error/20' : 'bg-warning/10 border-warning/20'}
        `}>
          <div className="flex items-start space-x-2">
            <Icon 
              name={hasBlockedPermissions ? "AlertTriangle" : "Info"} 
              size={16} 
              className={hasBlockedPermissions ? "text-error mt-0.5" : "text-warning mt-0.5"}
              aria-hidden="true"
            />
            <div>
              <p className={`text-sm font-medium ${hasBlockedPermissions ? 'text-error' : 'text-warning'}`}>
                {hasBlockedPermissions ? 'Permissions Required' : 'Setup Needed'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasBlockedPermissions 
                  ? 'Some features are blocked. Please allow permissions for full functionality.'
                  : 'Grant permissions to enable all VisionMate features.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Permission List */}
      <div className="space-y-3">
        {permissionItems?.map((item) => (
          <div
            key={item?.type}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3 flex-1">
              <Icon 
                name={getPermissionIcon(item?.status)} 
                size={20} 
                className={getPermissionColor(item?.status)}
                aria-hidden="true"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-card-foreground">
                    {item?.name}
                  </p>
                  {item?.critical && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`text-xs font-medium ${getPermissionColor(item?.status)}`}>
                {getPermissionStatus(item?.status)}
              </span>
              
              {(item?.status === 'denied' || item?.status === 'prompt' || item?.status === 'unknown') && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => requestPermission(item?.type)}
                  aria-label={`Grant ${item?.name} permission`}
                >
                  Allow
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* All Permissions Granted State */}
      {!hasBlockedPermissions && !hasUnsetPermissions && (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success" aria-hidden="true" />
            <p className="text-sm font-medium text-success">All permissions granted</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            VisionMate is ready to use all features.
          </p>
        </div>
      )}
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite">
        Permission status: Camera {getPermissionStatus(permissions?.camera)}, 
        Microphone {getPermissionStatus(permissions?.microphone)}, 
        Location {getPermissionStatus(permissions?.location)}.
        {hasBlockedPermissions && ' Some permissions are blocked and need to be allowed.'}
      </div>
    </div>
  );
};

export default PermissionStatusCard;