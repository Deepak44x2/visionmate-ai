import React, { useRef, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ImageUploader = ({ onImageSelect, isProcessing, voiceEnabled = true }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const announceToUser = (message) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes?.includes(file?.type)) {
      const error = 'Please select a valid image file (JPEG, PNG, or WebP)';
      announceToUser(error);
      return { valid: false, error };
    }

    if (file?.size > maxSize) {
      const error = 'File size must be less than 10MB';
      announceToUser(error);
      return { valid: false, error };
    }

    return { valid: true, error: null };
  };

  const handleFileSelect = (files) => {
    if (!files || files?.length === 0) return;

    const file = files?.[0];
    const validation = validateFile(file);

    if (validation?.valid) {
      announceToUser('Image selected. Processing text...');
      onImageSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = (e) => {
    handleFileSelect(e?.target?.files);
  };

  const handleDragEnter = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = e?.dataTransfer?.files;
    handleFileSelect(files);
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select image file for text recognition"
      />
      {/* Upload Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleButtonClick}
        disabled={isProcessing}
        className="w-full h-16 mb-4"
        iconName="Upload"
        iconPosition="left"
        iconSize={24}
      >
        {isProcessing ? 'Processing...' : 'Upload from Gallery'}
      </Button>
      {/* Drag and Drop Area (Desktop) */}
      <div
        className={`
          hidden lg:block w-full h-32 border-2 border-dashed rounded-lg
          transition-colors duration-200 cursor-pointer
          ${dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleButtonClick : undefined}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop image file or click to select"
        onKeyDown={(e) => {
          if ((e?.key === 'Enter' || e?.key === ' ') && !isProcessing) {
            e?.preventDefault();
            handleButtonClick();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          <Icon 
            name={dragActive ? "Download" : "ImagePlus"} 
            size={32} 
            className={`mb-2 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`}
          />
          <p className={`text-sm font-medium ${dragActive ? 'text-primary' : 'text-foreground'}`}>
            {dragActive ? 'Drop image here' : 'Drag & drop image or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports JPEG, PNG, WebP (max 10MB)
          </p>
        </div>
      </div>
      {/* Voice Instructions */}
      {voiceEnabled && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Volume2" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Voice Commands:</p>
              <p>Say "upload image" or "select from gallery" to choose a file</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;