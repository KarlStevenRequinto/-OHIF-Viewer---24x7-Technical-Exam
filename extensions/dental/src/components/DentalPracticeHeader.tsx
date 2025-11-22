/**
 * Dental Practice Header Component
 * Custom header with practice branding, patient info, and tooth selector
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DentalPatientInfo, PracticeInfo, ToothNumber, ToothNumberingSystem } from '../types';
import ToothSelector from './ToothSelector';
import DentalThemeToggle from './DentalThemeToggle';

interface DentalPracticeHeaderProps {
  practiceInfo?: PracticeInfo;
  patientInfo?: DentalPatientInfo;
  selectedTeeth?: ToothNumber[];
  onToothSelect?: (tooth: ToothNumber) => void;
  onToothDeselect?: (tooth: ToothNumber) => void;
  showToothSelector?: boolean;
  className?: string;
}

const DentalPracticeHeader: React.FC<DentalPracticeHeaderProps> = ({
  practiceInfo: practiceInfoProp,
  patientInfo: patientInfoProp,
  selectedTeeth = [],
  onToothSelect,
  onToothDeselect,
  showToothSelector = true,
  className,
}) => {
  // Provide default values if props are null/undefined
  const practiceInfo = practiceInfoProp || {
    name: 'Dental Practice',
    logo: undefined,
    address: undefined,
    phone: undefined,
  };

  const patientInfo = patientInfoProp || {
    patientName: 'Unknown Patient',
    patientId: 'N/A',
    dateOfBirth: undefined,
    gender: undefined,
    age: undefined,
    lastVisit: undefined,
  };
  const [toothSelectorVisible, setToothSelectorVisible] = useState(false);
  const [numberingSystem, setNumberingSystem] = useState<ToothNumberingSystem>('universal');

  // Format patient age
  const getPatientAge = (): string | null => {
    if (patientInfo?.age) {
      return `${patientInfo.age}y`;
    }
    if (patientInfo?.dateOfBirth) {
      const dob = new Date(patientInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return `${age}y`;
    }
    return null;
  };

  // Format last visit date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={classNames(
        'bg-white border-b-2 border-gray-200 shadow-sm',
        className
      )}
    >
      {/* Main Header */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Practice Info */}
          <div className="flex items-center gap-4">
            {practiceInfo.logo ? (
              <img
                src={practiceInfo.logo}
                alt={practiceInfo.name}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-md">
                🦷
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {practiceInfo.name}
              </h1>
              {practiceInfo.address && (
                <p className="text-xs text-gray-500">{practiceInfo.address}</p>
              )}
            </div>
          </div>

          {/* Center: Patient Information */}
          {patientInfo && (
            <div className="flex-1 mx-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-3 gap-4">
                  {/* Patient Name */}
                  <div>
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      PATIENT
                    </div>
                    <div className="font-bold text-gray-900 truncate" title={patientInfo.patientName}>
                      {patientInfo.patientName}
                    </div>
                    <div className="text-xs text-gray-600">
                      ID: {patientInfo.patientId}
                    </div>
                  </div>

                  {/* Demographics */}
                  <div>
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      DEMOGRAPHICS
                    </div>
                    <div className="flex gap-3 text-sm">
                      {getPatientAge() && (
                        <span className="text-gray-700">{getPatientAge()}</span>
                      )}
                      {patientInfo.gender && (
                        <span className="text-gray-700 capitalize">
                          {patientInfo.gender}
                        </span>
                      )}
                    </div>
                    {patientInfo.dateOfBirth && (
                      <div className="text-xs text-gray-600">
                        DOB: {formatDate(patientInfo.dateOfBirth)}
                      </div>
                    )}
                  </div>

                  {/* Last Visit */}
                  <div>
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      LAST VISIT
                    </div>
                    <div className="text-sm text-gray-700">
                      {formatDate(patientInfo.lastVisit)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Tooth Selector Toggle */}
            {showToothSelector && (
              <button
                onClick={() => setToothSelectorVisible(!toothSelectorVisible)}
                className={classNames(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  toothSelectorVisible
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
                title="Toggle Tooth Selector"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C10 2 8.5 3.5 8 5.5C7.5 7.5 7 9 7 11C7 14 8 17 10 19C11 20 12 20 12 20C12 20 13 20 14 19C16 17 17 14 17 11C17 9 16.5 7.5 16 5.5C15.5 3.5 14 2 12 2Z" />
                </svg>
                <span className="text-sm font-medium">
                  {selectedTeeth.length > 0
                    ? `${selectedTeeth.length} Selected`
                    : 'Select Teeth'}
                </span>
              </button>
            )}

            {/* Theme Toggle */}
            <DentalThemeToggle />

            {/* Practice Info Button */}
            {practiceInfo.phone && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="Contact Practice"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.44 11.44 0 003.58.57 1 1 0 011 1v3.5a1 1 0 01-1 1A18 18 0 012 4a1 1 0 011-1h3.5a1 1 0 011 1 11.44 11.44 0 00.57 3.58 1 1 0 01-.27 1.11l-2.2 2.2z" />
                </svg>
                <span className="text-sm">{practiceInfo.phone}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tooth Selector Panel (Collapsible) */}
      {showToothSelector && toothSelectorVisible && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <ToothSelector
            selectedTeeth={selectedTeeth}
            onToothSelect={onToothSelect}
            onToothDeselect={onToothDeselect}
            numberingSystem={numberingSystem}
            onNumberingSystemChange={setNumberingSystem}
            multiSelect={true}
          />
        </div>
      )}

      {/* Quick Stats Bar (optional) */}
      {selectedTeeth.length > 0 && !toothSelectorVisible && (
        <div className="px-6 py-2 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-700 font-medium">
              {selectedTeeth.length} tooth{selectedTeeth.length !== 1 ? 'es' : ''}{' '}
              selected
            </span>
            <button
              onClick={() => setToothSelectorVisible(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View/Edit Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DentalPracticeHeader.propTypes = {
  practiceInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
  }),
  patientInfo: PropTypes.shape({
    patientId: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    gender: PropTypes.string,
    lastVisit: PropTypes.string,
  }),
  selectedTeeth: PropTypes.array,
  onToothSelect: PropTypes.func,
  onToothDeselect: PropTypes.func,
  showToothSelector: PropTypes.bool,
  className: PropTypes.string,
};

export default DentalPracticeHeader;
