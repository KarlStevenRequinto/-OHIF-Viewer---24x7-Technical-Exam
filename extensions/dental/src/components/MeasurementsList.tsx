/**
 * Measurements List Component
 * Displays, sorts, and filters dental measurements
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DentalMeasurement } from '../types';
import { formatMeasurementValue, getMeasurementTypeLabel } from '../utils/measurementExport';
import { formatToothNumber } from '../utils/toothNumbering';

interface MeasurementsListProps {
  measurements: DentalMeasurement[];
  onMeasurementSelect?: (measurement: DentalMeasurement) => void;
  onMeasurementDelete?: (measurementId: string) => void;
  selectedMeasurementId?: string;
  className?: string;
}

type SortBy = 'timestamp' | 'type' | 'value' | 'tooth';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'periapical_length' | 'canal_angle' | 'crown_width' | 'root_length';

const MeasurementsList: React.FC<MeasurementsListProps> = ({
  measurements,
  onMeasurementSelect,
  onMeasurementDelete,
  selectedMeasurementId,
  className,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered and sorted measurements
  const processedMeasurements = useMemo(() => {
    let filtered = [...measurements];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.label.toLowerCase().includes(term) ||
          m.type.toLowerCase().includes(term) ||
          (m.toothNumber && `#${m.toothNumber.universal}`.includes(term))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'tooth':
          comparison =
            (a.toothNumber?.universal || 999) - (b.toothNumber?.universal || 999);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [measurements, filterType, searchTerm, sortBy, sortOrder]);

  // Get measurement type color
  const getMeasurementColor = (type: string): string => {
    const colors = {
      periapical_length: '#3B82F6',
      canal_angle: '#10B981',
      crown_width: '#8B5CF6',
      root_length: '#F59E0B',
    };
    return colors[type] || '#6B7280';
  };

  // Toggle sort order
  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className={classNames('flex flex-col h-full bg-gray-50', className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Measurements</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {processedMeasurements.length} of {measurements.length} measurements
        </p>
      </div>

      {/* Filters and Search */}
      <div className="p-3 bg-white border-b border-gray-200 space-y-2">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search measurements..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Filter by Type */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={classNames(
              'px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors duration-200',
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            All
          </button>
          {['periapical_length', 'canal_angle', 'crown_width', 'root_length'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as FilterType)}
              className={classNames(
                'px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors duration-200',
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              {getMeasurementTypeLabel(type).replace(' ', '\n')}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600 font-medium">Sort by:</span>
          {(['timestamp', 'type', 'value', 'tooth'] as SortBy[]).map(sort => (
            <button
              key={sort}
              onClick={() => handleSortChange(sort)}
              className={classNames(
                'px-2 py-1 rounded capitalize transition-colors duration-200',
                sortBy === sort
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-200'
              )}
            >
              {sort}
              {sortBy === sort && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Measurements List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {processedMeasurements.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm">No measurements found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          processedMeasurements.map(measurement => (
            <div
              key={measurement.id}
              onClick={() => onMeasurementSelect?.(measurement)}
              className={classNames(
                'p-3 bg-white rounded-lg border-2 cursor-pointer transition-all duration-200',
                'hover:shadow-md',
                selectedMeasurementId === measurement.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              )}
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: getMeasurementColor(measurement.type),
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Label and Type */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {measurement.label}
                    </h4>
                    {measurement.toothNumber && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {formatToothNumber(measurement.toothNumber, 'universal')}
                      </span>
                    )}
                  </div>

                  {/* Value */}
                  <div className="text-lg font-bold text-gray-900">
                    {formatMeasurementValue(measurement)}
                  </div>

                  {/* Metadata */}
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{getMeasurementTypeLabel(measurement.type)}</span>
                    <span>•</span>
                    <span>{new Date(measurement.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onMeasurementDelete?.(measurement.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  title="Delete measurement"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

MeasurementsList.propTypes = {
  measurements: PropTypes.array.isRequired,
  onMeasurementSelect: PropTypes.func,
  onMeasurementDelete: PropTypes.func,
  selectedMeasurementId: PropTypes.string,
  className: PropTypes.string,
};

export default MeasurementsList;
