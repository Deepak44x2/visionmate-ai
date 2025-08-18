import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import CameraErrorHandler from '../../../components/ui/CameraErrorHandler';
import { 
  initializeCameraWithFallback, 
  stopCameraStream, 
  announceToUser 
} from '../../../utils/cameraPermissions';

const CameraFeed = ({ 
  isDetecting, 
  onDetection, 
  onCameraError, 
  detectionSensitivity = 0.7,
  onFrameCapture 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('initializing');
  const [detectionZones, setDetectionZones] = useState([]);
  const [error, setError] = useState(null);

  // Mock object detection data
  const mockObjects = [
    { name: 'chair', confidence: 0.95, position: 'left', description: 'wooden chair' },
    { name: 'table', confidence: 0.88, position: 'center', description: 'dining table' },
    { name: 'bottle', confidence: 0.92, position: 'right', description: 'water bottle' },
    { name: 'book', confidence: 0.85, position: 'left-center', description: 'open book' },
    { name: 'cup', confidence: 0.90, position: 'right-center', description: 'coffee cup' },
    { name: 'phone', confidence: 0.87, position: 'center', description: 'mobile phone' },
    { name: 'laptop', confidence: 0.93, position: 'center-back', description: 'laptop computer' },
    { name: 'plant', confidence: 0.89, position: 'right-back', description: 'potted plant' }
  ];

  // Initialize camera with improved error handling
  useEffect(() => {
    initializeCamera();

    return () => {
      if (streamRef?.current) {
        stopCameraStream(streamRef?.current);
      }
      if (detectionIntervalRef?.current) {
        clearInterval(detectionIntervalRef?.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setCameraStatus('requesting');
      setError(null);
      
      const stream = await initializeCameraWithFallback({
        preferHighQuality: true,
        allowLowQuality: true
      });

      streamRef.current = stream;
      
      if (videoRef?.current) {
        videoRef.current.srcObject = stream;
        videoRef?.current?.play();
        setCameraStatus('active');
        announceToUser('Camera ready for object detection');
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setCameraStatus('error');
      setError(error);
      onCameraError?.(error?.message || 'Camera access denied');
      announceToUser('Camera access failed. Please check permissions.');
    }
  };

  const handleRetryCamera = () => {
    initializeCamera();
  };

  // Mock object detection simulation
  useEffect(() => {
    if (isDetecting && cameraStatus === 'active') {
      detectionIntervalRef.current = setInterval(() => {
        // Simulate random object detection
        const detectedObjects = mockObjects?.filter(() => Math.random() > 0.6)?.slice(0, Math.floor(Math.random() * 3) + 1)?.map(obj => ({
            ...obj,
            confidence: Math.max(detectionSensitivity, obj?.confidence - Math.random() * 0.2),
            timestamp: new Date()?.toISOString()
          }));

        if (detectedObjects?.length > 0) {
          setDetectionZones(detectedObjects);
          onDetection?.(detectedObjects);
        }
      }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

      return () => {
        if (detectionIntervalRef?.current) {
          clearInterval(detectionIntervalRef?.current);
        }
      };
    } else {
      if (detectionIntervalRef?.current) {
        clearInterval(detectionIntervalRef?.current);
      }
      setDetectionZones([]);
    }
  }, [isDetecting, cameraStatus, detectionSensitivity, onDetection]);

  // Capture current frame
  const captureFrame = () => {
    if (videoRef?.current && canvasRef?.current) {
      const canvas = canvasRef?.current;
      const video = videoRef?.current;
      const context = canvas?.getContext('2d');
      
      canvas.width = video?.videoWidth;
      canvas.height = video?.videoHeight;
      context?.drawImage(video, 0, 0);
      
      const imageData = canvas?.toDataURL('image/jpeg', 0.8);
      onFrameCapture?.(imageData, detectionZones);
    }
  };

  // Handle video load
  const handleVideoLoad = () => {
    if (videoRef?.current) {
      setCameraStatus('active');
    }
  };

  // Show error handler if there's a camera error
  if (error) {
    return (
      <CameraErrorHandler
        error={error}
        onRetry={handleRetryCamera}
        onDismiss={() => setError(null)}
        className="w-full h-full"
        showVoiceInstructions={true}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Camera Status Overlay */}
      {cameraStatus !== 'active' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            {cameraStatus === 'initializing' && (
              <>
                <Icon name="Camera" size={48} className="mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium">Initializing Camera...</p>
                <p className="text-sm opacity-75 mt-2">Please wait while we access your camera</p>
              </>
            )}
            {cameraStatus === 'requesting' && (
              <>
                <Icon name="Shield" size={48} className="mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium">Camera Permission Required</p>
                <p className="text-sm opacity-75 mt-2">Please allow camera access to continue</p>
              </>
            )}
          </div>
        </div>
      )}
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleVideoLoad}
        aria-label="Live camera feed for object detection"
      />
      {/* Hidden Canvas for Frame Capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        aria-hidden="true"
      />
      {/* Detection Status Indicator */}
      {cameraStatus === 'active' && (
        <div className="absolute top-4 left-4 z-20">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
            isDetecting 
              ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isDetecting ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-white text-sm font-medium">
              {isDetecting ? 'Detecting' : 'Paused'}
            </span>
          </div>
        </div>
      )}
      {/* Detection Zones Overlay */}
      {isDetecting && detectionZones?.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {detectionZones?.map((zone, index) => (
            <div
              key={`${zone?.name}-${index}`}
              className={`absolute border-2 border-blue-400 bg-blue-400/10 rounded-lg transition-all duration-300 ${
                zone?.position?.includes('left') ? 'left-4' : 
                zone?.position?.includes('right') ? 'right-4' : 'left-1/2 -translate-x-1/2'
              } ${
                zone?.position?.includes('center') ? 'top-1/2 -translate-y-1/2' :
                zone?.position?.includes('back') ? 'top-4' : 'bottom-4'
              }`}
              style={{
                width: '120px',
                height: '80px',
                opacity: zone?.confidence
              }}
            >
              <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {zone?.name} ({Math.round(zone?.confidence * 100)}%)
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Capture Button */}
      <button
        onClick={captureFrame}
        className="absolute bottom-20 right-4 w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 z-20"
        aria-label="Capture current frame with detected objects"
        disabled={cameraStatus !== 'active'}
      >
        <Icon name="Camera" size={24} />
      </button>
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Camera status: {cameraStatus}. 
        {isDetecting ? `Detecting objects. ${detectionZones?.length} objects currently detected.` : 'Object detection paused.'}
      </div>
    </div>
  );
};

export default CameraFeed;