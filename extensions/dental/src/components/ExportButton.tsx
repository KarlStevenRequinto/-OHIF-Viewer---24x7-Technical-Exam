/**
 * Export Button Component
 * Exports dental measurements to JSON format
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DentalMeasurement, DentalPatientInfo, PracticeInfo } from '../types';
import { exportMeasurements, getMeasurementSummary } from '../utils/measurementExport';

interface ExportButtonProps {
  measurements: DentalMeasurement[];
  patientInfo?: DentalPatientInfo;
  studyInstanceUID?: string;
  practiceInfo?: PracticeInfo;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onExportComplete?: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  measurements,
  patientInfo,
  studyInstanceUID = 'unknown',
  practiceInfo,
  className,
  variant = 'primary',
  size = 'md',
  onExportComplete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleExport = async () => {
    if (measurements.length === 0) {
      alert('No measurements to export');
      return;
    }

    if (!patientInfo) {
      alert('Patient information is required for export');
      return;
    }

    setIsExporting(true);

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      exportMeasurements(
        measurements,
        patientInfo,
        studyInstanceUID,
        practiceInfo
      );

      onExportComplete?.();

      // Show success message
      setShowSummary(true);
      setTimeout(() => setShowSummary(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = getMeasurementSummary(measurements);

  // Button styles based on variant and size
  const buttonClasses = classNames(
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      // Variants
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500':
        variant === 'primary',
      'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500':
        variant === 'secondary',
      'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500':
        variant === 'outline',

      // Sizes
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    className
  );

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting || measurements.length === 0}
        className={buttonClasses}
        title={
          measurements.length === 0
            ? 'No measurements to export'
            : `Export ${measurements.length} measurement${measurements.length !== 1 ? 's' : ''}`
        }
      >
        {isExporting ? (
          <>
            {/* Loading Spinner */}
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            {/* Export Icon */}
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export JSON</span>
            {measurements.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs bg-white bg-opacity-20 rounded-full">
                {measurements.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Success Summary Popup */}
      {showSummary && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-green-50 border-2 border-green-500 rounded-lg shadow-lg p-3 z-50 animate-fade-in">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                Export Successful!
              </p>
              <div className="mt-2 text-xs text-green-700 space-y-1">
                <div>Total: {summary.total} measurements</div>
                {Object.keys(summary.byType).length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(summary.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="capitalize">{type.replace('_', ' ')}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ExportButton.propTypes = {
  measurements: PropTypes.array.isRequired,
  patientInfo: PropTypes.shape({
    patientId: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    gender: PropTypes.string,
    lastVisit: PropTypes.string,
  }),
  studyInstanceUID: PropTypes.string,
  practiceInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
  }),
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onExportComplete: PropTypes.func,
};

export default ExportButton;
