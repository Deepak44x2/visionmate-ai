import React, { useRef, useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import CameraErrorHandler from '../../../components/ui/CameraErrorHandler';
import { 
  initializeCameraWithFallback, 
  stopCameraStream, 
  announceToUser 
} from '../../../utils/cameraPermissions';

const CameraViewfinder = ({ 
  onCapture, 
  isProcessing, 
  voiceEnabled = true,
  onVoiceCommand 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize camera with improved error handling
  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stopCameraStream(stream);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setError(null);
      const mediaStream = await initializeCameraWithFallback({
        preferHighQuality: true,
        allowLowQuality: true
      });
      
      setStream(mediaStream);
      
      if (videoRef?.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
          if (voiceEnabled) {
            announceToUser('Camera ready. Point at text and tap capture button or say capture.');
          }
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError(err);
      
      if (voiceEnabled) {
        announceToUser('Camera access denied. Please enable camera permissions in your browser settings.');
      }
    }
  };

  const handleRetryCamera = () => {
    initializeCamera();
  };

  const captureImage = async () => {
    if (!videoRef?.current || !canvasRef?.current || isCapturing) return;

    setIsCapturing(true);
    
    try {
      const video = videoRef?.current;
      const canvas = canvasRef?.current;
      const context = canvas?.getContext('2d');

      canvas.width = video?.videoWidth;
      canvas.height = video?.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas?.width, canvas?.height);
      
      // Convert to blob
      canvas?.toBlob((blob) => {
        if (blob) {
          const imageFile = new File([blob], `text-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          
          if (voiceEnabled) {
            announceToUser('Image captured. Processing text...');
          }
          
          onCapture(imageFile);
        }
      }, 'image/jpeg', 0.9);

    } catch (err) {
      console.error('Capture error:', err);
      
      if (voiceEnabled) {
        announceToUser('Failed to capture image. Please try again.');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Show error handler if there's a camera error
  if (error) {
    return (
      <CameraErrorHandler
        error={error}
        onRetry={handleRetryCamera}
        onDismiss={() => setError(null)}
        className="w-full h-[60vh]"
        showVoiceInstructions={voiceEnabled}
      />
    );
  }

  return (
    <div className="relative w-full h-[60vh] bg-black rounded-lg overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        aria-label="Camera viewfinder for text capture"
      />
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay Guides */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner guides */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white opacity-80" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white opacity-80" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white opacity-80" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white opacity-80" />
        
        {/* Center guide */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-dashed border-white opacity-60 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
              Align text here
            </span>
          </div>
        </div>
        
        {/* Voice instruction overlay */}
        {voiceEnabled && (
          <div className="absolute bottom-16 left-4 right-4">
            <div className="bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-lg text-center">
              Point camera at text and tap capture
            </div>
          </div>
        )}
      </div>
      
      {/* Capture Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <Button
          variant="primary"
          size="icon"
          onClick={captureImage}
          disabled={isProcessing || isCapturing || !isReady}
          className="w-20 h-20 rounded-full shadow-lg"
          aria-label="Capture image for text recognition"
        >
          {isCapturing ? (
            <Icon name="Loader2" size={32} className="animate-spin" />
          ) : (
            <Icon name="Camera" size={32} />
          )}
        </Button>
      </div>
      
      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary mb-3" />
            <p className="text-foreground font-medium">Processing image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraViewfinder;