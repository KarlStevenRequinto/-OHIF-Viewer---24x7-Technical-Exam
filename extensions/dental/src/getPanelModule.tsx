/**
 * Panel Module for Dental Extension
 * Registers the Measurements List panel for the right sidebar
 */

import React from 'react';
import MeasurementsList from './components/MeasurementsList';
import ExportButton from './components/ExportButton';
import DentalPracticeHeader from './components/DentalPracticeHeader';
import { useDentalStore } from './stores/useDentalStore';

/**
 * Dental Measurements Panel Component
 * Wraps MeasurementsList and connects it to the Zustand store
 */
const DentalMeasurementsPanel = ({ servicesManager, commandsManager }) => {
  const {
    measurements,
    selectedMeasurementId,
    setSelectedMeasurementId,
    removeMeasurement,
    patientInfo,
    practiceInfo,
  } = useDentalStore();

  const handleMeasurementSelect = measurement => {
    setSelectedMeasurementId(measurement.id);

    // Optional: Jump to the measurement in the viewport
    try {
      const { viewportGridService } = servicesManager.services;
      // This would trigger navigation to the measurement's image
      // Implementation depends on OHIF's measurement service
      console.log('Selected measurement:', measurement);
    } catch (error) {
      console.error('Error selecting measurement:', error);
    }
  };

  const handleMeasurementDelete = measurementId => {
    // Confirm deletion
    if (confirm('Are you sure you want to delete this measurement?')) {
      removeMeasurement(measurementId);

      // Optional: Remove from Cornerstone as well
      try {
        // commandsManager.runCommand('deleteMeasurement', { measurementId });
        console.log('Deleted measurement:', measurementId);
      } catch (error) {
        console.error('Error deleting measurement:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Export Button at the Top */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <ExportButton
          measurements={measurements}
          patientInfo={patientInfo}
          practiceInfo={practiceInfo}
          variant="primary"
          size="md"
          className="w-full"
        />
      </div>

      {/* Measurements List */}
      <div className="flex-1 overflow-hidden">
        <MeasurementsList
          measurements={measurements}
          selectedMeasurementId={selectedMeasurementId}
          onMeasurementSelect={handleMeasurementSelect}
          onMeasurementDelete={handleMeasurementDelete}
        />
      </div>

      {/* Summary Footer */}
      {measurements.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>
              Total: <strong>{measurements.length}</strong> measurement
              {measurements.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                if (
                  confirm(
                    `Clear all ${measurements.length} measurement${measurements.length !== 1 ? 's' : ''}?`
                  )
                ) {
                  useDentalStore.getState().clearMeasurements();
                }
              }}
              className="text-red-600 hover:text-red-800 underline text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Dental Practice Info Panel Component
 * Shows practice header with patient info and tooth selector
 */
const DentalPracticeInfoPanel = ({ servicesManager, commandsManager }) => {
  const { selectedTeeth, selectTooth, deselectTooth, patientInfo, practiceInfo } =
    useDentalStore();

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <DentalPracticeHeader
        practiceInfo={practiceInfo}
        patientInfo={patientInfo}
        selectedTeeth={selectedTeeth}
        onToothSelect={selectTooth}
        onToothDeselect={deselectTooth}
        showToothSelector={true}
      />
    </div>
  );
};

/**
 * Get Panel Module
 * Exports panel configurations for OHIF
 */
function getPanelModule({ servicesManager, commandsManager }) {
  return [
    {
      name: 'dentalPracticeInfo',
      iconName: 'info-action',
      iconLabel: 'Practice Info',
      label: 'Practice Info',
      component: props => (
        <DentalPracticeInfoPanel
          {...props}
          servicesManager={servicesManager}
          commandsManager={commandsManager}
        />
      ),
    },
    {
      name: 'dentalMeasurements',
      iconName: 'list-bullets',
      iconLabel: 'Dental Measurements',
      label: 'Dental Measurements',
      component: props => (
        <DentalMeasurementsPanel
          {...props}
          servicesManager={servicesManager}
          commandsManager={commandsManager}
        />
      ),
    },
  ];
}

export default getPanelModule;
