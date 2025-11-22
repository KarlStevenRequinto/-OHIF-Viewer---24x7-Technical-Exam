/**
 * Dental Mode for OHIF Viewer
 * Specialized viewing mode for dental imaging workflows with 2x2 layout
 */

import { id } from './id';
import getHangingProtocolModule from './getHangingProtocolModule';

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
   * Return true if this mode should be available for the current study
   */
  isValidMode: ({ modalities }) => {
    // Allow dental mode for any study (can be restricted by modality)
    return true;

    // Example: Restrict to specific modalities
    // const dentalModalities = ['DX', 'CR', 'IO'];
    // return modalities.some(modality => dentalModalities.includes(modality));
  },

  /**
   * Routes
   * Define the routes and layouts for this mode
   */
  routes: [
    {
      path: 'dental',
      layoutTemplate: ({ location, servicesManager }) => {
        return {
          id: 'dentalLayout',
          props: {
            // Left panels
            leftPanels: [],

            // Right panels - Dental measurements list
            rightPanels: ['@ohif/extension-dental.panelModule.dentalMeasurements'],

            // Viewports - Will use 2x2 grid from hanging protocol
            viewports: [
              {
                namespace: '@ohif/extension-cornerstone.viewportModule.cornerstone',
                displaySetsToDisplay: ['@ohif/extension-default.sopClassHandlerModule.stack'],
              },
            ],
          },
        };
      },
    },
  ],

  /**
   * Extension Dependencies
   */
  extensions: extensionDependencies,

  /**
   * Hanging Protocol Module
   */
  getHangingProtocolModule,

  /**
   * Default Layout Template
   */
  defaultContext: 'DENTAL',
};

export default mode;
