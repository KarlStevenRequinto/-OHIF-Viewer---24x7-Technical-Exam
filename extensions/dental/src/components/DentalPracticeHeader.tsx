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
import AuthModal from './AuthModal';
import * as authState from '../services/authState';

interface DentalPracticeHeaderProps {
  practiceInfo?: PracticeInfo;
  patientInfo?: DentalPatientInfo;
  selectedTeeth?: ToothNumber[];
  onToothSelect?: (tooth: ToothNumber) => void;
  onToothDeselect?: (tooth: ToothNumber) => void;
  showToothSelector?: boolean;
  className?: string;
}

// Helper function to create rgba from CSS variable
const hexToRgba = (cssVar: string, opacity: number): string => {
  // For CSS variables, we'll use a fallback approach
  // Since we can't parse CSS vars in JS, we'll use a simplified approach
  return `rgba(43, 122, 155, ${opacity})`; // Fallback color
};

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(authState.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authState.isAuthenticated());

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = authState.subscribeToAuth((newUser) => {
      setUser(newUser);
      setIsAuthenticated(!!newUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    authState.logout();
  };

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
        'border-b-2 shadow-sm',
        className
      )}
      style={{
        backgroundColor: 'var(--dental-surface)',
        borderColor: 'var(--dental-primary)',
      }}
    >
      {/* Main Header */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back Button + Practice Info */}
          <div className="flex items-center gap-4">
            {/* Back to Study List Button */}
            <button
              onClick={() => {
                // Navigate back to study list
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--dental-background)',
                color: 'var(--dental-text)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--dental-primary)',
              }}
              title="Back to Study List"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Studies</span>
            </button>

            {/* Practice Logo/Icon */}
            {practiceInfo.logo ? (
              <img
                src={practiceInfo.logo}
                alt={practiceInfo.name}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg shadow-md"
                style={{
                  background: `linear-gradient(135deg, var(--dental-primary), var(--dental-secondary))`,
                }}
              >
                🦷
              </div>
            )}
            <div>
              <h1
                className="text-xl font-bold"
                style={{
                  color: 'var(--dental-text)',
                  fontFamily: 'var(--dental-font-family)',
                  fontSize: 'var(--dental-header-size)',
                }}
              >
                {practiceInfo.name}
              </h1>
              {practiceInfo.address && (
                <p
                  className="text-xs"
                  style={{
                    color: 'var(--dental-text)',
                    opacity: 0.7,
                  }}
                >
                  {practiceInfo.address}
                </p>
              )}
            </div>
          </div>

          {/* Center: Patient Information */}
          {patientInfo && (
            <div className="flex-1 mx-8">
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: 'var(--dental-background)',
                  borderColor: 'var(--dental-primary)',
                  borderWidth: '1px',
                  opacity: 0.95,
                }}
              >
                <div className="grid grid-cols-3 gap-4">
                  {/* Patient Name */}
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--dental-primary)' }}
                    >
                      PATIENT
                    </div>
                    <div
                      className="font-bold truncate"
                      style={{ color: 'var(--dental-text)' }}
                      title={patientInfo.patientName}
                    >
                      {patientInfo.patientName}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: 'var(--dental-text)',
                        opacity: 0.7,
                      }}
                    >
                      ID: {patientInfo.patientId}
                    </div>
                  </div>

                  {/* Demographics */}
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--dental-primary)' }}
                    >
                      DEMOGRAPHICS
                    </div>
                    <div className="flex gap-3 text-sm">
                      {getPatientAge() && (
                        <span style={{ color: 'var(--dental-text)' }}>
                          {getPatientAge()}
                        </span>
                      )}
                      {patientInfo.gender && (
                        <span
                          className="capitalize"
                          style={{ color: 'var(--dental-text)' }}
                        >
                          {patientInfo.gender}
                        </span>
                      )}
                    </div>
                    {patientInfo.dateOfBirth && (
                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--dental-text)',
                          opacity: 0.7,
                        }}
                      >
                        DOB: {formatDate(patientInfo.dateOfBirth)}
                      </div>
                    )}
                  </div>

                  {/* Last Visit */}
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: 'var(--dental-primary)' }}
                    >
                      LAST VISIT
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: 'var(--dental-text)' }}
                    >
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 border"
                style={{
                  backgroundColor: toothSelectorVisible
                    ? 'var(--dental-primary)'
                    : 'var(--dental-background)',
                  color: toothSelectorVisible ? 'white' : 'var(--dental-text)',
                  borderColor: 'var(--dental-primary)',
                  borderWidth: '2px',
                }}
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

            {/* Authentication UI */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* User Info */}
                <div
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--dental-background)',
                    color: 'var(--dental-text)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--dental-primary)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{user?.fullName}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--dental-primary)',
                    color: 'white',
                  }}
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Login Button */
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                style={{
                  backgroundColor: 'var(--dental-primary)',
                  color: 'white',
                }}
                title="Login to save your data"
              >
                Login / Register
              </button>
            )}

            {/* Practice Info Button */}
            {practiceInfo.phone && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--dental-background)',
                  color: 'var(--dental-text)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--dental-primary)',
                }}
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
        <div
          className="px-6 py-4 border-t"
          style={{
            backgroundColor: 'var(--dental-background)',
            borderColor: 'var(--dental-primary)',
          }}
        >
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
        <div
          className="px-6 py-2 border-t"
          style={{
            backgroundColor: 'var(--dental-background)',
            borderColor: 'var(--dental-primary)',
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className="font-medium"
              style={{ color: 'var(--dental-primary)' }}
            >
              {selectedTeeth.length} tooth{selectedTeeth.length !== 1 ? 'es' : ''}{' '}
              selected
            </span>
            <button
              onClick={() => setToothSelectorVisible(true)}
              className="underline"
              style={{ color: 'var(--dental-primary)' }}
            >
              View/Edit Selection
            </button>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
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
