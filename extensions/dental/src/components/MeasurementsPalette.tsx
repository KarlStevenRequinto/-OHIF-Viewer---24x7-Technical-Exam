/**
 * Measurements Palette Component
 * Provides quick access to dental-specific measurement presets
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MeasurementPreset } from '../types';

interface MeasurementsPaletteProps {
  onPresetSelect?: (preset: MeasurementPreset) => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const DENTAL_MEASUREMENT_PRESETS: MeasurementPreset[] = [
  {
    id: 'periapical_length',
    label: 'Periapical Length',
    type: 'periapical_length',
    toolName: 'Length',
    unit: 'mm',
    icon: '📏',
    color: '#3B82F6', // Blue
  },
  {
    id: 'canal_angle',
    label: 'Canal Angle',
    type: 'canal_angle',
    toolName: 'Angle',
    unit: 'degrees',
    icon: '📐',
    color: '#10B981', // Green
  },
  {
    id: 'crown_width',
    label: 'Crown Width',
    type: 'crown_width',
    toolName: 'Length',
    unit: 'mm',
    icon: '↔️',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'root_length',
    label: 'Root Length',
    type: 'root_length',
    toolName: 'Length',
    unit: 'mm',
    icon: '📍',
    color: '#F59E0B', // Amber
  },
];

const MeasurementsPalette: React.FC<MeasurementsPaletteProps> = ({
  onPresetSelect,
  isOpen = false,
  onClose,
  className,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<MeasurementPreset | null>(null);

  const handlePresetClick = (preset: MeasurementPreset) => {
    setSelectedPreset(preset);
    onPresetSelect?.(preset);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Palette Panel */}
      <div
        className={classNames(
          'fixed right-4 top-1/2 transform -translate-y-1/2',
          'bg-white rounded-lg shadow-2xl z-50',
          'w-80 max-h-[90vh] overflow-auto',
          className
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Dental Measurements</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Select a measurement preset
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-500 rounded transition-colors duration-200"
              title="Close"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Presets List */}
        <div className="p-3 space-y-2">
          {DENTAL_MEASUREMENT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={classNames(
                'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                selectedPreset?.id === preset.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              )}
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: preset.color,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl"
                  style={{ backgroundColor: `${preset.color}20` }}
                >
                  {preset.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{preset.label}</h4>
                    {selectedPreset?.id === preset.id && (
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-medium">{preset.toolName} Tool</span>
                    <span>•</span>
                    <span>Unit: {preset.unit}</span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {getPresetDescription(preset.type)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="text-xs text-gray-600 space-y-2">
            <p className="font-medium text-gray-700">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Select a measurement preset above</li>
              <li>Click on the image to start measuring</li>
              <li>The measurement will be auto-labeled</li>
              <li>View all measurements in the right panel</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Get description for each measurement type
 */
function getPresetDescription(type: string): string {
  const descriptions = {
    periapical_length:
      'Measure the length of periapical lesions or root structures',
    canal_angle: 'Measure the angle of root canals for endodontic planning',
    crown_width: 'Measure the mesiodistal width of dental crowns',
    root_length: 'Measure the length of tooth roots from CEJ to apex',
  };
  return descriptions[type] || '';
}

MeasurementsPalette.propTypes = {
  onPresetSelect: PropTypes.func,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default MeasurementsPalette;
export { DENTAL_MEASUREMENT_PRESETS };
