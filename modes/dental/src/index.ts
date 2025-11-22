/**
 * Dental Mode for OHIF Viewer
 * Specialized viewing mode for dental imaging workflows with 2x2 layout
 */

import { utils } from '@ohif/core';
import { id } from './id';

const { structuredCloneWithFunctions } = utils;

/**
 * Extension module references
 */
const ohif = {
  layout: '@ohif/extension-default.layoutTemplateModule.viewerLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  thumbnailList: '@ohif/extension-default.panelModule.seriesList',
};

const cornerstone = {
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
  measurements: '@ohif/extension-cornerstone.panelModule.panelMeasurement',
};

/**
 * SOP Class Handlers
 * Define which DICOM SOP classes this mode can handle
 */
export const sopClassHandlers = [ohif.sopClassHandler];

/**
 * Extension Dependencies
 * List all extensions required by this mode
 */
const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  '@ohif/extension-dental': '^3.0.0',
};

/**
 * Dental Layout Configuration
 * Defines the UI layout for dental mode
 */
export const dentalLayout = {
  id: ohif.layout,
  props: {
    // Left panels - Series thumbnail list
    leftPanels: [ohif.thumbnailList],
    leftPanelResizable: true,

    // Right panels - Dental measurements and cornerstone measurements
    rightPanels: [
      '@ohif/extension-dental.panelModule.dentalMeasurements',
      cornerstone.measurements,
    ],
    rightPanelClosed: false,
    rightPanelResizable: true,
    rightPanelDefaultWidth: 400,

    // Viewports - Will use 2x2 grid from hanging protocol
    viewports: [
      {
        namespace: cornerstone.viewport,
        displaySetsToDisplay: [ohif.sopClassHandler],
      },
    ],
  },
};

/**
 * Layout Template Function
 * Returns a cloned copy of the dental layout
 */
export function layoutTemplate() {
  return structuredCloneWithFunctions(this.layoutInstance);
}

/**
 * Dental Route Configuration
 */
export const dentalRoute = {
  path: 'dental',
  layoutTemplate,
  layoutInstance: dentalLayout,
};

/**
 * Mode Configuration
 */
