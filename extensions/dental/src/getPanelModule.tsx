/**
 * Panel Module for Dental Extension
 * Registers the Measurements List panel for the right sidebar
 */

import React from 'react';
import MeasurementsList from './components/MeasurementsList';
import ExportButton from './components/ExportButton';
import DentalPracticeHeader from './components/DentalPracticeHeader';
import MeasurementToolsPanel from './components/MeasurementToolsPanel';
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
    <div className="h-full" style={{ backgroundColor: 'var(--dental-background)' }}>
      {/* Measurement Tools Section */}
      <div
        className="border-b"
        style={{
          backgroundColor: 'var(--dental-background)',
          borderColor: 'var(--dental-primary)'
        }}
      >
        <MeasurementToolsPanel commandsManager={commandsManager} />
      </div>

      {/* Export Button */}
      <div
        className="p-3 border-b"
        style={{
          backgroundColor: 'var(--dental-surface)',
          borderColor: 'var(--dental-primary)'
        }}
      >
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
      <div>
        <MeasurementsList
          measurements={measurements}
          selectedMeasurementId={selectedMeasurementId}
          onMeasurementSelect={handleMeasurementSelect}
          onMeasurementDelete={handleMeasurementDelete}
        />
      </div>

      {/* Summary Footer */}
      {measurements.length > 0 && (
        <div
          className="p-3 border-t"
          style={{
            backgroundColor: 'var(--dental-surface)',
            borderColor: 'var(--dental-primary)'
          }}
        >
          <div
            className="text-xs flex items-center justify-between"
            style={{ color: 'var(--dental-text)' }}
          >
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
              className="underline text-xs hover:opacity-80"
              style={{ color: 'var(--dental-accent)' }}
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
      iconName: 'tab-studies',
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
      iconName: 'tab-studies',
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
