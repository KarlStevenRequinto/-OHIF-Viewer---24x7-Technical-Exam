/**
 * Toolbar Module for Dental Extension
 * Adds the Measurements Palette button to the OHIF toolbar
 */

import React from 'react';
import MeasurementsPalette from './components/MeasurementsPalette';
import { useDentalStore } from './stores/useDentalStore';
import { DENTAL_MEASUREMENT_PRESETS } from './components/MeasurementsPalette';

/**
 * Measurements Palette Button Component
 * Button that opens the measurements palette modal
 */
const MeasurementsPaletteButton = ({ servicesManager, commandsManager }) => {
  const { measurementsPaletteOpen, setMeasurementsPaletteOpen, setActiveMeasurementPreset } =
    useDentalStore();

  const handlePresetSelect = preset => {
    console.log('Preset selected:', preset);
    setActiveMeasurementPreset(preset);

    // Activate the corresponding Cornerstone tool
    try {
      const { toolGroupService } = servicesManager.services;

      // Map preset to Cornerstone tool
      const toolName = preset.toolName; // 'Length' or 'Angle'

      // Activate the tool
      commandsManager.runCommand('setToolActive', {
        toolName,
        // Additional context can be passed here
      });

      console.log(`Activated ${toolName} tool for ${preset.label}`);
    } catch (error) {
      console.error('Error activating tool:', error);
      // Fallback: just close the palette
    }

    // Close the palette after selection
    setMeasurementsPaletteOpen(false);
  };

  return (
    <>
      <MeasurementsPalette
        isOpen={measurementsPaletteOpen}
        onClose={() => setMeasurementsPaletteOpen(false)}
        onPresetSelect={handlePresetSelect}
      />
    </>
  );
};

/**
 * Get Toolbar Module
 * Exports toolbar button definitions for OHIF
 */
function getToolbarModule({ servicesManager, commandsManager }) {
  return [
    {
      name: 'dentalMeasurements',
      id: 'dentalMeasurements',
      type: 'ohif.radioGroup',
      props: {
        icon: 'tool-measure',
        label: 'Dental Measurements',
        commands: [
          {
            commandName: 'openDentalMeasurementsPalette',
            commandOptions: {},
            context: 'CORNERSTONE',
          },
        ],
      },
    },
  ];
}

/**
 * Custom Toolbar Component
 * This can be used to render custom toolbar UI
 */
export const DentalToolbarComponent = ({ servicesManager, commandsManager }) => {
  const { measurementsPaletteOpen, setMeasurementsPaletteOpen } = useDentalStore();

  return (
    <div className="flex items-center gap-2">
      {/* Measurements Button */}
      <button
        onClick={() => setMeasurementsPaletteOpen(!measurementsPaletteOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        title="Open Dental Measurements Palette"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <span>Measurements</span>
      </button>

      {/* Palette Modal */}
      <MeasurementsPaletteButton
        servicesManager={servicesManager}
        commandsManager={commandsManager}
      />
    </div>
  );
};

export default getToolbarModule;
