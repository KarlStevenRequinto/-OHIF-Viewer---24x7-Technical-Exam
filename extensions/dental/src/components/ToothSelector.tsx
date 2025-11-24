/**
 * Tooth Selector Component
 * Interactive tooth chart with FDI and Universal numbering systems
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ToothNumber, ToothNumberingSystem } from '../types';
import {
  getAllTeeth,
  formatToothNumber,
  getQuadrantName,
  isUpperTooth,
} from '../utils/toothNumbering';

interface ToothSelectorProps {
  selectedTeeth?: ToothNumber[];
  onToothSelect?: (tooth: ToothNumber) => void;
  onToothDeselect?: (tooth: ToothNumber) => void;
  numberingSystem?: ToothNumberingSystem;
  onNumberingSystemChange?: (system: ToothNumberingSystem) => void;
  className?: string;
  multiSelect?: boolean;
}

const ToothSelector: React.FC<ToothSelectorProps> = ({
  selectedTeeth = [],
  onToothSelect,
  onToothDeselect,
  numberingSystem = 'universal',
  onNumberingSystemChange,
  className,
  multiSelect = true,
}) => {
  const [hoveredTooth, setHoveredTooth] = useState<ToothNumber | null>(null);
  const allTeeth = getAllTeeth();

  const isToothSelected = (tooth: ToothNumber): boolean => {
    return selectedTeeth.some(t => t.universal === tooth.universal);
  };

  const handleToothClick = (tooth: ToothNumber) => {
    if (isToothSelected(tooth)) {
      onToothDeselect?.(tooth);
    } else {
      onToothSelect?.(tooth);
    }
  };

  // Group teeth by quadrant for layout
  const quadrant1 = allTeeth.filter(t => t.quadrant === 1); // Upper Right
  const quadrant2 = allTeeth.filter(t => t.quadrant === 2); // Upper Left
  const quadrant3 = allTeeth.filter(t => t.quadrant === 3); // Lower Left
  const quadrant4 = allTeeth.filter(t => t.quadrant === 4); // Lower Right

  const renderTooth = (tooth: ToothNumber) => {
    const selected = isToothSelected(tooth);
    const hovered = hoveredTooth?.universal === tooth.universal;

    return (
      <button
        key={tooth.universal}
        onClick={() => handleToothClick(tooth)}
        onMouseEnter={() => setHoveredTooth(tooth)}
        onMouseLeave={() => setHoveredTooth(null)}
        className="relative w-10 h-14 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs font-medium hover:shadow-md cursor-pointer focus:outline-none focus:ring-2"
        style={{
          backgroundColor: selected
            ? 'var(--dental-primary)'
            : hovered
            ? 'var(--dental-background)'
            : 'var(--dental-surface)',
          borderColor: selected
            ? 'var(--dental-primary)'
            : hovered
            ? 'var(--dental-secondary)'
            : 'var(--dental-text)',
          borderWidth: selected ? '2px' : '1px',
          color: selected ? 'white' : 'var(--dental-text)',
          transform: hovered && !selected ? 'scale(1.05)' : 'scale(1)',
        }}
        title={`${formatToothNumber(tooth, numberingSystem)} - ${
          isUpperTooth(tooth) ? 'Upper' : 'Lower'
        } ${tooth.quadrant === 1 || tooth.quadrant === 4 ? 'Right' : 'Left'}`}
      >
        {/* Tooth icon (simplified) */}
        <svg
          className="w-5 h-5 mb-1"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{
            color: selected ? 'white' : 'var(--dental-text)',
            opacity: selected ? 1 : 0.6,
          }}
        >
          <path d="M12 2C10 2 8.5 3.5 8 5.5C7.5 7.5 7 9 7 11C7 14 8 17 10 19C11 20 12 20 12 20C12 20 13 20 14 19C16 17 17 14 17 11C17 9 16.5 7.5 16 5.5C15.5 3.5 14 2 12 2Z" />
        </svg>

        {/* Number display */}
        <span className="text-[10px] font-bold">
          {numberingSystem === 'universal' ? tooth.universal : tooth.fdi}
        </span>
      </button>
    );
  };

  return (
    <div
      className={classNames('rounded-lg shadow-sm p-4', className)}
      style={{
        backgroundColor: 'var(--dental-surface)',
      }}
    >
      {/* Header with Numbering System Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{
            color: 'var(--dental-text)',
            fontFamily: 'var(--dental-font-family)',
          }}
        >
          Tooth Selector
        </h3>
        <div className="flex items-center gap-2">
          <label
            className="text-xs"
            style={{ color: 'var(--dental-text)', opacity: 0.8 }}
          >
            Notation:
          </label>
          <select
            value={numberingSystem}
            onChange={e =>
              onNumberingSystemChange?.(e.target.value as ToothNumberingSystem)
            }
            className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--dental-primary)',
              backgroundColor: 'var(--dental-background)',
              color: 'var(--dental-text)',
            }}
          >
            <option value="universal">Universal (1-32)</option>
            <option value="fdi">FDI (11-48)</option>
          </select>
        </div>
      </div>

      {/* Tooth Chart */}
      <div className="space-y-4">
        {/* Upper Arch */}
        <div
          className="border-b-2 pb-4"
          style={{ borderColor: 'var(--dental-text)', opacity: 0.3 }}
        >
          <div
            className="text-xs text-center mb-2 font-medium"
            style={{ color: 'var(--dental-text)', opacity: 0.7 }}
          >
            UPPER ARCH
          </div>
          <div className="flex justify-center gap-6">
            {/* Upper Right (Q1) */}
            <div className="flex flex-col items-center">
              <div
                className="text-[10px] mb-1"
                style={{ color: 'var(--dental-text)', opacity: 0.5 }}
              >
                UR
              </div>
              <div className="flex gap-1">{quadrant1.map(renderTooth)}</div>
            </div>

            {/* Midline */}
            <div
              className="w-px"
              style={{ backgroundColor: 'var(--dental-text)', opacity: 0.3 }}
            />

            {/* Upper Left (Q2) */}
            <div className="flex flex-col items-center">
              <div
                className="text-[10px] mb-1"
                style={{ color: 'var(--dental-text)', opacity: 0.5 }}
              >
                UL
              </div>
              <div className="flex gap-1">{quadrant2.map(renderTooth)}</div>
            </div>
          </div>
        </div>

        {/* Lower Arch */}
        <div>
          <div
            className="text-xs text-center mb-2 font-medium"
            style={{ color: 'var(--dental-text)', opacity: 0.7 }}
          >
            LOWER ARCH
          </div>
          <div className="flex justify-center gap-6">
            {/* Lower Right (Q4) */}
            <div className="flex flex-col items-center">
              <div className="flex gap-1">{quadrant4.map(renderTooth)}</div>
              <div
                className="text-[10px] mt-1"
                style={{ color: 'var(--dental-text)', opacity: 0.5 }}
              >
                LR
              </div>
            </div>

            {/* Midline */}
            <div
              className="w-px"
              style={{ backgroundColor: 'var(--dental-text)', opacity: 0.3 }}
            />

            {/* Lower Left (Q3) */}
            <div className="flex flex-col items-center">
              <div className="flex gap-1">{quadrant3.map(renderTooth)}</div>
              <div
                className="text-[10px] mt-1"
                style={{ color: 'var(--dental-text)', opacity: 0.5 }}
              >
                LL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Teeth Display */}
      {selectedTeeth.length > 0 && (
        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--dental-text)', opacity: 0.2 }}
        >
          <div
            className="text-xs font-medium mb-2"
            style={{ color: 'var(--dental-text)' }}
          >
            Selected Teeth ({selectedTeeth.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTeeth.map(tooth => (
              <span
                key={tooth.universal}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'var(--dental-primary)',
                  color: 'white',
                  opacity: 0.9,
                }}
              >
                {formatToothNumber(tooth, numberingSystem)}
                <button
                  onClick={() => onToothDeselect?.(tooth)}
                  className="hover:opacity-75 focus:outline-none"
                  style={{ color: 'white' }}
                  title="Deselect"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hovered Tooth Info */}
      {hoveredTooth && (
        <div
          className="mt-3 p-2 border rounded text-xs"
          style={{
            backgroundColor: 'var(--dental-background)',
            borderColor: 'var(--dental-primary)',
          }}
        >
          <div
            className="font-medium"
            style={{ color: 'var(--dental-primary)' }}
          >
            Tooth {formatToothNumber(hoveredTooth, numberingSystem)}
          </div>
          <div
            className="mt-1"
            style={{ color: 'var(--dental-text)' }}
          >
            {getQuadrantName(hoveredTooth.quadrant)} • Position {hoveredTooth.position}
          </div>
          {numberingSystem === 'universal' && (
            <div
              className="text-[10px] mt-1"
              style={{ color: 'var(--dental-text)', opacity: 0.7 }}
            >
              FDI: {hoveredTooth.fdi}
            </div>
          )}
          {numberingSystem === 'fdi' && (
            <div
              className="text-[10px] mt-1"
              style={{ color: 'var(--dental-text)', opacity: 0.7 }}
            >
              Universal: #{hoveredTooth.universal}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ToothSelector.propTypes = {
  selectedTeeth: PropTypes.array,
  onToothSelect: PropTypes.func,
  onToothDeselect: PropTypes.func,
  numberingSystem: PropTypes.oneOf(['universal', 'fdi']),
  onNumberingSystemChange: PropTypes.func,
  className: PropTypes.string,
  multiSelect: PropTypes.bool,
};

export default ToothSelector;
