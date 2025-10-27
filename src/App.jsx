import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import AccessibilityControls from './components/Accessibility/AccessibilityControls';
import { useTikTokLive } from './hooks/useTikTokLive';
import './styles/globals.css';

function App() {
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    dyslexiaMode: false,
    reducedMotion: false,
    largeText: false,
  });

  // Apply accessibility settings to document
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('high-contrast', accessibilitySettings.highContrast);
    body.classList.toggle('dyslexia-mode', accessibilitySettings.dyslexiaMode);
    body.classList.toggle('reduced-motion', accessibilitySettings.reducedMotion);
    body.classList.toggle('large-text', accessibilitySettings.largeText);
  }, [accessibilitySettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white">
      <AccessibilityControls
        settings={accessibilitySettings}
        onSettingsChange={setAccessibilitySettings}
      />
      <Dashboard />
    </div>
  );
}

export default App;