const mode = {
  /**
   * Mode ID and metadata
   */
  id,
  routeName: 'dental',
  displayName: 'Dental',

  /**
   * Lifecycle hooks
   */
  onModeEnter: ({ servicesManager, extensionManager, commandsManager }) => {
    console.log('🦷 Entering Dental Mode');

    // Hide the default OHIF header and inject Dental Practice Header
    const injectDentalHeader = async () => {
      // Import React and ReactDOM
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');

      // Import dental components
      const { default: DentalPracticeHeader } = await import('@ohif/extension-dental');
      const { useDentalStore } = await import('@ohif/extension-dental');

      // Find the header element
      const headerContainer = document.querySelector('header');
      if (!headerContainer) {
        console.warn('Header container not found');
        return;
      }

      // Clear existing header content and inject dental header
      headerContainer.innerHTML = '';
      headerContainer.style.cssText = 'display: block !important; background: white;';

      // Create root and render dental header
      const root = ReactDOM.createRoot(headerContainer);

      const DentalHeaderWrapper = () => {
        const { selectedTeeth, selectTooth, deselectTooth, patientInfo, practiceInfo } =
          useDentalStore();

        return React.createElement(DentalPracticeHeader, {
          practiceInfo,
          patientInfo,
          selectedTeeth,
          onToothSelect: selectTooth,
          onToothDeselect: deselectTooth,
          showToothSelector: true,
        });
      };

      root.render(React.createElement(DentalHeaderWrapper));

      // Store root for cleanup
      (window as any).__dentalHeaderRoot = root;
    };

    // Execute after a short delay to ensure DOM is ready
    setTimeout(injectDentalHeader, 500);

    // Initialize dental-specific services
    const { measurementService, hangingProtocolService } = servicesManager.services;

    // Apply dental hanging protocol
    try {
      hangingProtocolService.setProtocol('dental2x2');
      console.log('Applied dental 2x2 hanging protocol');
    } catch (error) {
      console.warn('Could not set dental hanging protocol:', error);
    }

    // Initialize patient info from study metadata
    try {
      const { displaySetService } = servicesManager.services;
      const displaySets = displaySetService.getActiveDisplaySets();

      if (displaySets && displaySets.length > 0) {
        const firstDisplaySet = displaySets[0];
        const { PatientName, PatientID, PatientBirthDate, PatientSex } =
          firstDisplaySet.metadata || {};

        if (PatientName || PatientID) {
          commandsManager.runCommand('setDentalPatientInfo', {
            patientInfo: {
              patientName: PatientName?.Alphabetic || 'Unknown',
              patientId: PatientID || 'N/A',
              dateOfBirth: PatientBirthDate,
              gender: PatientSex,
            },
          });
        }
      }
    } catch (error) {
      console.warn('Could not initialize patient info:', error);
    }

    // Set up measurement event listeners
    const handleMeasurementAdded = ({ source, measurement }) => {
      console.log('Measurement added:', measurement);

      // Check if it's a dental measurement (from our preset)
      const { useDentalStore } = require('@ohif/extension-dental');
      const { activeMeasurementPreset } = useDentalStore.getState();

      if (activeMeasurementPreset) {
        // Create dental measurement object
        const dentalMeasurement = {
          id: measurement.uid,
          type: activeMeasurementPreset.type,
          label: activeMeasurementPreset.label,
          value: measurement.length || measurement.angle || 0,
          unit: activeMeasurementPreset.unit,
          timestamp: new Date().toISOString(),
          imageId: measurement.imageId,
          seriesInstanceUID: measurement.SeriesInstanceUID,
          studyInstanceUID: measurement.StudyInstanceUID,
        };

        // Add to dental store
        commandsManager.runCommand('addDentalMeasurement', {
          measurement: dentalMeasurement,
        });
      }
    };

    // Subscribe to measurement events
    measurementService.subscribe(
      measurementService.EVENTS.MEASUREMENT_ADDED,
      handleMeasurementAdded
    );

    console.log('🦷 Dental Mode initialized successfully');
  },

  onModeExit: ({ servicesManager }) => {
    console.log('🦷 Exiting Dental Mode');

    // Cleanup dental header
    const root = (window as any).__dentalHeaderRoot;
    if (root) {
      root.unmount();
      delete (window as any).__dentalHeaderRoot;
    }

    // Clean up event listeners
    const { measurementService } = servicesManager.services;
    measurementService.clearListeners();
  },

  /**
   * Validate Mode
   * Check if this mode can be activated for the current study
   */
  validationTags: {
    study: [],
    series: [],
  },

  /**
   * Is Valid Mode
   * Return validation object if this mode should be available for the current study
   */
  isValidMode: ({ modalities }) => {
    // Allow dental mode for any study (can be restricted by modality)
    return {
      valid: true,
      description: 'Dental mode is available for all studies',
    };

    // Example: Restrict to specific modalities
    // const dentalModalities = ['DX', 'CR', 'IO'];
    // const modalities_list = modalities.split('\\');
    // const hasValidModality = modalities_list.some(modality => dentalModalities.includes(modality));
    // return {
    //   valid: hasValidModality,
    //   description: hasValidModality
    //     ? `Matches dental modalities`
    //     : `No dental modalities found. Supported: ${dentalModalities.join(', ')}`,
    // };
  },

  /**
   * Routes
   * Define the routes and layouts for this mode
   */
  routes: [dentalRoute],

  /**
   * Extension Dependencies
   */
  extensions: extensionDependencies,

  /**
   * Hanging Protocol
   * Specify which hanging protocol to use by default
   */
  hangingProtocol: 'dental2x2',

  /**
   * SOP Class Handlers
   * Define which DICOM SOP classes this mode can handle
   */
  sopClassHandlers,

  /**
   * Default Layout Template
   */
  defaultContext: 'DENTAL',
};

export default mode;
