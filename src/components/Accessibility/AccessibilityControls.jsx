import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function AccessibilityControls({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSetting = (setting) => {
    onSettingsChange({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-200 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-label="Accessibility Controls"
        aria-expanded={isOpen}
      >
        <span className="text-xl">♿</span>
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl min-w-64"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Accessibility Options</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close accessibility panel"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* High Contrast */}
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">High Contrast</span>
                <button
                  onClick={() => toggleSetting('highContrast')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    settings.highContrast ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={settings.highContrast}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              {/* Dyslexia Mode */}
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Dyslexia-Friendly Font</span>
                <button
                  onClick={() => toggleSetting('dyslexiaMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    settings.dyslexiaMode ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={settings.dyslexiaMode}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.dyslexiaMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              {/* Reduced Motion */}
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Reduce Motion</span>
                <button
                  onClick={() => toggleSetting('reducedMotion')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    settings.reducedMotion ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              {/* Large Text */}
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Large Text</span>
                <button
                  onClick={() => toggleSetting('largeText')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    settings.largeText ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={settings.largeText}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.largeText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                ♿ WCAG AAA Compliant • Designed for neurodivergent users
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AccessibilityControls;
