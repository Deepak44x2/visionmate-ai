/**
 * Centralized camera permission management utility
 * Provides consistent permission handling across all camera components
 */

export class CameraPermissionError extends Error {
  constructor(message, code = 'PERMISSION_DENIED') {
    super(message);
    this.name = 'CameraPermissionError';
    this.code = code;
  }
}

export const PERMISSION_STATES = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt',
  UNKNOWN: 'unknown'
};

export const CAMERA_CONSTRAINTS = {
  DEFAULT: {
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  },
  HIGH_QUALITY: {
    video: {
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  },
  LOW_BANDWIDTH: {
    video: {
      facingMode: 'environment',
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  }
};

/**
 * Check current camera permission status
 * @returns {Promise<string>} Permission state
 */
export const checkCameraPermission = async () => {
  try {
    if (!('permissions' in navigator)) {
      return PERMISSION_STATES?.UNKNOWN;
    }

    const permission = await navigator.permissions?.query({ name: 'camera' });
    return permission?.state;
  } catch (error) {
    console.warn('Permission query not supported:', error);
    return PERMISSION_STATES?.UNKNOWN;
  }
};

/**
 * Request camera access with comprehensive error handling
 * @param {Object} constraints - Media constraints
 * @param {Object} options - Additional options
 * @returns {Promise<MediaStream>} Camera stream
 */
export const requestCameraAccess = async (
  constraints = CAMERA_CONSTRAINTS?.DEFAULT,
  options = {}
) => {
  const { retryCount = 0, maxRetries = 2, fallbackConstraints = null } = options;

  try {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new CameraPermissionError(
        'Camera is not supported on this device or browser',
        'NOT_SUPPORTED'
      );
    }

    // Request camera access
    const stream = await navigator.mediaDevices?.getUserMedia(constraints);
    return stream;

  } catch (error) {
    console.error('Camera access error:', error);

    // Handle different types of errors
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      throw new CameraPermissionError(
        'Camera permission was denied. Please allow camera access in your browser settings.',
        'PERMISSION_DENIED'
      );
    }

    if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      throw new CameraPermissionError(
        'No camera device was found on this device.',
        'NO_CAMERA'
      );
    }

    if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
      throw new CameraPermissionError(
        'Camera is already in use by another application.',
        'CAMERA_BUSY'
      );
    }

    if (error?.name === 'OverconstrainedError' || error?.name === 'ConstraintNotSatisfiedError') {
      // Try with fallback constraints if available
      if (fallbackConstraints && retryCount < maxRetries) {
        return requestCameraAccess(fallbackConstraints, { 
          ...options, 
          retryCount: retryCount + 1 
        });
      }
      
      throw new CameraPermissionError(
        'Camera does not support the requested settings.',
        'UNSUPPORTED_CONSTRAINTS'
      );
    }

    if (error?.name === 'AbortError') {
      throw new CameraPermissionError(
        'Camera access request was interrupted.',
        'REQUEST_ABORTED'
      );
    }

    // Generic error
    throw new CameraPermissionError(
      `Camera access failed: ${error.message}`,
      'GENERIC_ERROR'
    );
  }
};

/**
 * Initialize camera with fallback strategy
 * @param {Object} options - Configuration options
 * @returns {Promise<MediaStream>} Camera stream
 */
export const initializeCameraWithFallback = async (options = {}) => {
  const { preferHighQuality = false, allowLowQuality = true } = options;

  const constraintOrder = preferHighQuality 
    ? [CAMERA_CONSTRAINTS?.HIGH_QUALITY, CAMERA_CONSTRAINTS?.DEFAULT, CAMERA_CONSTRAINTS?.LOW_BANDWIDTH]
    : [CAMERA_CONSTRAINTS?.DEFAULT, CAMERA_CONSTRAINTS?.LOW_BANDWIDTH];

  if (!allowLowQuality) {
    constraintOrder?.pop(); // Remove low bandwidth option
  }

  let lastError = null;

  for (let i = 0; i < constraintOrder?.length; i++) {
    try {
      const constraints = constraintOrder?.[i];
      const fallback = constraintOrder?.[i + 1] || null;
      
      return await requestCameraAccess(constraints, {
        fallbackConstraints: fallback,
        maxRetries: 1
      });
    } catch (error) {
      lastError = error;
      
      // If it's a permission or device error, don't try other constraints
      if (error?.code === 'PERMISSION_DENIED' || 
          error?.code === 'NO_CAMERA' || 
          error?.code === 'NOT_SUPPORTED') {
        throw error;
      }
    }
  }

  // All attempts failed
  throw lastError;
};

