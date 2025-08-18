import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const AccessibilityFocusManager = ({ children }) => {
  const location = useLocation();
  const previousLocationRef = useRef(location?.pathname);
  const focusTargetRef = useRef(null);
  const skipLinkRef = useRef(null);

  // Focus management for route changes
  useEffect(() => {
    const currentPath = location?.pathname;
    const previousPath = previousLocationRef?.current;

    if (currentPath !== previousPath) {
      // Announce page change
      announcePageChange(currentPath);
      
      // Focus management after route change
      setTimeout(() => {
        const mainContent = document.querySelector('main');
        const firstHeading = document.querySelector('main h1, main h2, main [role="heading"]');
        const firstFocusable = document.querySelector('main [tabIndex="0"], main button, main input, main select, main textarea, main a[href]');
        
        // Priority: heading > main content > first focusable element
        if (firstHeading) {
          firstHeading?.focus();
        } else if (mainContent) {
          mainContent?.focus();
        } else if (firstFocusable) {
          firstFocusable?.focus();
        }
      }, 100);

      previousLocationRef.current = currentPath;
    }
  }, [location?.pathname]);

  // Announce page changes to screen readers
  const announcePageChange = (path) => {
    const pageNames = {
      '/dashboard-home': 'Dashboard Home',
      '/text-reader-ocr': 'Text Reader OCR',
      '/object-detection': 'Object Detection',
      '/color-detection': 'Color Detection',
      '/currency-recognition': 'Currency Recognition',
      '/emergency-contacts-sos': 'Emergency Contacts SOS'
    };

    const pageName = pageNames?.[path] || 'Page';
    const announcement = `Navigated to ${pageName}`;
    
    const ariaLiveRegion = document.createElement('div');
    ariaLiveRegion?.setAttribute('aria-live', 'assertive');
    ariaLiveRegion?.setAttribute('aria-atomic', 'true');
    ariaLiveRegion.className = 'sr-only';
    ariaLiveRegion.textContent = announcement;
    document.body?.appendChild(ariaLiveRegion);
    
    setTimeout(() => {
      if (document.body?.contains(ariaLiveRegion)) {
        document.body?.removeChild(ariaLiveRegion);
      }
    }, 2000);
  };

  // Skip link functionality
  const handleSkipToMain = useCallback((e) => {
    e?.preventDefault();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent?.focus();
      mainContent?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Focus trap for modals and overlays
  const trapFocus = useCallback((container) => {
    const focusableElements = container?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabIndex="-1"])'
    );
    
    if (focusableElements?.length === 0) return;

    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements?.length - 1];

    const handleTabKey = (e) => {
      if (e?.key === 'Tab') {
        if (e?.shiftKey) {
          if (document.activeElement === firstElement) {
            e?.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e?.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container?.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container?.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Restore focus after modal/overlay closes
  const restoreFocus = useCallback((previousActiveElement) => {
    if (previousActiveElement && typeof previousActiveElement?.focus === 'function') {
      setTimeout(() => {
        previousActiveElement?.focus();
      }, 100);
    }
  }, []);

  // Handle escape key for closing overlays
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e?.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"], [role="alertdialog"]');
        const overlay = document.querySelector('.overlay-open');
        
        if (modal || overlay) {
          // Dispatch custom event for components to handle
          const escapeEvent = new CustomEvent('accessibilityEscape', {
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(escapeEvent);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // Provide focus management utilities through context
  const focusManagerValue = {
    trapFocus,
    restoreFocus,
    announcePageChange
  };

  return (
    <>
      {/* Skip Link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        onClick={handleSkipToMain}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-1100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-elevation-2"
        tabIndex={0}
      >
        Skip to main content
      </a>

      {/* Main Content Wrapper */}
      <div className="focus-manager-wrapper">
        {children}
      </div>

      {/* Screen Reader Only Status Region */}
      <div
        id="accessibility-status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
};

export default AccessibilityFocusManager;