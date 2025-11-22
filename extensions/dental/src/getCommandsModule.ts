/**
 * Commands Module for Dental Extension
 * Defines custom commands for dental-specific actions
 */

import { useDentalStore } from './stores/useDentalStore';
import { exportMeasurements } from './utils/measurementExport';
import { DentalMeasurement, MeasurementPreset } from './types';

/**
 * Get Commands Module
 * Exports command definitions for OHIF CommandsManager
 */
function getCommandsModule({ servicesManager, commandsManager }) {
  const actions = {
    /**
     * Open Dental Measurements Palette
     */
    openDentalMeasurementsPalette: () => {
      const { setMeasurementsPaletteOpen } = useDentalStore.getState();
      setMeasurementsPaletteOpen(true);
    },

    /**
     * Close Dental Measurements Palette
     */
    closeDentalMeasurementsPalette: () => {
      const { setMeasurementsPaletteOpen } = useDentalStore.getState();
      setMeasurementsPaletteOpen(false);
    },

    /**
     * Toggle Dental Measurements Palette
     */
    toggleDentalMeasurementsPalette: () => {
      const { measurementsPaletteOpen, setMeasurementsPaletteOpen } =
        useDentalStore.getState();
      setMeasurementsPaletteOpen(!measurementsPaletteOpen);
    },

    /**
     * Select Measurement Preset
     */
    selectDentalMeasurementPreset: ({ preset }: { preset: MeasurementPreset }) => {
      const { setActiveMeasurementPreset } = useDentalStore.getState();
      setActiveMeasurementPreset(preset);

      // Activate corresponding tool
      const toolName = preset.toolName;
      try {
        commandsManager.runCommand('setToolActive', {
          toolName,
        });
        console.log(`Activated ${toolName} for ${preset.label}`);
      } catch (error) {
        console.error('Error activating tool:', error);
      }
    },

    /**
     * Add Dental Measurement
     */
    addDentalMeasurement: ({ measurement }: { measurement: DentalMeasurement }) => {
      const { addMeasurement } = useDentalStore.getState();
      addMeasurement(measurement);
      console.log('Added dental measurement:', measurement);
    },

    /**
     * Remove Dental Measurement
     */
    removeDentalMeasurement: ({ measurementId }: { measurementId: string }) => {
      const { removeMeasurement } = useDentalStore.getState();
      removeMeasurement(measurementId);
      console.log('Removed dental measurement:', measurementId);
    },

    /**
     * Clear All Dental Measurements
     */
    clearDentalMeasurements: () => {
      const { clearMeasurements } = useDentalStore.getState();

      // Confirm before clearing
      if (confirm('Clear all dental measurements?')) {
        clearMeasurements();
        console.log('Cleared all dental measurements');
      }
    },

    /**
     * Export Dental Measurements to JSON
     */
    exportDentalMeasurements: () => {
      const { measurements, patientInfo, practiceInfo } = useDentalStore.getState();

      if (measurements.length === 0) {
        alert('No measurements to export');
        return;
      }

      if (!patientInfo) {
        alert('Patient information is required for export');
        return;
      }

      try {
        // Get study instance UID from active viewport
        const { viewportGridService } = servicesManager.services;
        const activeViewportId = viewportGridService.getActiveViewportId();

        // Default to 'unknown' if we can't get the study UID
        const studyInstanceUID = 'unknown';

        exportMeasurements(measurements, patientInfo, studyInstanceUID, practiceInfo);

        console.log(`Exported ${measurements.length} measurements`);
      } catch (error) {
        console.error('Export failed:', error);
        alert(`Export failed: ${error.message}`);
      }
    },

    /**
     * Select Tooth
     */
    selectDentalTooth: ({ tooth }) => {
      const { selectTooth } = useDentalStore.getState();
      selectTooth(tooth);
      console.log('Selected tooth:', tooth);
    },

    /**
     * Deselect Tooth
     */
    deselectDentalTooth: ({ tooth }) => {
      const { deselectTooth } = useDentalStore.getState();
      deselectTooth(tooth);
      console.log('Deselected tooth:', tooth);
    },

    /**
     * Clear Selected Teeth
     */
    clearSelectedTeeth: () => {
      const { clearSelectedTeeth } = useDentalStore.getState();
      clearSelectedTeeth();
      console.log('Cleared selected teeth');
    },

    /**
     * Toggle Tooth Selector Visibility
     */
    toggleToothSelector: () => {
      const { toothSelectorVisible, setToothSelectorVisible } = useDentalStore.getState();
      setToothSelectorVisible(!toothSelectorVisible);
    },

    /**
     * Set Dental Theme
     */
    setDentalTheme: ({ themeName }: { themeName: string }) => {
      const { setCurrentTheme } = useDentalStore.getState();
      setCurrentTheme(themeName);

      // Apply theme CSS
      const { applyTheme, getTheme } = require('./utils/dentalThemes');
      const theme = getTheme(themeName);
      applyTheme(theme);

      console.log('Applied dental theme:', themeName);
    },

    /**
     * Set Patient Info
     */
    setDentalPatientInfo: ({ patientInfo }) => {
      const { setPatientInfo } = useDentalStore.getState();
      setPatientInfo(patientInfo);
      console.log('Set patient info:', patientInfo);
    },

    /**
     * Set Practice Info
     */
    setDentalPracticeInfo: ({ practiceInfo }) => {
      const { setPracticeInfo } = useDentalStore.getState();
      setPracticeInfo(practiceInfo);
      console.log('Set practice info:', practiceInfo);
    },

    /**
     * Reset Dental State
     */
    resetDentalState: () => {
      const { reset } = useDentalStore.getState();

      if (confirm('Reset all dental data (measurements, selections, etc.)?')) {
        reset();
        console.log('Reset dental state');
      }
    },
  };

  const definitions = {
    openDentalMeasurementsPalette: {
      commandFn: actions.openDentalMeasurementsPalette,
      storeContexts: [],
      options: {},
    },
    closeDentalMeasurementsPalette: {
      commandFn: actions.closeDentalMeasurementsPalette,
      storeContexts: [],
      options: {},
    },
    toggleDentalMeasurementsPalette: {
      commandFn: actions.toggleDentalMeasurementsPalette,
      storeContexts: [],
      options: {},
    },
    selectDentalMeasurementPreset: {
      commandFn: actions.selectDentalMeasurementPreset,
      storeContexts: [],
      options: {},
    },
    addDentalMeasurement: {
      commandFn: actions.addDentalMeasurement,
      storeContexts: [],
      options: {},
    },
    removeDentalMeasurement: {
      commandFn: actions.removeDentalMeasurement,
      storeContexts: [],
      options: {},
    },
    clearDentalMeasurements: {
      commandFn: actions.clearDentalMeasurements,
      storeContexts: [],
      options: {},
    },
    exportDentalMeasurements: {
      commandFn: actions.exportDentalMeasurements,
      storeContexts: [],
      options: {},
    },
    selectDentalTooth: {
      commandFn: actions.selectDentalTooth,
      storeContexts: [],
      options: {},
    },
    deselectDentalTooth: {
      commandFn: actions.deselectDentalTooth,
      storeContexts: [],
      options: {},
    },
    clearSelectedTeeth: {
      commandFn: actions.clearSelectedTeeth,
      storeContexts: [],
      options: {},
    },
    toggleToothSelector: {
      commandFn: actions.toggleToothSelector,
      storeContexts: [],
      options: {},
    },
    setDentalTheme: {
      commandFn: actions.setDentalTheme,
      storeContexts: [],
      options: {},
    },
    setDentalPatientInfo: {
      commandFn: actions.setDentalPatientInfo,
      storeContexts: [],
      options: {},
    },
    setDentalPracticeInfo: {
      commandFn: actions.setDentalPracticeInfo,
      storeContexts: [],
      options: {},
    },
    resetDentalState: {
      commandFn: actions.resetDentalState,
      storeContexts: [],
      options: {},
    },
  };

  return {
    definitions,
    defaultContext: 'DENTAL',
  };
}

export default getCommandsModule;
