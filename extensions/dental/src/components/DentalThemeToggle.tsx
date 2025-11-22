/**
 * Dental Theme Toggle Component
 * Allows users to switch between dental-specific themes
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  dentalThemes,
  applyTheme,
  saveThemePreference,
  loadThemePreference,
} from '../utils/dentalThemes';

interface DentalThemeToggleProps {
  className?: string;
}

const DentalThemeToggle: React.FC<DentalThemeToggleProps> = ({ className }) => {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isOpen, setIsOpen] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = loadThemePreference();
    if (savedTheme && dentalThemes[savedTheme]) {
      handleThemeChange(savedTheme);
    }
  }, []);

  const handleThemeChange = (themeName: string) => {
    const theme = dentalThemes[themeName];
    if (theme) {
      applyTheme(theme);
      setCurrentTheme(themeName);
      saveThemePreference(themeName);
      setIsOpen(false);
    }
  };

  const themeOptions = [
    { name: 'default', label: 'Default OHIF', icon: '🏥' },
    { name: 'dental', label: 'Dental Light', icon: '🦷' },
    { name: 'dental-dark', label: 'Dental Dark', icon: '🌙' },
  ];

  return (
    <div className={classNames('relative', className)}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-gray-700 hover:bg-gray-600 text-white',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
        title="Change Theme"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        <span className="text-sm font-medium">Theme</span>
        <svg
          className={classNames(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-800 shadow-lg z-50 overflow-hidden">
            <div className="py-1">
              {themeOptions.map(option => (
                <button
                  key={option.name}
                  onClick={() => handleThemeChange(option.name)}
                  className={classNames(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'text-left text-sm transition-colors duration-150',
                    currentTheme === option.name
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <span className="text-xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {currentTheme === option.name && (
                      <div className="text-xs text-blue-200 mt-0.5">Active</div>
                    )}
                  </div>
                  {currentTheme === option.name && (
                    <svg
                      className="w-5 h-5 text-blue-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Theme Preview */}
            <div className="border-t border-gray-700 p-3">
              <div className="text-xs text-gray-400 mb-2">Theme Preview</div>
              <div className="flex gap-2">
                {Object.values(dentalThemes[currentTheme]?.colors || {})
                  .slice(0, 6)
                  .map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded border border-gray-600"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

DentalThemeToggle.propTypes = {
  className: PropTypes.string,
};

export default DentalThemeToggle;