/**
 * Get user-friendly error message and recovery instructions
 * @param {CameraPermissionError} error - Camera permission error
 * @returns {Object} Error message and instructions
 */
export const getCameraErrorInfo = (error) => {
  switch (error?.code) {
    case 'PERMISSION_DENIED':
      return {
        title: 'Camera Access Required',
        message: 'VisionMate needs camera access to function properly.',
        instructions: [
          'Click the camera icon in your browser\'s address bar',
          'Select "Allow" for camera access',
          'Refresh the page and try again'
        ],
        canRetry: true,
        showBrowserHelp: true
      };

    case 'NO_CAMERA':
      return {
        title: 'No Camera Found',
        message: 'No camera device was detected on this device.',
        instructions: [
          'Check if your camera is properly connected',
          'Try refreshing the page',
          'Ensure other apps aren\'t using the camera'
        ],
        canRetry: true,
        showBrowserHelp: false
      };

    case 'CAMERA_BUSY':
      return {
        title: 'Camera In Use',
        message: 'Your camera is currently being used by another application.',
        instructions: [
          'Close other apps that might be using the camera',
          'Close other browser tabs with camera access',
          'Try again after closing camera applications'
        ],
        canRetry: true,
        showBrowserHelp: false
      };

    case 'NOT_SUPPORTED':
      return {
        title: 'Camera Not Supported',
        message: 'Your browser or device doesn\'t support camera access.',
        instructions: [
          'Try using a modern browser like Chrome, Firefox, or Safari',
          'Ensure you\'re using HTTPS (secure connection)',
          'Update your browser to the latest version'
        ],
        canRetry: false,
        showBrowserHelp: true
      };

    case 'UNSUPPORTED_CONSTRAINTS':
      return {
        title: 'Camera Settings Error',
        message: 'Your camera doesn\'t support the requested settings.',
        instructions: [
          'The app will automatically adjust camera quality',
          'Try refreshing the page',
          'Check if your camera drivers are up to date'
        ],
        canRetry: true,
        showBrowserHelp: false
      };

    default:
      return {
        title: 'Camera Error',
        message: error?.message || 'An unexpected camera error occurred.',
        instructions: [
          'Try refreshing the page',
          'Check your browser permissions',
          'Contact support if the problem persists'
        ],
        canRetry: true,
        showBrowserHelp: true
      };
  }
};

/**
 * Stop camera stream and release resources
 * @param {MediaStream} stream - Camera stream to stop
 */
export const stopCameraStream = (stream) => {
  if (stream) {
    stream?.getTracks()?.forEach(track => {
      track?.stop();
    });
  }
};

/**
 * Check if device has camera capability
 * @returns {Promise<boolean>} True if camera is available
 */
export const hasCameraSupport = async () => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    const devices = await navigator.mediaDevices?.enumerateDevices();
    return devices?.some(device => device?.kind === 'videoinput');
  } catch (error) {
    console.warn('Camera capability check failed:', error);
    return false;
  }
};

/**
 * Voice announcement helper for accessibility
 * @param {string} message - Message to announce
 * @param {Object} options - Speech options
 */
export const announceToUser = (message, options = {}) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = options?.rate || 0.9;
    utterance.volume = options?.volume || 0.8;
    utterance.lang = options?.lang || 'en-US';
    speechSynthesis.speak(utterance);
  }
};