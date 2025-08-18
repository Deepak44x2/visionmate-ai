import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ColorDetection from './pages/color-detection';
import TextReaderOCR from './pages/text-reader-ocr';
import ObjectDetection from './pages/object-detection';
import EmergencyContactsSOS from './pages/emergency-contacts-sos';
import CurrencyRecognitionWithProviders from './pages/currency-recognition';
import DashboardHome from './pages/dashboard-home';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<ColorDetection />} />
        <Route path="/color-detection" element={<ColorDetection />} />
        <Route path="/text-reader-ocr" element={<TextReaderOCR />} />
        <Route path="/object-detection" element={<ObjectDetection />} />
        <Route path="/emergency-contacts-sos" element={<EmergencyContactsSOS />} />
        <Route path="/currency-recognition" element={<CurrencyRecognitionWithProviders />} />
        <Route path="/dashboard-home" element={<DashboardHome />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
