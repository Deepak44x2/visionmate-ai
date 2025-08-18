import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CameraErrorHandler from '../../../components/ui/CameraErrorHandler';
import { 
  initializeCameraWithFallback, 
  stopCameraStream, 
  announceToUser 
} from '../../../utils/cameraPermissions';

const CameraViewfinder = ({ 
  onCapture, 
  isProcessing, 
  cameraError, 
  onRetryCamera,
  voiceInstructions = true 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialize camera with improved error handling
  useEffect(() => {
    initializeCamera();
    
    // Cleanup on unmount
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
          if (voiceInstructions) {
            announceToUser('Camera ready. Place bill flat in frame for best detection.');
          }
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError(error);
      if (voiceInstructions) {
        announceToUser('Camera access denied. Please enable camera permissions and try again.');
      }
    }
  };

  const handleRetryCamera = () => {
    initializeCamera();
    onRetryCamera?.();
  };

  const captureImage = () => {
    if (!videoRef?.current || !canvasRef?.current || isProcessing) return;

    const video = videoRef?.current;
    const canvas = canvasRef?.current;
    const context = canvas?.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video?.videoWidth;
    canvas.height = video?.videoHeight;

    // Draw current video frame to canvas
    context?.drawImage(video, 0, 0, canvas?.width, canvas?.height);

    // Convert to blob and pass to parent
    canvas?.toBlob((blob) => {
      if (blob && onCapture) {
        onCapture(blob);
        if (voiceInstructions) {
          announceToUser('Image captured. Processing currency detection...');
        }
      }
    }, 'image/jpeg', 0.9);
  };

  const handleKeyPress = (e) => {
    if (e?.key === ' ' || e?.key === 'Enter') {
      e?.preventDefault();
      captureImage();
    }
  };

  // Show error handler if there's a camera error
  if (error || cameraError) {
    return (
      <CameraErrorHandler
        error={error || cameraError}
        onRetry={handleRetryCamera}
        onDismiss={() => setError(null)}
        className="w-full h-80"
        showVoiceInstructions={voiceInstructions}
      />
    );
  }

  return (
    <div className="relative w-full">
      {/* Camera Preview */}
      <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          aria-label="Camera viewfinder for currency detection"
        />
        
        {/* Overlay Guide Frame */}
        <div className="absolute inset-4 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
          <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-lg" />
          
          {/* Corner Guides */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg" />
          
          {/* Center Instructions */}
          {isReady && (
            <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-center">
              <p className="text-sm font-medium">Place bill flat in frame</p>
              <p className="text-xs opacity-80">Move closer for better detection</p>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
              <p className="text-sm font-medium text-foreground">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={captureImage}
          onKeyDown={handleKeyPress}
          disabled={!isReady || isProcessing}
          className={`
            w-20 h-20 rounded-full border-4 border-white shadow-lg
            flex items-center justify-center transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50
            ${isReady && !isProcessing 
              ? 'bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95' : 'bg-muted cursor-not-allowed'
            }
          `}
          aria-label="Capture currency image"
          role="button"
          tabIndex={0}
        >
          <Icon 
            name={isProcessing ? "Loader2" : "Camera"} 
            size={32} 
            className={`text-white ${isProcessing ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {/* Hidden Canvas for Image Capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        aria-hidden="true"
      />

      {/* Voice Instructions */}
      <div className="sr-only" aria-live="polite">
        {isReady ? 'Camera ready for currency detection' : 'Initializing camera...'}
      </div>
    </div>
  );
};

export default CameraViewfinder;