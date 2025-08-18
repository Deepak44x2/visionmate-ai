import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import CameraErrorHandler from '../../../components/ui/CameraErrorHandler';
import { initializeCameraWithFallback, stopCameraStream, announceToUser } from '../../../utils/cameraPermissions';

const CameraView = ({ 
  onColorDetected, 
  isScanning, 
  scanningMode, 
  sensitivity,
  onCameraError 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const detectionIntervalRef = useRef(null);

  // Initialize camera with improved error handling
  useEffect(() => {
    initCamera();

    return () => {
      if (stream) {
        stopCameraStream(stream);
      }
      if (detectionIntervalRef?.current) {
        clearInterval(detectionIntervalRef?.current);
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mediaStream = await initializeCameraWithFallback({
        preferHighQuality: false,
        allowLowQuality: true
      });
      
      if (videoRef?.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        announceToUser('Camera ready for color detection');
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError(err);
      onCameraError?.(err);
      announceToUser('Camera access failed. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryCamera = () => {
    initCamera();
  };

  // Color detection logic
  const detectColorAtCenter = () => {
    if (!videoRef?.current || !canvasRef?.current) return;

    const video = videoRef?.current;
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');

    canvas.width = video?.videoWidth;
    canvas.height = video?.videoHeight;
    ctx?.drawImage(video, 0, 0);

    // Get center pixel
    const centerX = Math.floor(canvas?.width / 2);
    const centerY = Math.floor(canvas?.height / 2);
    
    // Sample area around center for better accuracy
    const sampleSize = sensitivity === 'high' ? 20 : sensitivity === 'medium' ? 15 : 10;
    const imageData = ctx?.getImageData(
      centerX - sampleSize/2, 
      centerY - sampleSize/2, 
      sampleSize, 
      sampleSize
    );

    // Calculate average color
    let r = 0, g = 0, b = 0;
    const pixels = imageData?.data?.length / 4;
    
    for (let i = 0; i < imageData?.data?.length; i += 4) {
      r += imageData?.data?.[i];
      g += imageData?.data?.[i + 1];
      b += imageData?.data?.[i + 2];
    }

    r = Math.round(r / pixels);
    g = Math.round(g / pixels);
    b = Math.round(b / pixels);

    const colorInfo = analyzeColor(r, g, b);
    onColorDetected(colorInfo);
  };

  // Color analysis function
  const analyzeColor = (r, g, b) => {
    const hex = `#${r?.toString(16)?.padStart(2, '0')}${g?.toString(16)?.padStart(2, '0')}${b?.toString(16)?.padStart(2, '0')}`;
    
    // Convert to HSL for better color description
    const hsl = rgbToHsl(r, g, b);
    const colorName = getColorName(r, g, b, hsl);
    const brightness = getBrightness(r, g, b);
    const saturation = getSaturation(hsl?.[1]);
    
    return {
      rgb: { r, g, b },
      hex,
      hsl,
      name: colorName,
      brightness,
      saturation,
      confidence: calculateConfidence(r, g, b),
      timestamp: new Date()
    };
  };

  // RGB to HSL conversion
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  // Get color name based on RGB values
  const getColorName = (r, g, b, hsl) => {
    const [h, s, l] = hsl;
    
    // Grayscale colors
    if (s < 10) {
      if (l < 20) return 'black';
      if (l < 40) return 'dark gray';
      if (l < 60) return 'gray';
      if (l < 80) return 'light gray';
      return 'white';
    }

    // Chromatic colors
    if (h >= 0 && h < 15) return l > 50 ? 'light red' : 'dark red';
    if (h >= 15 && h < 45) return l > 50 ? 'light orange' : 'dark orange';
    if (h >= 45 && h < 75) return l > 50 ? 'light yellow' : 'dark yellow';
    if (h >= 75 && h < 150) return l > 50 ? 'light green' : 'dark green';
    if (h >= 150 && h < 210) return l > 50 ? 'light cyan' : 'dark cyan';
    if (h >= 210 && h < 270) return l > 50 ? 'light blue' : 'dark blue';
    if (h >= 270 && h < 330) return l > 50 ? 'light purple' : 'dark purple';
    if (h >= 330) return l > 50 ? 'light pink' : 'dark pink';
    
    return 'unknown color';
  };

  const getBrightness = (r, g, b) => {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness > 200) return 'very bright';
    if (brightness > 150) return 'bright';
    if (brightness > 100) return 'medium';
    if (brightness > 50) return 'dark';
    return 'very dark';
  };

  const getSaturation = (s) => {
    if (s > 80) return 'very vibrant';
    if (s > 60) return 'vibrant';
    if (s > 40) return 'moderate';
    if (s > 20) return 'muted';
    return 'very muted';
  };

  const calculateConfidence = (r, g, b) => {
    // Simple confidence based on color distinctiveness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const range = max - min;
    return Math.min(95, Math.max(60, (range / 255) * 100));
  };

  // Handle continuous scanning
  useEffect(() => {
    if (isScanning && scanningMode === 'continuous') {
      detectionIntervalRef.current = setInterval(() => {
        detectColorAtCenter();
      }, 500);
    } else {
      if (detectionIntervalRef?.current) {
        clearInterval(detectionIntervalRef?.current);
      }
    }

    return () => {
      if (detectionIntervalRef?.current) {
        clearInterval(detectionIntervalRef?.current);
      }
    };
  }, [isScanning, scanningMode, sensitivity]);

  // Handle tap to detect
  const handleTapDetect = () => {
    if (scanningMode === 'tap') {
      detectColorAtCenter();
    }
  };

  // Show error handler if there's a camera error
  if (error) {
    return (
      <CameraErrorHandler
        error={error}
        onRetry={handleRetryCamera}
        onDismiss={() => setError(null)}
        className="w-full h-96"
        showVoiceInstructions={true}
      />
    );
  }

  return (
    <div className="relative w-full">
      {/* Camera Feed */}
      <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Initializing camera...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => setIsLoading(false)}
          onClick={handleTapDetect}
          aria-label="Camera feed for color detection"
        />

        {/* Center Crosshair Target */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-0.5 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-0.5 h-8 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Scanning Indicator */}
        {isScanning && scanningMode === 'continuous' && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
            <span>Scanning</span>
          </div>
        )}

        {/* Tap to Detect Hint */}
        {scanningMode === 'tap' && !isScanning && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
            Tap screen to detect color
          </div>
        )}
      </div>

      {/* Hidden Canvas for Color Detection */}
      <canvas
        ref={canvasRef}
        className="hidden"
        aria-hidden="true"
      />

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Color detection camera is {isLoading ? 'loading' : 'ready'}. 
        {scanningMode === 'continuous' ? 'Continuous scanning mode active.' : 'Tap screen to detect colors.'}
        Center target area is ready for color detection.
      </div>
    </div>
  );
};

export default CameraView;